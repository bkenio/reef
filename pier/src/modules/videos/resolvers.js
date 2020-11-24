const Video = require('./model');
const User = require('../users/model');
const { viewVideo } = require('../views/loaders');
const { getVideosByUsername, getTidalVersionsById, deleteVideoById, getTidalThumbnailsById } = require('./loaders');

const ds3 = require('../../utils/ds3');
const dispatchJob = require('../../utils/dispatchJob');
const { DIGITAL_OCEAN_TIDAL_BUCKET } = require('../../utils/config');

const resolvers =  {
  Video: {
    tidal({ id }) {
      return getTidalVersionsById(id);
    },
    async user({ user }) {
      const userAccount = await User.findById(user);
      userAccount.id = userAccount._id;
      return userAccount;
    },
    thumbnails({ id }) {
      return getTidalThumbnailsById(id);
    },
  },
  Query: {
    async video(__, { id }, ctx) {
      const video = await Video.findById(id);
      await viewVideo(video, ctx);
      return video;
    },
    async videos(_, { title }) {
      return Video.find({ visibility: 'public', '$text': {'$search': title} }).sort({ createdAt: -1 });
    },
    getRecentVideos() {
      return Video.find({ visibility: 'public' }).sort({ createdAt: -1 });
    },
    videosByUsername(__, { username }) {
      return getVideosByUsername(username);
    },
  },
  Mutation: {
    async deleteVideo(__, { id }, { user, authenticate }) {
      authenticate();
      const { id: vid } = await Video.findOne({ _id: id, user: user.id });
      return deleteVideoById(vid);
    },
    async updateVideoTitle(__, { input: { id, title } }, { user, authenticate }) {
      authenticate();
      return Video.findOneAndUpdate({ _id: id, user: user.id }, { title }, { new: true });
    },
    async updateVideoVisibility(__, { id, visibility }, { user, authenticate }) {
      authenticate();
      return  Video.findOneAndUpdate({ _id: id, user: user.id }, { visibility }, { new: true });
    },
    async reprocessVideos(_, { ids }, { authenticate, authorize }) {
      authenticate();
      authorize('role', 'admin');
      const videos = [];

      for (const id of ids) {
        console.log('reprocessing', id);
        const video = await Video.findById(id);

        const { Contents } = await ds3.listObjectsV2({
          Delimiter: '/',
          Prefix: `${id}/`,
          Bucket: DIGITAL_OCEAN_TIDAL_BUCKET,
        }).promise();
  
        const [sourceVideo] = Contents.map(({ Key }) => Key).filter(k => k.includes('source.'));
  
        await dispatchJob('thumbnail', {
          s3_out: `s3://cdn.bken.io/i/${id}/t/thumb.webp`,
          s3_in: `s3://${DIGITAL_OCEAN_TIDAL_BUCKET}/${sourceVideo}`,
          cmd: '-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50',
        });
        
        await dispatchJob('ingest', {
          s3_in: `s3://${DIGITAL_OCEAN_TIDAL_BUCKET}/${sourceVideo}`,
        });
  
        videos.push(video);
      }

      return videos;
    },
  },
};

module.exports = {
  resolvers,
};
