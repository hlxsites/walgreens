import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  block.querySelectorAll('li a').forEach((link, idx, arr) => {
    if (!idx < arr.length - 1) {
      return;
    }

    const icon = document.createElement('span');
    icon.classList.add('icon');
    icon.classList.add('icon-arrow-right');

    link.appendChild(icon);
  });

  await decorateIcons(block);
}
