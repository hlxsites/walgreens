import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  a, div, li, ul, p, img,
} from '../../scripts/dom-helpers.js';


function apiCardLink(offer) {
  if ('plucode' in offer) {
    return `https://www.walgreens.com/store/store/xpo_products.jsp?pluCode=${offer.plucode}`;
  }

  if ('eventCode' in offer) {
    return `https://www.walgreens.com/store/BalanceRewardsOffers/balance-rewards-offer.jsp?eventCode=${offer.eventCode}`;
  }

  // eslint-disable-next-line no-console
  console.warn('Could not generate link for the following offer', offer);
  return '';
}

async function decorateAPICarousel(block) {
  const apiEndpoint = block.querySelector('a').href;
  block.innerHTML = '';
  const apiResponse = await fetch(apiEndpoint);

  if (!apiResponse.ok) {
    return;
  }

  const apiInfo = JSON.parse(await apiResponse.text());
  block.append(
    ul(
      ...apiInfo.offers.map((offer) => (
        li(
          a({ href: apiCardLink(offer) },
            div({ class: 'card-image' },
              img({
                src: new URL(offer.imageUrl, 'https://www.walgreens.com').toString(),
                loading: 'lazy',
                alt: `Offer Image: ${offer.title}`,
              }),
            ),
            div({ class: 'card-body' },
              p((offer.title)),
            ),
          ),
        )),
      ),
    ),
  );
}

export default async function decorate(block) {
  if (block.children.length === 1 && block.querySelectorAll('a').length === 1) {
    await decorateAPICarousel(block);
  } else {
    return;
  }
}