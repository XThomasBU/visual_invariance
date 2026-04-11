/* PDF-as-image: try .pdf in <img> first; fall back to .jpg then .png when unsupported or zero-size (e.g. Chrome). */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('img.paper-teaser-img[src$=".pdf"]').forEach(function (img) {
    var pdfSrc = img.getAttribute('src');
    if (!pdfSrc) return;

    var pngSrc = pdfSrc.replace(/\.pdf(\?.*)?$/i, '.png$1');
    var jpgSrc = pdfSrc.replace(/\.pdf(\?.*)?$/i, '.jpg$1');
    var fallbackAttempted = false;

    function tryFallback(fallbackSrc, nextFallback) {
      if (fallbackAttempted) return;
      var testImg = new Image();
      testImg.onload = function () {
        if (img.getAttribute('src') !== fallbackSrc) {
          img.setAttribute('src', fallbackSrc);
        }
        fallbackAttempted = true;
      };
      testImg.onerror = function () {
        if (nextFallback) nextFallback();
      };
      testImg.src = fallbackSrc;
    }

    function tryPng() {
      tryFallback(pngSrc, null);
    }
    function tryJpg() {
      tryFallback(jpgSrc, tryPng);
    }

    function applyFallback() {
      if (!fallbackAttempted) tryJpg();
    }

    function onError() {
      applyFallback();
      img.removeEventListener('error', onError);
    }

    function checkRender() {
      if (fallbackAttempted) return;
      if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
        applyFallback();
      }
    }

    function scheduleRenderChecks() {
      checkRender();
      requestAnimationFrame(function () {
        requestAnimationFrame(checkRender);
      });
      [50, 200, 500].forEach(function (ms) {
        setTimeout(checkRender, ms);
      });
    }

    function onLoad() {
      if (typeof img.decode === 'function') {
        img.decode().catch(applyFallback);
      }
      scheduleRenderChecks();
    }

    img.addEventListener('error', onError);
    img.addEventListener('load', onLoad);
    if (img.complete) {
      onLoad();
    } else {
      scheduleRenderChecks();
    }

    setTimeout(function () {
      if (fallbackAttempted) return;
      var src = img.getAttribute('src') || '';
      if (!/\.pdf(\?|$)/i.test(src)) return;
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        applyFallback();
      }
    }, 2000);
  });
});
