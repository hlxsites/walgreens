/**
 * Remaps the relative urls to absolute urls.
 * @param {string} content string of html with relative urls
 * @returns the string with absolute urls
 */
function resolveRelativeURLs(content, privacyIcon, localPrivacyIcon) {
  const baseUrl = 'https://www.walgreens.com';

  // Use a regular expression to find relative links (starting with "/")
  const relativeLinkRegex = /(?:href|action)="(?!\/images\/)(\/[^"]+)"/g;
  let absoluteContent = content.replace(relativeLinkRegex, (match, relativePath) => {
    // Combine the base URL and the relative path to create an absolute URL
    const absoluteUrl = `${baseUrl}${relativePath}`;
    return `href="${absoluteUrl}"`;
  });
  absoluteContent = absoluteContent.replace(privacyIcon, localPrivacyIcon);
  return absoluteContent;
}

onmessage = async (e) => {
  const APIs = {
    header: 'https://www.walgreens.com/common/v1/headerui',
    footer: 'https://www.walgreens.com/common/v1/footerui',
  };
  const { source, privacyIcon, localPrivacyIcon } = e.data;
  const resp = await fetch(APIs[source]);

  if (!resp.ok) {
    postMessage({ source, ok: resp.ok });
    return;
  }

  const jsonData = await resp.json();
  jsonData.content = resolveRelativeURLs(jsonData.content, privacyIcon, localPrivacyIcon);

  postMessage({
    source,
    ok: resp.ok,
    ...jsonData,
  });
};
