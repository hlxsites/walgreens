import { loadFileList, resolveRelativeURLs } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

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
  const apiURL = 'https://www.walgreens.com/common/v1/headerui'; // block.querySelector('a');
  const path = apiURL; // ? apiURL.getAttribute('href') : block.textContent.trim();
  const resp = await fetch(path);

  if (resp.ok) {
    const jsonData = await resp.json();
    const content = jsonData.content;
    const absoluteContent = resolveRelativeURLs(content);
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = absoluteContent;
    addCSSStyle(jsonData.clientCSSContent);
    addCSSStyle(jsonData.clientLSGCSSContent);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.firstElementChild.replaceWith(navWrapper);
    loadFileList(jsonData.fileList);
  }
}
