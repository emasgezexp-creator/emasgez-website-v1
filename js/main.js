/* ===== MODAL ===== */
function openModal() {
  document.getElementById('contactModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  resetForm();
}
function closeModal() {
  document.getElementById('contactModal').classList.remove('open');
  document.body.style.overflow = '';
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('contactModal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function resetForm() {
  ['f-name','f-company','f-email','f-phone','f-country','f-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f-interest').value = '';
  const st = document.getElementById('form-status');
  st.className = 'form-status';
  st.textContent = '';
  const btn = document.getElementById('modal-submit-btn');
  btn.disabled = false;
  document.getElementById('submit-label').style.display = '';
  document.getElementById('submit-spinner').style.display = 'none';
}

async function submitForm() {
  const name     = document.getElementById('f-name').value.trim();
  const email    = document.getElementById('f-email').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const company  = document.getElementById('f-company').value.trim();
  const country  = document.getElementById('f-country').value.trim();
  const interest = document.getElementById('f-interest').value;
  const message  = document.getElementById('f-message').value.trim();
  const status   = document.getElementById('form-status');
  const btn      = document.getElementById('modal-submit-btn');

  const msgs = {
    en: { required:'Please fill in your name and email.', sending:'Sending…', success:'✓ Message sent! We will get back to you shortly.', error:'Could not send. Please contact us via WhatsApp.' },
    tr: { required:'Lütfen ad ve e-posta alanlarını doldurun.', sending:'Gönderiliyor…', success:'✓ Mesajınız iletildi! En kısa sürede geri dönüş yapacağız.', error:'Gönderilemedi. Lütfen WhatsApp ile ulaşın.' },
    de: { required:'Bitte Name und E-Mail ausfüllen.', sending:'Wird gesendet…', success:'✓ Nachricht gesendet! Wir melden uns in Kürze.', error:'Fehler. Bitte per WhatsApp kontaktieren.' }
  };
  const m = msgs[currentLang] || msgs.en;

  if (!name || !email) {
    status.className = 'form-status error'; status.textContent = m.required; return;
  }

  btn.disabled = true;
  document.getElementById('submit-label').textContent = m.sending;
  document.getElementById('submit-spinner').style.display = '';
  status.className = 'form-status'; status.textContent = '';

  try {
    const res = await fetch('https://formsubmit.co/ajax/emasgezexp@gmail.com', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone:     phone    || '—',
        company:   company  || '—',
        country:   country  || '—',
        interest:  interest || '—',
        message:   message  || '—',
        _subject:  'EMASGEZ Sorgu — ' + (interest || 'Genel') + ' — ' + name,
        _captcha:  'false',
        _template: 'table',
        _replyto:  email,
      })
    });
    const data = await res.json();
    console.log('HTTP status:', res.status);
    console.log('Response:', JSON.stringify(data));
    if (data.success === 'true' || data.success === true) {
      status.className = 'form-status success';
      status.textContent = m.success;
      document.getElementById('submit-label').textContent = '✓ Sent';
      document.getElementById('submit-spinner').style.display = 'none';
      setTimeout(() => closeModal(), 3000);
    } else {
      throw new Error(data.message || 'failed');
    }
  } catch (err) {
    console.error('HATA:', err);
    console.error('Mesaj:', err.message);
    btn.disabled = false;
    document.getElementById('submit-label').textContent = { en:'Send Inquiry', tr:'Gönder', de:'Absenden' }[currentLang] || 'Send Inquiry';
    document.getElementById('submit-spinner').style.display = 'none';
    status.className = 'form-status error';
    status.textContent = m.error;
  }
}

/* ── Update modal labels when language changes ── */
const _origSetLang = setLang;
// patch setLang to also update modal strings
const modalLabels = {
  en: { tag:'Get In Touch', title:'Request Our Catalog', name:'Full Name', company:'Company', email:'E-mail', phone:'Phone / WhatsApp', country:'Country', interest:'Product Interest', message:'Message', submit:'Send Inquiry', alt:'Or reach us directly on' },
  tr: { tag:'İletişime Geçin', title:'Kataloğumuzu İsteyin', name:'Ad Soyad', company:'Şirket', email:'E-posta', phone:'Telefon / WhatsApp', country:'Ülke', interest:'Ürün İlgi Alanı', message:'Mesaj', submit:'Talebi Gönder', alt:'Ya da bize doğrudan ulaşın' },
  de: { tag:'Kontakt aufnehmen', title:'Katalog anfordern', name:'Vollständiger Name', company:'Unternehmen', email:'E-Mail', phone:'Telefon / WhatsApp', country:'Land', interest:'Produktinteresse', message:'Nachricht', submit:'Anfrage senden', alt:'Oder schreiben Sie uns direkt auf' }
};
function updateModalLang(lang) {
  const l = modalLabels[lang] || modalLabels.en;
  const set = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
  set('modal-tag-text', l.tag);
  set('modal-title-text', l.title);
  set('lbl-name', l.name);
  set('lbl-company', l.company);
  set('lbl-email', l.email);
  set('lbl-phone', l.phone);
  set('lbl-country', l.country);
  set('lbl-interest', l.interest);
  set('lbl-message', l.message);
  set('submit-label', l.submit);
  const alt = document.getElementById('modal-alt-text');
  if (alt) alt.innerHTML = l.alt + ' <a href="https://wa.me/905457876755" target="_blank">WhatsApp +90 545 787 6755</a>';
}

