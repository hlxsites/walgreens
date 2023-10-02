import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function closeAllOtherFaqs(faq) {
  faq.querySelectorAll('.faq-accordion').forEach((acc) => {
    if (acc !== faq && acc.classList.contains('active')) {
      acc.classList.remove('active');
    }
  });
}

function toggleFaq(e) {
  const faq = e.target.closest('.faq-accordion');
  const arrowIcon = faq.querySelector('.icon');
  
  if (arrowIcon === e.target) {
    faq.classList.toggle('active');
  } else {
    closeAllOtherFaqs(faq);
    faq.classList.toggle('active');
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