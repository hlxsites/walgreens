// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './lib-franklin.js';
import { getEnvType } from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

async function loadAdobeLaunch() {
  const adobedtmSrc = {
    dev: 'https://assets.adobedtm.com/98d94abf0996/ebfaa8e9c235/launch-e03a396c8cc7-development.min.js',
    preview: '',
    live: 'https://assets.adobedtm.com/launch-ENdd5c82450e4a478ba693752c21000d75.min.js',
  };
  await loadScript(adobedtmSrc[getEnvType()]);
}

await loadAdobeLaunch();
