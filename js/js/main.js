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
reveals.forEach(r => obs.observe(r))
/* ═══════════════════════════════════
   WORLD MAP — D3 + Natural Earth
═══════════════════════════════════ */
(function initMap() {
  const container = document.querySelector('.world-map-container');
  const canvas = document.getElementById('worldMapCanvas');
  const loading = document.getElementById('mapLoading');
  if (!canvas || !container) return;

  const W = container.clientWidth || 1000;
  const H = container.clientHeight || 460;
  canvas.width = W * (window.devicePixelRatio || 1);
  canvas.height = H * (window.devicePixelRatio || 1);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  const projection = d3.geoNaturalEarth1()
    .scale(W / 6.1)
    .translate([W / 2, H / 2]);

  const pathGen = d3.geoPath(projection, ctx);

  const ANKARA = [32.85, 39.93];
  const cities = [
    { coords: [8.68, 50.11],   label: 'FRANKFURT' },
    { coords: [46.72, 24.69],  label: 'RIYADH'    },
    { coords: [72.88, 19.07],  label: 'MUMBAI'    },
    { coords: [121.47, 31.23], label: 'SHANGHAI'  },
    { coords: [3.39, 6.45],    label: 'LAGOS'     },
    { coords: [-74.01, 40.71], label: 'NEW YORK'  },
    { coords: [-46.63,-23.55], label: 'SÃO PAULO' },
    { coords: [151.21,-33.87], label: 'SYDNEY'    },
  ];

  // Arc midpoints for curved routes
  const arcMids = [
    [20, 54],   // Frankfurt
    [42, 28],   // Riyadh
    [60, 28],   // Mumbai
    [95, 52],   // Shanghai
    [18, 8],    // Lagos
    [-30, 52],  // New York
    [-20, 8],   // São Paulo
    [110, 5],   // Sydney
  ];

  // Particles
  const particles = cities.map((c, i) => ({
    i, t: Math.random(), speed: 0.0016 + Math.random() * 0.001, size: 2.5
  }));

  let pulseT = 0;
  let worldData = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function bezierPt(t, p0, cp, p1) {
    const mt = 1 - t;
    return [
      mt*mt*p0[0] + 2*mt*t*cp[0] + t*t*p1[0],
      mt*mt*p0[1] + 2*mt*t*cp[1] + t*t*p1[1],
    ];
  }

  function drawBackground() {
    const bg = ctx.createRadialGradient(W*.45, H*.4, 0, W*.5, H*.5, W*.75);
    bg.addColorStop(0, '#0e0e22');
    bg.addColorStop(0.6, '#080812');
    bg.addColorStop(1, '#05050d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // Subtle dot texture
    ctx.fillStyle = 'rgba(255,255,255,0.018)';
    for (let x = 10; x < W; x += 18) for (let y = 10; y < H; y += 18) {
      ctx.beginPath(); ctx.arc(x, y, 0.5, 0, Math.PI*2); ctx.fill();
    }
  }

  function drawGraticule() {
    const graticule = d3.geoGraticule()();
    ctx.beginPath();
    pathGen(graticule);
    ctx.strokeStyle = 'rgba(44,44,80,0.5)';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    // Equator brighter
    const equator = d3.geoCircle().center([0,90]).radius(90)();
    ctx.beginPath();
    pathGen(d3.geoGraticule().stepMajor([360,0])());
    ctx.strokeStyle = 'rgba(60,60,110,0.7)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function drawSphere() {
    ctx.beginPath();
    pathGen({type:'Sphere'});
    ctx.strokeStyle = 'rgba(60,60,100,0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawLand(land) {
    ctx.beginPath();
    pathGen(land);
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, 'rgba(200,168,75,0.30)');
    grd.addColorStop(0.5, 'rgba(175,142,55,0.24)');
    grd.addColorStop(1, 'rgba(130,100,32,0.18)');
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,201,106,0.55)';
    ctx.lineWidth = 0.55;
    ctx.stroke();
  }

  function drawBorders(borders) {
    ctx.beginPath();
    pathGen(borders);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.4;
    ctx.stroke();
  }

  function drawRoutes() {
    const ap = projection(ANKARA);
    cities.forEach((c, i) => {
      const cp = projection(c.coords);
      const mp = projection(arcMids[i]);
      if (!ap || !cp || !mp) return;
      ctx.beginPath();
      ctx.moveTo(ap[0], ap[1]);
      ctx.quadraticCurveTo(mp[0], mp[1], cp[0], cp[1]);
      ctx.strokeStyle = 'rgba(200,168,75,0.22)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawParticles() {
    const ap = projection(ANKARA);
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const cp = projection(cities[p.i].coords);
      const mp = projection(arcMids[p.i]);
      if (!ap || !cp || !mp) return;
      const t = p.t;
      const mt = 1 - t;
      const px = mt*mt*ap[0] + 2*mt*t*mp[0] + t*t*cp[0];
      const py = mt*mt*ap[1] + 2*mt*t*mp[1] + t*t*cp[1];
      const alpha = Math.sin(t * Math.PI);
      const grd = ctx.createRadialGradient(px,py,0, px,py, p.size*5);
      grd.addColorStop(0, `rgba(232,201,106,${0.6*alpha})`);
      grd.addColorStop(1, 'rgba(200,168,75,0)');
      ctx.beginPath(); ctx.arc(px, py, p.size*5, 0, Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,245,190,${alpha})`; ctx.fill();
    });
  }

  function drawCities() {
    const ap = projection(ANKARA);
    cities.forEach((c, i) => {
      const p = projection(c.coords);
      if (!p) return;
      ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(200,168,75,0.4)'; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, Math.PI*2);
      ctx.fillStyle = '#c8a84b'; ctx.fill();
      ctx.font = '700 7px "Barlow Condensed",sans-serif';
      ctx.fillStyle = 'rgba(210,178,90,0.88)';
      const right = p[0] > ap[0];
      ctx.textAlign = right ? 'left' : 'right';
      ctx.fillText(c.label, right ? p[0]+9 : p[0]-9, p[1]+3);
    });
  }

  function drawAnkara() {
    const ap = projection(ANKARA);
    if (!ap) return;
    pulseT += 0.011;
    [0, 0.35, 0.7].forEach(off => {
      const t = (pulseT + off) % 1;
      ctx.beginPath(); ctx.arc(ap[0], ap[1], t*28, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(232,201,106,${(1-t)*0.35})`; ctx.lineWidth = 1.5; ctx.stroke();
    });
    const grd = ctx.createRadialGradient(ap[0],ap[1],0, ap[0],ap[1],20);
    grd.addColorStop(0,'rgba(232,201,106,0.5)'); grd.addColorStop(1,'rgba(200,168,75,0)');
    ctx.beginPath(); ctx.arc(ap[0],ap[1],20,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
    ctx.beginPath(); ctx.arc(ap[0],ap[1],6,0,Math.PI*2);
    ctx.strokeStyle='rgba(232,201,106,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(ap[0],ap[1],3.5,0,Math.PI*2); ctx.fillStyle='#e8c96a'; ctx.fill();
    ctx.beginPath(); ctx.arc(ap[0],ap[1],1.8,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
    ctx.textAlign='center';
    ctx.font='bold 9px "Barlow Condensed",sans-serif'; ctx.fillStyle='#e8c96a';
    ctx.fillText('ANKARA', ap[0], ap[1]-16);
    ctx.font='500 7px "Barlow Condensed",sans-serif'; ctx.fillStyle='rgba(200,168,75,0.55)';
    ctx.fillText('EXPORT ORIGIN', ap[0], ap[1]-8);
  }

  function drawCornerText() {
    ctx.textAlign='left'; ctx.font='600 8px "Barlow Condensed",sans-serif';
    ctx.fillStyle='rgba(200,168,75,0.22)';
    ctx.fillText('EMASGEZ GLOBAL EXPORT NETWORK', 14, 18);
    ctx.textAlign='right';
    ctx.fillText('WORLDWIDE DELIVERY', W-14, 18);
  }

  function frame() {
    ctx.clearRect(0,0,W,H);
    drawBackground();
    if (worldData) {
      drawSphere();
      drawGraticule();
      drawLand(worldData.land);
      drawBorders(worldData.borders);
      drawRoutes();
      drawParticles();
      drawCities();
      drawAnkara();
      drawCornerText();
    }
    requestAnimationFrame(frame);
  }

  frame();

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      worldData = {
        land: topojson.feature(world, world.objects.land),
        borders: topojson.mesh(world, world.objects.countries, (a,b) => a!==b)
      };
      if (loading) loading.style.display = 'none';
    });
})();
