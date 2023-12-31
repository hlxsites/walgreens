import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  a, div, li, strong, ul, p, img,
} from '../../scripts/dom-helpers.js';
import { walgreensUrl } from '../../scripts/scripts.js';

export function decorateCuratedCards(block, withBorder) {
  const cardsWithBorder = block.classList.contains('border');

  /* change to ul, li */
  const list = ul();
  [...block.children].forEach((row) => {
    const listItem = li({ class: `card ${cardsWithBorder || withBorder ? ' with-border' : ''}` });

    const link = row.querySelector('a');
    let parent = listItem;
    if (link) {
      link.textContent = '';
      parent = link;
      listItem.appendChild(link);
    }

    while (row.firstElementChild) parent.append(row.firstElementChild);
    [...parent.children].forEach((child) => {
      if (child.children.length === 1 && child.querySelector('picture')) child.className = 'card-image';
      else child.className = 'card-body';
      if (child.innerHTML === '') child.remove();
    });
    list.append(listItem);
  });
  list.querySelectorAll('img').forEach((image) => image.closest('picture').replaceWith(
    createOptimizedPicture(image.src, image.alt, false, [{ width: '180' }]),
  ));
  block.textContent = '';
  block.append(list);
}

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

export function decorateAPICards(cardsInfo, cardsWithBorder) {
  return (
    ul(
      ...cardsInfo.map((offer) => (
        li(
          { class: `card ${cardsWithBorder ? ' with-border' : ''}` },
          a(
            { href: apiCardLink(offer) },
            div(
              { class: 'card-image' },
              img({
                src: walgreensUrl(offer.imageUrl),
                loading: 'lazy',
                alt: `Offer Image: ${offer.title}`,
              }),
            ),
            div(
              { class: 'card-body' },
              p(strong(offer.title)),
              offer.brand ? p(strong(offer.brand)) : '',
              offer.offerDescription ? p(offer.offerDescription) : '',
            ),
          ),
        ))),
    )
  );
}

export default async function decorate(block) {
  if (block.children.length === 1 && block.querySelectorAll('a').length === 1) {
    const apiEndpoint = block.querySelector('a').href;
    block.innerHTML = '';
    const apiResponse = await fetch(apiEndpoint);

    if (!apiResponse.ok) {
      return;
    }

    const apiInfo = JSON.parse(await apiResponse.text());

    block.append(decorateAPICards(apiInfo.offers, block.classList.contains('border')));
  } else {
    decorateCuratedCards(block);
  }
}
