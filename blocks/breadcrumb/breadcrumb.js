import { div, span, strong } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const desktopBlock = block;
  desktopBlock.classList.add('desktop');

  // duplicate breadcrumb information in a new section + block for mobile
  // at the and of the page
  const mobileSection = (
    div({ class: 'section breadcrumb-container', 'data-section-status': 'loading' },
      div({ class: 'breadcrumb-wrapper' },
        div({ class: 'breadcrumb block mobile', 'data-block-name': 'breadcrumb', 'data-block-status': 'loaded' }),
      ),
    )
  );
  const mobileBlock = mobileSection.querySelector('.block');
  mobileBlock.style.display = 'none'; // hide in the beginning to avoid CLS
  mobileBlock.append(desktopBlock.children[0].cloneNode(true));

  const main = block.closest('main');
  main.append(mobileSection);

  // decorate desktop block
  desktopBlock.querySelectorAll('li').forEach((item) => {
    const link = item.querySelector('a');
    if (!link) return;

    link.appendChild(span({ class: 'icon icon-arrow-right' }));
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

  // only show the mobile breadcrumb, once the previous section is fully loaded
  const previousSection = mobileSection.previousElementSibling;
  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'attributes'
        && mutation.attributeName === 'data-section-status'
        && previousSection.attributes.getNamedItem('data-section-status').value === 'loaded') {
        observer.disconnect();
        console.log('here');
        mobileBlock.style.display = null;
      }
    });
  });

  observer.observe(previousSection, { attributes: true });
}
