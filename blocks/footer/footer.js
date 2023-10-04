import { decorateIcons } from '../../scripts/lib-franklin.js';
import { resolveRelativeURLs } from '../../scripts/worker-commons.js';

/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
  // fetch footer content
  const resp = await fetch('https://www.walgreens.com/common/v1/footerui');
  if (!resp.ok) {
    return;
  }

  const worker = new Worker('../../scripts/absolute-worker.js');
  const data = await resp.json();
  // decorate footer DOM
  worker.onmessage = (e) => {
    const footer = document.createElement('div');
    footer.innerHTML = e.data.content;
    decorateIcons(footer);
    block.append(footer);
    const footerStyles = document.createElement('style');
    footerStyles.innerHTML = data.clientLSGCSSContent;
    document.head.appendChild(footerStyles);
  }
  worker.postMessage({ source: 'header', content: data.content });
}
