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
   WORLD MAP CANVAS — Realistic Geographic Projection
═══════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('worldMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 1000, H = 490;
  canvas.width = W;
  canvas.height = H;

  // Equirectangular projection
  function proj(lon, lat) {
    return {
      x: (lon + 180) * (W / 360),
      y: (90 - lat) * (H / 180)
    };
  }

  // ── Geographic continent data (lon, lat pairs) ──
  const shapes = [

    // ── NORTH AMERICA ──
    [[-168,71],[-141,60],[-130,54],[-126,50],[-124,49],[-124,47],[-124,37],[-117,32],[-110,23],[-105,20],[-90,16],[-83,10],[-80,9],[-76,9],[-83,10],[-80,25],[-81,31],[-80,32],[-78,35],[-75,35],[-74,40],[-71,42],[-66,45],[-60,44],[-53,47],[-56,50],[-60,47],[-64,44],[-66,44],[-70,43],[-76,44],[-78,44],[-83,46],[-87,42],[-88,42],[-90,46],[-96,49],[-110,49],[-117,49],[-123,49],[-130,56],[-140,60],[-141,60],[-153,58],[-163,54],[-168,54],[-168,62],[-165,64],[-166,68],[-163,70],[-157,71],[-168,71]],

    // ── ALASKA ──
    [[-168,54],[-163,54],[-153,58],[-141,60],[-130,56],[-130,54],[-135,57],[-148,60],[-153,57],[-162,54],[-168,54]],

    // ── GREENLAND ──
    [[-73,76],[-60,76],[-44,60],[-42,65],[-44,72],[-52,75],[-63,77],[-73,76]],

    // ── CUBA ──
    [[-85,22],[-82,23],[-78,22],[-74,20],[-75,20],[-78,20],[-82,22],[-85,22]],

    // ── SOUTH AMERICA ──
    [[-80,9],[-76,9],[-66,1],[-60,-3],[-50,-1],[-44,0],[-35,-5],[-34,-7],[-36,-10],[-38,-14],[-39,-18],[-40,-22],[-44,-23],[-48,-26],[-50,-29],[-53,-33],[-58,-38],[-62,-42],[-65,-46],[-66,-52],[-68,-54],[-65,-55],[-63,-52],[-58,-48],[-57,-42],[-58,-35],[-57,-30],[-57,-24],[-60,-16],[-62,-10],[-60,-5],[-58,-2],[-53,1],[-50,4],[-52,5],[-57,6],[-60,7],[-63,10],[-68,12],[-72,12],[-74,10],[-78,9],[-80,9]],

    // ── EUROPE MAINLAND ──
    [[-9,36],[-8,38],[-8,40],[-8,44],[-4,44],[-2,44],[0,44],[3,43],[5,43],[7,44],[9,44],[12,44],[13,46],[16,46],[18,45],[20,45],[22,45],[24,45],[26,44],[28,46],[30,46],[28,56],[26,58],[22,60],[20,60],[18,60],[16,58],[14,56],[12,56],[10,58],[8,58],[5,58],[4,52],[3,51],[2,51],[0,51],[-2,51],[-5,48],[-5,44],[-6,40],[-9,39],[-9,36]],

    // ── GREAT BRITAIN ──
    [[-5,50],[-3,50],[-1,51],[0,51],[1,52],[0,53],[-1,54],[-2,55],[-3,57],[-4,58],[-6,58],[-5,54],[-4,53],[-3,51],[-5,50]],
    [[-6,55],[-5,54],[-6,54],[-8,54],[-7,53],[-6,53],[-6,55]],

    // ── SCANDINAVIA ──
    [[5,58],[7,58],[8,58],[10,58],[12,56],[14,56],[16,58],[18,60],[20,60],[22,60],[26,64],[28,66],[30,68],[28,70],[26,72],[22,70],[18,68],[16,68],[14,65],[12,62],[10,58],[5,58]],
    [[20,60],[22,62],[24,64],[26,66],[28,68],[28,70],[22,70],[18,70],[16,68],[18,68],[20,66],[20,60]],

    // ── ICELAND ──
    [[-24,64],[-22,64],[-18,64],[-14,64],[-13,65],[-16,66],[-20,66],[-24,65],[-24,64]],

    // ── AFRICA ──
    [[-6,36],[-2,36],[2,36],[8,37],[12,37],[15,37],[15,34],[12,32],[20,32],[28,32],[32,30],[36,22],[43,12],[44,11],[42,12],[40,10],[38,12],[36,14],[34,16],[38,18],[40,20],[44,12],[44,11],[50,12],[52,12],[50,10],[44,8],[42,4],[40,0],[34,-8],[32,-10],[28,-12],[26,-16],[30,-18],[34,-26],[28,-30],[18,-34],[16,-34],[14,-30],[8,-24],[6,-18],[4,-5],[0,2],[-4,4],[-8,8],[-16,12],[-18,14],[-18,18],[-18,22],[-14,24],[-14,28],[-10,32],[-6,36]],

    // ── MADAGASCAR ──
    [[44,-12],[48,-14],[50,-16],[50,-20],[46,-24],[44,-22],[44,-18],[44,-12]],

    // ── TURKEY ──
    [[26,42],[28,40],[30,38],[36,36],[38,37],[40,38],[42,38],[44,38],[42,40],[40,41],[36,42],[34,42],[30,42],[26,42]],

    // ── MIDDLE EAST / ARABIAN PENINSULA ──
    [[36,36],[38,37],[40,38],[44,38],[50,24],[56,24],[58,22],[60,22],[58,24],[56,28],[52,30],[50,30],[44,30],[40,32],[38,36],[36,36]],

    // ── IRAN + IRAQ ──
    [[44,38],[48,38],[54,38],[58,38],[60,36],[60,30],[58,24],[52,30],[50,30],[44,30],[40,32],[38,36],[42,38],[44,38]],

    // ── RUSSIA — main ──
    [[28,70],[30,68],[30,60],[28,56],[26,58],[22,60],[20,60],[18,68],[16,68],[28,70]],
    [[30,68],[36,68],[50,70],[60,72],[70,72],[80,74],[100,76],[120,74],[130,72],[140,72],[160,70],[168,68],[170,64],[168,60],[160,58],[158,56],[152,52],[148,46],[140,48],[134,46],[130,42],[130,44],[136,50],[140,48],[148,52],[156,58],[162,60],[168,62],[166,64],[160,62],[154,60],[152,56],[152,50],[148,46],[140,46],[136,46],[132,48],[128,52],[120,54],[114,54],[112,52],[106,52],[100,52],[96,54],[90,54],[84,54],[80,58],[76,60],[68,64],[62,68],[58,68],[50,68],[44,68],[36,70],[32,70],[30,68]],

    // ── KAZAKHSTAN + CENTRAL ASIA ──
    [[50,50],[60,54],[70,54],[80,52],[80,46],[72,42],[68,38],[64,36],[60,38],[56,42],[50,46],[50,50]],

    // ── INDIA ──
    [[68,22],[72,22],[74,20],[78,8],[80,10],[82,12],[80,14],[78,14],[77,20],[74,22],[72,24],[68,22]],

    // ── SRI LANKA ──
    [[80,10],[82,10],[82,8],[80,8],[80,10]],

    // ── CHINA + EAST ASIA ──
    [[80,52],[90,52],[100,50],[110,46],[120,50],[124,52],[126,52],[128,50],[128,44],[126,42],[122,38],[120,32],[120,24],[114,22],[110,18],[108,18],[106,16],[102,18],[100,20],[96,24],[92,26],[88,28],[86,30],[80,34],[76,36],[76,38],[80,40],[80,46],[80,52]],

    // ── JAPAN ──
    [[130,32],[132,34],[134,36],[138,38],[140,40],[142,44],[144,44],[142,42],[140,40],[136,34],[132,32],[130,32]],
    [[140,42],[142,44],[146,46],[146,44],[144,42],[140,42]],

    // ── KOREA ──
    [[126,34],[128,36],[130,38],[130,34],[128,32],[126,34]],

    // ── SOUTHEAST ASIA ──
    [[100,20],[104,18],[106,16],[108,14],[106,10],[104,2],[102,1],[100,2],[100,6],[102,10],[100,12],[100,16],[100,20]],

    // ── INDONESIA (SUMATRA) ──
    [[96,6],[100,4],[104,2],[106,0],[106,-4],[104,-6],[100,-4],[96,-4],[96,0],[96,6]],

    // ── BORNEO ──
    [[108,2],[110,2],[116,4],[118,6],[118,2],[116,0],[112,-2],[108,0],[108,2]],

    // ── JAVA ──
    [[106,-6],[108,-6],[112,-8],[114,-8],[116,-8],[112,-8],[106,-6]],

    // ── PHILIPPINES ──
    [[118,8],[120,10],[122,12],[122,16],[120,18],[118,16],[116,10],[118,8]],

    // ── AUSTRALIA ──
    [[114,-22],[114,-26],[116,-34],[124,-34],[128,-34],[130,-32],[132,-32],[134,-24],[136,-12],[132,-12],[130,-16],[130,-18],[134,-22],[138,-26],[140,-26],[142,-24],[144,-22],[148,-20],[152,-24],[152,-26],[150,-28],[148,-32],[152,-38],[148,-38],[146,-38],[144,-38],[140,-36],[136,-36],[132,-34],[128,-34],[124,-32],[122,-34],[114,-34],[114,-26],[114,-22]],

    // ── NEW ZEALAND ──
    [[170,-36],[172,-38],[174,-40],[172,-42],[170,-40],[170,-36]],
    [[172,-40],[174,-40],[176,-44],[174,-46],[172,-44],[172,-40]],

    // ── PAPUA NEW GUINEA ──
    [[132,-2],[136,-4],[140,-6],[146,-6],[148,-6],[146,-4],[140,-4],[136,-2],[132,-2]],

  ];

  // ── Shipping routes: [lon,lat] pairs as quadratic bezier ──
  const ankara = { lon: 32.8, lat: 39.9 };
  const destinations = [
    { lon: 8.7, lat: 50.1, label: 'FRANKFURT' },
    { lon: 46.7, lat: 24.7, label: 'RIYADH' },
    { lon: 72.9, lat: 18.9, label: 'MUMBAI' },
    { lon: 121.5, lat: 31.2, label: 'SHANGHAI' },
    { lon: 3.4, lat: 6.5, label: 'LAGOS' },
    { lon: -74, lat: 40.7, label: 'NEW YORK' },
    { lon: -46.6, lat: -23.5, label: 'SÃO PAULO' },
    { lon: 151.2, lat: -33.8, label: 'SYDNEY' },
  ];

  // Control points for curved arcs (lon, lat midpoints)
  const ctrls = [
    { lon: 20, lat: 55 },   // Frankfurt
    { lon: 42, lat: 28 },   // Riyadh
    { lon: 55, lat: 28 },   // Mumbai
    { lon: 90, lat: 55 },   // Shanghai
    { lon: 20, lat: 10 },   // Lagos
    { lon: -10, lat: 55 },  // New York (over Atlantic)
    { lon: -10, lat: 10 },  // São Paulo
    { lon: 100, lat: 10 },  // Sydney
  ];

  const ankaraP = proj(ankara.lon, ankara.lat);
  const destPts = destinations.map(d => proj(d.lon, d.lat));
  const ctrlPts = ctrls.map(c => proj(c.lon, c.lat));

  // ── Animated particles ──
  const particles = destinations.map((d, i) => ({
    i,
    t: Math.random(),
    speed: 0.0018 + Math.random() * 0.001,
    size: 2.8 + Math.random(),
  }));

  let pulseT = 0;

  function drawOcean() {
    const bg = ctx.createRadialGradient(W * 0.45, H * 0.38, 0, W * 0.5, H * 0.5, W * 0.72);
    bg.addColorStop(0, '#0e0e20');
    bg.addColorStop(0.5, '#090914');
    bg.addColorStop(1, '#06060e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawDotGrid() {
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (let x = 10; x < W; x += 20) {
      for (let y = 10; y < H; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawGraticule() {
    ctx.strokeStyle = 'rgba(50,50,90,0.4)';
    ctx.lineWidth = 0.4;
    // longitude lines every 30°
    for (let lon = -180; lon <= 180; lon += 30) {
      const p = proj(lon, 90);
      const p2 = proj(lon, -90);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    // latitude lines every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const p = proj(-180, lat);
      const p2 = proj(180, lat);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    // Equator brighter
    ctx.strokeStyle = 'rgba(70,70,120,0.6)';
    ctx.lineWidth = 0.7;
    const eq = proj(-180, 0);
    const eq2 = proj(180, 0);
    ctx.beginPath();
    ctx.moveTo(eq.x, eq.y);
    ctx.lineTo(eq2.x, eq2.y);
    ctx.stroke();
  }

  function drawContinents() {
    shapes.forEach(pts => {
      if (pts.length < 3) return;
      ctx.beginPath();
      const p0 = proj(pts[0][0], pts[0][1]);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < pts.length; i++) {
        const p = proj(pts[i][0], pts[i][1]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();

      // Land fill with subtle gradient
      const bb = pts.reduce((a, p) => {
        const pp = proj(p[0], p[1]);
        return { minX: Math.min(a.minX, pp.x), maxX: Math.max(a.maxX, pp.x), minY: Math.min(a.minY, pp.y), maxY: Math.max(a.maxY, pp.y) };
      }, { minX: 9999, maxX: 0, minY: 9999, maxY: 0 });
      const grd = ctx.createLinearGradient(bb.minX, bb.minY, bb.maxX, bb.maxY);
      grd.addColorStop(0, 'rgba(200,168,75,0.28)');
      grd.addColorStop(0.5, 'rgba(180,145,55,0.22)');
      grd.addColorStop(1, 'rgba(138,104,30,0.16)');
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.strokeStyle = 'rgba(232,201,106,0.5)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });
  }

  function bezierPt(t, p0, p1, p2) {
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    };
  }

  function drawRoutes() {
    destPts.forEach((d, i) => {
      ctx.beginPath();
      ctx.moveTo(ankaraP.x, ankaraP.y);
      ctx.quadraticCurveTo(ctrlPts[i].x, ctrlPts[i].y, d.x, d.y);
      ctx.strokeStyle = 'rgba(200,168,75,0.2)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([5, 7]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const pos = bezierPt(p.t, ankaraP, ctrlPts[p.i], destPts[p.i]);
      const alpha = Math.sin(p.t * Math.PI);

      // Outer glow
      const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 5);
      grd.addColorStop(0, `rgba(232,201,106,${0.55 * alpha})`);
      grd.addColorStop(1, 'rgba(200,168,75,0)');
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,245,200,${alpha})`;
      ctx.fill();
    });
  }

  function drawDestinations() {
    destPts.forEach((d, i) => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(d.x, d.y, 5.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,168,75,0.45)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
      // Middle ring
      ctx.beginPath();
      ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,168,75,0.6)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
      // Dot
      ctx.beginPath();
      ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#c8a84b';
      ctx.fill();
      // Label
      ctx.font = '700 7.5px "Barlow Condensed", sans-serif';
      ctx.fillStyle = 'rgba(210,180,90,0.9)';
      const right = d.x > W * 0.5;
      ctx.textAlign = right ? 'left' : 'right';
      ctx.fillText(destinations[i].label, right ? d.x + 9 : d.x - 9, d.y + 3);
    });
  }

  function drawAnkara() {
    pulseT += 0.011;
    [0, 0.35, 0.7].forEach(offset => {
      const t = (pulseT + offset) % 1;
      const r = t * 26;
      const a = (1 - t) * 0.35;
      ctx.beginPath();
      ctx.arc(ankaraP.x, ankaraP.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,201,106,${a})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Glow halo
    const grd = ctx.createRadialGradient(ankaraP.x, ankaraP.y, 0, ankaraP.x, ankaraP.y, 18);
    grd.addColorStop(0, 'rgba(232,201,106,0.45)');
    grd.addColorStop(1, 'rgba(200,168,75,0)');
    ctx.beginPath();
    ctx.arc(ankaraP.x, ankaraP.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Rings
    ctx.beginPath();
    ctx.arc(ankaraP.x, ankaraP.y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(232,201,106,0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ankaraP.x, ankaraP.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c96a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ankaraP.x, ankaraP.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = 'bold 9px "Barlow Condensed", sans-serif';
    ctx.fillStyle = '#e8c96a';
    ctx.fillText('ANKARA', ankaraP.x, ankaraP.y - 15);

    ctx.font = '500 7px "Barlow Condensed", sans-serif';
    ctx.fillStyle = 'rgba(200,168,75,0.55)';
    ctx.fillText('EXPORT ORIGIN', ankaraP.x, ankaraP.y - 7);
  }

  function drawLabels() {
    ctx.textAlign = 'left';
    ctx.font = '600 8px "Barlow Condensed", sans-serif';
    ctx.fillStyle = 'rgba(200,168,75,0.25)';
    ctx.fillText('EMASGEZ GLOBAL EXPORT NETWORK', 14, 18);
    ctx.textAlign = 'right';
    ctx.fillText('WORLDWIDE DELIVERY', W - 14, 18);
  }

  function frame() {
    drawOcean();
    drawDotGrid();
    drawGraticule();
    drawContinents();
    drawRoutes();
    drawParticles();
    drawDestinations();
    drawAnkara();
    drawLabels();
    requestAnimationFrame(frame);
  }

  frame();
})();
