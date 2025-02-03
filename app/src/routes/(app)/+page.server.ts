import { type Actions, fail } from "@sveltejs/kit";
import { ASSET_STORAGE_PREFIX, s3Client } from "$lib/server/utilities/s3";
import { db } from "$lib/server/db/db";
import { assets } from "$lib/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { assetProcessingQueue, AssetTasks } from "$lib/server/tasks/queues";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand
} from "@aws-sdk/client-s3";
import { env } from "$lib/server/utilities/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

import { z } from "zod";

const mimeTypeValidator = z.string().refine(
  (val) => val.startsWith("image/") || val.startsWith("video/"),
  { message: "Invalid MIME type. Must be an image or video type" }
);

const createUploadSchema = z.object({
  filename: z.string().min(1, { message: "Filename is required" }),
  totalParts: z.string()
    .min(1, { message: "Total parts is required" })
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { 
      message: "Total parts must be a positive number" 
    }),
  type: mimeTypeValidator
});

const completeUploadSchema = z.object({
  key: z.string().min(1, { message: "Storage key is required" }),
  uploadId: z.string().min(1, { message: "Upload ID is required" }),
  parts: z.preprocess(
    (arg) => {
      if (typeof arg === "string") {
        try {
          return JSON.parse(arg);
        } catch (e) {
          return arg;
        }
      }
      return arg;
    },
    z.array(z.object({
      ETag: z.string(),
      PartNumber: z.number()
    }))
  ),
  assetId: z.string().uuid({ message: "Invalid asset ID format" }),
  type: mimeTypeValidator,
  filename: z.string().min(1, { message: "Filename is required" })
});

const validateFormData = async <T extends z.ZodSchema>(
  formData: FormData,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: z.ZodError }> => {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

type CreateUploadInput = z.infer<typeof createUploadSchema>;
type CompleteUploadInput = z.infer<typeof completeUploadSchema>;

function getAssetType(mimeType: string): "IMAGE" | "VIDEO" {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  throw new Error("Invalid asset type");
}

export const load: PageServerLoad = async ({ locals }) => {
  const assetsList = await db
    .select()
    .from(assets)
    .where(eq(assets.ownerId, locals.user.id));
  return { assets: assetsList };
};

export const actions = {
  createUpload: async ({ request, locals }) => {
    if (!locals.user) throw fail(401);
    const formData = await request.formData();

    const validation = await validateFormData(formData, createUploadSchema);
    if (!validation.success) {
      return fail(400, { 
        error: true, 
        message: "Invalid form data", 
        issues: validation.error.issues 
      });
    }
    
    const { filename, totalParts, type } = validation.data;
    const assetId = uuidv4();
    const storageKey = `${ASSET_STORAGE_PREFIX}/${assetId}/${assetId}`;

    const createCommand = new CreateMultipartUploadCommand({
      Key: storageKey,
      ContentType: type,
      Bucket: env.ALCOVES_OBJECT_STORE_DEFAULT_BUCKET
    });
    const { UploadId } = await s3Client.send(createCommand);

    const uploadUrls = await Promise.all(
      Array.from({ length: totalParts }, (_, i) => i + 1).map(async (partNumber) => {
        const command = new UploadPartCommand({
          UploadId,
          Key: storageKey,
          PartNumber: partNumber,
          Bucket: env.ALCOVES_OBJECT_STORE_DEFAULT_BUCKET
        });
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600 * 24 // 24 hours
        });
        return { signedUrl, partNumber };
      })
    );

    return { assetId, storageKey, uploadId: UploadId, uploadUrls };
  },

  completeUpload: async ({ request, locals }) => {
    if (!locals.user) throw fail(401);
    const formData = await request.formData();

    const validation = await validateFormData(formData, completeUploadSchema);
    if (!validation.success) {
      return fail(400, { 
        error: true, 
        message: "Invalid form data", 
        issues: validation.error.issues 
      });
    }
    
    const { key, uploadId, parts, assetId, type, filename } = validation.data;

    const command = new CompleteMultipartUploadCommand({
      Bucket: env.ALCOVES_OBJECT_STORE_DEFAULT_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p: { ETag: string; PartNumber: number }) => ({
          ETag: p.ETag,
          PartNumber: p.PartNumber
        }))
      }
    });
    await s3Client.send(command);

    const assetStoragePrefix = `${ASSET_STORAGE_PREFIX}/${assetId}`;
    await db.insert(assets).values({
      id: assetId,
      ownerId: locals.user.id,
      type: getAssetType(type),
      status: "UPLOADED",
      title: path.parse(filename).name,
      filename,
      mimeType: type,
      storagePrefix: assetStoragePrefix,
      storageKey: `${assetStoragePrefix}/${assetId}`,
      storageBucket: process.env.ALCOVES_OBJECT_STORE_DEFAULT_BUCKET!
    }).returning();

    await assetProcessingQueue.add(AssetTasks.INGEST_ASSET, { assetId });
    return { success: true };
  }
} satisfies Actions;