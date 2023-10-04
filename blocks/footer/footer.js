import { decorateIcons } from '../../scripts/lib-franklin.js';

/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
  // ?? do we need this CSS ? Footer looks good without it
  // const cssPromise = loadCSS(`${window.hlx.codeBasePath}/external-styles/footer-clientLSGCSSContent.css`);

  const worker = new Worker('../../scripts/headerfooter-worker.js');
  // decorate footer DOM
  worker.onmessage = async (e) => {
    if (!e.data.ok) {
      return;
    }

    const footer = document.createElement('div');
    footer.innerHTML = e.data.content;
    decorateIcons(footer);
    // await cssPromise;
    block.append(footer);
    worker.terminate();
  };
  worker.postMessage({ source: 'footer' });
}
