import {
  a, div, img, li, span, ul,
} from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/aem.js';
import { walgreensUrl } from '../../scripts/scripts.js';

function decorateCuratedListOfLinks(panel) {
  panel.querySelectorAll('ul a').forEach((link) => {
    if (!link.previousElementSibling || link.previousElementSibling.nodeName.toLowerCase() !== 'picture') {
      return;
    }

    const text = link.textContent;
    link.innerHTML = '';
    link.append(
      span({ class: 'link-image' }, link.previousElementSibling),
      span({ class: 'link-text' }, text),
    );
  });
}

async function decorateAPIListOfLinks(panel) {
  const link = panel.querySelector('a');
  const apiEndpoint = link.href;
  link.parentElement.remove();
  const apiResponse = await fetch(apiEndpoint);

  if (!apiResponse.ok) {
    return;
  }

  const apiInfo = await apiResponse.json();

  panel.append(
    ul(
      ...apiInfo.categories.map((category) => (
        li(
          a({ href: walgreensUrl(category.url) },
            category.imageUrl === 'null' ? '' : span({ class: 'link-image' }, img({ src: category.imageUrl })),
            span({ class: 'link-text' }, category.name),
          ),
        )
      )),
    ),
  );
}

/**
 * The sidepanel has a more complex behaviour.
 * On Desktop:
 *  - added as a sidebar (this is implemeneted in the global styles.css)
 *  - a series of rounded panels
 *  - each panel has a header
 *  - each panel has a list of links, with all pictures hidden
 * On Mobile
 *  - an inlined series of accordions
 *  - the header is the title for the accordion button
 *  - the list of links, some with pictures, is the hidden content of the accordion
 *
 * Word content structure
 *  - A table with 1 column
 *  - each row represents a panel on Desktop/Accordion on Mobile
 *  - each row has a h2 header -> panel header on Desktop / accordion button on Mobile
 *  - each row has a list of links, optionally prepended by images
 * @param {Element} block sidepanel block
 */
export default async function decorate(block) {
  for (let i = 0; i < block.children.length; i += 1) {
    const row = block.children[i];
    const panel = row.children[0];

    if (panel.querySelector('ul')) {
      decorateCuratedListOfLinks(panel);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await decorateAPIListOfLinks(panel);
    }

    if (!i) {
      panel.querySelector('ul').append(
        li({ class: 'shop-by-brand' },
          a({ href: 'https://www.walgreens.com/store/store/brands/brand.jsp' },
            'Shop by Brand',
          ),
        ),
      );
    }

    const header = panel.querySelector('h2');
    const list = panel.querySelector('ul');
    panel.innerHTML = '';

    const openCloseAccordion = (e) => {
      const parent = e.currentTarget.parentElement;
      parent.setAttribute('aria-expanded', `${!(parent.getAttribute('aria-expanded') === 'true')}`);
    };

    panel.classList.add('panel-accordion');
    panel.setAttribute('aria-expanded', false);
    panel.setAttribute('role', 'button');

    panel.append(
      div({ class: 'accordion-button', onclick: openCloseAccordion },
        header,
        span({ class: 'icon icon-arrow-down' }),
      ),
      div({ class: 'accordion-content' },
        list,
      ),
    );
  }

  decorateIcons(block);
}
