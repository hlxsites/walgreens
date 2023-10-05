import { decorateIcons } from '../../scripts/lib-franklin.js';

/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
  const worker = new Worker('../../scripts/headerfooter-worker.js');
  worker.onmessage = async (e) => {
    worker.terminate();
    if (!e.data.ok) {
      return;
    }

    const footer = document.createElement('div');
    footer.innerHTML = e.data.content;
    decorateIcons(footer);
    block.append(footer);
  };
  worker.postMessage({ source: 'footer' });
}
