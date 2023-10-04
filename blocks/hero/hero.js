import { waitForEagerImageLoad } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  [...block.children].forEach((row) => {
    if (row.children.length < 2) return;

    const configCell = row.children[0];

    if (configCell.textContent.toLowerCase().trim() === 'desktop') {
      row.classList.add('background-desktop');
    }

    if (configCell.textContent.toLowerCase().trim() === 'mobile') {
      row.classList.add('background-mobile');
    }

    if (configCell.textContent.toLowerCase().trim() === 'overlay') {
      row.classList.add('hero-overlay');
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

  /*
   * avoid CLS by not displaying the block until the image has finished loading
   * in this case, it is acceptable to block until the image has loaded,
   * because the Hero background is also the LCP
   */
  let lcpImage = null;
  if (window.matchMedia('(max-width: 768px)')) {
    lcpImage = block.querySelector('.background-mobile img');
  } else {
    lcpImage = block.querySelector('.background-desktop img');
  }
  await waitForEagerImageLoad(lcpImage);
}
