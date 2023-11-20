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
  decorateIcons,
  fetchPlaceholders,
  loadBlock,
  toCamelCase,
} from '../../scripts/lib-franklin.js';
import { pushToDataLayer, walgreensUrl } from '../../scripts/scripts.js';
import { addCarouselNav } from '../carousel/carousel.js';

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

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  let source = 'rvi';
  if (name === 'buyItAgain') source = 'rpi';
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i].split('=');
    if (cookie[0] === source) {
      return decodeURIComponent(cookie[1]);
    }
  }
  return null;
}

function productClick() {
  const children = Array.from(this.parentElement.parentElement.children);
  const index = children.indexOf(this.parentElement) + 1;
  const idMatch = this.href.match(/ID=(.*?)-product/);
  const prodID = idMatch ? idMatch[1] : null;
  const searchParams = new URLSearchParams(this.href);
  const wic = searchParams.get('product');

  const customEvent = {
    recommendation: {
      type: 'product recommendations',
      name: 'Recently viewed items',
      placement: index,
    },
    prodRecoData: {
      position: `${index}`,
      productProdID: `${prodID}`,
      productWIC: `${wic}`,
    },
    productFinding: {
      method: 'product recommendations',
    },
  };

  window.digitalData.triggerCustomEvent('recommendationClick', customEvent);
}

function decorateRIBlock(data) {
  return (
    ul(
      ...data.map((offer, index) => (
        li({ class: 'card with-border' },
          a({
            onclick: productClick,
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

/**
 * Updates digitalData with all RVI
 * @param {*} products results from API call
 */
function rviLoaded(products) {
  const prodRecoData = [];
  if (products.length) {
    products.forEach((product, index) => {
      const position = index + 1;
      prodRecoData.push({
        position: `${position}`,
        productProdID: `${product.productInfo.prodId}`,
        productWIC: `${product.productInfo.wic}`,
      });
    });
  }

  pushToDataLayer({
    eventData: {
      prodRecoData,
      recommendation: {
        name: 'Recently viewed items',
        placement: '1',
        type: 'product recommendations',
      },
    },
    eventName: 'recommendationImpression',
    status: 'processed',
    triggered: true,
  },
  );
}

export default async function decorate(block) {
  const resource = toCamelCase(block.textContent);
  const riCookie = getCookie(resource);
  const sourceUrl = placeholders[resource];
  // if the cookie doesn't exist, display nothing.
  if (riCookie) {
    const heading = buildBlock('underlined-heading', h2(block.textContent.trim()));
    block.textContent = '';
    block.parentElement.parentElement.prepend(div(heading));
    decorateBlock(heading);
    await loadBlock(heading);

    // Define the POST request options
    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ rvi: riCookie }),
    };
    // Set to null if localhost avoid CORS error
    if (window.location.hostname === 'localhost') {
      requestOptions = null;
    }

    // Make the POST request
    fetch(sourceUrl, requestOptions)
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
        block.classList.add('carousel', 'cards', 'cards-4');
        const { productList, products } = decodedData;
        const combinedProducts = mergeProductInfo(productList, products);
        rviLoaded(combinedProducts);
        // build block
        const carouselBl = buildBlock('carousel', decorateRIBlock(combinedProducts));
        const carouselUl = carouselBl.querySelector('ul');
        block.append(carouselUl);
        addCarouselNav(block);
        decorateIcons(block);
      });
  } else {
    block.textContent = '';
  }
}
