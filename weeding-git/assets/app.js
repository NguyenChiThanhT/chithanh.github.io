(function () {
  'use strict';

  const cfg = window.WEDDING;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const state = { lightboxOpen: false };

  const [first, second] = cfg.brideFirst ? [cfg.bride, cfg.groom] : [cfg.groom, cfg.bride];
  const guest = new URLSearchParams(location.search).get('khach');

  function parseDate(s) {
    const [y, m, d] = s.split('-').map(Number);
    return { y, m, d, wd: new Date(y, m - 1, d).getDay() };
  }

  function lunarText(p) {
    const l = window.Lunar.solarToLunar(p.d, p.m, p.y);
    return `ngày ${l.day} tháng ${l.month}${l.leap ? ' nhuận' : ''} năm ${window.Lunar.yearName(l.year)}`;
  }

  function timeText(t) {
    const [h, m] = t.split(':');
    return `${Number(h)} giờ ${m}`;
  }

  function svgData(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Ảnh mẫu khi chưa có ảnh thật: nền đỏ chuyển sắc, chữ 囍 chìm và nhãn.
  const PH_COLORS = [['#9b1b2a', '#3d0008'], ['#a8452b', '#4a0b0b'], ['#7a1838', '#2c0410'],
    ['#a0612d', '#4a1a08'], ['#86213f', '#30040f'], ['#94401f', '#3a0a06']];
  function photoPlaceholder(i, w, h, label) {
    const [c1, c2] = PH_COLORS[i % PH_COLORS.length];
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
      <circle cx="${w / 2}" cy="${h * 0.45}" r="${w * 0.28}" fill="none" stroke="#f1c27d" stroke-opacity=".25" stroke-width="2"/>
      <text x="50%" y="${h * 0.45}" font-size="${w * 0.26}" text-anchor="middle" dominant-baseline="central" fill="#f1c27d" fill-opacity=".35" font-family="serif">囍</text>
      <text x="50%" y="${h * 0.82}" font-size="${w * 0.06}" text-anchor="middle" fill="#fff4dc" fill-opacity=".85" font-family="Georgia, serif" font-style="italic">${label}</text>
    </svg>`);
  }

  // Mã QR giả để xem bố cục — không quét được. Thay bằng ảnh QR thật trong config.js.
  function qrPlaceholder(seed) {
    const n = 25, c = 8;
    let x = seed * 7919 + 13;
    const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    let cells = '';
    for (let r = 0; r < n; r++) {
      for (let col = 0; col < n; col++) {
        const finder = (r < 8 && col < 8) || (r < 8 && col >= n - 8) || (r >= n - 8 && col < 8);
        if (!finder && rnd() > 0.55) cells += `<rect x="${col * c}" y="${r * c}" width="${c}" height="${c}"/>`;
      }
    }
    const finder = (fx, fy) => `<rect x="${fx + 4}" y="${fy + 4}" width="48" height="48" fill="none" stroke="#2a0006" stroke-width="8"/><rect x="${fx + 16}" y="${fy + 16}" width="24" height="24"/>`;
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 216 216">
      <rect x="-8" y="-8" width="216" height="216" fill="#fff"/>
      <g fill="#2a0006">${cells}${finder(0, 0)}${finder(144, 0)}${finder(0, 144)}</g>
      <rect x="62" y="84" width="76" height="32" rx="6" fill="#fff" stroke="#8e0a1a"/>
      <text x="100" y="105" font-size="15" text-anchor="middle" fill="#8e0a1a" font-family="Georgia, serif">QR mẫu</text>
    </svg>`);
  }

  function ornament(kind, cls) {
    const src = cfg.ornaments && cfg.ornaments[kind];
    return src
      ? `<img class="orn orn-img ${cls}" src="${esc(src)}" alt="" aria-hidden="true">`
      : `<svg class="orn ${cls}" aria-hidden="true"><use href="#s-branch"/></svg>`;
  }

  const divider = () => '<div class="divider" aria-hidden="true"><svg><use href="#s-cloud"/></svg></div>';
  const roleOf = p => (p === cfg.groom ? 'Chú rể' : 'Cô dâu');
  const sideOf = p => (p === cfg.groom ? 'Nhà trai' : 'Nhà gái');

  function familyCol(p) {
    return `<div class="family-col">
      <h4>${sideOf(p)}</h4>
      <p>${esc(p.father)}</p>
      <p>${esc(p.mother)}</p>
      <p class="addr">${esc(p.address)}</p>
    </div>`;
  }

  function eventCard(e, i) {
    const p = parseDate(e.date);
    return `<article class="event reveal" style="--i:${i % 2}">
      <h4>${esc(e.title)}</h4>
      <p class="event-time">Vào lúc <b>${esc(timeText(e.time))}</b></p>
      <div class="date-row"><span>${WEEKDAYS[p.wd]}</span><b>${pad(p.d)}</b><span>Tháng ${p.m} · ${p.y}</span></div>
      ${cfg.showLunar ? `<p class="lunar">(Tức ${lunarText(p)})</p>` : ''}
      <p class="place">${esc(e.place)}</p>
    </article>`;
  }

  function calendar(p) {
    const offset = (new Date(p.y, p.m - 1, 1).getDay() + 6) % 7;
    const days = new Date(p.y, p.m, 0).getDate();
    let cells = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => `<span class="dow">${d}</span>`).join('');
    cells += '<span></span>'.repeat(offset);
    for (let d = 1; d <= days; d++) {
      cells += d === p.d
        ? `<span class="is-day"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 4.6 2.6l1 1.4 1-1.4C14 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg><b>${d}</b></span>`
        : `<span>${d}</span>`;
    }
    return `<p class="cal-title">Tháng ${p.m} · ${p.y}</p><div class="cal-grid">${cells}</div>`;
  }

  function giftCard(g, i) {
    return `<article class="gift reveal" style="--i:${i % 2}">
      <p class="gift-side">${esc(g.side)}</p>
      <img class="qr" src="${esc(g.qr || qrPlaceholder(i + 1))}" alt="Mã QR mừng cưới ${esc(g.side)}">
      <p class="gift-bank">${esc(g.bank)}</p>
      <p class="gift-acc"><span>${esc(g.account)}</span><button class="copy" type="button" data-copy="${esc(g.account)}">Sao chép</button></p>
      <p class="gift-holder">${esc(g.holder)}</p>
    </article>`;
  }

  function render(photos) {
    const main = parseDate(cfg.date);
    const hero = cfg.heroPhoto || photoPlaceholder(0, 600, 800, 'Ảnh cưới của bạn');
    const mapQuery = encodeURIComponent(cfg.venue.mapQuery || cfg.venue.address);

    $('#card').innerHTML = `
      <section class="hero">
        <svg class="lantern hero-lantern l1" aria-hidden="true"><use href="#s-lantern"/></svg>
        <svg class="lantern hero-lantern l2" aria-hidden="true"><use href="#s-lantern"/></svg>
        ${ornament('phoenix', 'orn-tl fly')}
        ${ornament('dragon', 'orn-br fly')}
        <p class="eyebrow reveal">Lễ Thành Hôn</p>
        <h2 class="hero-names reveal"><span class="gold-text">${esc(first.name)}</span><span class="hy">囍</span><span class="gold-text">${esc(second.name)}</span></h2>
        <div class="frame-wrap reveal">
          <svg class="swallow sw-l fly" aria-hidden="true"><use href="#s-swallow"/></svg>
          <svg class="swallow sw-r fly" aria-hidden="true"><use href="#s-swallow"/></svg>
          <div class="frame"><img src="${esc(hero)}" alt="Ảnh cưới" style="object-position:${esc(cfg.heroFocus || '50% 50%')}"></div>
        </div>
        <p class="hero-date reveal">${WEEKDAYS[main.wd]}<i></i>${pad(main.d)}.${pad(main.m)}.${main.y}</p>
      </section>
      ${divider()}
      <section class="section family">
        <div class="family-grid reveal">${familyCol(first)}<span class="vline"></span>${familyCol(second)}</div>
        <p class="invite reveal">${esc(cfg.inviteText)}</p>
        <p class="guest-line reveal" hidden>Kính gửi: <strong data-bind="guest"></strong></p>
        <p class="announce reveal">Tới dự lễ thành hôn của con chúng tôi</p>
        <div class="couple reveal">
          <div><span class="role">${roleOf(first)}</span><span class="script gold-text">${esc(first.fullName)}</span></div>
          <span class="amp">&amp;</span>
          <div><span class="role">${roleOf(second)}</span><span class="script gold-text">${esc(second.fullName)}</span></div>
        </div>
      </section>
      ${divider()}
      <section class="section events">
        <h3 class="title reveal">Lịch trình</h3>
        ${cfg.events.map(eventCard).join('')}
        <div class="calendar reveal">${calendar(main)}</div>
        <div class="countdown reveal" id="countdown">
          <div><b data-cd="d">00</b><span>Ngày</span></div>
          <div><b data-cd="h">00</b><span>Giờ</span></div>
          <div><b data-cd="m">00</b><span>Phút</span></div>
          <div><b data-cd="s">00</b><span>Giây</span></div>
        </div>
      </section>
      <section class="section">
        <h3 class="title reveal">Chương trình</h3>
        <ol class="timeline">${cfg.timeline.map(t => `<li class="reveal"><time>${esc(t.time)}</time><span>${esc(t.label)}</span></li>`).join('')}</ol>
      </section>
      ${divider()}
      <section class="section">
        <h3 class="title reveal">Album ảnh cưới</h3>
        <div class="gallery">${photos.map((src, i) => `<button class="ph reveal" style="--i:${i % 2}" type="button" data-i="${i}" aria-label="Xem ảnh ${i + 1}"><img src="${esc(src)}" alt="Ảnh cưới ${i + 1}" loading="lazy"></button>`).join('')}</div>
      </section>
      <section class="section venue">
        <h3 class="title reveal">Địa điểm</h3>
        <p class="venue-name reveal">${esc(cfg.venue.name)}</p>
        <p class="venue-addr reveal">${esc(cfg.venue.address)}</p>
        <div class="map reveal"><iframe title="Bản đồ đường đi" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${mapQuery}&output=embed"></iframe></div>
        <a class="btn reveal" href="https://www.google.com/maps/dir/?api=1&destination=${mapQuery}" target="_blank" rel="noopener">Chỉ đường</a>
        ${cfg.rsvpUrl ? `<a class="btn btn-solid reveal" href="${esc(cfg.rsvpUrl)}" target="_blank" rel="noopener">Xác nhận tham dự</a>` : ''}
      </section>
      ${divider()}
      <section class="section gifts">
        <h3 class="title reveal">Hộp mừng cưới</h3>
        <p class="note reveal">Nếu không thể tới chung vui, bạn có thể gửi lời chúc qua tài khoản dưới đây.</p>
        <div class="gift-grid">${cfg.gifts.map(giftCard).join('')}</div>
      </section>
      <footer class="section thanks">
        <svg class="reveal" aria-hidden="true"><use href="#s-cloud"/></svg>
        <p class="reveal">${esc(cfg.thanks)}</p>
        <p class="script gold-text reveal">${esc(first.name)} &amp; ${esc(second.name)}</p>
      </footer>`;
  }

  function bind() {
    const p = parseDate(cfg.date);
    const values = { first: first.name, second: second.name, dateDots: `${pad(p.d)} · ${pad(p.m)} · ${p.y}`, guest };
    document.querySelectorAll('[data-bind]').forEach(el => { el.textContent = values[el.dataset.bind] ?? ''; });
    if (guest) document.querySelectorAll('.intro-guest, .guest-line').forEach(el => { el.hidden = false; });
    document.title = `${first.name} & ${second.name} · Thiệp cưới`;
  }

  function startCountdown() {
    const el = $('#countdown');
    const target = new Date(`${cfg.date}T${cfg.time}:00+07:00`).getTime();
    const tick = () => {
      const left = Math.floor((target - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(timer);
        const today = Date.now() - target < 86400000;
        el.innerHTML = `<p class="cd-done gold-text">${today ? 'Hôm nay là ngày vui của chúng mình!' : 'Cảm ơn bạn đã chung vui cùng chúng mình!'}</p>`;
        return;
      }
      const vals = { d: Math.floor(left / 86400), h: Math.floor((left % 86400) / 3600), m: Math.floor((left % 3600) / 60), s: left % 60 };
      Object.keys(vals).forEach(k => { el.querySelector(`[data-cd="${k}"]`).textContent = pad(vals[k]); });
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }

  function burst() {
    if (reduced) return;
    const host = $('#sparks');
    const r = $('#open-btn').getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const glyphs = ['囍', '✦', '✧', '❀', '✦'];
    const reach = Math.max(innerWidth, innerHeight) * 0.6;
    for (let i = 0; i < 48; i++) {
      const s = document.createElement('span');
      const a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * reach;
      s.className = 'spark';
      s.textContent = glyphs[i % glyphs.length];
      s.style.cssText = `left:${cx}px;top:${cy}px;--tx:${(Math.cos(a) * dist) | 0}px;--ty:${(Math.sin(a) * dist) | 0}px;` +
        `--r:${(Math.random() * 720 - 360) | 0}deg;--d:${(1000 + Math.random() * 900) | 0}ms;font-size:${(12 + Math.random() * 20) | 0}px`;
      host.appendChild(s);
    }
    setTimeout(() => host.replaceChildren(), 2200);
  }

  function startPetals() {
    if (reduced) return;
    const host = $('#petals');
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.style.cssText = `left:${(Math.random() * 100).toFixed(1)}vw;--dx:${(Math.random() * 160 - 80) | 0}px;` +
        `--rot:${(Math.random() * 720) | 0}deg;--size:${(8 + Math.random() * 8) | 0}px;` +
        `animation-duration:${(9 + Math.random() * 9).toFixed(1)}s;animation-delay:-${(Math.random() * 15).toFixed(1)}s`;
      host.appendChild(p);
    }
  }

  function setupParallax() {
    if (reduced) return;
    const bg = $('#bg-pattern');
    let queued = false;
    addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        bg.style.transform = `translate3d(0, ${-(scrollY * 0.25) % 180}px, 0)`;
        queued = false;
      });
    }, { passive: true });
  }

  // Tự cuộn ~40px/giây; người xem chạm / cuộn / bấm phím thì dừng 6 giây rồi chạy tiếp.
  function startAutoScroll() {
    if (reduced || !cfg.autoScroll) return;
    let pausedUntil = 0, last = performance.now(), carry = 0;
    const pause = () => { pausedUntil = performance.now() + 6000; };
    ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(ev => addEventListener(ev, pause, { passive: true }));
    const step = now => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (now > pausedUntil && !state.lightboxOpen) {
        carry += dt * 0.04;
        const px = Math.floor(carry);
        if (px > 0) {
          carry -= px;
          scrollBy(0, px);
        }
      }
      if (innerHeight + scrollY < document.documentElement.scrollHeight - 2) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const audio = $('#music');
  const musicBtn = $('#music-btn');
  function setupMusic() {
    if (!cfg.music) return;
    audio.src = cfg.music;
    audio.addEventListener('error', () => { musicBtn.hidden = true; });
    audio.addEventListener('play', () => musicBtn.classList.add('playing'));
    audio.addEventListener('pause', () => musicBtn.classList.remove('playing'));
    musicBtn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
  }

  function playMusic() {
    if (!cfg.music) return;
    audio.volume = 0.6;
    audio.play().then(() => { musicBtn.hidden = false; }).catch(() => {});
  }

  function setupLightbox(photos) {
    const lb = $('#lightbox'), img = $('img', lb), count = $('.lb-count', lb);
    let idx = 0, x0 = null;
    const show = i => {
      idx = (i + photos.length) % photos.length;
      img.src = photos[idx];
      count.textContent = `${idx + 1} / ${photos.length}`;
    };
    const open = i => {
      show(i);
      lb.hidden = false;
      document.body.classList.add('lb-open');
      state.lightboxOpen = true;
      requestAnimationFrame(() => lb.classList.add('show'));
    };
    const close = () => {
      lb.classList.remove('show');
      document.body.classList.remove('lb-open');
      state.lightboxOpen = false;
      setTimeout(() => { lb.hidden = true; }, 250);
    };
    $('#card').addEventListener('click', e => {
      const ph = e.target.closest('.ph');
      if (ph) open(Number(ph.dataset.i));
    });
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    $('.lb-close', lb).addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  function setupCopy() {
    $('#card').addEventListener('click', e => {
      const btn = e.target.closest('.copy');
      if (!btn) return;
      copyText(btn.dataset.copy).then(() => {
        btn.textContent = 'Đã chép';
        setTimeout(() => { btn.textContent = 'Sao chép'; }, 1500);
      }, () => {});
    });
  }

  function openCard() {
    const body = document.body;
    if (body.classList.contains('opening')) return;
    body.classList.add('opening');
    playMusic();
    burst();
    setTimeout(() => {
      body.classList.add('opened');
      setupReveal();
    }, reduced ? 0 : 450);
    setTimeout(() => {
      $('#intro').remove();
      body.classList.remove('locked');
      startPetals();
      setTimeout(startAutoScroll, 1500);
    }, reduced ? 50 : 1800);
  }

  const photos = cfg.gallery.length
    ? cfg.gallery
    : Array.from({ length: 6 }, (_, i) => photoPlaceholder(i + 1, 600, 600, `Ảnh cưới ${i + 1}`));
  render(photos);
  bind();
  startCountdown();
  setupParallax();
  setupMusic();
  setupLightbox(photos);
  setupCopy();
  $('#open-btn').addEventListener('click', openCard);
})();
