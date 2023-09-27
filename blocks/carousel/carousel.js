import { button, span } from '../../scripts/dom-helpers.js';
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { decorateAPICards } from '../cards/cards.js';

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

function navLeft(block, e) {
  // TODO scroll/translate left
}

function navRight(block, e) {
  // TODO scroll/translate right
}

export default async function decorate(block) {
  const cardsCSSPromise = loadCSS('/blocks/cards/cards.css');
  if (block.children.length === 1 && block.querySelectorAll('a').length === 1) {
    await decorateAPICarousel(block);
  }

  block.append(
    button({ class: 'carousel-nav carousel-nav-left', onclick: (e) => navLeft(block, e) },
      span({ class: 'icon icon-arrow-right' }),
    ),
    button({ class: 'carousel-nav carousel-nav-right', onclick: (e) => navRight(block, e) },
      span({ class: 'icon icon-arrow-right' }),
    ),
  );

  decorateIcons(block);
  await cardsCSSPromise;
}
