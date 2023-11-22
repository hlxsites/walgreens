// eslint-disable-next-line import/no-cycle
import { fetchPlaceholders, loadScript, sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');
// fetch placeholders file
const placeholders = await fetchPlaceholders();

/*
  * Returns the environment type based on the hostname.
*/
function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'walgreens.com': 'live',
    'www.walgreens.com': 'live',
    'main--walgreens--hlxsites.hlx.page': 'dev',
    'main--walgreens--hlxsites.hlx.live': 'dev',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

async function loadAdobeLaunch() {
  const adobedtmSrc = {
    dev: 'https://assets.adobedtm.com/98d94abf0996/ebfaa8e9c235/launch-e03a396c8cc7-development.min.js',
    preview: 'https://assets.adobedtm.com/98d94abf0996/ebfaa8e9c235/launch-e03a396c8cc7-development.min.js',
    live: 'https://assets.adobedtm.com/launch-ENdd5c82450e4a478ba693752c21000d75.min.js',
  };
  await loadScript(adobedtmSrc[getEnvType()], {
    type: 'text/javascript',
    async: true,
  });
}

// OneTrust Cookies Consent Notice start
if (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost')) {
  const otId = placeholders.onetrustid;
  if (otId) {
    loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': `${otId}`,
    });

    window.OptanonWrapper = () => {
    };
  }

  const allButtons = document.querySelectorAll('a.button');
  allButtons.forEach((button) => {
    if (button.getAttribute('href').includes('cookie-policy')) {
      button.addEventListener('click', (e) => {
        // eslint-disable-next-line no-undef
        OneTrust.ToggleInfoDisplay();
        e.preventDefault();
      });
    }
  });
}

await loadAdobeLaunch();
