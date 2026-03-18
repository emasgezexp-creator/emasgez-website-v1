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

/* ═══════════════════════════════════
   WORLD MAP — Animation Canvas
═══════════════════════════════════ */
(function() {
  const container = document.querySelector('.world-map-container');
  const canvas = document.getElementById('worldMapCanvas');
  if (!canvas || !container) return;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {W, H};
  }

  const ctx = canvas.getContext('2d');
  let dims = resize();
  window.addEventListener('resize', () => { dims = resize(); });

  // Positions in SVG design space (1000x500), scale to canvas at runtime
  const SVG_W = 1000, SVG_H = 500;

  // City positions in SVG coords
  const ANKARA = {x:591.2, y:139.1};
  const cities = [
    {x:524.1, y:110.8, label:'FRANKFURT'},
    {x:629.8, y:181.4, label:'RIYADH'},
    {x:702.4, y:197.0, label:'MUMBAI'},
    {x:837.4, y:163.2, label:'SHANGHAI'},
    {x:509.4, y:232.1, label:'LAGOS'},
    {x:294.4, y:136.9, label:'NEW YORK'},
    {x:370.5, y:315.4, label:'SÃO PAULO'},
    {x:920.0, y:344.1, label:'SYDNEY'},
  ];

  const ctrls = [
    {x:555, y:100},  // Frankfurt
    {x:620, y:165},  // Riyadh
    {x:660, y:182},  // Mumbai
    {x:730, y:115},  // Shanghai
    {x:535, y:200},  // Lagos
    {x:430, y:90},   // New York
    {x:455, y:260},  // São Paulo
    {x:775, y:285},  // Sydney
  ];

  const particles = cities.map((c, i) => ({
    i, t: i / cities.length, speed: 0.0014 + (i % 3) * 0.0005, size: 2.6
  }));

  let pulseT = 0;

  function s(v, isY) {
    const {W, H} = dims;
    return isY ? v / SVG_H * H : v / SVG_W * W;
  }
  function sx(v) { return s(v, false); }
  function sy(v) { return s(v, true); }

  function draw() {
    const {W, H} = dims;
    ctx.clearRect(0, 0, W, H);

    // Routes
    ctx.setLineDash([4, 7]);
    ctx.lineWidth = 0.9;
    cities.forEach((c, i) => {
      ctx.beginPath();
      ctx.moveTo(sx(ANKARA.x), sy(ANKARA.y));
      ctx.quadraticCurveTo(sx(ctrls[i].x), sy(ctrls[i].y), sx(c.x), sy(c.y));
      ctx.strokeStyle = 'rgba(200,168,75,0.28)';
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Particles
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const t = p.t, mt = 1 - t;
      const c = cities[p.i], ctrl = ctrls[p.i];
      const px = sx(mt*mt*ANKARA.x + 2*mt*t*ctrl.x + t*t*c.x);
      const py = sy(mt*mt*ANKARA.y + 2*mt*t*ctrl.y + t*t*c.y);
      const alpha = Math.sin(t * Math.PI);
      const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5);
      grd.addColorStop(0, `rgba(232,201,106,${0.65 * alpha})`);
      grd.addColorStop(1, 'rgba(200,168,75,0)');
      ctx.beginPath(); ctx.arc(px, py, p.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,245,190,${alpha})`; ctx.fill();
    });

    // City dots + labels
    cities.forEach(c => {
      const cx = sx(c.x), cy = sy(c.y);
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,168,75,0.5)'; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c8a84b'; ctx.fill();
      ctx.font = '700 7px "Barlow Condensed", sans-serif';
      ctx.fillStyle = 'rgba(210,178,90,0.92)';
      const right = cx > W * 0.5;
      ctx.textAlign = right ? 'left' : 'right';
      ctx.fillText(c.label, right ? cx + 9 : cx - 9, cy + 3);
    });

    // Ankara pulse rings
    pulseT += 0.011;
    const ax = sx(ANKARA.x), ay = sy(ANKARA.y);
    [0, 0.35, 0.7].forEach(off => {
      const t = (pulseT + off) % 1;
      ctx.beginPath(); ctx.arc(ax, ay, t * sx(28), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,201,106,${(1 - t) * 0.42})`;
      ctx.lineWidth = 1.5; ctx.stroke();
    });

    // Ankara glow
    const ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, sx(20));
    ag.addColorStop(0, 'rgba(232,201,106,0.52)');
    ag.addColorStop(1, 'rgba(200,168,75,0)');
    ctx.beginPath(); ctx.arc(ax, ay, sx(20), 0, Math.PI * 2);
    ctx.fillStyle = ag; ctx.fill();

    // Ankara dot
    ctx.beginPath(); ctx.arc(ax, ay, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(232,201,106,0.95)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c96a'; ctx.fill();
    ctx.beginPath(); ctx.arc(ax, ay, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();

    // Ankara label
    ctx.textAlign = 'center';
    ctx.font = 'bold 9px "Barlow Condensed", sans-serif';
    ctx.fillStyle = '#e8c96a';
    ctx.fillText('ANKARA', ax, ay - 16);
    ctx.font = '500 7px "Barlow Condensed", sans-serif';
    ctx.fillStyle = 'rgba(200,168,75,0.6)';
    ctx.fillText('EXPORT ORIGIN', ax, ay - 8);

    requestAnimationFrame(draw);
  }

  draw();
})();
