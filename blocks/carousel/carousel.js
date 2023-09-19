export default async function decorate(block) {
  const api = 'https://www.walgreens.com/catalogsearch/v1/categories?ids=359434,359436,359441,359438;'
  if (api) {
    const res = await fetch(api)
    const data = await res.json();
    console.log(data)
    const images = [];
    data.forEach(el => {
      images.push(el.imageUrl)
    })
    images.forEach(image =>{
      const div = document.createElement('div');
      div.classList.add('card');
      div.classList.add('with-border');
      const img = document.createElement('img')
      img.src = image;
      div.append(img);
      block.append(div)
    })
  }
}