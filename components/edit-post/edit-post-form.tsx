"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, SparklesIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  PlatformPreviews,
  type GeneratingMode,
  type PlatformCopy,
} from "@/components/edit-post/platform-previews";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PostDto } from "@/hooks/use-post";
import { DEFAULT_TEMPLATE_ID } from "@/lib/content/default-templates";
import { readFileAsBase64Parts } from "@/lib/client/image-data-url";
import { postKeys } from "@/lib/queries/post-keys";
import { cn } from "@/lib/utils";

type TemplateOption = {
  id: string;
  name: string;
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const emptyCopy = (): PlatformCopy => ({ linkedin: "", twitter: "" });

function formattedToCopy(fc: unknown): PlatformCopy {
  if (!fc || typeof fc !== "object") {
    return emptyCopy();
  }
  const o = fc as Record<string, unknown>;
  return {
    linkedin: typeof o.linkedin === "string" ? o.linkedin : "",
    twitter: typeof o.twitter === "string" ? o.twitter : "",
  };
}

function isUuid(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

function buildInitialEditorState(
  initialPostId: string | null,
  initialPostSnapshot: PostDto | null,
) {
  if (
    !initialPostId ||
    !initialPostSnapshot ||
    initialPostSnapshot.id !== initialPostId
  ) {
    return {
      rawContent: "",
      platformCopy: emptyCopy(),
      hasGenerated: false,
      serverImageUrl: null as string | null,
    };
  }
  const copy = formattedToCopy(initialPostSnapshot.formattedContent);
  const hasText =
    copy.linkedin.trim().length > 0 || copy.twitter.trim().length > 0;
  return {
    rawContent: initialPostSnapshot.rawContent ?? "",
    platformCopy: copy,
    hasGenerated: hasText,
    serverImageUrl: initialPostSnapshot.imageUrl ?? null,
  };
}

export type EditPostFormProps = {
  /** When set, the editor targets this post id (save uses PATCH). */
  initialPostId?: string | null;
  /** Server snapshot when opening an existing post; omitted for new posts. */
  initialPostSnapshot?: PostDto | null;
};

/**
 * New or existing post editor: raw input, optional image, template selection, generate, inline preview edits, save draft.
 */
export function EditPostForm({
  initialPostId = null,
  initialPostSnapshot = null,
}: EditPostFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const initialEditor = buildInitialEditorState(
    initialPostId,
    initialPostSnapshot,
  );

  const [postId, setPostId] = React.useState<string | null>(
    initialPostId && isUuid(initialPostId) ? initialPostId : null,
  );
  const [templates, setTemplates] = React.useState<TemplateOption[]>([]);
  const [templatesLoading, setTemplatesLoading] = React.useState(true);
  const [templateId, setTemplateId] = React.useState<string>(DEFAULT_TEMPLATE_ID);
  const [rawContent, setRawContent] = React.useState(initialEditor.rawContent);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [serverImageUrl] = React.useState(initialEditor.serverImageUrl);
  const imagePreviewUrl = React.useMemo(() => {
    if (!imageFile) {
      return null;
    }
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const [platformCopy, setPlatformCopy] = React.useState(
    initialEditor.platformCopy,
  );
  const [hasGenerated, setHasGenerated] = React.useState(
    initialEditor.hasGenerated,
  );
  const [generatingMode, setGeneratingMode] = React.useState<GeneratingMode>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      void (async () => {
        try {
          const res = await fetch("/api/templates");
          if (!res.ok) {
            throw new Error("Could not load templates");
          }
          const data = (await res.json()) as { templates: TemplateOption[] };
          if (cancelled) {
            return;
          }
          setTemplates(
            data.templates.map((t) => ({ id: t.id, name: t.name })),
          );
          if (data.templates.length > 0) {
            const hasDefault = data.templates.some(
              (t) => t.id === DEFAULT_TEMPLATE_ID,
            );
            setTemplateId(
              hasDefault ? DEFAULT_TEMPLATE_ID : data.templates[0].id,
            );
          }
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Failed to load templates",
          );
        } finally {
          if (!cancelled) {
            setTemplatesLoading(false);
          }
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(null);
    e.target.value = "";
    if (!file) {
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }
    setImageFile(file);
  };

  const buildImagePayload = async () => {
    if (!imageFile) {
      return {} as {
        imageBase64?: string;
        imageMediaType?: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
      };
    }
    const parts = await readFileAsBase64Parts(imageFile);
    return {
      imageBase64: parts.base64,
      imageMediaType: parts.mediaType,
    };
  };

  const handleGenerate = async () => {
    if (!rawContent.trim()) {
      toast.error("Add some ideas or notes first.");
      return;
    }
    setGeneratingMode("all");
    setPlatformCopy(emptyCopy());
    try {
      const imagePayload = await buildImagePayload();
      const res = await fetch("/api/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent,
          templateId,
          ...imagePayload,
        }),
      });
      const body = (await res.json()) as {
        formatted?: PlatformCopy;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body.error ?? "Generation failed");
      }
      if (!body.formatted) {
        throw new Error("No formatted content returned");
      }
      setPlatformCopy(body.formatted);
      setHasGenerated(true);
      toast.success("Content generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingMode(null);
    }
  };

  const runSinglePlatformRegenerate = async (platform: "linkedin" | "twitter") => {
    if (!rawContent.trim()) {
      toast.error("Add some ideas or notes first.");
      return;
    }
    setGeneratingMode(platform);
    try {
      const imagePayload = await buildImagePayload();
      const res = await fetch("/api/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent,
          templateId,
          ...imagePayload,
          regeneratePlatform: platform,
          existingFormatted: {
            linkedin: platformCopy.linkedin,
            twitter: platformCopy.twitter,
          },
        }),
      });
      const body = (await res.json()) as {
        formatted?: PlatformCopy;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body.error ?? "Regeneration failed");
      }
      if (!body.formatted) {
        throw new Error("No formatted content returned");
      }
      setPlatformCopy(body.formatted);
      toast.success(
        platform === "linkedin"
          ? "LinkedIn copy regenerated"
          : "X copy regenerated",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setGeneratingMode(null);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        rawContent,
        formattedContent: {
          linkedin: platformCopy.linkedin,
          twitter: platformCopy.twitter,
        },
      };

      if (postId && isUuid(postId)) {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(body.error ?? "Could not update draft");
        }
        toast.success("Draft saved");
        void queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
        void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
        router.refresh();
        return;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as {
        post?: PostDto;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body.error ?? "Could not save draft");
      }
      if (!body.post?.id) {
        throw new Error("Could not save draft");
      }
      setPostId(body.post.id);
      queryClient.setQueryData(postKeys.detail(body.post.id), body.post);
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      router.replace(`/edit-post?postId=${body.post.id}`);
      toast.success("Draft saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const busy = generatingMode !== null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <select
              id="template"
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              disabled={templatesLoading || templates.length === 0 || busy}
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {templatesLoading ? (
              <p className="text-xs text-muted-foreground">Loading templates…</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="raw">Raw ideas</Label>
            <Textarea
              id="raw"
              placeholder="Dump your rough notes, bullets, or ideas here…"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image (optional)</Label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              onChange={onPickImage}
              disabled={busy}
            />
            {imageFile ? (
              <p className="text-xs text-muted-foreground">{imageFile.name}</p>
            ) : serverImageUrl ? (
              <p className="text-xs text-muted-foreground">
                A saved image is attached. Pick a new file to replace it for generation (upload to storage is not wired yet).
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={busy || templatesLoading}
            >
              {generatingMode === "all" ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SparklesIcon className="size-4" />
              )}
              Generate both
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={saving || busy}
            >
              {saving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              Save draft
            </Button>
          </div>
          {hasGenerated ? (
            <p className="text-xs text-muted-foreground">
              Edits in the previews are kept until you save the draft or run
              generate again.
            </p>
          ) : null}
        </div>

        <PlatformPreviews
          linkedinText={platformCopy.linkedin}
          twitterText={platformCopy.twitter}
          onLinkedInChange={(v) =>
            setPlatformCopy((p) => ({ ...p, linkedin: v }))
          }
          onTwitterChange={(v) =>
            setPlatformCopy((p) => ({ ...p, twitter: v }))
          }
          onRegenerateLinkedIn={() => runSinglePlatformRegenerate("linkedin")}
          onRegenerateTwitter={() => runSinglePlatformRegenerate("twitter")}
          imagePreviewUrl={imagePreviewUrl}
          remoteImageUrl={imageFile ? null : serverImageUrl}
          hasGenerated={hasGenerated}
          generatingMode={generatingMode}
        />
      </div>
    </div>
  );
}
