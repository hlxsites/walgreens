import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

export default function(block) {
  block.querySelectorAll('a').forEach((link) => {
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

  const header = block.querySelector('h2');
  const list = block.querySelector('ul');
  block.innerHTML = ''; 

  const openCloseAccordion = (e) => {
    const parent = e.currentTarget.parentElement;
    parent.setAttribute('aria-expanded', `${!(parent.getAttribute('aria-expanded') === 'true')}`);
  }

  block.setAttribute('aria-expanded', false);
  block.append(
    div({ class: 'accordion-button', role: 'button', onclick: openCloseAccordion }, 
      header, 
      span({ class: 'icon icon-arrow-down' }),
    ),
    div({ class: 'accordion-content' }, 
      list,
    ),
  );

  decorateIcons(block);
}