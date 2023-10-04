import { loadCSS } from '../../scripts/lib-franklin.js';
import { loadFileList } from '../../scripts/scripts.js';

async function addContent(block, jsonData, cssPromises) {
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = jsonData.content;
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  // await Promise.all(cssPromises);
  block.firstElementChild.replaceWith(navWrapper);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
   const cssPromises = [
  //   loadCSS(`${window.hlx.codeBasePath}/external-styles/header-clientCSSContent.css`),
  //   loadCSS(`${window.hlx.codeBasePath}/external-styles/header-clientLSGCSSContent.css`),
  ];
  const worker = new Worker('../../scripts/headerfooter-worker.js');

  worker.onmessage = async (e) => {
    worker.terminate();

    if (!e.data.ok) {
      return;
    }
    const jsonData = e.data;
    addContent(block, jsonData, cssPromises);
    loadFileList(jsonData.fileList);
  };
  worker.postMessage({ source: 'header' });
}
