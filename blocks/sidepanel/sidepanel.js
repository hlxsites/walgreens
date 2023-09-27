import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

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
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const panel = row.children[0];
    panel.querySelectorAll('a').forEach((link) => {
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
  });

  decorateIcons(block);
}
