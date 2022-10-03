import url from 'url'
import Joi from 'joi'
import path from 'path'
import { db } from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import queues from '../queues/queues'
import { IngestionJobData } from '../types'
import { enqueueThumbnailJob } from '../services/thumbnails'
import { enqueueTranscodeJob } from '../services/transcodes'

export async function deleteVideo(req, res) {
  await db.video.update({
    data: { deleted: true },
    where: { id: req.params.videoId },
  })
  res.sendStatus(200)
}

export async function getVideo(req, res) {
  const videos = await db.video.findMany({
    orderBy: { createdAt: 'desc' },
    where: { id: req.params.videoId, deleted: false },
    include: {
      thumbnails: true,
      transcodes: true,
    },
  })
  if (videos.length) return res.json(videos[0])
  return res.sendStatus(404)
}

export async function listVideos(req, res) {
  const videos = await db.video.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'desc' },
    include: {
      thumbnails: true,
    },
  })
  res.json({ videos })
}

export async function createVideo(req, res) {
  const schema = Joi.object({
    input: Joi.string().uri().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const videoId = uuidv4()
  const cleanedUrl = url.parse(value.input).pathname || ''
  const sourceFileExtension = path.extname(cleanedUrl) || ''

  const video = await db.video.create({
    data: {
      id: videoId,
      input: value.input,
      s3Uri: `s3://${process.env.TIDAL_BUCKET}/assets/videos/${videoId}/source${sourceFileExtension}`,
    },
  })

  const ingestionJob: IngestionJobData = {
    assetId: video.id,
    input: value.input,
    s3OutputUri: video.s3Uri,
  }

  await queues.ingestion.queue.add('ingestion', ingestionJob)
  res.json(video)
}

export async function createThumbnail(req, res) {
  const { videoId } = req.params

  const schema = Joi.object({
    time: Joi.string().default('00:00:00:000'),
    width: Joi.number().min(1).max(10000).required(),
    height: Joi.number().min(1).max(10000).required(),
    fit: Joi.string().uri().default('cover').valid('cover', 'contain', 'fill', 'inside', 'outside'),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  await enqueueThumbnailJob(videoId, {
    fit: value.fit,
    time: value.time,
    width: value.width,
    height: value.height,
  })

  return res.status(202).end()
}

export async function createTranscode(req, res) {
  const { videoId } = req.params
  const schema = Joi.object({
    cmd: Joi.string().required(),
    extension: Joi.string().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  await enqueueTranscodeJob(videoId, {
    videoId,
    cmd: value.cmd,
  })

  return res.status(202).end()
}
