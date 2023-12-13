import {
  sampleRUM,
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
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
const DELAYED_RESOURCES = 1000;
const BASEURL = 'https://www.walgreens.com';

export function pushToDataLayer(event, payload) {
  if (!window.digitalData) {
    window.digitalData = {};
    window.digitalData.events = [];
  }
  window.digitalData.events.push(event);
  if (payload) window.digitalData.page = payload;
}

export function getTags(tags) {
  return tags ? tags.split(':').filter((tag) => !!tag).map((tag) => tag.trim()) : [];
}

function getDeviceType() {
  const { userAgent } = navigator;
  if (/Mobile/i.test(userAgent)) {
    return 'mobile';
  }
  if (/Tablet/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
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
  const siteSection = pathname.split('/')[1];
  pushToDataLayer(
    {
      eventData: '',
      eventName: 'DataLayerReady',
      status: 'processed',
      triggered: false,
    },
    {
      pageInfo: {
        cleanURL: window.location.href,
        deviceType: getDeviceType(),
        environment,
        pageName: getMetadata('og:title'),
        pageTemplate: (siteSection === 'topic') ? 'Topic' : 'Shop',
        siteSection,
        serverName: 'hlx.live', // indicator for AEM Edge Delivery
      },
    },
  );
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
 * Adds the js and css to the head.
 * @param {JSON} fileList json object that comes with the UI API response
 */
export async function loadFileList(fileList) {
  const skip = ['dtm', 'clientBundleFooter']; // dtm is loaded in delayes.js
  const eager = ['jquery'];
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

      if (fileInfo.type === 'js' && !scriptExists && !skip.includes(fileName)) {
        if (eager.includes(fileName)) {
          loadScript(absolutePath, { type: 'text/javascript', charset: 'UTF-8', async: true });
        } else {
          setTimeout(() => {
            loadScript(absolutePath, { type: 'text/javascript', charset: 'UTF-8', async: true });
          }, DELAYED_RESOURCES);
        }
      } else if (fileInfo.type === 'css') {
        loadCSS(absolutePath);
      }
    }
  });
}

function pageScrolled() {
  const siteSection = window.location.pathname.split('/')[1];
  pushToDataLayer({
    eventData: {
      contentName: `Back to Top - ${(siteSection === 'topic') ? 'Topic' : 'Shop Landing'}`,
      contentType: 'Page Navigation - Back to Top',
      impressionType: 'present',
      recommendationType: 'none',
    },
    eventName: 'ContentImpression',
    status: 'processed',
    triggered: true,
  });
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildBackToTop(main) {
  const section = document.createElement('div');
  const bttw = `<button aria-describedby="scrollToTop" id="topBtn" data-element-name="Back to Top" data-element-type="Page Navigation" class="btt btn__back-to-top backtoTopButton hide" title="Go to top">
    <span class="icon icon-arrow-up">
      <svg aria-hidden="true" focusable="false">
        <use xlink:href="/external-topic/images/adaptive/livestyleguide/walgreens.com/v4/themes/images/icons/symbol-defs.svg#icon__arrow-up"></use>
      </svg>
      </span>
    <span class="body-copy__fourteen" id="scrollToTop">TOP</span>
    </button>`;
  section.innerHTML = bttw;
  main.append(section);
  const btn = document.getElementById('topBtn');
  const docEl = document.documentElement;

  btn.addEventListener('click', () => {
    docEl.scrollTop = 0;
  });

  window.onscroll = () => {
    if (docEl.scrollTop > docEl.scrollHeight * 0.1) {
      if (btn.classList.contains('hide')) pageScrolled();
      btn.classList.remove('hide');
    } else {
      btn.classList.add('hide');
    }
  };
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

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

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
  window.setTimeout(() => import('./delayed.js'), DELAYED_RESOURCES);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  pushPageLoadToDataLayer();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
