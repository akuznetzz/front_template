export function capitalizeFirstChar(originalString?: string): string | undefined {
  return originalString ? originalString.charAt(0).toUpperCase() + originalString.slice(1) : originalString;
}
