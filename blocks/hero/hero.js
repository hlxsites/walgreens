import { waitForEagerImageLoad } from '../../scripts/lib-franklin.js';

function getAspectRatio(img) {
  return (img.naturalHeight / img.naturalWidth) * 100;
}

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

  let lcpImage = null;
  const mq = window.matchMedia("(max-width: 768px)");
  if (mq.matches) {
    lcpImage = block.querySelector('.background-mobile img');
  } else {
    lcpImage = block.querySelector('.background-desktop img');
  }

  await waitForEagerImageLoad(lcpImage);
}
