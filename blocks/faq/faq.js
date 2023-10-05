import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function closeAllOtherFaqs(faq) {
  const allFaqs = document.querySelectorAll('.faq-accordion');
  allFaqs.forEach((acc) => {
    if (acc !== faq && acc.classList.contains('active')) {
      acc.querySelector('.faq-answer').style.maxHeight = '0';
      acc.classList.remove('active');
    }
  });
}

function toggleFaq(e) {
  const faq = e.target.closest('.faq-accordion');
  const answer = faq.querySelector('.faq-answer');
  const arrowIcon = faq.querySelector('.icon');
  if (arrowIcon === e.target) {
    faq.classList.toggle('active');
    if (answer.style.maxHeight === '0px' || answer.style.maxHeight === '') {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = '0';
    }
  } else {
    closeAllOtherFaqs(faq);
    faq.classList.toggle('active');
    if (answer.style.maxHeight === '0px' || answer.style.maxHeight === '') {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = '0';
    }
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
