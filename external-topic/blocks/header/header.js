import { loadFileList } from '../../scripts/scripts.js';

async function addContent(block, jsonData) {
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = jsonData.content;
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.firstElementChild.replaceWith(navWrapper);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const worker = new Worker(`${window.hlx.codeBasePath}/scripts/headerfooter-worker.js`);

  worker.onmessage = async (e) => {
    worker.terminate();

    if (!e.data.ok) {
      return;
    }
    const jsonData = e.data;
    addContent(block, jsonData);
    loadFileList(jsonData.fileList);
  };
  worker.postMessage({ source: 'header' });
}
