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

const LAND_PATHS = [
  "M33.3,50.0 L108.3,55.6 L138.9,88.9 L150.0,111.1 L155.6,113.9 L158.3,144.4 L175.0,161.1 L183.3,172.2 L194.4,186.1 L208.3,194.4 L241.7,205.6 L266.7,225.0 L277.8,227.8 L288.9,225.0 L269.4,222.2 L277.8,180.6 L277.8,163.9 L283.3,155.6 L294.4,150.0 L305.6,133.3 L316.7,127.8 L333.3,122.2 L350.0,119.4 L344.4,108.3 L333.3,119.4 L322.2,127.8 L316.7,127.8 L305.6,130.6 L291.7,127.8 L283.3,127.8 L269.4,122.2 L258.3,133.3 L255.6,133.3 L244.4,122.2 L230.6,113.9 L194.4,113.9 L175.0,113.9 L155.6,113.9 L138.9,94.4 L111.1,83.3 L75.0,91.7 L47.2,97.2 L33.3,100.0 L33.3,77.8 L38.9,61.1 L50.0,55.6 L66.7,50.0 L33.3,50.0 Z",
  "M33.3,100.0 L47.2,97.2 L75.0,91.7 L108.3,83.3 L138.9,94.4 L88.9,83.3 L50.0,100.0 L33.3,100.0 Z",
  "M297.2,38.9 L333.3,38.9 L377.8,83.3 L383.3,69.4 L377.8,50.0 L355.6,41.7 L325.0,36.1 L297.2,38.9 Z",
  "M230.6,188.9 L250.0,205.6 L266.7,225.0 L277.8,225.0 L277.8,180.6 L266.7,188.9 L250.0,188.9 L230.6,188.9 Z",
  "M263.9,188.9 L272.2,186.1 L283.3,188.9 L291.7,194.4 L283.3,194.4 L272.2,188.9 L263.9,188.9 Z",
  "M277.8,225.0 L283.3,241.7 L294.4,255.6 L311.1,258.3 L333.3,263.9 L355.6,252.8 L377.8,250.0 L402.8,263.9 L405.6,269.4 L394.4,288.9 L388.9,302.8 L388.9,311.1 L377.8,313.9 L366.7,322.2 L361.1,330.6 L352.8,341.7 L338.9,355.6 L327.8,363.9 L319.4,377.8 L316.7,394.4 L311.1,400.0 L319.4,402.8 L325.0,391.7 L341.7,363.9 L341.7,316.7 L333.3,294.4 L333.3,263.9 L352.8,247.2 L361.1,238.9 L341.7,233.3 L325.0,222.2 L311.1,216.7 L294.4,222.2 L283.3,225.0 L277.8,225.0 Z",
  "M475.0,150.0 L477.8,144.4 L477.8,127.8 L488.9,127.8 L500.0,127.8 L513.9,130.6 L525.0,127.8 L536.1,122.2 L550.0,125.0 L561.1,125.0 L572.2,127.8 L577.8,122.2 L583.3,122.2 L577.8,94.4 L572.2,88.9 L561.1,83.3 L550.0,83.3 L538.9,94.4 L527.8,88.9 L513.9,88.9 L511.1,105.6 L500.0,108.3 L486.1,116.7 L483.3,138.9 L475.0,141.7 L475.0,150.0 Z",
  "M486.1,111.1 L497.2,108.3 L500.0,108.3 L502.8,105.6 L494.4,97.2 L488.9,88.9 L483.3,88.9 L486.1,100.0 L491.7,108.3 L486.1,111.1 Z",
  "M472.2,105.6 L483.3,105.6 L483.3,100.0 L477.8,97.2 L472.2,105.6 Z",
  "M513.9,88.9 L527.8,88.9 L533.3,94.4 L538.9,94.4 L544.4,88.9 L550.0,83.3 L561.1,77.8 L572.2,66.7 L577.8,55.6 L572.2,50.0 L561.1,55.6 L544.4,61.1 L533.3,77.8 L527.8,88.9 L513.9,88.9 Z",
  "M555.6,83.3 L572.2,72.2 L583.3,61.1 L577.8,55.6 L561.1,55.6 L544.4,61.1 L555.6,66.7 L555.6,83.3 Z",
  "M433.3,72.2 L461.1,72.2 L463.9,69.4 L455.6,66.7 L433.3,72.2 Z",
  "M483.3,150.0 L505.6,150.0 L522.2,147.2 L541.7,147.2 L541.7,155.6 L555.6,161.1 L577.8,161.1 L594.4,172.2 L600.0,188.9 L605.6,200.0 L611.1,211.1 L622.2,219.4 L622.2,227.8 L616.7,238.9 L611.1,250.0 L605.6,261.1 L594.4,277.8 L577.8,300.0 L577.8,333.3 L550.0,344.4 L538.9,333.3 L522.2,311.1 L511.1,277.8 L500.0,244.4 L488.9,238.9 L477.8,227.8 L450.0,211.1 L450.0,188.9 L461.1,172.2 L472.2,161.1 L483.3,150.0 Z",
  "M622.2,283.3 L633.3,288.9 L638.9,305.6 L627.8,316.7 L622.2,300.0 L622.2,283.3 Z",
  "M572.2,133.3 L583.3,144.4 L600.0,150.0 L611.1,144.4 L622.2,144.4 L616.7,138.9 L605.6,136.1 L594.4,133.3 L583.3,133.3 L572.2,133.3 Z",
  "M600.0,150.0 L622.2,144.4 L633.3,144.4 L650.0,144.4 L666.7,150.0 L666.7,166.7 L661.1,183.3 L638.9,211.1 L622.2,216.7 L611.1,211.1 L600.0,188.9 L594.4,172.2 L600.0,161.1 L600.0,150.0 Z",
  "M622.2,144.4 L650.0,144.4 L666.7,150.0 L677.8,161.1 L683.3,172.2 L666.7,188.9 L661.1,183.3 L655.6,172.2 L638.9,166.7 L622.2,144.4 Z",
  "M577.8,61.1 L633.3,61.1 L666.7,55.6 L722.2,50.0 L777.8,38.9 L833.3,44.4 L888.9,50.0 L944.4,55.6 L966.7,61.1 L972.2,72.2 L922.2,111.1 L888.9,116.7 L872.2,127.8 L861.1,127.8 L833.3,105.6 L794.4,111.1 L766.7,105.6 L733.3,100.0 L688.9,72.2 L633.3,66.7 L577.8,61.1 Z",
  "M666.7,55.6 L722.2,50.0 L777.8,38.9 L833.3,44.4 L888.9,50.0 L966.7,61.1 L972.2,50.0 L833.3,38.9 L722.2,44.4 L666.7,55.6 Z",
  "M638.9,122.2 L666.7,105.6 L722.2,111.1 L722.2,127.8 L700.0,138.9 L677.8,155.6 L661.1,144.4 L638.9,122.2 Z",
  "M683.3,183.3 L700.0,188.9 L705.6,194.4 L716.7,227.8 L722.2,222.2 L722.2,200.0 L711.1,183.3 L688.9,183.3 L683.3,183.3 Z",
  "M711.1,150.0 L722.2,144.4 L722.2,111.1 L750.0,105.6 L794.4,111.1 L833.3,105.6 L855.6,116.7 L855.6,127.8 L838.9,150.0 L833.3,183.3 L816.7,194.4 L794.4,211.1 L777.8,200.0 L755.6,177.8 L733.3,166.7 L711.1,150.0 Z",
  "M722.2,111.1 L766.7,105.6 L794.4,111.1 L827.8,116.7 L811.1,127.8 L777.8,133.3 L733.3,111.1 L722.2,111.1 Z",
  "M861.1,161.1 L872.2,150.0 L883.3,144.4 L894.4,127.8 L900.0,127.8 L894.4,133.3 L877.8,155.6 L861.1,161.1 Z",
  "M888.9,133.3 L900.0,127.8 L905.6,127.8 L900.0,133.3 L888.9,133.3 Z",
  "M850.0,155.6 L855.6,150.0 L861.1,144.4 L861.1,155.6 L855.6,161.1 L850.0,155.6 Z",
  "M777.8,200.0 L800.0,211.1 L794.4,222.2 L788.9,238.9 L800.0,233.3 L822.2,233.3 L816.7,216.7 L800.0,200.0 L788.9,188.9 L777.8,200.0 Z",
  "M777.8,233.3 L788.9,238.9 L788.9,244.4 L783.3,244.4 L777.8,238.9 L777.8,233.3 Z",
  "M766.7,238.9 L777.8,238.9 L794.4,250.0 L794.4,261.1 L777.8,261.1 L766.7,255.6 L766.7,238.9 Z",
  "M800.0,244.4 L822.2,238.9 L827.8,238.9 L822.2,250.0 L811.1,261.1 L800.0,255.6 L800.0,244.4 Z",
  "M794.4,266.7 L811.1,272.2 L816.7,272.2 L805.6,266.7 L794.4,266.7 Z",
  "M827.8,227.8 L833.3,222.2 L838.9,205.6 L827.8,205.6 L822.2,222.2 L827.8,227.8 Z",
  "M816.7,311.1 L822.2,344.4 L838.9,344.4 L861.1,338.9 L866.7,316.7 L877.8,283.3 L861.1,300.0 L883.3,322.2 L894.4,316.7 L911.1,305.6 L922.2,316.7 L922.2,355.6 L888.9,350.0 L866.7,344.4 L838.9,344.4 L816.7,344.4 L816.7,311.1 Z",
  "M900.0,361.1 L911.1,366.7 L911.1,372.2 L900.0,372.2 L900.0,361.1 Z",
  "M983.3,350.0 L994.4,355.6 L994.4,361.1 L977.8,361.1 L983.3,350.0 Z",
  "M966.7,372.2 L977.8,372.2 L972.2,383.3 L966.7,377.8 L966.7,372.2 Z",
  "M866.7,255.6 L888.9,266.7 L911.1,261.1 L883.3,261.1 L866.7,255.6 Z",
];

