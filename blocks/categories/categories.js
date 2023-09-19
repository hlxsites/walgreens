export default function decorate(block) {
    const cols = [...block.firstElementChild.children];
    block.classList.add(`categories-${cols.length}-cols`);
  
    // setup image categories
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const pic = col.querySelector('picture');
        if (pic) {
          const picWrapper = pic.closest('div');
          if (picWrapper && picWrapper.children.length === 1) {
            // picture is only content in category
            picWrapper.classList.add('categories-img-col');
          }
        }
        /*else {
            col.querySelector('div').classList.add('categories-body-col')
        }*/
      });
    });
  }