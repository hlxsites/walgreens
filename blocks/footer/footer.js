import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';

/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
  const cssPromise = loadCSS(`${window.hlx.codeBasePath}/styles/header-clientCSSContent.css`);

  const worker = new Worker('../../scripts/absolute-worker.js');
  // decorate footer DOM
  worker.onmessage = async (e) => {
    if (!e.data.ok) {
      return;
    }

    const data = e.data;
    const footer = document.createElement('div');
    footer.innerHTML = data.content;
    decorateIcons(footer);
    await cssPromise;
    block.append(footer);

  }
  worker.postMessage({ source: 'footer' });
}
