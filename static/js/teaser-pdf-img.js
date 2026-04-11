/* PDF-as-image fallback (same idea as reference/static/js/index.js) — no jQuery */
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

    function tryJpg() {
      tryFallback(jpgSrc, null);
    }
    function tryPng() {
      tryFallback(pngSrc, tryJpg);
    }

    function onError() {
      if (!fallbackAttempted) tryPng();
      img.removeEventListener('error', onError);
    }

    function checkRender() {
      if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
        if (!fallbackAttempted) tryPng();
      }
    }

    img.addEventListener('error', onError);
    img.addEventListener('load', checkRender);
    if (img.complete) {
      checkRender();
    } else {
      setTimeout(checkRender, 500);
    }
  });
});
