import { loadBlock } from "../../scripts/lib-franklin.js";

function getCookie() {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].split('=');
    if (cookie[0] === 'rvi') {
      return decodeURIComponent(cookie[1]);
    }
  }
  return null;
}

export default async function decorate(block) {
  const rviCookie = getCookie();

  /* if (rviCookie) {

    const url = 'https://www.walgreens.com/productsearch/v1/products/' + encodeURIComponent(rviCookie);
  
    // Define the POST request options
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ rvi: rviCookie }), // You can customize the payload as needed
    };
  
    // Make the POST request
    fetch(url, requestOptions)
      .then(response => {
        if (response.ok) {
          // Check if the response is gzip-encoded
          if (response.headers.get('Content-Encoding') === 'gzip') {
            return response.blob();
          } else {
            return response.json();
          }
        } else {
          throw new Error('POST request failed');
        }
      })
      .then(data => {
        if (data instanceof Blob) {
          // If response is gzip-encoded, decode it
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
              try {
                resolve(JSON.parse(reader.result));
              } catch (error) {
                reject(error);
              }
            };
            reader.readAsText(data);
          });
        } else {
          return data;
        }
      })
      .then(decodedData => {
        // build block
        decorateRVIBlock(decodedData);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  } else {
    block.textContent = '';
  } */
}
