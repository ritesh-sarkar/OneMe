import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    username: { type: String, required: true, trim: true, lowercase: true, maxlength: 30 },
    passwordHash: { type: String, required: true, select: false },
    emailVerifiedAt: { type: Date, default: null },
    onboardingCompletedAt: { type: Date, default: null },
    onboardingSkippedAt: { type: Date, default: null },
    sessionVersion: { type: Number, default: 0, required: true },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
