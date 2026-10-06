// Имейл на училището
let SCHOOL_EMAIL = 'bgschoolraynaknyaginya@gmail.com';   // сменя се от админ панела (Настройки)

/* ---------- Език BG / EN ---------- */
const langBtn = document.getElementById('langBtn');
const nodes = document.querySelectorAll('[data-en]');
nodes.forEach(n => n.dataset.bg = n.innerHTML);
let lang = 'bg';
function setLang(l) {
  lang = l;
  nodes.forEach(n => n.innerHTML = l === 'en' ? n.dataset.en : n.dataset.bg);
  document.documentElement.lang = l;
  langBtn.textContent = l === 'en' ? 'BG' : 'EN';
  langBtn.setAttribute('aria-label', l === 'en' ? 'Превключи на български' : 'Switch to English');
  if (typeof renderAll === 'function' && CONTENT) renderAll();
  requestAnimationFrame(buildThread);
}
langBtn.addEventListener('click', () => setLang(lang === 'en' ? 'bg' : 'en'));

/* ---------- Книгата се отваря ---------- */
const book = document.getElementById('book');
const openBook = () => {
  if (book.classList.contains('open')) return;
  book.classList.add('open');
  setTimeout(() => { book.classList.add('gone'); buildThread(); }, 1900);
};
setTimeout(openBook, 700);
book.addEventListener('click', openBook);
window.addEventListener('scroll', openBook, { once: true, passive: true });

/* ---------- Появяване при скрол ---------- */
const fadeEls = document.querySelectorAll('.chapter-head, .leaf, .mission-text, .mission-art, .timeline li, .timeline-photos figure, .teachers-photo, .teacher, .homes li, .album a, .facts, .motto-line, .interlude blockquote');
fadeEls.forEach(el => el.classList.add('fade'));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
fadeEls.forEach(el => io.observe(el));

/* ---------- Червената нишка ---------- */
const root = document.getElementById('storyRoot');
const svg = document.getElementById('thread');
const line = document.getElementById('threadLine');
const ghost = document.getElementById('threadGhost');
let threadLen = 0;

function buildThread() {
  if (getComputedStyle(svg).display === 'none') return;
  const rb = root.getBoundingClientRect();
  const H = root.offsetHeight, W = root.offsetWidth;
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const pts = [];
  const cx = W / 2;
  pts.push([gutterX(W), 0]);
  document.querySelectorAll('#storyRoot .knot:not(.deco)').forEach(k => {
    const r = k.getBoundingClientRect();
    const x = r.left - rb.left + r.width / 2;
    const y = r.top - rb.top + r.height / 2;
    const sec = k.closest('section');
    const centered = !k.closest('.chapter');
    if (centered && sec && pts.length > 1) {
      const last = pts[pts.length - 1];
      pts.push([last[0], sec.offsetTop - 10]);
    }
    pts.push([x, y]);
    if (centered && sec) {
      const gx = gutterX(W);
      pts.push([gx, y + 70]);
      pts.push([gx, sec.offsetTop + sec.offsetHeight + 10]);
    }
  });
  pts.push([pts[pts.length - 1][0], H]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const dy = (y1 - y0) * 0.5;
    const sway = (i % 2 ? 1 : -1) * Math.min(22, Math.abs(y1 - y0) * 0.05);
    d += ` C${x0 + sway},${y0 + dy} ${x1 - sway},${y1 - dy} ${x1},${y1}`;
  }
  line.setAttribute('d', d);
  ghost.setAttribute('d', d);
  threadLen = line.getTotalLength();
  line.style.strokeDasharray = threadLen;
  drawThread();
}
function gutterX(W) {
  const k = document.querySelector('.chapter .knot');
  if (!k) return 24;
  const rb = root.getBoundingClientRect(), r = k.getBoundingClientRect();
  return r.left - rb.left + r.width / 2;
}
function drawThread() {
  if (!threadLen) return;
  const rb = root.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - rb.top) / root.offsetHeight));
  line.style.strokeDashoffset = threadLen * (1 - p);
}
window.addEventListener('scroll', drawThread, { passive: true });
window.addEventListener('resize', () => requestAnimationFrame(buildThread));
window.addEventListener('load', buildThread);
document.fonts && document.fonts.ready.then(buildThread);
setTimeout(buildThread, 1500);

/* ---------- Формата отваря имейл с попълнените данни ---------- */
document.getElementById('enrolForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = `Родител: ${f.get('parent')}\nДете и клас: ${f.get('child')}\nКонтакт: ${f.get('contact')}\n\n${f.get('msg') || ''}`;
  window.location.href = `mailto:${SCHOOL_EMAIL}?subject=${encodeURIComponent('Записване в неделното училище')}&body=${encodeURIComponent(body)}`;
  document.getElementById('formNote').textContent = lang === 'en'
    ? 'Your email app will open with the details filled in. Just press Send.'
    : 'Ще се отвори имейл с попълнените данни. Натиснете „Изпрати“.';
});

