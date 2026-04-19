/**
 * Appended to the template system prompt when only one platform should be returned.
 */
export function singlePlatformJsonSuffix(
  platform: "linkedin" | "twitter",
): string {
  return `\n\nOUTPUT CONSTRAINT: Respond with a JSON object that contains ONLY the key "${platform}" (a string value). Do not include the other platform key.`;
}
