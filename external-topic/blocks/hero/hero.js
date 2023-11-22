import { toClassName, waitForEagerImageLoad } from '../../scripts/aem.js';

export default async function decorate(block) {
  [...block.children].forEach((row) => {
    if (row.children.length < 2) return;

    const [configCell, contentCell] = row.children;

    const config = configCell.textContent.toLowerCase().trim();
    if (config === 'desktop') {
      row.classList.add('background-desktop');
    }

    if (config === 'mobile') {
      row.classList.add('background-mobile');
    }

    if (config === 'overlay') {
      row.classList.add('hero-overlay');
    }

    const supportedOverrides = [
      'text color',
      'desktop text color',
      'mobile text color',

      'background color',
      'desktop background color',
      'mobile background color',

      'text align',
      'mobile text align',
      'desktop text align',

      'paragraph padding',
      'mobile paragraph padding',
      'desktop paragraph padding',

      'title size',
      'desktop title size',
      'mobile title size',

      'subtitle size',
      'desktop subtitle size',
      'mobile subtitle size',
    ];

    if (supportedOverrides.includes(config)) {
      if (contentCell.textContent) {
        const cssVar = `--hero-${toClassName(config)}`;
        block.style.setProperty(cssVar, contentCell.textContent);
      }
      contentCell.remove();
    }

    configCell.remove();
  });

  const link = block.querySelector('a');
  link.parentElement.remove();

  if (link) {
    link.textContent = '';
    link.append(...block.children);
    block.append(link);
  }

  if (document.querySelector('.hero') !== block) {
    block.style.marginBottom = '50px';
  }

  /*
   * avoid CLS by not displaying the block until the image has finished loading
   * in this case, it is acceptable to block until the image has loaded,
   * because the Hero background is also the LCP
   */
  let lcpImage = null;
  if (window.matchMedia('(max-width: 768px)').matches) {
    lcpImage = block.querySelector('.background-mobile img');
  } else {
    lcpImage = block.querySelector('.background-desktop img');
  }
  await waitForEagerImageLoad(lcpImage);
}
