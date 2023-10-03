import { button, div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { decorateAPICards, decorateCuratedCards } from '../cards/cards.js';

async function decorateAPICarousel(block) {
  const apiEndpoint = block.querySelector('a').href;
  block.innerHTML = '';
  const apiResponse = await fetch(apiEndpoint);

  if (!apiResponse.ok) {
    return;
  }

  const apiInfo = JSON.parse(await apiResponse.text());
  block.append(decorateAPICards(apiInfo.offers, true));
}

function navCarousel(block, direction) {
  const ul = block.querySelector('ul');
  const li = block.querySelector('li');
  if (direction === 'left') {
    ul.scrollLeft -= li.offsetWidth;
  } else {
    ul.scrollLeft += li.offsetWidth;
  }
}

export default async function decorate(block) {
  const cardsCSSPromise = loadCSS('/blocks/cards/cards.css');
  if (block.children.length === 1 && block.querySelectorAll('a').length === 1) {
    await decorateAPICarousel(block);
  }else{
    await decorateCuratedCards(block);
  }

  block.append(
    div({ class: 'carousel-nav' },
      button({ class: 'carousel-nav-left', onclick: () => navCarousel(block, 'left') },
        span({ class: 'icon icon-arrow-right left-arrow' }),
      ),
      button({ class: 'carousel-nav-right', onclick: () => navCarousel(block, 'right') },
        span({ class: 'icon icon-arrow-right' }),
      ),
    ),
  );

  decorateIcons(block);
  await cardsCSSPromise;
}
