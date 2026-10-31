import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: ['profile_view', 'link_click', 'resume_download', 'contact_click'],
      required: true,
    },
    target: { type: String, maxlength: 80, default: '' },
    visitorHash: { type: String, required: true },
    dedupeBucket: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false },
);

analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
analyticsEventSchema.index(
  { ownerId: 1, eventType: 1, visitorHash: 1, dedupeBucket: 1, target: 1 },
  { unique: true },
);
analyticsEventSchema.index({ ownerId: 1, createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema);
