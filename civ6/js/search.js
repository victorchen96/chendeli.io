/**
 * Civ6 Wiki - Search System
 * Client-side keyword search with dropdown results
 */

(function() {
  var searchIndex = [];
  var searchInput = null;
  var dropdown = null;
  var isIndexPage = false;

  // Determine base path (index.html is at root, subpages are one level deep)
  function getBasePath() {
    var path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/')) {
      // Check if we're at the site root or in a subdirectory
      if (path.includes('/civs/') || path.includes('/mechanics/') || path.includes('/mod/')) {
        return '../';
      }
      return '';
    }
    if (path.includes('/civs/') || path.includes('/mechanics/') || path.includes('/mod/')) {
      return '../';
    }
    return '';
  }

  // Load search index
  function loadIndex() {
    var basePath = getBasePath();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', basePath + 'data/search_index.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          searchIndex = JSON.parse(xhr.responseText);
        } catch (e) {
          console.warn('Search index parse error:', e);
        }
      }
    };
    xhr.send();
  }

  // Create dropdown element
  function createDropdown() {
    dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.style.cssText = 'display:none;position:absolute;top:100%;left:0;right:0;' +
      'background:#1e1e2e;border:1px solid #444;border-radius:8px;max-height:400px;' +
      'overflow-y:auto;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.6);margin-top:4px;';
    var headerSearch = document.querySelector('.header-search');
    if (headerSearch) {
      headerSearch.style.position = 'relative';
      headerSearch.appendChild(dropdown);
    }
  }

  // Perform search
  function search(query) {
    if (!query || query.length < 1) {
      dropdown.style.display = 'none';
      return;
    }

    var q = query.toLowerCase();
    var results = searchIndex.filter(function(item) {
      if (item.title.toLowerCase().indexOf(q) !== -1) return true;
      if (item.desc.toLowerCase().indexOf(q) !== -1) return true;
      for (var i = 0; i < item.tags.length; i++) {
        if (item.tags[i].toLowerCase().indexOf(q) !== -1) return true;
      }
      return false;
    });

    renderResults(results, query);
  }

  // Render search results
  function renderResults(results, query) {
    if (results.length === 0) {
      dropdown.innerHTML = '<div style="padding:12px 16px;color:#888;font-size:14px;">No results found for "' +
        escapeHtml(query) + '"</div>';
      dropdown.style.display = 'block';
      return;
    }

    var basePath = getBasePath();
    var html = '';
    var maxResults = Math.min(results.length, 10);

    for (var i = 0; i < maxResults; i++) {
      var item = results[i];
      html += '<a href="' + basePath + item.url + '" class="search-result-item" style="' +
        'display:block;padding:10px 16px;text-decoration:none;border-bottom:1px solid #333;' +
        'transition:background 0.15s;">' +
        '<div style="color:#e0e0ff;font-size:14px;font-weight:500;">' + escapeHtml(item.title) + '</div>' +
        '<div style="color:#888;font-size:12px;margin-top:2px;">' + escapeHtml(item.desc) + '</div>' +
        '</a>';
    }

    if (results.length > maxResults) {
      html += '<div style="padding:8px 16px;color:#666;font-size:12px;text-align:center;">' +
        '... and ' + (results.length - maxResults) + ' more results</div>';
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Add hover effects
    var items = dropdown.querySelectorAll('.search-result-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('mouseenter', function() { this.style.background = '#2a2a3e'; });
      items[j].addEventListener('mouseleave', function() { this.style.background = 'transparent'; });
    }
  }

  // HTML escape
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    loadIndex();
    createDropdown();

    searchInput = document.querySelector('.header-search input');
    if (!searchInput) return;

    // Remove old enter-key handler from nav.js by replacing input behavior
    searchInput.addEventListener('input', function() {
      search(this.value.trim());
    });

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        dropdown.style.display = 'none';
        this.blur();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        var firstResult = dropdown.querySelector('.search-result-item');
        if (firstResult) {
          window.location.href = firstResult.getAttribute('href');
        }
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.header-search')) {
        if (dropdown) dropdown.style.display = 'none';
      }
    });

    // Ctrl+K shortcut to focus search
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  });
})();
