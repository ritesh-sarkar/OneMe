"use client";

import React, { useRef } from "react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { Button } from "@/components/Button";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function CredentialImageField({ image, label, onChange, onError }) {
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.has(file.type)) {
      onError("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError("Choose an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange({ file, preview: String(reader.result || "") });
    reader.onerror = () => onError("The selected image could not be previewed.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <span className="form-label">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="sr-only"
      />
      {image ? (
        <div className="flex items-center gap-3">
          <img
            src={image}
            alt={`${label} preview`}
            className="h-16 w-16 rounded-xl border border-subtle object-cover"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={FiUploadCloud}
              onClick={() => inputRef.current?.click()}
            >
              Replace image
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={FiTrash2}
              onClick={() => onChange({ file: null, preview: "" })}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={FiImage}
          onClick={() => inputRef.current?.click()}
        >
          Add image
        </Button>
      )}
      <p className="text-xs text-secondary">JPEG, PNG, WebP, or AVIF · up to 5 MB</p>
    </div>
  );
}
