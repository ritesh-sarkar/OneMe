import mongoose from 'mongoose';

const flowQrSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, maxlength: 64 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'claimed', 'completed'],
      default: 'active',
      required: true,
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

flowQrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const FlowQrSession =
  mongoose.models.FlowQrSession || mongoose.model('FlowQrSession', flowQrSessionSchema);
