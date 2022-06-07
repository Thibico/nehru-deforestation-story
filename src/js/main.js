/* global d3 */
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import linkFix from './utils/link-fix';
import modalSetup from './utils/modal-a11y';
import graphic from './graphic';
import footer from './footer';

const $body = d3.select('body');
let previousWidth = 0;

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    graphic.resize();
  }
}

function setupStickyHeader() {
  const $header = $body.select('header');
  if ($header.classed('is-sticky')) {
    const $menu = $body.select('#slide__menu');
    const $toggle = $body.select('.header__toggle');

    modalSetup($toggle, $toggle, $header, $menu, 'a, button, .logo', true);
  }
}

function init() {
  // adds rel="noopener" to all target="_blank" links
  linkFix();
  // add mobile class to body tag
  $body.classed('is-mobile', isMobile.any());
  // setup resize event
  window.addEventListener('resize', debounce(resize, 150));
  // setup sticky header menu
  //setupStickyHeader(); // Lu Min: commented out because we are not using the header
  // kick off graphic code
  graphic.init();
  // load footer stories
  footer.init();
}

//graphic.d3Test();
graphic.activateStickyOverlay('deforestation_and_concessions',
  graphic.handleStepEnter.image_swap(graphic.stickyOverlayInfoArr
  .filter( (d) => (d.value.scroll_id === 'deforestation_and_concessions'))[0].value));
graphic.activateScrollyMapbox('elc_scrolly', 'elc_map');
graphic.activateFluxGrid('deforestation_area_chart');
init();