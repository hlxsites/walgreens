import { loadFileList } from '../../scripts/scripts.js';
import { resolveRelativeURLs } from '../../scripts/worker-commons.js';

function addCSSStyle(css) {
  const styleEl = document.querySelector('style');
  if (styleEl) {
    styleEl.innerHTML += css;
  } else {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.append(style);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const worker = new Worker('../../scripts/absolute-worker.js');
  
  worker.onmessage = (e) => {
    if (!e.data.ok) {
      return;
    }
    
    const jsonData = e.data;
    const nav = document.createElement('nav');
    nav.id = 'nav';
    // nav.innerHTML = jsonData.content;
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.firstElementChild.replaceWith(navWrapper);
    // addCSSStyle(jsonData.clientCSSContent);
    // addCSSStyle(jsonData.clientLSGCSSContent);
    loadFileList(jsonData.fileList);
    worker.terminate();
  }
  worker.postMessage({ source: 'header' });
}
