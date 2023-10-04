/**
 * Remaps the relative urls to absolute urls.
 * @param {string} content string of html with relative urls
 * @returns the string with absolute urls
 */
export function resolveRelativeURLs(content) {
  const baseUrl = 'https://walgreens.com';

  // Use a regular expression to find relative links (starting with "/")
  const relativeLinkRegex = /(?:href|action)="(?!\/images\/)(\/[^"]+)"/g;
  const absoluteContent = content.replace(relativeLinkRegex, (match, relativePath) => {
    // Combine the base URL and the relative path to create an absolute URL
    const absoluteUrl = `${baseUrl}${relativePath}`;
    return `href="${absoluteUrl}"`;
  });
  return absoluteContent;
}