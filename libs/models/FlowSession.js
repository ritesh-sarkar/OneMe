import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  username: { type: String, required: true, maxlength: 30 },
  title: { type: String, default: '', maxlength: 120 },
  avatar: { type: String, default: '', maxlength: 2048 },
}, { _id: false });

const contactDataSchema = new mongoose.Schema({
  email: { type: String, default: '', maxlength: 254 },
  phone: { type: String, default: '', maxlength: 40 },
  socials: {
    type: [{
      label: { type: String, maxlength: 80 },
      platform: { type: String, maxlength: 40 },
      url: { type: String, maxlength: 2048 },
    }],
    default: [],
  },
  resume: {
    fileName: { type: String, default: '', maxlength: 180 },
    fileUrl: { type: String, default: '', maxlength: 2048 },
  },
}, { _id: false });

const flowSessionSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pairKey: { type: String, required: true, maxlength: 49 },
    requesterCard: { type: cardSchema, required: true },
    recipientCard: { type: cardSchema, required: true },
    requesterFields: {
      type: [{ type: String, enum: ['email', 'phone', 'socials', 'resume'] }],
      required: true,
    },
    recipientFields: {
      type: [{ type: String, enum: ['email', 'phone', 'socials', 'resume'] }],
      default: [],
    },
    requesterData: { type: contactDataSchema, default: null },
    recipientData: { type: contactDataSchema, default: null },
    requesterNotificationReadAt: { type: Date, default: null },
    requesterNotificationDismissedAt: { type: Date, default: null },
    recipientNotificationReadAt: { type: Date, default: null },
    recipientNotificationDismissedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
      required: true,
    },
    hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, required: true },
    purgeAt: { type: Date, default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

flowSessionSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
flowSessionSchema.index({ requesterId: 1, status: 1, createdAt: -1 });
flowSessionSchema.index({ requesterId: 1, status: 1, respondedAt: -1 });
flowSessionSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
flowSessionSchema.index({ pairKey: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'pending' },
});

export const FlowSession =
  mongoose.models.FlowSession || mongoose.model('FlowSession', flowSessionSchema);
