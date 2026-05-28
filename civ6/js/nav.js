document.addEventListener('DOMContentLoaded', function() {
  var menuToggle = document.querySelector('.menu-toggle');
  var sidebar = document.querySelector('.sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Top-nav: auto-detect active tab from URL path
  var path = window.location.pathname;
  var tabs = document.querySelectorAll('.top-nav-tab');
  tabs.forEach(function(tab) {
    tab.classList.remove('active');
    var href = tab.getAttribute('href');
    if (!href) return;
    // Resolve relative href to section key
    var section = '';
    if (href.match(/civs/)) section = 'civs';
    else if (href.match(/mechanics/)) section = 'mechanics';
    else if (href.match(/guides/)) section = 'guides';
    else if (href.match(/mod\//)) section = 'mod';
    else if (href.match(/ai\//)) section = 'ai';
    else if (href.match(/index\.html$/) && !href.match(/\//)) section = 'home';
    else if (href === '../index.html' || href === 'index.html') section = 'home';

    if (section && section !== 'home' && path.indexOf('/' + section) !== -1) {
      tab.classList.add('active');
    } else if (section === 'home' && (path.endsWith('/index.html') || path.endsWith('/src/') || path.endsWith('/civ6_wiki/'))) {
      // Only mark home active if not in any sub-section
      if (!path.match(/\/(civs|mechanics|guides|mod|ai)\//)) {
        tab.classList.add('active');
      }
    }
  });

  // Sidebar: set active nav item
  var navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && path.indexOf(href.replace(/^\.\.\//, '').replace(/^\.\//, '')) !== -1) {
      link.classList.add('active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ESC key → go back to parent level
  var path = window.location.pathname;
  var token = window.__token ? '?token=' + window.__token : '';
  var backUrl = null;

  if (path.match(/\/mod\/(hd|bbg)\/civs\/.+\.html/)) {
    // mod civ detail → mod index
    backUrl = '../index.html';
  } else if (path.match(/\/mod\/(hd|bbg)\/(mechanics|index)\.html/)) {
    // mod index/mechanics → home
    backUrl = '../../index.html';
  } else if (path.match(/\/civs\/.+\.html/) && !path.match(/\/civs\/index\.html/)) {
    // civ detail → civs index
    backUrl = 'index.html';
  } else if (path.match(/\/civs\/index\.html/)) {
    // civs index → home
    backUrl = '../index.html';
  } else if (path.match(/\/(mechanics|guides|ai)\/.+\.html/)) {
    // sub-section page → home
    backUrl = '../index.html';
  }

  if (backUrl) {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        var active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          active.blur();
          return;
        }
        window.location.href = backUrl + token;
      }
    });

    // Add visible back button
    var backBtn = document.createElement('a');
    backBtn.href = backUrl + token;
    backBtn.className = 'back-nav-btn';
    backBtn.innerHTML = '&#8592; 返回上级 <kbd>Esc</kbd>';
    var main = document.querySelector('.main-content .content-container');
    if (main) main.insertBefore(backBtn, main.firstChild);
  }
});
