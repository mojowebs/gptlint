/**
 * This not starts with capital letter.
 */
function extractDomain(url: string): string {
  return new URL(url).hostname
}

// Generated by gpt-4-0125-preview