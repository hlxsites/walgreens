/**
 * Remaps the relative urls to absolute urls.
 * @param {string} content string of html with relative urls
 * @returns the string with absolute urls
 */
function resolveRelativeURLs(content) {
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

onmessage = async (e) => {
  const APIs = {
    header: 'https://www.walgreens.com/common/v1/headerui',
    footer: 'https://www.walgreens.com/common/v1/footerui',
  }
  const { source } = e.data;
  const apiURL = APIs[source];
  const resp = await fetch(apiURL); //TODO validate

  if (!resp.ok) {
    postMessage({
      source,
      ok: resp.ok,
    })
    return;
  }

  const jsonData = await resp.json();
  jsonData.content = resolveRelativeURLs(jsonData.content);

  console.error(`Message received from ${source}`);
  postMessage({
    source,
    ok: resp.ok,
    ...jsonData,
  });
  console.error(`Posting message back to ${source}`);
};