/* ═══════════════════════════════════
   WORLD MAP — Equirectangular Canvas
═══════════════════════════════════ */
(function() {
  const container = document.querySelector('.world-map-container');
  const canvas = document.getElementById('worldMapCanvas');
  const loading = document.getElementById('mapLoading');
  if (!canvas || !container) return;

  const dpr = window.devicePixelRatio || 1;
  const W = container.clientWidth || 1000;
  const H = 460;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Scale from design space 1000x500 to actual W x H
  const SX = W / 1000, SY = H / 500;

  // Pre-parse all continent paths
  const landPaths = LAND_PATHS.map(d => {
    const scaled = d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g,
      (_, x, y) => `${(parseFloat(x)*SX).toFixed(1)},${(parseFloat(y)*SY).toFixed(1)}`);
    return new Path2D(scaled);
  });

  // City positions (design-space 1000x500, equirectangular)
  const ANKARA   = {x:591.2*SX, y:139.1*SY};
  const cities = [
    {x:524.1*SX, y:110.8*SY, label:'FRANKFURT'},
    {x:629.8*SX, y:181.4*SY, label:'RIYADH'},
    {x:702.4*SX, y:197.0*SY, label:'MUMBAI'},
    {x:837.4*SX, y:163.2*SY, label:'SHANGHAI'},
    {x:509.4*SX, y:232.1*SY, label:'LAGOS'},
    {x:294.4*SX, y:136.9*SY, label:'NEW YORK'},
    {x:370.5*SX, y:315.4*SY, label:'SÃO PAULO'},
    {x:920.0*SX, y:344.1*SY, label:'SYDNEY'},
  ];

  // Arc control points for curved routes
  const ctrls = [
    {x:558*SX, y:100*SY},  // Frankfurt
    {x:620*SX, y:165*SY},  // Riyadh
    {x:660*SX, y:185*SY},  // Mumbai
    {x:740*SX, y:120*SY},  // Shanghai
    {x:530*SX, y:205*SY},  // Lagos
    {x:430*SX, y:95*SY},   // New York
    {x:460*SX, y:260*SY},  // São Paulo
    {x:780*SX, y:290*SY},  // Sydney
  ];

  // Particles
  const particles = cities.map((c, i) => ({
    i, t: i / cities.length, speed: 0.0014 + (i % 3) * 0.0005, size: 2.8
  }));

  let pulseT = 0;
  if (loading) loading.style.display = 'none';

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Ocean background
    const bg = ctx.createRadialGradient(W*.44, H*.38, 0, W*.5, H*.5, W*.72);
    bg.addColorStop(0, '#0d0d20');
    bg.addColorStop(0.5, '#090914');
    bg.addColorStop(1, '#05050d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(38,38,75,0.45)';
    ctx.lineWidth = 0.35;
    for (let x = 0; x <= W; x += W/12) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y <= H; y += H/6)  { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    // Equator
    ctx.strokeStyle = 'rgba(60,60,110,0.65)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(0, H*0.5); ctx.lineTo(W, H*0.5); ctx.stroke();
    // Tropic of Cancer / Capricorn
    ctx.strokeStyle = 'rgba(40,40,80,0.35)'; ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(0, H*0.297); ctx.lineTo(W, H*0.297); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H*0.703); ctx.lineTo(W, H*0.703); ctx.stroke();

    // Land fill
    const landGrad = ctx.createLinearGradient(0, 0, W, H);
    landGrad.addColorStop(0,   'rgba(200,168,75,0.32)');
    landGrad.addColorStop(0.4, 'rgba(180,148,58,0.26)');
    landGrad.addColorStop(1,   'rgba(130,104,30,0.20)');
    ctx.fillStyle = landGrad;
    landPaths.forEach(p => ctx.fill(p));

    // Land stroke
    ctx.strokeStyle = 'rgba(232,201,106,0.58)';
    ctx.lineWidth = 0.6;
    landPaths.forEach(p => ctx.stroke(p));

    // Routes
    ctx.setLineDash([4, 7]);
    ctx.lineWidth = 0.9;
    cities.forEach((c, i) => {
      ctx.beginPath();
      ctx.moveTo(ANKARA.x, ANKARA.y);
      ctx.quadraticCurveTo(ctrls[i].x, ctrls[i].y, c.x, c.y);
      ctx.strokeStyle = 'rgba(200,168,75,0.25)';
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Particles
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const t = p.t, mt = 1 - t;
      const c = cities[p.i], ctrl = ctrls[p.i];
      const px = mt*mt*ANKARA.x + 2*mt*t*ctrl.x + t*t*c.x;
      const py = mt*mt*ANKARA.y + 2*mt*t*ctrl.y + t*t*c.y;
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
      ctx.beginPath(); ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,168,75,0.45)'; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c8a84b'; ctx.fill();
      ctx.font = '700 7px "Barlow Condensed", sans-serif';
      ctx.fillStyle = 'rgba(210,178,90,0.92)';
      const right = c.x > W * 0.5;
      ctx.textAlign = right ? 'left' : 'right';
      ctx.fillText(c.label, right ? c.x + 9 : c.x - 9, c.y + 3);
    });

    // Ankara pulse
    pulseT += 0.011;
    [0, 0.35, 0.7].forEach(off => {
      const t = (pulseT + off) % 1;
      ctx.beginPath(); ctx.arc(ANKARA.x, ANKARA.y, t * 28, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,201,106,${(1 - t) * 0.4})`;
      ctx.lineWidth = 1.5; ctx.stroke();
    });
    const ag = ctx.createRadialGradient(ANKARA.x, ANKARA.y, 0, ANKARA.x, ANKARA.y, 20);
    ag.addColorStop(0, 'rgba(232,201,106,0.52)');
    ag.addColorStop(1, 'rgba(200,168,75,0)');
    ctx.beginPath(); ctx.arc(ANKARA.x, ANKARA.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = ag; ctx.fill();
    ctx.beginPath(); ctx.arc(ANKARA.x, ANKARA.y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(232,201,106,0.95)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(ANKARA.x, ANKARA.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c96a'; ctx.fill();
    ctx.beginPath(); ctx.arc(ANKARA.x, ANKARA.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = 'bold 9px "Barlow Condensed", sans-serif';
    ctx.fillStyle = '#e8c96a';
    ctx.fillText('ANKARA', ANKARA.x, ANKARA.y - 16);
    ctx.font = '500 7px "Barlow Condensed", sans-serif';
    ctx.fillStyle = 'rgba(200,168,75,0.6)';
    ctx.fillText('EXPORT ORIGIN', ANKARA.x, ANKARA.y - 8);

    // Corner labels
    ctx.textAlign = 'left';
    ctx.font = '600 8px "Barlow Condensed", sans-serif';
    ctx.fillStyle = 'rgba(200,168,75,0.22)';
    ctx.fillText('EMASGEZ GLOBAL EXPORT NETWORK', 14, 18);
    ctx.textAlign = 'right';
    ctx.fillText('WORLDWIDE DELIVERY', W - 14, 18);

    requestAnimationFrame(draw);
  }

  draw();
})();