/* ---------- Мобилно меню ---------- */
const burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
function setMenu(open) {
  mnav.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('menu-open', open);
}
burger.addEventListener('click', () => setMenu(mnav.hidden));
mnav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 1060) setMenu(false); });

/* ====================================================================
   Съдържание от админ панела (папка content/)
   ==================================================================== */
let CONTENT = null;
const T = (bg, en) => (lang === 'en' ? (en || bg || '') : (bg || en || ''));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const paras = s => esc(s).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
const clean = s => String(s || '').replace(/^\/+/, '');
const ytId = u => { const m = String(u || '').match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/); return m ? m[1] : ''; };
const fmtDate = d => {
  if (!d) return '';
  const x = new Date(String(d).slice(0, 10) + 'T12:00:00');
  if (isNaN(x)) return esc(d);
  return x.toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
};
const GROUPS = {
  all:        { bg: 'Всички', en: 'Everyone' },
  preschool:  { bg: 'Предучилищна група (2–5 г.)', en: 'Preschool (ages 2–5)' },
  g1_4:       { bg: '1. – 4. клас', en: 'Grades 1–4' },
  g5_7:       { bg: '5. – 7. клас', en: 'Grades 5–7' },
  g8_12:      { bg: '8. – 12. клас', en: 'Grades 8–12' },
  school:     { bg: 'Училище (1. – 12. клас)', en: 'School (grades 1–12)' }
};
let topicFilter = 'any', postsShown = 0;

function thumbHTML(url, title) {
  const id = ytId(url);
  if (id) return `<button class="vthumb" type="button" data-yt="${id}" aria-label="${esc(T('Пусни видеото', 'Play video'))}: ${esc(title)}">
      <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" loading="lazy" alt=""
        onload="if(this.naturalWidth<=120){this.onload=null;this.src='https://i.ytimg.com/vi/${id}/mqdefault.jpg'}"
        onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/mqdefault.jpg'">
      <span class="vplay" aria-hidden="true"></span></button>`;
  return `<a class="vthumb other" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(title)}">
      <img src="img/logo.jpg" loading="lazy" alt=""><span class="vplay" aria-hidden="true"></span></a>`;
}

function renderTopics() {
  const box = document.getElementById('topics');
  const list = (CONTENT.topics || []).filter(x => x && x.show !== false && (x.title_bg || x.title_en));
  box.hidden = !list.length;
  if (!list.length) return;
  const used = [...new Set(list.map(x => x.group || 'all'))];
  const f = document.getElementById('topicFilter');
  f.innerHTML = used.length > 1 ? [`<button type="button" class="chip${topicFilter === 'any' ? ' on' : ''}" data-g="any">${T('Всички групи', 'All groups')}</button>`]
    .concat(used.map(g => `<button type="button" class="chip${topicFilter === g ? ' on' : ''}" data-g="${g}">${esc(T((GROUPS[g] || GROUPS.all).bg, (GROUPS[g] || GROUPS.all).en))}</button>`)).join('') : '';
  const shown = list.filter(x => topicFilter === 'any' || (x.group || 'all') === topicFilter || (x.group || 'all') === 'all');
  document.getElementById('topicList').innerHTML = shown.map(x => {
    const g = GROUPS[x.group] || GROUPS.all;
    return `<article class="topic">
      <p class="topic-meta"><span>${esc(T(g.bg, g.en))}</span>${x.date ? `<span>${fmtDate(x.date)}</span>` : ''}</p>
      <h4>${esc(T(x.title_bg, x.title_en))}</h4>
      ${(x.text_bg || x.text_en) ? paras(T(x.text_bg, x.text_en)) : ''}
      ${x.link ? `<a class="topic-link" href="${esc(x.link)}" target="_blank" rel="noopener">${T('Материали', 'Materials')} →</a>` : ''}
    </article>`;
  }).join('');
}
document.getElementById('topicFilter').addEventListener('click', e => {
  const b = e.target.closest('[data-g]'); if (!b) return;
  topicFilter = b.dataset.g; renderTopics(); requestAnimationFrame(buildThread);
});

function sortedPosts() {
  return (CONTENT.posts || []).filter(p => p && p.show !== false && (p.title_bg || p.title_en))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}
