(function(){
  const LANGS = ['zh','en','ja'];
  const LABELS = {zh:'中文',en:'EN',ja:'日本語'};
  const CONTACT = {
    zh:'有问题？飞书联系 @chendeli',
    en:'Questions? Contact @chendeli on Feishu',
    ja:'質問は？Feishuで @chendeli に連絡'
  };

  function getLang(){
    return localStorage.getItem('ar_lang') || 'zh';
  }
  function setLang(lang){
    localStorage.setItem('ar_lang', lang);
    applyLang(lang);
  }
  function applyLang(lang){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const keys = el.dataset.i18n.split('|');
      const idx = LANGS.indexOf(lang);
      if(keys[idx] !== undefined && keys[idx] !== '') el.textContent = keys[idx];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const keys = el.dataset.i18nHtml.split('|');
      const idx = LANGS.indexOf(lang);
      if(keys[idx] !== undefined && keys[idx] !== '') el.innerHTML = keys[idx];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    const cb = document.querySelector('.contact-bar-text');
    if(cb) cb.textContent = CONTACT[lang];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja' : 'en';
  }

  function injectUI(){
    // Language switcher
    const sw = document.createElement('div');
    sw.className = 'lang-switcher';
    sw.innerHTML = LANGS.map(l =>
      `<button class="lang-btn" data-lang="${l}">${LABELS[l]}</button>`
    ).join('');
    document.body.appendChild(sw);
    sw.addEventListener('click', e => {
      if(e.target.classList.contains('lang-btn')) setLang(e.target.dataset.lang);
    });

    // Contact bar
    const bar = document.createElement('div');
    bar.className = 'contact-bar';
    bar.innerHTML = `<span class="contact-bar-text">${CONTACT[getLang()]}</span>`;
    document.body.appendChild(bar);

    // Styles
    const style = document.createElement('style');
    style.textContent = `
.lang-switcher {
  position: fixed; top: 1rem; right: 1rem; z-index: 9999;
  display: flex; gap: 2px; background: rgba(15,17,23,0.9); border: 1px solid #1f2430;
  border-radius: 6px; padding: 3px; backdrop-filter: blur(8px);
}
.lang-btn {
  font-family: 'Space Mono', monospace; font-size: 0.68rem; padding: 0.3rem 0.6rem;
  border: none; background: transparent; color: #7d7b78; cursor: pointer;
  border-radius: 4px; transition: all 0.2s;
}
.lang-btn:hover { color: #eae8e4; }
.lang-btn.active { background: #ff6b35; color: #fff; }
.contact-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
  background: rgba(15,17,23,0.95); border-top: 1px solid #1f2430;
  padding: 0.5rem 1rem; text-align: center; backdrop-filter: blur(8px);
}
.contact-bar-text {
  font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #7d7b78;
}
@media (max-width: 600px) {
  .lang-switcher { top: 0.5rem; right: 0.5rem; }
  .lang-btn { font-size: 0.6rem; padding: 0.25rem 0.4rem; }
}`;
    document.head.appendChild(style);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { injectUI(); applyLang(getLang()); });
  } else {
    injectUI(); applyLang(getLang());
  }
})();
