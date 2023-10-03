import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  loadScript,
  getMetadata,
  fetchPlaceholders,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
const BASEURL = 'https://walgreens.com';
const placeholders = await fetchPlaceholders();

export function pushToDataLayer(event, payload) {
  if (!window.digitalData) {
    window.digitalData = {};
    window.digitalData.events = [];
  }
  window.digitalData.events.push( event );
  window.digitalData.page = payload;
}

export function getTags(tags) {
  return tags ? tags.split(':').filter((tag) => !!tag).map((tag) => tag.trim()) : [];
}

function getDeviceType() {
    const userAgent = navigator.userAgent;

    if (/Mobile/i.test(userAgent)) {
        // Mobile device (including tablets)
        return 'mobile';
    } else if (/Tablet/i.test(userAgent)) {
        // Tablet device
        return 'tablet';
    } else {
        // Desktop device
        return 'desktop';
    }
}

/**
 * Returns the environment name based on the hostname
 * @returns {String}
 */
export function getEnvironment(hostname) {
  if (hostname.includes('hlx.page') || hostname.includes('hlx.live')) {
    return 'stage';
  }
  if (hostname.includes(BASEURL)) {
    return 'prod';
  }
  return 'dev';
}

function pushPageLoadToDataLayer() {
  const { hostname, pathname } = window.location;
  const environment = getEnvironment(hostname);
  const setSection = pathname.split('/')[1];
  pushToDataLayer(
    { eventData: '',
      eventName: 'DataLayerReady',
      status: 'processed',
      triggered: false,
    },
    { pageInfo: {
        cleanURL: window.location.href,
        deviceType: getDeviceType(),
        environment: environment,
        pageName: getMetadata('og:title'),
        pageTemplate: setSection.replace(/^\w/, (char) => char.toUpperCase()),
        setSection: setSection,
        serverName: 'hlx.live', // indicator for AEM Edge Delivery
      }
    }
  );
}

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

/**
 * Get the Absolute walgreens url from a relative one
 * @param {Element} path relative walgreens path
 * @returns Absolute wallgreens url
 */
export function walgreensUrl(path) {
  return new URL(path, BASEURL).toString();
}

/**
 * Remaps the relative urls to absolute urls.
 * @param {string} content string of html with relative urls
 * @returns the string with absolute urls
 */
export function resolveRelativeURLs(content) {
  // Use a regular expression to find relative links (starting with "/")
  const relativeLinkRegex = /(?:href|action)="(?!\/images\/)(\/[^"]+)"/g;
  const { privacyIcon, localPrivacyIcon } = placeholders;
  let absoluteContent = content.replace(relativeLinkRegex, (match, relativePath) => {
    // Combine the base URL and the relative path to create an absolute URL
    const absoluteUrl = `${BASEURL}${relativePath}`;
    return `href="${absoluteUrl}"`;
  });
  absoluteContent = absoluteContent.replace(privacyIcon, localPrivacyIcon);
  return absoluteContent;
}

/**
 * Adds the js and css to the head.
 * @param {JSON} fileList json object that comes with the UI API response
 */
export function loadFileList(fileList) {
  const scriptTags = document.querySelectorAll('script[src]');

  const fileKeys = Object.keys(fileList);

  fileKeys.forEach((fileName) => {
    if (fileList[fileName]) {
      const fileInfo = fileList[fileName];
      const absolutePath = fileInfo.path.startsWith('http')
        ? fileInfo.path
        : BASEURL + fileInfo.path;

      // Check if a script with the same URL is already on the page
      const scriptExists = [...scriptTags].some((scriptTag) => scriptTag.src === absolutePath);

      if (
        fileInfo.type === 'js'
        && !scriptExists
        && !['dtm'].includes(fileName)
      ) {
        loadScript(absolutePath, {
          type: 'text/javascript',
          charset: 'UTF-8',
          async: true,
        });
      } else if (fileInfo.type === 'css') {
        loadCSS(absolutePath);
      }
    }
  });
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildBackToTop(main) {
  const section = document.createElement('div');
  const bttw = `<div id="backtoTopWidget">
  <button aria-describedby="scrollToTop" id="topBtn" data-element-name="Back to Top" data-element-type="Page Navigation" class="btt btn__back-to-top backtoTopButton hide" title="Go to top">
      <span class="hide">
          <span class="icon icon__arrow-up">
              <svg aria-hidden="true" focusable="false">
                  <use xlink:href="/images/adaptive/livestyleguide/walgreens.com/v4/themes/images/icons/symbol-defs.svg#icon__arrow-up"></use>
              </svg>
          </span>
          <span class="body-copy__fourteen" id="scrollToTop">TOP</span>
      </span>
  </button>
</div>`
  section.innerHTML = bttw;
  main.append(section);
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildBackToTop(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Detect the sidebar section and decorate the main element
 * @param {Element} main The main element
 */
function detectSidebar(main) {
  const sidebar = main.querySelector('.section.sidebar');
  if (sidebar) {
    main.classList.add('sidebar');
    const sidebarOffset = sidebar.getAttribute('data-start-sidebar-at-section');

    const numSections = main.children.length - 1;
    main.style = `grid-template-rows: repeat(${numSections}, auto);`;

    if (sidebarOffset && Number.parseInt(sidebar.getAttribute('data-start-sidebar-at-section'), 10)) {
      const offset = Number.parseInt(sidebar.getAttribute('data-start-sidebar-at-section'), 10);
      sidebar.style = `grid-row: ${offset} / infinite;`;
    }
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  detectSidebar(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // TODO: remove this check before go-live
  const noHeader = new URLSearchParams(window.location.search).has('test');
  if (!noHeader) {
    loadHeader(doc.querySelector('header'));
    loadFooter(doc.querySelector('footer'));
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  pushPageLoadToDataLayer();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
