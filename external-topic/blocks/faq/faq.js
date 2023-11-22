import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/aem.js';

function closeAllOtherFaqs(faq) {
  const allFaqs = document.querySelectorAll('.faq-question');
  allFaqs.forEach((acc) => {
    if (acc !== faq && acc.classList.contains('active')) {
      acc.nextElementSibling.style.maxHeight = null;
      acc.nextElementSibling.style.marginBottom = null;
      acc.classList.remove('active');
    }
  });
}

function toggleFaq() {
  this.classList.toggle('active');
  const panel = this.nextElementSibling;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
    panel.style.marginBottom = null;
  } else {
    closeAllOtherFaqs(this);
    panel.style.maxHeight = `${panel.scrollHeight}px`;
    panel.style.marginBottom = '10px';
  }
}

export default async function decorate(block) {
  const faqs = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const question = cells[0] && cells[0].textContent;
    const answer = cells[1] || div();
    answer.classList.add('faq-answer');
    faqs.push({ question, answer });
  });

  block.innerHTML = '';
  faqs.forEach((faq) => {
    const { question, answer } = faq;
    block.append(
      div({ class: 'faq-accordion' },
        div({ class: 'faq-question', onclick: toggleFaq },
          question,
          span({ class: 'icon icon-arrow-down' }),
        ),
        answer,
      ),
    );
  });

  await decorateIcons(block);
}
