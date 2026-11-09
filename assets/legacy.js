/* Runtime for ported pages: replaces the behaviour legacy site scripts used to provide.
   - FAQ open/close (.faq-item .faq-q / .faq-a)
   - Links created at runtime by legacy scripts that point at the site root or ptaorg.com
     are rewritten to stay inside this site. */
(() => {
  'use strict';
  const ROOT = (document.body && document.body.dataset.root) || window.__ROOT || '';
  const SITE = /^https?:\/\/(?:www\.)?ptaorg\.(?:com|github\.io)(?=\/|$)/i;
  function fixHref(a) {
    const h = a.getAttribute('href');
    if (!h || a.dataset.rootFixed) return;
    let path = null;
    if (SITE.test(h)) path = h.replace(SITE, '') || '/';
    else if (h.charAt(0) === '/' && h.charAt(1) !== '/') path = h;
    if (path === null) return;
    a.setAttribute('href', ROOT + (path === '/' ? 'index.html' : path.slice(1)));
    a.dataset.rootFixed = '1';
  }
  const fixAll = root => (root.querySelectorAll ? root.querySelectorAll('.legacy a[href], a[href].legacy-link') : []).forEach(fixHref);
  function initFAQ(scope) {
    scope.querySelectorAll('.faq-item .faq-q').forEach((q, i) => {
      if (q.dataset.faqNew === '1') return;
      const item = q.closest('.faq-item'); const answer = item && item.querySelector('.faq-a');
      if (!item || !answer) return;
      q.dataset.faqNew = '1';
      answer.id = answer.id || 'faq-answer-' + (i + 1);
      q.setAttribute('role', 'button'); q.setAttribute('tabindex', '0'); q.setAttribute('aria-controls', answer.id);
      const set = open => {
        item.classList.toggle('is-open', open);
        q.setAttribute('aria-expanded', String(open));
        answer.setAttribute('aria-hidden', String(!open));
        answer.style.maxHeight = open ? 'none' : '0px';
        answer.style.paddingBottom = open ? '20px' : '0px';
        const icon = q.querySelector('.faq-toggle'); if (icon) icon.textContent = open ? '▲' : '▼';
      };
      set(item.classList.contains('is-open'));
      q.addEventListener('click', () => set(q.getAttribute('aria-expanded') !== 'true'));
      q.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(q.getAttribute('aria-expanded') !== 'true'); } });
    });
  }
  function init() {
    fixAll(document);
    initFAQ(document);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches('a[href]')) fixHref(n); fixAll(n); } })))
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