function renderPosts() {
  const list = sortedPosts();
  const per = Math.max(1, Number((CONTENT.settings || {}).posts_per_page) || 6);
  if (!postsShown) postsShown = per;
  const box = document.getElementById('postList');
  box.innerHTML = list.length ? list.slice(0, postsShown).map((p, i) => {
    const title = T(p.title_bg, p.title_en);
    const media = p.video && ytId(p.video) ? thumbHTML(p.video, title)
      : p.image ? `<a class="post-img" href="${esc(clean(p.image))}" target="_blank"><img src="${esc(clean(p.image))}" loading="lazy" alt="${esc(title)}"></a>` : '';
    return `<article class="post${i === 0 ? ' lead' : ''}${media ? '' : ' no-media'}">
      ${media ? `<div class="post-media">${media}</div>` : ''}
      <div class="post-body">
        ${p.date ? `<p class="t-date">${fmtDate(p.date)}</p>` : ''}
        <h3>${esc(title)}</h3>
        ${paras(T(p.text_bg, p.text_en))}
        ${p.video && !ytId(p.video) ? `<a class="post-link" href="${esc(p.video)}" target="_blank" rel="noopener">${T('Гледайте видеото', 'Watch the video')} →</a>` : ''}
        ${p.link ? `<a class="post-link" href="${esc(p.link)}" target="_blank" rel="noopener">${T('Прочетете още', 'Read more')} →</a>` : ''}
      </div></article>`;
  }).join('') : `<p class="empty-note">${T('Скоро тук ще има новини.', 'News coming soon.')}</p>`;
  const more = document.getElementById('morePosts');
  more.hidden = list.length <= postsShown;
}
document.getElementById('morePosts').addEventListener('click', () => {
  postsShown += Math.max(1, Number((CONTENT.settings || {}).posts_per_page) || 6);
  renderPosts(); requestAnimationFrame(buildThread);
});

function renderVideos() {
  const list = (CONTENT.videos || []).filter(v => v && v.url && v.show !== false);
  const box = document.getElementById('videos');
  box.hidden = !list.length;
  document.getElementById('videoList').innerHTML = list.map(v => {
    const title = T(v.title_bg, v.title_en) || T('Видео', 'Video');
    return `<figure class="vcard">${thumbHTML(v.url, title)}
      <figcaption>${v.date ? `<span class="t-date">${fmtDate(v.date)}</span>` : ''}<b>${esc(title)}</b></figcaption></figure>`;
  }).join('');
}

function renderAlbum() {
  const list = (CONTENT.album || []).filter(a => a && a.image);
  if (!list.length) return;
  document.getElementById('albumGrid').innerHTML = list.map((a, i) => {
    const src = esc(clean(a.image)), cap = T(a.caption_bg, a.caption_en);
    return `<a class="${i < 5 ? 'a' + (i + 1) : 'ax'} fade in" href="${src}" target="_blank"><img src="${src}" loading="lazy" alt="${esc(cap)}">${cap ? `<span class="cap">${esc(cap)}</span>` : ''}</a>`;
  }).join('');
}

function renderAll() {
  renderTopics(); renderPosts(); renderVideos(); renderAlbum();
  document.querySelectorAll('#topicList .topic, #postList .post, #videoList .vcard').forEach(el => el.classList.add('fade', 'in'));
}

/* видео в изскачащ прозорец */
const vmodal = document.getElementById('vmodal');
document.addEventListener('click', e => {
  const b = e.target.closest('[data-yt]');
  if (b) {
    document.getElementById('vframe').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    vmodal.hidden = false; return;
  }
  if (e.target.closest('[data-vclose]')) closeV();
});
function closeV() { vmodal.hidden = true; document.getElementById('vframe').innerHTML = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeV(); setMenu(false); } });

async function loadContent() {
  const get = f => fetch('content/' + f + '?t=' + Date.now(), { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const names = ['settings', 'texts', 'topics', 'posts', 'videos', 'album'];
  const res = await Promise.all(names.map(n => get(n + '.json')));
  CONTENT = Object.fromEntries(names.map((n, i) => [n, res[i]]));
  const s = CONTENT.settings || {};
  if (s.email) {
    SCHOOL_EMAIL = s.email.trim();
    const a = document.getElementById('cEmail'); a.href = 'mailto:' + SCHOOL_EMAIL; a.textContent = SCHOOL_EMAIL;
  }
  if (s.phone) { const a = document.getElementById('cPhone'); a.href = 'tel:' + s.phone.replace(/[^\d+]/g, ''); a.textContent = s.phone; }
  if (s.facebook) document.querySelectorAll('a[href*="facebook.com"]').forEach(a => (a.href = s.facebook));
  if (Array.isArray(CONTENT.texts)) {
    const map = new Map(CONTENT.texts.filter(Boolean).map(x => [x.key, x]));
    const rich = v => esc(v).replace(/\n/g, '<br>');
    document.querySelectorAll('[data-k]').forEach(n => {
      const x = map.get(n.dataset.k); if (!x) return;
      if (x.bg) n.dataset.bg = rich(x.bg);
      if (x.en) n.dataset.en = rich(x.en);
    });
  }
  setLang(lang);
}
loadContent();
