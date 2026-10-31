"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { FiCamera, FiCheck, FiSkipForward, FiUser } from "react-icons/fi";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function Onboarding() {
  const { user, isLoading } = useAuth();
  const fileInput = useRef(null);
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadAvatar = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Choose an image smaller than 5 MB.");
      return;
    }

    setErrorMessage("");
    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/uploads/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "avatar" }),
      });
      const signature = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(signature.error || "Image upload is unavailable.");

      const formData = new FormData();
      Object.entries(signature.params).forEach(([key, value]) =>
        formData.append(key, String(value)),
      );
      formData.append("api_key", signature.apiKey);
      formData.append("signature", signature.signature);
      formData.append("file", file);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
        { method: "POST", body: formData },
      );
      const result = await uploadResponse.json();
      const uploadedUrl = new URL(result.secure_url || "");
      if (
        !uploadResponse.ok ||
        uploadedUrl.protocol !== "https:" ||
        uploadedUrl.hostname !== "res.cloudinary.com" ||
        !result.public_id?.startsWith(`oneme/${user?.id}/profile/`)
      ) {
        throw new Error("The image provider rejected the upload.");
      }
      setAvatar(uploadedUrl.toString());
    } catch (error) {
      setErrorMessage(error.message || "Image upload failed. Try again or continue without one.");
    } finally {
      setUploading(false);
    }
  };

  const saveSetup = async (action) => {
    setErrorMessage("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, title, bio, location, avatar }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Profile setup could not be saved.");
      window.location.assign("/dashboard");
    } catch (error) {
      setErrorMessage(error.message || "Profile setup could not be saved. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main
        className="min-h-screen bg-surface-page"
        aria-busy="true"
      />
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-page px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <section className="relative z-10 w-full max-w-2xl space-y-7 rounded-3xl border border-subtle bg-surface-deep p-6 shadow-2xl sm:p-10">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-accent"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
            1M
          </span>
          OneMe
        </Link>

        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">A great start</p>
          <h1 className="text-3xl font-black tracking-tight text-primary">
            Make your identity yours.
          </h1>
          <p className="text-sm leading-relaxed text-secondary">
            Add the essentials to your public profile. You can skip this for now and finish it later
            from your dashboard.
          </p>
        </header>

        {user && (
          <div className="rounded-2xl border border-subtle bg-surface-dark/60 p-4">
            <p className="font-semibold text-primary">{user.name}</p>
            <p className="text-sm text-secondary">
              @{user.username} · {user.email}
            </p>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveSetup("complete");
          }}
          className="space-y-5"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-accent/40 bg-accent-soft/20 p-5 text-center">
            {avatar ? (
              <img
                src={avatar}
                alt="Your profile preview"
                className="h-24 w-24 rounded-full border-2 border-accent object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-subtle bg-surface-panel text-accent">
                <FiUser className="h-10 w-10" />
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={uploadAvatar}
              className="sr-only"
              aria-label="Choose a profile picture"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={FiCamera}
              isLoading={uploading}
              onClick={() => fileInput.current?.click()}
            >
              {avatar ? "Change profile photo" : "Add a profile photo (optional)"}
            </Button>
            <p className="text-xs text-tertiary">JPEG, PNG, WebP, or AVIF · up to 5 MB</p>
          </div>

          <Input
            label="Professional title"
            placeholder="e.g. Product Designer, Founder, Software Engineer"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
          />

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-primary">A short description</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What do you do, what are you interested in, and what would you like people to know?"
              maxLength={4000}
              rows={5}
              required
              className="w-full resize-y rounded-xl border border-subtle bg-surface-dark px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
            />
            <span className="block text-right text-xs text-tertiary">{bio.length}/4000</span>
          </label>

          <Input
            label="Location (optional)"
            placeholder="City, country"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={120}
          />

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-light bg-danger-soft p-3 text-sm text-danger"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              icon={FiSkipForward}
              disabled={submitting || uploading}
              onClick={() => saveSetup("skip")}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="lg"
              icon={FiCheck}
              isLoading={submitting}
              disabled={uploading}
            >
              Save and continue
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-tertiary">
          Your profile stays unpublished until you choose to publish it in the profile editor.
        </p>
      </section>
    </main>
  );
}
