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
} from './lib-franklin.js';

const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list
const DELAYED_RESOURCES = 3000;

/**
 * Get the Absolute walgreens url from a relative one
 * @param {Element} path relative walgreens path
 * @returns Absolute wallgreens url
 */
export function walgreensUrl(path) {
  return new URL(path, 'https://www.walgreens.com').toString();
}

/**
 * Adds the js and css to the head.
 * @param {JSON} fileList json object that comes with the UI API response
 */
export async function loadFileList(fileList) {
  const baseUrl = 'https://www.walgreens.com';

  const skip = ['dtm', 'googleApi', 'speedIndex', 'lsgScriptMin'];
  const eager = ['jquery', 'sly', 'headerSupport', 'lsgURL'];

  const scriptTags = document.querySelectorAll('script[src]');

  const fileKeys = Object.keys(fileList);

  fileKeys.forEach((fileName) => {
    if (fileList[fileName]) {
      const fileInfo = fileList[fileName];
      const absolutePath = fileInfo.path.startsWith('http')
        ? fileInfo.path
        : baseUrl + fileInfo.path;

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

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
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
    buildHeroBlock(main);
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
  const noHeader = new URLSearchParams(window.location.search).has('test');
  if (!noHeader) {
    loadHeader(doc.querySelector('header'));
  }

  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // TODO: remove this check before go-live
  if (!noHeader) {
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
  window.setTimeout(() => import('./delayed.js'), DELAYED_RESOURCES);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
