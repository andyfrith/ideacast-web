/**
 * Reads a local file as a data URL and splits out raw base64 + media type for APIs.
 */
export async function readFileAsBase64Parts(file: File): Promise<{
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}> {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as const;
  if (!allowed.includes(file.type as (typeof allowed)[number])) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid image data");
  }
  const mediaType = match[1] as (typeof allowed)[number];
  return { base64: match[2], mediaType };
}
