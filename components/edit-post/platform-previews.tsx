"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type PlatformCopy = {
  linkedin: string;
  twitter: string;
};

type PlatformPreviewsProps = {
  copy: PlatformCopy | null;
  imagePreviewUrl: string | null;
  className?: string;
};

/**
 * Side-by-side styled previews for LinkedIn and X (read-only in Phase 3).
 */
export function PlatformPreviews({
  copy,
  imagePreviewUrl,
  className,
}: PlatformPreviewsProps) {
  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-2 lg:items-start",
        className,
      )}
    >
      <LinkedInPreview
        text={copy?.linkedin ?? ""}
        imageUrl={imagePreviewUrl}
        empty={!copy}
      />
      <XPreview text={copy?.twitter ?? ""} empty={!copy} />
    </div>
  );
}

function LinkedInPreview({
  text,
  imageUrl,
  empty,
}: {
  text: string;
  imageUrl: string | null;
  empty: boolean;
}) {
  return (
    <section
      aria-label="LinkedIn preview"
      className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        LinkedIn
      </div>
      <div className="space-y-3 p-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-side object URL preview only
          <img
            src={imageUrl}
            alt=""
            className="max-h-48 w-full rounded-lg object-cover"
          />
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {empty ? (
            <span className="text-muted-foreground">
              Formatted LinkedIn copy will appear here after you generate.
            </span>
          ) : (
            text
          )}
        </p>
      </div>
    </section>
  );
}

function XPreview({ text, empty }: { text: string; empty: boolean }) {
  return (
    <section
      aria-label="X preview"
      className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        X (Twitter)
      </div>
      <div className="p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {empty ? (
            <span className="text-muted-foreground">
              Formatted post will appear here after you generate (max 280
              characters).
            </span>
          ) : (
            text
          )}
        </p>
        {!empty ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {text.length} / 280 characters
          </p>
        ) : null}
      </div>
    </section>
  );
}
