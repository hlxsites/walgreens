import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const cardsWithBorder = block.classList.contains('border');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('card');
    if (cardsWithBorder) {
      li.classList.add('with-border');
    }

    const link = row.querySelector('a');
    let parent = li;
    if (link) {
      link.textContent = '';
      parent = link;
      li.appendChild(link);
    }

    while (row.firstElementChild) parent.append(row.firstElementChild);
    [...parent.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'card-image';
      else div.className = 'card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
