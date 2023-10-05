// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

/*
  * Returns the environment type based on the hostname.
*/
export function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'walgreens.com': 'live',
    'www.walgreens.com': 'live',
    'main--walgreens--hlxsites.hlx.page': 'dev',
    'main--walgreens--hlxsites.hlx.live': 'live',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

async function loadAdobeLaunch() {
  const adobedtmSrc = {
    dev: 'https://assets.adobedtm.com/98d94abf0996/ebfaa8e9c235/launch-e03a396c8cc7-development.min.js',
    preview: '',
    live: 'https://assets.adobedtm.com/launch-ENdd5c82450e4a478ba693752c21000d75.min.js',
  };
  await loadScript(adobedtmSrc[getEnvType()], {
    type: 'text/javascript',
    async: true,
  });
}

loadScript('https://resources.digital-cloud-west.medallia.com/wdcwest/378975/onsite/embed.js', {
  type: 'text/javascript',
  async: true,
});

await loadAdobeLaunch();
