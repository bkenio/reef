const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;

const defaultThumbnail =
  'https://s3.us-east-2.wasabisys.com/media-bken/files/default-thumbnail-sm.jpg';

const videoFile = new Schema({
  link: { type: String },
  createdAt: { type: String },
  completedAt: { type: String },
  status: { type: String, default: 'queueing', required: true },
  percentCompleted: { type: Number, default: 0, required: true },
});

const videoSchema = new Schema(
  {
    title: { type: String, required: true, default: shortid.generate },
    status: { type: String, required: true, default: 'uploading' },
    sourceFile: { type: String, required: false },
    _id: { type: String, default: shortid.generate },
    hd720: { type: videoFile },
    hd1080: { type: videoFile },
    hd1440: { type: videoFile },
    hd2160: { type: videoFile },
    highQuality: { type: videoFile },
    thumbnail: { type: String, default: defaultThumbnail, required: true },
    views: { type: Number, default: 0, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text' });

module.exports = mongoose.model('Video', videoSchema);
