import { loadCSS } from '../../scripts/lib-franklin.js';
import { loadFileList } from '../../scripts/scripts.js';

// eslint-disable-next-line no-unused-vars
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
  const cssPromises = [
    loadCSS(`${window.hlx.codeBasePath}/external-styles/header-clientCSSContent.css`),
    loadCSS(`${window.hlx.codeBasePath}/external-styles/header-clientLSGCSSContent.css`),
  ];
  const worker = new Worker('../../scripts/headerfooter-worker.js');

  worker.onmessage = async (e) => {
    if (!e.data.ok) {
      return;
    }
    const jsonData = e.data;
    new Promise(async (resolve) => {
      const nav = document.createElement('nav');
      nav.id = 'nav';
      nav.innerHTML = jsonData.content;
      const navWrapper = document.createElement('div');
      navWrapper.className = 'nav-wrapper';
      navWrapper.append(nav);
      await Promise.all(cssPromises);
      block.firstElementChild.replaceWith(navWrapper);
      resolve();
    });
    new Promise((resolve) => {
      loadFileList(jsonData.fileList);
      resolve();
    });
    worker.terminate();
  };
  worker.postMessage({ source: 'header' });
}
