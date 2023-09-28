export default function decorate(block) {
  const link = block.querySelector('a');
  const picture = block.querySelector('picture');

  if (picture) {
    block.prepend(picture);
  }

  if (link) {
    link.textContent = '';
    block.prepend(link);
  }
}
