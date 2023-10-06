export default function decorate(block) {
  //  deals of the weekn column
  const dotwColumn = block.classList.contains('dotw');
  if (dotwColumn) {
    const headerDiv = (block.children[0].children[0]);
    const subtitleDiv = (block.children[0].children[1]);
    const headerP = document.createElement('p');
    const subtitleP = document.createElement('p');
    headerP.innerHTML = headerDiv.innerHTML;
    headerDiv.parentNode.replaceChild(headerP, headerDiv);
    subtitleP.innerHTML = subtitleDiv.innerHTML;
    subtitleDiv.parentNode.replaceChild(subtitleP, subtitleDiv);

    const strong1 = document.createElement('strong');
    const span = document.createElement('span');
    const strong2 = document.createElement('strong');
    const headerArray = headerP.innerHTML.split(' ');

    strong1.innerHTML = `${headerArray[0]} `;
    span.innerHTML = `${headerArray[1]} ${headerArray[2]} `;
    strong2.innerHTML = `${headerArray[3]}`;
    strong1.classList.add('large-text');
    strong2.classList.add('large-text');
    headerP.append(strong1, span, strong2);
    headerP.childNodes[0].remove();
  }

  // If the text is all bold decorateButtons skips these links
  // so this adds the button-container class
  if (block.classList.contains('promo')) {
    block.querySelectorAll('a').forEach((a) => {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
        up.classList.add('button-container');
      }
      if (up.childNodes.length === 1 && up.tagName === 'STRONG'
        && twoup.childNodes.length === 1 && twoup.tagName === 'DIV') {
        twoup.classList.add('button-container');
      }
    });
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
