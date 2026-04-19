"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  LINKEDIN_SOFT_MAX_CHARS,
  TWITTER_MAX_CHARS,
} from "@/lib/content/social-limits";
import { cn } from "@/lib/utils";

export type PlatformCopy = {
  linkedin: string;
  twitter: string;
};

export type GeneratingMode = null | "all" | "linkedin" | "twitter";

type PlatformPreviewsProps = {
  linkedinText: string;
  twitterText: string;
  onLinkedInChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  onRegenerateLinkedIn: () => void | Promise<void>;
  onRegenerateTwitter: () => void | Promise<void>;
  imagePreviewUrl: string | null;
  /** True once the user has generated at least once (enables per-platform regen). */
  hasGenerated: boolean;
  generatingMode: GeneratingMode;
  className?: string;
};

/**
 * Side-by-side previews with platform-specific chrome, inline editing, and per-platform regenerate.
 */
export function PlatformPreviews({
  linkedinText,
  twitterText,
  onLinkedInChange,
  onTwitterChange,
  onRegenerateLinkedIn,
  onRegenerateTwitter,
  imagePreviewUrl,
  hasGenerated,
  generatingMode,
  className,
}: PlatformPreviewsProps) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-2 lg:items-start",
        className,
      )}
    >
      <LinkedInPreview
        text={linkedinText}
        imageUrl={imagePreviewUrl}
        onChange={onLinkedInChange}
        onRegenerate={onRegenerateLinkedIn}
        hasGenerated={hasGenerated}
        regenerating={generatingMode === "linkedin"}
        disabled={generatingMode !== null}
      />
      <XPreview
        text={twitterText}
        onChange={onTwitterChange}
        onRegenerate={onRegenerateTwitter}
        hasGenerated={hasGenerated}
        regenerating={generatingMode === "twitter"}
        disabled={generatingMode !== null}
      />
    </div>
  );
}

function LinkedInPreview({
  text,
  imageUrl,
  onChange,
  onRegenerate,
  hasGenerated,
  regenerating,
  disabled,
}: {
  text: string;
  imageUrl: string | null;
  onChange: (value: string) => void;
  onRegenerate: () => void | Promise<void>;
  hasGenerated: boolean;
  regenerating: boolean;
  disabled: boolean;
}) {
  const { user, isLoaded } = useUser();
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Your name";
  const initial =
    (user?.firstName?.[0] ?? user?.username?.[0] ?? "?").toUpperCase();
  const overSoft = text.length > LINKEDIN_SOFT_MAX_CHARS;

  return (
    <section
      aria-label="LinkedIn preview"
      className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          LinkedIn
        </span>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-7 gap-1 text-xs"
          disabled={disabled || !hasGenerated}
          onClick={() => void onRegenerate()}
          aria-label="Regenerate LinkedIn copy"
        >
          {regenerating ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-3.5" />
          )}
          Regenerate
        </Button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
            aria-hidden
          >
            {isLoaded ? (
              user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Clerk avatar URL
                <img
                  src={user.imageUrl}
                  alt=""
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                initial
              )
            ) : (
              "…"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              Your headline · Public
            </p>
          </div>
        </div>

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img
            src={imageUrl}
            alt=""
            className="max-h-52 w-full rounded-lg border border-border object-cover"
          />
        ) : null}

        {!hasGenerated ? (
          <p className="text-sm text-muted-foreground">
            Formatted LinkedIn copy will appear here after you generate. You can
            edit text inline afterward.
          </p>
        ) : (
          <>
            <Textarea
              value={text}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-44 resize-y text-sm leading-relaxed"
              placeholder="LinkedIn post body…"
              disabled={disabled}
              aria-label="LinkedIn post text"
            />
            <p
              className={cn(
                "text-xs",
                overSoft ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground",
              )}
            >
              {text.length.toLocaleString()} / ~{LINKEDIN_SOFT_MAX_CHARS.toLocaleString()}{" "}
              characters (soft limit for feed readability)
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function XPreview({
  text,
  onChange,
  onRegenerate,
  hasGenerated,
  regenerating,
  disabled,
}: {
  text: string;
  onChange: (value: string) => void;
  onRegenerate: () => void | Promise<void>;
  hasGenerated: boolean;
  regenerating: boolean;
  disabled: boolean;
}) {
  const { user, isLoaded } = useUser();
  const handle = user?.username
    ? `@${user.username}`
    : user?.primaryEmailAddress?.emailAddress
      ? `@${user.primaryEmailAddress.emailAddress.split("@")[0]}`
      : "@you";
  const initial =
    (user?.firstName?.[0] ?? user?.username?.[0] ?? "?").toUpperCase();
  const overLimit = text.length > TWITTER_MAX_CHARS;

  return (
    <section
      aria-label="X preview"
      className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          X (Twitter)
        </span>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-7 gap-1 text-xs"
          disabled={disabled || !hasGenerated}
          onClick={() => void onRegenerate()}
          aria-label="Regenerate X post"
        >
          {regenerating ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-3.5" />
          )}
          Regenerate
        </Button>
      </div>

      <div className="p-4">
        <div className="mb-3 flex gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold"
            aria-hidden
          >
            {isLoaded ? (
              user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="size-10 object-cover"
                />
              ) : (
                initial
              )
            ) : (
              "…"
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {handle}
            </p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </div>

        {!hasGenerated ? (
          <p className="text-sm text-muted-foreground">
            Your post will appear here (max {TWITTER_MAX_CHARS} characters). Edit
            inline after generating.
          </p>
        ) : (
          <>
            <Textarea
              value={text}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-28 resize-y rounded-2xl border-border text-sm leading-normal"
              placeholder="What’s happening?"
              disabled={disabled}
              aria-label="X post text"
            />
            <p
              className={cn(
                "mt-2 text-xs",
                overLimit
                  ? "font-semibold text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {text.length} / {TWITTER_MAX_CHARS} characters
              {overLimit ? " — trim to post on X" : ""}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
