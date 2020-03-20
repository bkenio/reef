#!/bin/bash
set -e

echo "Setting envs"
BUCKET=$1
VIDEO_ID=$2
FILENAME=$3

TMP_DIR="local/$VIDEO_ID"
mkdir -p local/$VIDEO_ID

SEGMENTS_DIR="$TMP_DIR/segments"
SOURCE_VIDEO="$TMP_DIR/$FILENAME"
mkdir -p $SEGMENTS_DIR

AUDIO_FILENAME="source.wav"
AUDIO_PATH="$TMP_DIR/$AUDIO_FILENAME"

echo "Downloading source clip"
aws s3 cp s3://$BUCKET/uploads/$VIDEO_ID/$FILENAME $SOURCE_VIDEO

echo "Exporting audio"
ffmpeg -i $SOURCE_VIDEO -threads 1 $AUDIO_PATH

echo "Uploading audio"
aws s3 cp $AUDIO_PATH s3://$BUCKET/audio/$VIDEO_ID/$AUDIO_FILENAME

echo "Segmenting video"
ffmpeg -i $SOURCE_VIDEO -y -threads 1 -c copy -f segment -segment_time 10 -an $SEGMENTS_DIR/output_%04d.mkv

echo "Segmentation complete"
ls $TMP_DIR
ls $SEGMENTS_DIR

echo "Getting video metadata"
METADATA=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 $SOURCE_VIDEO)
ARR=(${METADATA//,/ })
WIDTH=${ARR[0]}
HEIGHT=${ARR[1]}

echo "Video Width: $WIDTH"
echo "Video Height: $HEIGHT"

echo "Uploading segments"
aws s3 sync $SEGMENTS_DIR s3://$BUCKET/segments/$VIDEO_ID/

# for PRESET in "1080p-libx264"; do
#   for SEGMENT in $(ls $SEGMENTS_DIR); do
#     FILE_PATH=$TMP_DIR/${PRESET}-${SEGMENT}.json

#     echo "enqueing $PRESET:$SEGMENT"

#     jq -n \
#     --arg cmd "-c:v libx264 -profile:v high -vf scale=1080:-2 -coder 1 -pix_fmt yuv420p -bf 2 -crf 27 -preset slow -threads 1" \
#     --arg preset $PRESET \
#     --arg bucket $BUCKET \
#     --arg segment $SEGMENT \
#     --arg video_id $VIDEO_ID \
#     --arg aws_access_key_id $AWS_ACCESS_KEY_ID \
#     --arg github_access_token $GITHUB_ACCESS_TOKEN \
#     --arg aws_secret_access_key $AWS_SECRET_ACCESS_KEY \
#     '{
#       Meta: {
#         cmd:$cmd,
#         preset:$preset,
#         bucket:$bucket,
#         segment:$segment,
#         video_id:$video_id,
#         aws_access_key_id:$aws_access_key_id,
#         github_access_token:$github_access_token,
#         aws_secret_access_key:$aws_secret_access_key
#       }
#     }' \
#     > $DISPATCH_META_FILE

#     aws sqs send-message \
#       --queue-url "" \
#       --message-body file://
#   done
# done

# for PRESET in "1080p-libx264"; do
#   for SEGMENT in $(ls $SEGMENTS_DIR); do
#     echo "Enqueuing transcoding requests"

#     aws
#     # ls

#     DISPATCH_META_FILE=$(mktemp)

#     curl \
#     --request POST \
#     --data @$DISPATCH_META_FILE \
#     "http://${NOMAD_IP_host}:4646/v1/job/transcoding/dispatch"

#     rm $DISPATCH_META_FILE
#   done

#   echo "Enqueuing concatination requests"
#     CONCATINATION_DISPATCH_FILE=$(mktemp)

#     jq -n \
#     --arg preset $PRESET \
#     --arg bucket $BUCKET \
#     --arg video_id $VIDEO_ID \
#     --arg aws_access_key_id $AWS_ACCESS_KEY_ID \
#     --arg github_access_token $GITHUB_ACCESS_TOKEN \
#     --arg aws_secret_access_key $AWS_SECRET_ACCESS_KEY \
#     '{
#       Meta: {
#         preset:$preset,
#         bucket:$bucket,
#         video_id:$video_id,
#         aws_access_key_id:$aws_access_key_id,
#         github_access_token:$github_access_token,
#         aws_secret_access_key:$aws_secret_access_key
#       }
#     }' \
#     > $CONCATINATION_DISPATCH_FILE

#     curl \
#     --request POST \
#     --data @$CONCATINATION_DISPATCH_FILE \
#     "http://${NOMAD_IP_host}:4646/v1/job/concatinating/dispatch"

#     rm $CONCATINATION_DISPATCH_FILE
# done

echo "Segmenting success!"
