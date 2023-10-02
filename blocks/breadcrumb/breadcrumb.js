import { div, span, strong } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const desktopBlock = block;
  desktopBlock.classList.add('desktop');

  // duplicate breadcrumb information in a new section + block for mobile
  // at the and of the page
  const mobileSection = 
    div({ class: 'section breadcrumb-container', 'data-section-status': 'loading' },
      div({ class: 'breadcrumb-wrapper' },
        div({ class: 'breadcrumb block mobile', 'data-block-name': 'breadcrumb', 'data-block-status': "loaded" }),
      ),  
    );
  const mobileBlock = mobileSection.querySelector('.block');
  mobileBlock.append(desktopBlock.children[0].cloneNode(true));

  const main = block.closest('main');
  main.append(mobileSection);

  // decorate desktop block
  desktopBlock.querySelectorAll('li').forEach((item, idx, arr) => {
    const link = item.querySelector('a');
    link && link.appendChild(span({ class: 'icon icon-arrow-right' }));
  });
  await decorateIcons(desktopBlock);

  // decorate mobile block
  mobileBlock.querySelectorAll('li a').forEach((link) => {
    const linkText = link.textContent;
    link.textContent = '';

    link.append(
      document.createTextNode('‹ '),
      strong(linkText),
    );
  });
}
