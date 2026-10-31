import mongoose from 'mongoose';

const profileDataSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

profileDataSchema.index({
  'data.profile.isPublished': 1,
  'data.profile.privacy.searchEngineIndexing': 1,
  updatedAt: -1,
});

export const ProfileData =
  mongoose.models.ProfileData || mongoose.model('ProfileData', profileDataSchema);