/* Monkey-patch setLang to also refresh modal */
const _origSetLangFn = setLang;
window.setLang = function(lang) {
  _origSetLangFn(lang);
  updateModalLang(lang);
};
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

function showCat(id, btn) {
  document.querySelectorAll('.cat-section').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('cat-' + id).classList.add('visible');
  btn.classList.add('active');
}

const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    e.target.querySelectorAll('.product-card,.about-card,.market-card,.why-card,.contact-item,.cabin-card,.mat-card,.floor-card').forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(12px)';
      c.style.transition = 'opacity 0.5s, transform 0.5s';
      setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'none'; }, 60 + i * 55);
    });
  });
}, { threshold: 0.06 });
reveals.forEach(r => obs.observe(r));
/* ═══════════════════════════════════════════════════════════
   WORLD MAP CANVAS
═══════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('worldMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = 1000, H = 480;
  canvas.width = W;
  canvas.height = H;

  // ── Continent shapes (simplified paths) ──
  const continents = [
    // North America
    [[182,28],[218,18],[258,24],[278,40],[262,58],[236,50],[210,48],[196,68],[192,82],[196,96],[204,108],[188,130],[178,140],[174,154],[180,166],[186,184],[178,188],[164,170],[152,78],[156,66],[168,42],[174,32]],
    [[120,50],[154,46],[162,54],[156,66],[144,72],[116,62]],
    [[218,42],[258,34],[286,50],[280,64],[244,68],[214,50]],
    [[174,188],[194,192],[184,218],[166,218],[162,206],[164,196]],
    // South America
    [[220,232],[262,226],[278,252],[280,270],[272,310],[250,354],[226,374],[208,352],[202,308],[208,246],[212,236]],
    // Europe
    [[428,126],[460,122],[468,132],[466,146],[440,154],[424,132]],
    [[446,100],[492,94],[502,114],[482,128],[448,112]],
    [[428,88],[456,90],[438,102]],
    [[490,90],[540,88],[546,98],[526,116],[488,100]],
    [[470,52],[526,52],[506,74],[476,66]],
    [[490,114],[510,120],[498,144],[478,128],[482,116]],
    [[506,82],[562,82],[560,94],[508,94]],
    [[540,60],[648,54],[636,80],[578,80],[540,66]],
    // Africa
    [[428,154],[576,152],[590,160],[572,180],[448,178],[422,162]],
    [[420,174],[460,188],[444,216],[402,204],[404,188]],
    [[460,178],[572,180],[582,196],[556,256],[492,258],[466,218],[458,196]],
    [[478,272],[560,278],[556,318],[500,336],[470,302]],
    // Middle East
    [[548,124],[614,118],[622,138],[582,146],[546,136]],
    [[570,148],[640,150],[630,202],[578,200],[564,164]],
    [[548,136],[598,136],[598,160],[542,148]],
    [[610,118],[672,132],[648,156],[604,132]],
    // Asia
    [[648,48],[860,44],[868,76],[700,76],[648,58]],
    [[760,16],[940,34],[900,58],[754,36]],
    [[660,74],[758,82],[728,106],[654,86]],
    [[666,148],[736,154],[700,202],[660,176],[656,158]],
    [[738,80],[864,80],[836,124],[746,110],[734,96]],
    [[762,150],[836,150],[812,174],[764,162]],
    [[808,164],[848,162],[834,194],[796,174]],
    [[782,210],[848,214],[818,228],[778,216]],
    // Australia
    [[796,270],[928,284],[920,320],[844,330],[796,280]],
    [[886,236],[940,242],[906,254],[886,246]],
    // Greenland
    [[270,18],[328,18],[318,44],[268,40],[262,28]],
  ];

  // ── Routes from Ankara (582, 132) ──
  const ankara = { x: 582, y: 132 };
  const destinations = [
    { x: 494, y: 102, label: 'FRANKFURT' },
    { x: 620, y: 176, label: 'RIYADH' },
    { x: 692, y: 174, label: 'MUMBAI' },
    { x: 856, y: 118, label: 'SHANGHAI' },
    { x: 430, y: 214, label: 'LAGOS' },
    { x: 200, y: 140, label: 'NEW YORK' },
    { x: 250, y: 310, label: 'SÃO PAULO' },
    { x: 900, y: 320, label: 'SYDNEY' },
  ];

  // Control points for arcs
  const controls = [
    { cx: 540, cy: 80 },
    { cx: 600, cy: 160 },
    { cx: 640, cy: 155 },
    { cx: 720, cy: 100 },
    { cx: 510, cy: 190 },
    { cx: 400, cy: 60 },
    { cx: 420, cy: 230 },
    { cx: 740, cy: 230 },
  ];

  // ── Particles on routes ──
  const particles = destinations.map((d, i) => ({
    dest: d,
    ctrl: controls[i],
    t: Math.random(),
    speed: 0.0015 + Math.random() * 0.001,
    size: 2.5 + Math.random() * 1.5,
  }));

  // ── Pulse state ──
  let pulseT = 0;

  function bezier(t, p0, p1, p2) {
    const mt = 1 - t;
    return {
      x: mt*mt*p0.x + 2*mt*t*p1.x + t*t*p2.x,
      y: mt*mt*p0.y + 2*mt*t*p1.y + t*t*p2.y,
    };
  }

  function drawDotGrid() {
    ctx.fillStyle = 'rgba(30,30,60,0.6)';
    for (let x = 12; x < W; x += 24) {
      for (let y = 12; y < H; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawContinents() {
    continents.forEach(pts => {
      if (pts.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(200,168,75,0.22)');
      grad.addColorStop(1, 'rgba(138,112,48,0.12)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(232,201,106,0.35)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });
  }

  function drawRoutes() {
    destinations.forEach((d, i) => {
      const c = controls[i];
      ctx.beginPath();
      ctx.moveTo(ankara.x, ankara.y);
      ctx.quadraticCurveTo(c.cx, c.cy, d.x, d.y);
      ctx.strokeStyle = 'rgba(200,168,75,0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const pos = bezier(p.t, ankara, p.ctrl, p.dest);
      const alpha = Math.sin(p.t * Math.PI);

      // Glow
      const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 4);
      grd.addColorStop(0, `rgba(232,201,106,${0.6 * alpha})`);
      grd.addColorStop(1, 'rgba(232,201,106,0)');
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,240,180,${alpha})`;
      ctx.fill();
    });
  }

  function drawDestinations() {
    destinations.forEach(d => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(d.x, d.y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,168,75,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Inner dot
      ctx.beginPath();
      ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c8a84b';
      ctx.fill();
      // Label
      ctx.font = '700 7.5px "Barlow Condensed", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillStyle = 'rgba(200,168,75,0.85)';
      const lx = d.x > 500 ? d.x + 9 : d.x - 9;
      ctx.textAlign = d.x > 500 ? 'left' : 'right';
      ctx.fillText(d.label, lx, d.y + 3);
    });
  }

  function drawAnkara() {
    pulseT += 0.012;
    const t1 = (pulseT % 1);
    const t2 = ((pulseT + 0.4) % 1);
    const t3 = ((pulseT + 0.7) % 1);

    [[t1,22],[t2,22],[t3,22]].forEach(([t, maxR]) => {
      const r = t * maxR;
      const a = (1 - t) * 0.3;
      ctx.beginPath();
      ctx.arc(ankara.x, ankara.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,201,106,${a})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Glow
    const grd = ctx.createRadialGradient(ankara.x, ankara.y, 0, ankara.x, ankara.y, 14);
    grd.addColorStop(0, 'rgba(232,201,106,0.4)');
    grd.addColorStop(1, 'rgba(232,201,106,0)');
    ctx.beginPath();
    ctx.arc(ankara.x, ankara.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(ankara.x, ankara.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c96a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ankara.x, ankara.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Label
    ctx.font = '700 9px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8c96a';
    ctx.fillText('ANKARA', ankara.x, ankara.y - 14);
    ctx.font = '500 7px "Barlow Condensed", sans-serif';
    ctx.fillStyle = 'rgba(200,168,75,0.6)';
    ctx.fillText('ORIGIN', ankara.x, ankara.y - 6);
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(40,40,70,0.7)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += 125) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 96) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Equator
    ctx.strokeStyle = 'rgba(60,60,100,0.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
  }

  function drawCornerLabel() {
    ctx.font = '600 8px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(200,168,75,0.3)';
    ctx.fillText('EMASGEZ GLOBAL EXPORT COVERAGE', 14, 18);
    ctx.textAlign = 'right';
    ctx.fillText('WORLDWIDE DELIVERY', W - 14, 18);
  }

  function frame() {
    // Background
    const bg = ctx.createRadialGradient(W*0.5, H*0.35, 0, W*0.5, H*0.35, W*0.65);
    bg.addColorStop(0, '#101020');
    bg.addColorStop(1, '#070710');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawDotGrid();
    drawGrid();
    drawContinents();
    drawRoutes();
    drawParticles();
    drawDestinations();
    drawAnkara();
    drawCornerLabel();

    requestAnimationFrame(frame);
  }

  frame();
})();
