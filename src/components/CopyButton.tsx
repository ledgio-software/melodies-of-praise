"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy number" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable: number is still visible to copy by hand */
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
