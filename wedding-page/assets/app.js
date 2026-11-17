(function () {
  'use strict';

  // hoai_ngoc.html (<body data-side="gai">) ghi đè phần chung bằng brideSide; các trang khác dùng nguyên phần chung.
  const cfg = document.body.dataset.side === 'gai' ? { ...window.WEDDING, ...window.WEDDING.brideSide } : window.WEDDING;
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

  function svgData(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Ảnh mẫu khi chưa có ảnh thật: nền đỏ đô chuyển sắc, trái tim chìm và nhãn.
  const PH_COLORS = [['#6e1a20', '#380a0e'], ['#8c3a3f', '#511419'], ['#5e1218', '#2c0508'],
    ['#7a2a2f', '#40100f'], ['#6b2228', '#33080c'], ['#8a3036', '#4a0f14']];
  function photoPlaceholder(i, w, h, label) {
    const [c1, c2] = PH_COLORS[i % PH_COLORS.length];
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
      <text x="50%" y="${h * 0.45}" font-size="${w * 0.3}" text-anchor="middle" dominant-baseline="central" fill="#ece4d8" fill-opacity=".25" font-family="serif">♡</text>
      <text x="50%" y="${h * 0.82}" font-size="${w * 0.06}" text-anchor="middle" fill="#ece4d8" fill-opacity=".85" font-family="Georgia, serif" font-style="italic">${label}</text>
    </svg>`);
  }

  // Ảnh trang trí của mẫu "Minimalism đỏ đậm": cành hoa, lâu đài nét chì, phong bì, biểu tượng lịch trình.
  const THEME = 'image/mau_do_dam/';
  const flower = cls => `<span class="flower ${cls}" aria-hidden="true"><img src="${THEME}flower2-decoration.webp" alt=""></span>`;
  const castle = style => `<img class="castle" src="${THEME}castle-background.webp" alt="" aria-hidden="true" style="${style}">`;
  const icon = name => `<img class="ico" src="${THEME}${esc(name)}.webp" alt="" aria-hidden="true">`;
  const roleOf = p => p.rank || (p === cfg.groom ? 'Chú rể' : 'Cô dâu');
  const sideOf = p => (p === cfg.groom ? 'Nhà trai' : 'Nhà gái');
  // Chữ cái đầu của tên gọi (từ cuối cùng), dùng cho con dấu sáp: "Chí Thanh" → "T".
  const initial = p => p.name.trim().split(/\s+/).pop().charAt(0).toUpperCase();

  function familyCol(p) {
    return `<div class="family-col">
      <h4>${sideOf(p)}</h4>
      <p>${esc(p.father)}</p>
      <p>${esc(p.mother)}</p>
      <p class="addr">${esc(p.address)}</p>
    </div>`;
  }

  function eventBlock(e) {
    const p = parseDate(e.date);
    return `<div class="event reveal">
      <p class="event-title">${esc(e.title)}${e.place ? `<br>${esc(e.place)}` : ''}</p>
      <p class="event-meta"><span>Vào lúc ${esc(e.time)}</span><span>${WEEKDAYS[p.wd]}</span></p>
      <div class="event-date"><b>${pad(p.d)}</b><i></i><span>Tháng ${pad(p.m)}<br>${p.y}</span></div>
      ${cfg.showLunar ? `<p class="lunar">(Tức ${lunarText(p)})</p>` : ''}
    </div>`;
  }

  function calendar(p) {
    const offset = (new Date(p.y, p.m - 1, 1).getDay() + 6) % 7;
    const days = new Date(p.y, p.m, 0).getDate();
    let cells = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => `<span class="dow">${d}</span>`).join('');
    cells += '<span></span>'.repeat(offset);
    for (let d = 1; d <= days; d++) {
      cells += d === p.d
        ? `<span class="is-day"><svg aria-hidden="true"><use href="#i-heart"/></svg><b>${d}</b></span>`
        : `<span>${d}</span>`;
    }
    return `<p class="cal-title">Tháng ${p.m} / ${p.y}</p><div class="cal-grid">${cells}</div>`;
  }

  // Link "Thêm vào lịch" của Google Calendar: giờ Việt Nam đổi sang UTC, mặc định kéo dài 2 tiếng.
  function calendarLink() {
    const start = new Date(`${cfg.date}T${cfg.time}:00+07:00`);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const utc = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${cfg.events[0].title} ${first.name} & ${second.name}`,
      dates: `${utc(start)}/${utc(end)}`,
      location: [cfg.venue.name, cfg.venue.address].filter(Boolean).join(', '),
      details: cfg.inviteText,
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  function album(photos) {
    const focus = i => (i === 0 && cfg.heroPhoto ? ` style="object-position:${esc(cfg.heroFocus || '50% 50%')}"` : '');
    return `<div class="flow reveal">
      <div class="flow-stage">${photos.map((src, i) => `<button class="flow-item" type="button" data-i="${i}" aria-label="Xem ảnh ${i + 1}"><img src="${esc(src)}" alt="Ảnh cưới ${i + 1}"${focus(i)}></button>`).join('')}</div>
      <div class="flow-dots">${photos.map((_, i) => `<button type="button" data-go="${i}" aria-label="Ảnh ${i + 1}"></button>`).join('')}</div>
    </div>`;
  }

  // Phong bì "Save the date": ảnh chính cài nghiêng giữa nền và nắp phong bì, cành hoa bên trái.
  function heroEnvelope(photo) {
    const focus = cfg.heroPhoto ? ` style="object-position:${esc(cfg.heroFocus || '50% 50%')}"` : '';
    return `<div class="env reveal">
      <img class="env-back" src="${THEME}envelope-background.webp" alt="" aria-hidden="true">
      <div class="env-photo"><div><img src="${esc(photo)}" alt="Ảnh cưới"${focus}></div></div>
      ${flower('env-flower')}
      <img class="env-front" src="${THEME}envelope-cover.webp" alt="" aria-hidden="true">
    </div>`;
  }

  function render(photos) {
    const main = parseDate(cfg.date);
    const mapQuery = encodeURIComponent(cfg.venue.mapQuery || cfg.venue.address);
    // Nhúng thẳng /maps/embed: link maps?q=…&output=embed chuyển hướng qua một bước có X-Frame-Options,
    // trình duyệt trong app trên Android (Zalo, Messenger…) chặn khung đó (ERR_BLOCKED_BY_RESPONSE).
    const mapEmbed = `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${mapQuery}`;
    const dress = cfg.dressCode || [];
    const [ceremony, ...moreEvents] = cfg.events;

    $('#card').innerHTML = `
      <header class="hero">
        ${castle('top:26%;width:170%')}
        <p class="hero-kicker">Save the date</p>
        ${heroEnvelope(photos[0])}
        <div class="hero-names reveal">
          <h2>${esc(first.name)}</h2>
          <span class="hero-amp" aria-hidden="true">&amp;</span>
          <h2>${esc(second.name)}</h2>
        </div>
      </header>

      <section class="panel-wrap">
        ${flower('deco-r1')}
        <div class="panel">
          <h2 class="panel-title reveal">Thông tin lễ cưới</h2>
          <div class="family reveal">${familyCol(first)}<span class="vline"></span>${familyCol(second)}</div>
          <p class="announce reveal">Trân trọng báo tin<br>lễ thành hôn của con chúng tôi</p>
          <div class="couple reveal">
            <h3 class="couple-name">${esc(first.fullName)}</h3>
            <p class="role">${esc(roleOf(first))}</p>
            <p class="amp">&amp;</p>
            <h3 class="couple-name">${esc(second.fullName)}</h3>
            <p class="role">${esc(roleOf(second))}</p>
          </div>
          ${eventBlock(ceremony)}
          <p class="guest-line reveal if-guest" hidden>Kính gửi: <strong data-bind="guest"></strong></p>
          <p class="invite reveal">${esc(cfg.inviteText)}</p>
        </div>
      </section>

      <section class="section">
        ${castle('top:-6%;width:150%')}
        <h2 class="title reveal">Album ảnh</h2>
        ${album(photos)}
      </section>

      <section class="panel-wrap">
        ${flower('deco-l1')}
        <div class="panel">
          ${moreEvents.length
            ? `<h2 class="panel-title reveal">Thông tin tiệc cưới</h2>${moreEvents.map(eventBlock).join('')}<h3 class="panel-sub reveal">Cùng đếm ngược</h3>`
            : '<h2 class="panel-title reveal">Cùng đếm ngược</h2>'}
          <div class="countdown reveal" id="countdown">
            <div><b data-cd="d">00</b><span>Ngày</span></div>
            <div><b data-cd="h">00</b><span>Giờ</span></div>
            <div><b data-cd="m">00</b><span>Phút</span></div>
            <div><b data-cd="s">00</b><span>Giây</span></div>
          </div>
          <div class="calendar reveal">${calendar(main)}</div>
          <a class="text-link reveal" href="${esc(calendarLink())}" target="_blank" rel="noopener">Thêm vào lịch</a>
          ${cfg.rsvpUrl ? `<a class="pill reveal" href="${esc(cfg.rsvpUrl)}" target="_blank" rel="noopener">Xác nhận tham dự</a>` : ''}
        </div>
      </section>

      <section class="section venue">
        ${castle('top:-1%;width:158%')}
        <h2 class="title reveal">Địa điểm tổ chức</h2>
        <p class="venue-name reveal">${esc(cfg.venue.name)}</p>
        <p class="venue-addr reveal">${esc(cfg.venue.address)}</p>
        <div class="map reveal"><iframe title="Bản đồ đường đi" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapEmbed}"></iframe></div>
        <a class="dir-link reveal" href="https://www.google.com/maps/dir/?api=1&destination=${mapQuery}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 3 10.5l7.5 3 3 7.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>Chỉ đường
        </a>
      </section>

      ${dress.length ? `<section class="section dress">
        <h2 class="title reveal">Dress code</h2>
        <p class="sub reveal">Trang phục dự tiệc</p>
        <div class="swatches reveal">${dress.map(c => `<span style="background:${esc(c)}"></span>`).join('')}</div>
      </section>` : ''}

      <section class="panel-wrap">
        ${flower('deco-r2')}
        <div class="panel">
          <h2 class="panel-title reveal">Lịch trình ngày cưới</h2>
          <ol class="timeline">${cfg.timeline.map(t => `<li class="reveal">
            <time><span class="tl-time">${t.icon ? icon(t.icon) : ''}${esc(t.time)}</span></time>
            <span class="tl-dot" aria-hidden="true"></span>
            <span class="tl-label">${esc(t.label)}</span>
          </li>`).join('')}</ol>
        </div>
      </section>

      <footer class="thanks">
        <p class="reveal">${esc(cfg.thanks)}</p>
        <p class="thanks-names reveal"><span>${esc(first.name)}</span> &amp; <span>${esc(second.name)}</span></p>
        <p class="thanks-heart" aria-hidden="true">♡</p>
      </footer>`;
  }

  function bind() {
    const p = parseDate(cfg.date);
    const values = {
      first: first.name, second: second.name, dateLong: `${p.d} tháng ${p.m}, ${p.y}`, guest,
      initials: `${initial(first)}&${initial(second)}`,
    };
    document.querySelectorAll('[data-bind]').forEach(el => { el.textContent = values[el.dataset.bind] ?? ''; });
    document.querySelectorAll('.if-guest').forEach(el => { el.hidden = !guest; });
    document.querySelectorAll('.no-guest').forEach(el => { el.hidden = Boolean(guest); });
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
        el.innerHTML = `<p class="cd-done">${today ? 'Hôm nay là ngày vui của chúng mình!' : 'Cảm ơn bạn đã chung vui cùng chúng mình!'}</p>`;
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
    const glyphs = ['✦', '♡', '✧', '❀', '✦'];
    const reach = Math.max(innerWidth, innerHeight) * 0.6;
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span');
      const a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * reach;
      s.className = 'spark';
      s.textContent = glyphs[i % glyphs.length];
      s.style.cssText = `left:${cx}px;top:${cy}px;--tx:${(Math.cos(a) * dist) | 0}px;--ty:${(Math.sin(a) * dist) | 0}px;` +
        `--r:${(Math.random() * 720 - 360) | 0}deg;--d:${(1000 + Math.random() * 900) | 0}ms;font-size:${(12 + Math.random() * 18) | 0}px`;
      host.appendChild(s);
    }
    setTimeout(() => host.replaceChildren(), 2200);
  }

  // Cánh hoa rơi chậm từ lúc hiện bìa: đỏ, kem, vàng; trên nền kem thì chỉ thấy cánh đỏ và vàng.
  const PETAL_COLORS = ['#a8323b', '#ece4d8', '#c9a24a', '#7a1f26'];
  function startPetals() {
    if (reduced) return;
    const host = $('#petals');
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.style.cssText = `left:${(Math.random() * 100).toFixed(1)}vw;--dx:${(Math.random() * 160 - 80) | 0}px;` +
        `--rot:${(Math.random() * 720) | 0}deg;--size:${(8 + Math.random() * 9) | 0}px;--c:${PETAL_COLORS[i % PETAL_COLORS.length]};` +
        `animation-duration:${(14 + Math.random() * 10).toFixed(1)}s;animation-delay:-${(Math.random() * 20).toFixed(1)}s`;
      host.appendChild(p);
    }
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
    return open;
  }

  // Album trượt: ảnh giữa to nhất, hai bên xoay nghiêng lùi ra sau. Bấm ảnh giữa để phóng to,
  // bấm ảnh bên / vuốt / chấm để chuyển; tự chuyển mỗi 4 giây, dừng 8 giây sau khi người xem thao tác.
  function setupFlow(openLightbox) {
    const stage = $('.flow-stage');
    const items = [...stage.children];
    const dots = [...document.querySelectorAll('.flow-dots button')];
    const n = items.length;
    let cur = 0, x0 = null, idleUntil = 0;
    const show = i => {
      cur = (i + n) % n;
      items.forEach((el, k) => {
        let o = k - cur;
        if (o > n / 2) o -= n;
        if (o < -n / 2) o += n;
        const a = Math.abs(o);
        el.style.transform = `translateX(${o * 60}%) translateZ(${-a * 150}px) rotateY(${Math.sign(o) * 40}deg) scale(${a ? 0.85 : 1})`;
        el.style.zIndex = String(10 - a);
        el.style.opacity = a > 2 ? '0' : a > 1 ? '.5' : a ? '.8' : '1';
        el.classList.toggle('is-center', o === 0);
        el.tabIndex = a > 1 ? -1 : 0;
      });
      dots.forEach((d, k) => d.classList.toggle('on', k === cur));
    };
    const go = i => {
      idleUntil = performance.now() + 8000;
      show(i);
    };
    stage.addEventListener('click', e => {
      const item = e.target.closest('.flow-item');
      if (!item) return;
      const i = Number(item.dataset.i);
      if (i === cur) openLightbox(i);
      else go(i);
    });
    $('.flow-dots').addEventListener('click', e => {
      const dot = e.target.closest('[data-go]');
      if (dot) go(Number(dot.dataset.go));
    });
    stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    show(0);
    if (!reduced) {
      setInterval(() => {
        if (!state.lightboxOpen && !document.hidden && performance.now() > idleUntil) show(cur + 1);
      }, 4000);
    }
  }

  function openCard() {
    const body = document.body;
    if (body.classList.contains('opening')) return;
    body.classList.add('opening');
    playMusic();
    burst();
    setTimeout(setupReveal, reduced ? 0 : 450);
    setTimeout(() => {
      $('#intro').remove();
      body.classList.remove('locked');
      setTimeout(startAutoScroll, 1500);
    }, reduced ? 50 : 1100);
  }

  const gallery = cfg.gallery.length
    ? cfg.gallery
    : Array.from({ length: 6 }, (_, i) => photoPlaceholder(i + 1, 600, 900, `Ảnh cưới ${i + 1}`));
  const photos = cfg.heroPhoto ? [cfg.heroPhoto, ...gallery.filter(src => src !== cfg.heroPhoto)] : gallery;
  render(photos);
  bind();
  startPetals();
  startCountdown();
  setupMusic();
  setupFlow(setupLightbox(photos));
  $('#open-btn').addEventListener('click', openCard);
})();
