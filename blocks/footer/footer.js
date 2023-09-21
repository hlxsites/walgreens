import { decorateIcons } from '../../scripts/lib-franklin.js';
/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
  // fetch footer content
  const resp = await fetch('https://www.walgreens.com/common/v1/footerui');
  if (resp.ok) {
    const data = await resp.json();
    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = data.content;
    decorateIcons(footer);
    block.append(footer);
    const footerStyles = document.createElement('style');
    footerStyles.innerHTML = data.clientLSGCSSContent;
    document.head.appendChild(footerStyles);
  }
}
