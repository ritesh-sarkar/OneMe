import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  username: { type: String, required: true, maxlength: 30 },
  title: { type: String, default: '', maxlength: 120 },
  avatar: { type: String, default: '', maxlength: 2048 },
}, { _id: false });

const flowNearbySessionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    card: { type: cardSchema, required: true },
    status: { type: String, enum: ['active', 'stopped'], default: 'active', required: true },
    lastSeenAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

flowNearbySessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
flowNearbySessionSchema.index({ status: 1, expiresAt: 1 });
flowNearbySessionSchema.index({ ownerId: 1, status: 1, expiresAt: 1 });

export const FlowNearbySession =
  mongoose.models.FlowNearbySession || mongoose.model('FlowNearbySession', flowNearbySessionSchema);
