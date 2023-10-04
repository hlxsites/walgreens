import { decorateIcons } from '../../scripts/lib-franklin.js';

/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
  const worker = new Worker('../../scripts/absolute-worker.js');
  // decorate footer DOM
  worker.onmessage = (e) => {
    if (!e.data.ok) {
      return;
    }

    const data = e.data;
    const footer = document.createElement('div');
    // footer.innerHTML = data.content;
    // decorateIcons(footer);
    block.append(footer);
    // const footerStyles = document.createElement('style');
    // footerStyles.innerHTML = data.clientLSGCSSContent;
    document.head.appendChild(footerStyles);
  }
  worker.postMessage({ source: 'footer' });
}
