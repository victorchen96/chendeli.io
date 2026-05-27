/**
 * Civ6 Wiki - SVG Icon Loader
 * Loads SVG sprite files and injects them into the DOM.
 * Usage: Add data-civ-icon="china" to any element to display that civ's icon.
 */
(function() {
  'use strict';

  // Determine path prefix based on page location
  var scripts = document.getElementsByTagName('script');
  var scriptSrc = scripts[scripts.length - 1].src;
  var basePath = scriptSrc.replace(/js\/icons\.js.*$/, 'img/');

  var spriteFiles = [
    'icons-1.svg', 'icons-2.svg', 'icons-mod.svg',
    'leaders-1.svg', 'leaders-2.svg', 'units.svg'
  ];
  var loaded = 0;

  function injectSprite(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var div = document.createElement('div');
        div.style.display = 'none';
        div.setAttribute('aria-hidden', 'true');
        div.innerHTML = xhr.responseText.replace(/style="display:none"/, '');
        document.body.insertBefore(div, document.body.firstChild);
      }
      loaded++;
      if (loaded === spriteFiles.length) {
        renderIcons();
      }
    };
    xhr.send();
  }

  function renderIcons() {
    // Render civ portrait icons
    var portraits = document.querySelectorAll('[data-civ-icon]');
    for (var i = 0; i < portraits.length; i++) {
      var el = portraits[i];
      var civId = el.getAttribute('data-civ-icon');
      el.innerHTML = '<svg class="civ-icon-svg" aria-label="' + civId + ' icon"><use href="#civ-' + civId + '"></use></svg>';
    }

    // Render sidebar nav icons
    var navIcons = document.querySelectorAll('[data-nav-icon]');
    for (var j = 0; j < navIcons.length; j++) {
      var navEl = navIcons[j];
      var navCivId = navEl.getAttribute('data-nav-icon');
      navEl.innerHTML = '<svg class="nav-icon-svg" aria-label="' + navCivId + '"><use href="#civ-' + navCivId + '"></use></svg>';
    }

    // Render leader portrait icons
    var leaders = document.querySelectorAll('[data-leader-icon]');
    for (var k = 0; k < leaders.length; k++) {
      var lEl = leaders[k];
      var leaderId = lEl.getAttribute('data-leader-icon');
      lEl.innerHTML = '<svg class="leader-icon-svg" aria-label="' + leaderId + '"><use href="#leader-' + leaderId + '"></use></svg>';
    }

    // Render unit icons
    var units = document.querySelectorAll('[data-unit-icon]');
    for (var m = 0; m < units.length; m++) {
      var uEl = units[m];
      var unitId = uEl.getAttribute('data-unit-icon');
      uEl.innerHTML = '<svg class="unit-icon-svg" aria-label="' + unitId + '"><use href="#unit-' + unitId + '"></use></svg>';
    }
  }

  // Load all sprite files
  for (var i = 0; i < spriteFiles.length; i++) {
    injectSprite(basePath + spriteFiles[i]);
  }
})();
