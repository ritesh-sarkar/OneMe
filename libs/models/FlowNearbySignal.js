import mongoose from 'mongoose';

const flowNearbySignalSchema = new mongoose.Schema(
  {
    exchangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlowNearbyExchange', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientSignalId: { type: String, required: true, maxlength: 36 },
    kind: { type: String, enum: ['offer', 'answer', 'candidate'], required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    acknowledgedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, minimize: false },
);

flowNearbySignalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
flowNearbySignalSchema.index({ exchangeId: 1, receiverId: 1, acknowledgedAt: 1, createdAt: 1 });
flowNearbySignalSchema.index({ exchangeId: 1, senderId: 1, clientSignalId: 1 }, { unique: true });

export const FlowNearbySignal =
  mongoose.models.FlowNearbySignal || mongoose.model('FlowNearbySignal', flowNearbySignalSchema);
