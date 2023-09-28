import {
  a, div, h3, img, li, strong, ul,
} from '../../scripts/dom-helpers.js';
import { walgreensUrl } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const apiEndpoint = block.querySelector('a').href;
  block.innerHTML = '';
  const apiResponse = await fetch(apiEndpoint);

  if (!apiResponse.ok) {
    return;
  }

  const apiInfo = JSON.parse(await apiResponse.text());
  block.append(
    ul(
      ...apiInfo.map((category) => (
        li(
          div({ class: 'category' },
            div({ class: 'category-image' },
              img({ src: walgreensUrl(category.imageUrl) }),
            ),
            div({ class: 'category-body' },
              h3(category.name),
              ul({ class: 'category-links' },
                ...category.childCategories.slice(0, 4).map((link) => (
                  li(
                    a({ href: walgreensUrl(link.url) }, link.name),
                  )),
                ),
                li(
                  a({ href: walgreensUrl(category.url), 'aria-label': `More ${category.name}` },
                    strong('More'),
                  ),
                ),
              ),
            ),
          ),
        )),
      ),
    ),
  );
}
