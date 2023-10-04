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
  const apiURL = 'https://www.walgreens.com/common/v1/headerui';
  const path = apiURL;
  const resp = await fetch(path);

  if (!resp.ok) {
    return;
  }

  const worker = new Worker('../../scripts/absolute-worker.js');
  const jsonData = await resp.json();
  const { content } = jsonData;
  
  worker.onmessage = (e) => {
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = e.data.content;
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.firstElementChild.replaceWith(navWrapper);
    addCSSStyle(jsonData.clientCSSContent);
    addCSSStyle(jsonData.clientLSGCSSContent);
    loadFileList(jsonData.fileList);
    worker.terminate();
  }
  worker.postMessage({ source: 'header', content });
}
