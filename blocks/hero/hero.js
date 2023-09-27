export default function decorate(block) {
  const link = block.querySelector('a');
  if (link) {
    link.textContent = '';
  }
}