"use client";

import React, { useState, useEffect } from "react";
import { generateQrDataUrl } from "@/libs/qr";
import { FiDownload, FiCopy, FiCheck, FiShare2 } from "react-icons/fi";
import { Button } from "@/components/Button";
import { copyToClipboard } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";

export function QrGenerator({
  url,
  title = "Scan to view OneMe Profile",
  username = "ritesh",
  darkColor = "#000000",
  lightColor = "#ffffff",
  className = "",
}) {
  const [qrUrl, setQrUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (url) {
      generateQrDataUrl(url, {
        color: { dark: darkColor, light: lightColor },
        width: 480,
      }).then((data) => setQrUrl(data));
    }
  }, [url, darkColor, lightColor]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `oneme_qr_${username}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("QR Code saved as high-res PNG image!");
  };

  const handleCopyLink = () => {
    copyToClipboard(url);
    setCopied(true);
    success("Profile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col items-center text-center space-y-4 ${className}`}
    >
      <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-4 border-accent-soft overflow-hidden">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="OneMe QR Code"
            className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
          />
        ) : (
          <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-surface-panel text-secondary">
            <span className="text-xs font-mono animate-pulse">
              Generating QR...
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-primary">{title}</h4>
        <p className="text-xs text-secondary font-mono break-all max-w-xs">
          {url}
        </p>
      </div>

      <div className="flex items-center gap-2.5 w-full max-w-xs">
        <Button
          onClick={handleDownload}
          variant="primary"
          size="sm"
          icon={FiDownload}
          className="flex-1"
        >
          Download PNG
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          icon={copied ? FiCheck : FiCopy}
          className="flex-1"
        >
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}
