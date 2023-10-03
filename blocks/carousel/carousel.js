import { button, div, span } from '../../scripts/dom-helpers.js';
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

function navLeft(block) {
  const ul = block.querySelector('ul');
  ul.scrollLeft -= 600;
}

function navRight(block) {
  const ul = block.querySelector('ul');
  ul.scrollLeft += 600;
}

export default async function decorate(block) {
  const cardsCSSPromise = loadCSS('/blocks/cards/cards.css');
  if (block.children.length === 1 && block.querySelectorAll('a').length === 1) {
    await decorateAPICarousel(block);
  }

  block.append(
    div({ class: 'carousel-nav' },
      button({ class: 'carousel-nav-left', onclick: () => navLeft(block) },
        span({ class: 'icon icon-arrow-right left-arrow' }),
      ),
      button({ class: 'carousel-nav-right', onclick: () => navRight(block) },
        span({ class: 'icon icon-arrow-right' }),
      ),
    ),
  );

  decorateIcons(block);
  await cardsCSSPromise;
}
