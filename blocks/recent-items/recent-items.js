import {
  div,
  ul,
  li,
  a,
  img,
  p,
  strong,
  span,
  h2,
} from '../../scripts/dom-helpers.js';
import {
  buildBlock,
  decorateBlock,
  fetchPlaceholders,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import { walgreensUrl } from '../../scripts/scripts.js';

// fetch placeholders file
const placeholders = await fetchPlaceholders();

function reconstructURL(url, product, index) {
  let position = index;
  const criteria = 'Recently%20viewed%20items';
  const newURL = walgreensUrl(`${url.split('?')[0]}?criteria=${criteria}&product=${product}&position=${position += 1}`);
  return newURL;
}

function parseHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.querySelector('span');
}

function getCookie() {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i].split('=');
    if (cookie[0] === 'rvi') {
      return decodeURIComponent(cookie[1]);
    }
  }
  return null;
}

function trigerDataLayer() {
  const index = Array.prototype.indexOf.call(this.parentElement.parentElement.children,
    this.parentElement) + 1;
  window.digitalData.triggerCustomEvent(
    'recommendationClick', {
      recommendation: {
        type: 'product recommendations',
        name: 'Recently viewed items',
        placement: index,
      },
      prodRecoData: {
        position: '1',
        productProdID: '300401524',
        productWIC: '526048',
      },
      productFinding: {
        method: 'product recommendations',
      },
    },
  );
}

function decorateRIBlock(data) {
  return (
    ul(
      ...data.map((offer, index) => (
        li({ class: 'card with-border' },
          a({
            onclick: trigerDataLayer,
            href: reconstructURL(offer.productUrl, offer.productInfo.wic, index),
          },
          div({ class: 'card-image' },
            img({
              src: offer.productInfo.imageUrl,
              loading: 'lazy',
              alt: `Offer Image: ${offer.productInfo.productName}`,
            }),
          ),
          div({ class: 'card-body' },
            p({ class: 'product-title' }, strong(offer.productInfo.productDisplayName)),
            offer.productInfo.reviewURL
              ? span({ class: 'product-rating' },
                img({
                  src: walgreensUrl(offer.productInfo.reviewURL),
                  loading: 'lazy',
                  alt: offer.productInfo.reviewHoverMessage,
                }),
                div(offer.productInfo.reviewCount))
              : '',
            offer.priceInfo.salePriceHtml
              ? div(parseHTML(offer.priceInfo.salePriceHtml))
              : div(parseHTML(offer.priceInfo.regularPriceHtml)),
            offer.priceInfo.ruleMessage ? div({ class: 'color__text-red' }, offer.priceInfo.ruleMessage.prefix) : '',
            offer.priceInfo.salePriceHtml ? div({ class: 'regularprice text__line-through', 'aria-hidden': true }, offer.priceInfo.regularPrice) : '',
            Object.keys(offer.productInfo.availableSkus).length > 0
              ? div({ class: 'options' }, 'Choose Options')
              : '',
          ),
          ),
        )),
      ),
    )
  );
}

/**
 * Convenience function that combines the RI list with product information.
 * @param {JSON} productList ordered
 * @param {JSON} products
 * @returns {JSON}
 */
function mergeProductInfo(productList, products) {
  const productMap = {};
  // Populate productMap with products from "products" using skuId as the key
  products.forEach((product) => {
    productMap[product.productInfo.skuId] = product;
  });
  // Merge products from "productList" with products from "products"
  const combinedProducts = productList.map((productListItem) => {
    const { skuId } = productListItem.productInfo;
    const existingProduct = productMap[skuId];

    if (existingProduct) {
      // Check if the products are exactly the same
      const isSameProduct = JSON.stringify(productListItem) === JSON.stringify(existingProduct);
      // If the products are the same, return the original productListItem
      if (isSameProduct) {
        return productListItem;
      }
      // If a product with the same skuId exists in "products," merge the properties
      return { ...productListItem, ...existingProduct };
    }
    // If not found in "products," return the original productListItem
    return productListItem;
  });
  return combinedProducts;
}

export default async function decorate(block) {
  const rviCookie = getCookie();
  const { rviurl } = placeholders;
  // if the cookie doesn't exist, display nothing.
  if (rviCookie) {
    const heading = buildBlock('underlined-heading', h2(block.textContent.trim()));
    block.textContent = '';
    block.parentElement.parentElement.prepend(div(heading));
    decorateBlock(heading);
    await loadBlock(heading);

    // TODO: swap this when using real url
    // Define the POST request options
    /* const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ rvi: rviCookie }),
    }; */

    // Make the POST request
    // fetch(rviurl, requestOptions)
    fetch(rviurl)
      .then((response) => {
        if (response.ok) {
          // Check if the response is gzip-encoded
          if (response.headers.get('Content-Encoding') === 'gzip') {
            return response.blob();
          }
          return response.json();
        }
        return null;
      })
      .then((data) => {
        if (data instanceof Blob) {
          // If response is gzip-encoded, decode it
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function onloadCallback() {
              try {
                resolve(JSON.parse(reader.result));
              } catch (error) {
                reject(error);
              }
            };
            reader.readAsText(data);
          });
        }
        return data;
      })
      .then((decodedData) => {
        const { productList, products } = decodedData;
        const combinedProducts = mergeProductInfo(productList, products);
        // build block
        const carouselBl = buildBlock('carousel', decorateRIBlock(combinedProducts));
        block.append(carouselBl);
        block.classList.add('carousel', 'cards', 'cards-4');
      });
  } else {
    block.textContent = '';
  }
}
