import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  username: { type: String, required: true, maxlength: 30 },
  title: { type: String, default: '', maxlength: 120 },
  avatar: { type: String, default: '', maxlength: 2048 },
}, { _id: false });

const flowNearbyExchangeSchema = new mongoose.Schema(
  {
    pairKey: { type: String, required: true, maxlength: 49 },
    initiatorSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlowNearbySession', required: true },
    recipientSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlowNearbySession', required: true },
    initiatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    initiatorCard: { type: cardSchema, required: true },
    recipientCard: { type: cardSchema, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'connected', 'closed'],
      default: 'pending',
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

flowNearbyExchangeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
flowNearbyExchangeSchema.index({ initiatorSessionId: 1, status: 1, expiresAt: 1 });
flowNearbyExchangeSchema.index({ recipientSessionId: 1, status: 1, expiresAt: 1 });
flowNearbyExchangeSchema.index({ pairKey: 1 }, {
  unique: true,
  partialFilterExpression: { status: { $in: ['pending', 'accepted', 'connected'] } },
});
flowNearbyExchangeSchema.index({ initiatorSessionId: 1 }, {
  unique: true,
  partialFilterExpression: { status: { $in: ['accepted', 'connected'] } },
});
flowNearbyExchangeSchema.index({ recipientSessionId: 1 }, {
  unique: true,
  partialFilterExpression: { status: { $in: ['accepted', 'connected'] } },
});

export const FlowNearbyExchange =
  mongoose.models.FlowNearbyExchange || mongoose.model('FlowNearbyExchange', flowNearbyExchangeSchema);
