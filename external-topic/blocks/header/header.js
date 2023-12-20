import { loadFileList } from '../../scripts/scripts.js';

async function addContent(block, jsonData) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(jsonData.content, 'text/html');
  const includeContent = Array.from(doc.body.children);
  block.parentElement.replaceWith(includeContent[0]);
  let previousEl = includeContent[0];
  includeContent.slice(1).forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const script = document.createElement('script');
      const attributes = node.getAttributeNames();

      for (let i = 0; i < attributes.length; i += 1) {
        const attribute = attributes[i];
        const value = node.getAttribute(attribute);
        script.setAttribute(attribute, value);
      }

      if (!script.getAttribute('type')) {
        script.setAttribute('type', 'text/javascript');
      }
      script.innerHTML = node.innerHTML;
      previousEl.insertAdjacentElement('afterend', script);
      previousEl = script;
    } else {
      previousEl.insertAdjacentElement('afterend', node);
      previousEl = node;
    }
  });
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
