import { button, div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { pushToDataLayer } from '../../scripts/scripts.js';
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
  if (typeof direction === 'number') {
    ul.scrollLeft -= direction;
    return;
  }
  if (direction === 'left') {
    ul.scrollLeft -= ul.offsetWidth;
  } else {
    ul.scrollLeft += ul.offsetWidth;
  }
}

export function makeCarouselDraggable(carousel) {
  let isDown = false;
  let startX = 0;
  let walk = 0;

  function getDragXPosition(e) {
    if (e.type.startsWith('touch')) {
      return e.touches[0].pageX;
    }
    return e.pageX;
  }

  function handleDragStart(e) {
    isDown = true;
    startX = getDragXPosition(e);
  }

  function handleDragEnd() {
    isDown = false;
  }

  function handleDragMove(e) {
    if (!isDown) {
      return;
    }
    e.preventDefault();
    const currentX = getDragXPosition(e);
    walk = currentX - startX;
    navCarousel(carousel, walk);
  }

  carousel.addEventListener('mousedown', handleDragStart);
  carousel.addEventListener('touchstart', handleDragStart, { passive: true });

  carousel.addEventListener('mouseleave', handleDragEnd);
  carousel.addEventListener('mouseup', handleDragEnd);
  carousel.addEventListener('touchend', handleDragEnd);

  carousel.addEventListener('mousemove', handleDragMove);
  carousel.addEventListener('touchmove', handleDragMove, { passive: true });
}

export function addCarouselNav(block) {
  return block.append(
    div({ class: 'carousel-nav' },
      button({ class: 'carousel-nav-left', onclick: () => navCarousel(block, 'left') },
        span({ class: 'icon icon-arrow-right left-arrow' }),
      ),
      button({ class: 'carousel-nav-right', onclick: () => navCarousel(block, 'right') },
        span({ class: 'icon icon-arrow-right' }),
      ),
    ),
  );
}

function couponsLoaded() {
  pushToDataLayer({
    eventData: {
      contentName: 'WD',
      contentType: 'coupon recommendation carousel',
      impressionType: 'present',
      recommendationType: 'none',
    },
    eventName: 'ContentImpression',
    status: 'processed',
    triggered: true,
  },
  );
}

export default async function decorate(block) {
  const cardsCSSPromise = loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  block.classList.add('cards');
  if (block.children.length === 1 && block.querySelectorAll('a').length === 1) {
    await decorateAPICarousel(block);
  } else {
    await decorateCuratedCards(block, true);
  }
  // required to update analytics - no styling affects
  if (block.classList.contains('dotw')) {
    couponsLoaded();
  }
  makeCarouselDraggable(block);
  addCarouselNav(block);
  decorateIcons(block);
  await cardsCSSPromise;
}
