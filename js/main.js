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

const MAP_CONTINENTS = [
  "M355.9,125.1 L313.7,144.2 L290.8,156.3 L276.5,163.2 L264.8,168.5 L221.3,184.1 L210.0,194.5 L210.0,210.1 L249.9,222.2 L282.0,232.7 L293.2,236.1 L302.0,234.4 L282.0,232.7 L291.9,204.9 L296.1,196.2 L315.7,189.3 L322.8,189.3 L339.3,180.6 L353.4,177.1 L369.4,171.9 L379.0,173.7 L399.5,168.5 L403.0,161.5 L386.2,168.5 L366.9,173.7 L356.1,175.4 L346.7,173.7 L339.2,170.2 L317.8,177.1 L325.6,170.2 L325.8,165.0 L300.4,165.0 L275.0,165.0 L301.5,152.8 L307.8,145.9 L278.9,149.4 L237.7,156.3 L229.6,156.3 L285.2,142.4 L329.7,132.0 L353.4,126.8 L366.2,125.1 L355.9,125.1 Z",
  "M449.5,118.1 L460.8,116.4 L440.0,145.9 L451.6,137.2 L462.3,125.1 L462.0,119.9 L458.8,116.4 L449.5,118.1 Z",
  "M243.1,211.8 L260.8,222.2 L282.0,232.7 L291.9,204.9 L296.1,196.2 L243.1,211.8 Z",
  "M274.9,211.8 L283.8,210.1 L293.4,211.8 L302.3,215.3 L299.6,215.3 L291.6,215.3 L282.8,211.8 L274.9,211.8 Z",
  "M291.6,234.4 L339.0,248.3 L351.2,255.2 L378.0,251.7 L393.6,250.0 L411.7,258.7 L412.8,262.1 L405.5,267.3 L394.9,281.2 L394.1,288.2 L375.1,295.1 L370.7,307.3 L369.6,315.9 L374.0,329.8 L388.4,340.2 L390.6,343.7 L398.1,345.4 L393.4,340.2 L380.6,322.9 L350.4,291.6 L336.9,277.8 L348.7,258.7 L370.7,248.3 L374.9,243.1 L355.0,239.6 L334.6,232.7 L318.6,229.2 L305.7,232.7 L296.8,234.4 L291.6,234.4 Z",
  "M479.1,187.5 L483.9,173.7 L491.9,173.7 L500.0,173.7 L510.3,175.4 L518.2,173.7 L525.2,170.2 L535.6,171.9 L543.5,171.9 L552.5,173.7 L554.3,170.2 L558.1,170.2 L542.8,152.8 L537.6,149.4 L530.0,145.9 L523.1,149.4 L518.3,152.8 L514.5,149.4 L507.2,149.4 L506.8,159.8 L500.0,161.5 L490.7,166.7 L489.9,173.7 L487.0,180.6 L480.1,182.3 L479.1,187.5 Z",
  "M491.1,163.2 L498.3,161.5 L500.0,161.5 L501.7,159.8 L500.0,158.0 L496.9,154.6 L494.2,149.4 L491.3,149.4 L492.0,156.3 L494.8,161.5 L491.1,163.2 Z",
  "M483.1,159.8 L489.9,159.8 L490.3,156.3 L487.5,154.6 L483.9,156.3 L483.1,159.8 Z",
  "M507.2,149.4 L514.5,149.4 L518.3,152.8 L521.4,152.8 L523.1,149.4 L524.5,145.9 L528.1,142.4 L528.9,135.5 L526.4,128.6 L522.3,125.1 L520.7,128.6 L516.4,132.0 L516.1,137.2 L515.3,142.4 L514.5,149.4 L507.2,149.4 Z",
  "M471.3,139.0 L483.3,139.0 L485.0,137.2 L482.2,135.5 L477.8,135.5 L472.3,137.2 L471.3,139.0 Z",
  "M486.1,187.5 L504.6,187.5 L518.3,185.8 L534.3,185.8 L536.0,191.0 L549.6,194.5 L569.4,194.5 L581.8,198.0 L595.3,211.8 L614.7,229.2 L616.5,230.9 L605.0,232.7 L601.4,229.2 L602.4,218.8 L606.9,215.3 L617.4,229.2 L633.4,229.2 L638.7,229.2 L631.3,232.7 L605.1,243.1 L596.7,250.0 L587.9,263.9 L574.7,270.8 L570.7,277.8 L580.8,281.2 L588.5,295.1 L571.5,302.1 L543.2,309.0 L538.4,309.0 L521.0,291.6 L510.1,258.7 L500.0,246.5 L490.0,243.1 L479.3,236.1 L457.3,229.2 L451.2,225.7 L452.3,211.8 L463.2,208.4 L463.9,201.4 L475.2,194.5 L486.1,187.5 Z",
  "M617.4,270.8 L630.0,274.3 L633.6,284.7 L620.8,291.6 L618.6,281.2 L617.4,270.8 Z",
  "M554.4,177.1 L567.4,184.1 L583.7,187.5 L589.9,184.1 L598.9,184.1 L621.4,184.1 L639.5,187.5 L653.3,198.0 L652.3,208.4 L632.9,198.0 L612.4,198.0 L599.1,194.5 L588.3,187.5 L583.7,187.5 L586.9,185.8 L598.9,184.1 L591.2,180.6 L581.0,178.9 L571.2,177.1 L562.8,177.1 L554.4,177.1 Z",
  "M592.8,201.4 L612.4,198.0 L627.8,198.0 L652.3,208.4 L658.9,211.8 L644.4,201.4 L632.9,198.0 L612.4,198.0 L598.0,201.4 L592.8,201.4 Z",
  "M598.9,184.1 L639.5,187.5 L653.3,198.0 L652.3,208.4 L631.3,208.4 L612.4,198.0 L598.9,184.1 Z",
  "M542.8,152.8 L540.9,145.9 L588.0,177.1 L600.5,177.1 L575.4,177.1 L553.2,163.2 L542.8,152.8 Z",
  "M530.8,132.0 L551.5,125.1 L569.2,118.1 L620.0,125.1 L672.4,132.0 L703.1,139.0 L757.1,159.8 L716.5,159.8 L669.1,159.8 L635.2,156.3 L581.2,139.0 L545.1,132.0 L530.8,132.0 Z",
  "M588.7,163.2 L635.3,159.8 L655.0,170.2 L650.8,177.1 L648.8,187.5 L634.9,184.1 L617.3,177.1 L596.9,170.2 L588.7,163.2 Z",
  "M680.1,211.8 L697.7,215.3 L701.6,236.1 L710.1,232.7 L718.7,229.2 L711.3,225.7 L696.0,211.8 L689.0,208.4 L680.1,211.8 Z",
  "M635.3,159.8 L677.4,163.2 L713.2,170.2 L712.8,163.2 L727.0,163.2 L758.2,173.7 L774.2,184.1 L815.0,208.4 L801.9,211.8 L796.4,218.8 L774.9,218.8 L767.2,215.3 L739.4,204.9 L719.8,198.0 L692.1,191.0 L670.8,184.1 L655.0,170.2 L635.3,159.8 Z",
  "M767.2,215.3 L792.6,225.7 L778.4,232.7 L755.8,246.5 L748.8,248.3 L754.3,239.6 L771.8,222.2 L767.2,215.3 Z",
  "M822.2,194.5 L810.2,184.1 L786.5,173.7 L790.5,173.7 L797.4,177.1 L826.6,191.0 L827.2,194.5 L822.2,194.5 Z",
  "M802.6,191.0 L792.2,184.1 L812.2,191.0 L817.2,194.5 L802.6,191.0 Z",
  "M744.1,239.6 L756.4,250.0 L765.2,256.9 L750.2,256.9 L732.2,250.0 L744.1,239.6 Z",
  "M765.7,246.5 L790.2,243.1 L800.1,239.6 L790.3,246.5 L775.5,253.5 L761.2,250.0 L765.7,246.5 Z",
  "M801.9,288.2 L778.6,309.0 L822.2,305.5 L851.8,291.6 L862.8,270.8 L850.3,281.2 L859.0,295.1 L895.4,284.7 L899.0,291.6 L841.7,315.9 L825.5,312.5 L817.0,309.0 L793.0,309.0 L773.8,309.0 L796.6,295.1 L801.9,288.2 Z",
  "M895.2,312.5 L877.8,319.4 L860.2,322.9 L869.1,319.4 L895.2,312.5 Z",
  "M873.4,319.4 L855.0,326.3 L837.2,329.8 L847.0,326.3 L873.4,319.4 Z",
  "M824.7,253.5 L856.0,260.4 L876.4,260.4 L865.2,256.9 L834.6,253.5 L824.7,253.5 Z",
];
const MAP_GRAT_LON = ['M419.6,388.8 L390.3,380.1 L358.7,371.4 L327.1,362.8 L295.5,354.1 L264.8,345.4 L234.0,336.8 L203.2,328.1 L174.3,319.4 L145.5,310.7 L116.7,302.1 L108.0,293.4 L99.3,284.7 L90.5,276.0 L106.1,267.3 L121.7,258.7 L137.2,250.0 L121.7,241.3 L106.1,232.7 L90.5,224.0 L99.3,215.3 L108.0,206.6 L116.7,198.0 L145.5,189.3 L174.3,180.6 L203.2,171.9 L234.0,163.2 L264.8,154.6 L295.5,145.9 L327.1,137.2 L358.7,128.6 L390.3,119.9 L419.6,111.2', 'M435.6,388.8 L412.3,380.1 L387.0,371.4 L361.7,362.8 L336.4,354.1 L311.8,345.4 L287.2,336.8 L262.5,328.1 L239.5,319.4 L216.4,310.7 L193.4,302.1 L186.4,293.4 L179.4,284.7 L172.4,276.0 L184.9,267.3 L197.3,258.7 L209.8,250.0 L197.3,241.3 L184.9,232.7 L172.4,224.0 L179.4,215.3 L186.4,206.6 L193.4,198.0 L216.4,189.3 L239.5,180.6 L262.5,171.9 L287.2,163.2 L311.8,154.6 L336.4,145.9 L361.7,137.2 L387.0,128.6 L412.3,119.9 L435.6,111.2', 'M451.7,388.8 L434.2,380.1 L415.2,371.4 L396.3,362.8 L377.3,354.1 L358.9,345.4 L340.4,336.8 L321.9,328.1 L304.6,319.4 L287.3,310.7 L270.0,302.1 L264.8,293.4 L259.6,284.7 L254.3,276.0 L263.7,267.3 L273.0,258.7 L282.3,250.0 L273.0,241.3 L263.7,232.7 L254.3,224.0 L259.6,215.3 L264.8,206.6 L270.0,198.0 L287.3,189.3 L304.6,180.6 L321.9,171.9 L340.4,163.2 L358.9,154.6 L377.3,145.9 L396.3,137.2 L415.2,128.6 L434.2,119.9 L451.7,111.2', 'M467.8,388.8 L456.1,380.1 L443.5,371.4 L430.9,362.8 L418.2,354.1 L405.9,345.4 L393.6,336.8 L381.3,328.1 L369.7,319.4 L358.2,310.7 L346.7,302.1 L343.2,293.4 L339.7,284.7 L336.2,276.0 L342.4,267.3 L348.7,258.7 L354.9,250.0 L348.7,241.3 L342.4,232.7 L336.2,224.0 L339.7,215.3 L343.2,206.6 L346.7,198.0 L358.2,189.3 L369.7,180.6 L381.3,171.9 L393.6,163.2 L405.9,154.6 L418.2,145.9 L430.9,137.2 L443.5,128.6 L456.1,119.9 L467.8,111.2', 'M483.9,388.8 L478.1,380.1 L471.7,371.4 L465.4,362.8 L459.1,354.1 L453.0,345.4 L446.8,336.8 L440.6,328.1 L434.9,319.4 L429.1,310.7 L423.3,302.1 L421.6,293.4 L419.9,284.7 L418.1,276.0 L421.2,267.3 L424.3,258.7 L427.4,250.0 L424.3,241.3 L421.2,232.7 L418.1,224.0 L419.9,215.3 L421.6,206.6 L423.3,198.0 L429.1,189.3 L434.9,180.6 L440.6,171.9 L446.8,163.2 L453.0,154.6 L459.1,145.9 L465.4,137.2 L471.7,128.6 L478.1,119.9 L483.9,111.2', 'M500.0,388.8 L500.0,380.1 L500.0,371.4 L500.0,362.8 L500.0,354.1 L500.0,345.4 L500.0,336.8 L500.0,328.1 L500.0,319.4 L500.0,310.7 L500.0,302.1 L500.0,293.4 L500.0,284.7 L500.0,276.0 L500.0,267.3 L500.0,258.7 L500.0,250.0 L500.0,241.3 L500.0,232.7 L500.0,224.0 L500.0,215.3 L500.0,206.6 L500.0,198.0 L500.0,189.3 L500.0,180.6 L500.0,171.9 L500.0,163.2 L500.0,154.6 L500.0,145.9 L500.0,137.2 L500.0,128.6 L500.0,119.9 L500.0,111.2', 'M516.1,388.8 L521.9,380.1 L528.3,371.4 L534.6,362.8 L540.9,354.1 L547.1,345.4 L553.2,336.8 L559.4,328.1 L565.1,319.4 L570.9,310.7 L576.7,302.1 L578.4,293.4 L580.1,284.7 L581.9,276.0 L578.8,267.3 L575.7,258.7 L572.6,250.0 L575.7,241.3 L578.8,232.7 L581.9,224.0 L580.1,215.3 L578.4,206.6 L576.7,198.0 L570.9,189.3 L565.1,180.6 L559.4,171.9 L553.2,163.2 L547.1,154.6 L540.9,145.9 L534.6,137.2 L528.3,128.6 L521.9,119.9 L516.1,111.2', 'M532.2,388.8 L543.9,380.1 L556.5,371.4 L569.1,362.8 L581.8,354.1 L594.1,345.4 L606.4,336.8 L618.7,328.1 L630.3,319.4 L641.8,310.7 L653.3,302.1 L656.8,293.4 L660.3,284.7 L663.8,276.0 L657.6,267.3 L651.3,258.7 L645.1,250.0 L651.3,241.3 L657.6,232.7 L663.8,224.0 L660.3,215.3 L656.8,206.6 L653.3,198.0 L641.8,189.3 L630.3,180.6 L618.7,171.9 L606.4,163.2 L594.1,154.6 L581.8,145.9 L569.1,137.2 L556.5,128.6 L543.9,119.9 L532.2,111.2', 'M548.3,388.8 L565.8,380.1 L584.8,371.4 L603.7,362.8 L622.7,354.1 L641.1,345.4 L659.6,336.8 L678.1,328.1 L695.4,319.4 L712.7,310.7 L730.0,302.1 L735.2,293.4 L740.4,284.7 L745.7,276.0 L736.3,267.3 L727.0,258.7 L717.7,250.0 L727.0,241.3 L736.3,232.7 L745.7,224.0 L740.4,215.3 L735.2,206.6 L730.0,198.0 L712.7,189.3 L695.4,180.6 L678.1,171.9 L659.6,163.2 L641.1,154.6 L622.7,145.9 L603.7,137.2 L584.8,128.6 L565.8,119.9 L548.3,111.2', 'M564.4,388.8 L587.7,380.1 L613.0,371.4 L638.3,362.8 L663.6,354.1 L688.2,345.4 L712.8,336.8 L737.5,328.1 L760.5,319.4 L783.6,310.7 L806.6,302.1 L813.6,293.4 L820.6,284.7 L827.6,276.0 L815.1,267.3 L802.7,258.7 L790.2,250.0 L802.7,241.3 L815.1,232.7 L827.6,224.0 L820.6,215.3 L813.6,206.6 L806.6,198.0 L783.6,189.3 L760.5,180.6 L737.5,171.9 L712.8,163.2 L688.2,154.6 L663.6,145.9 L638.3,137.2 L613.0,128.6 L587.7,119.9 L564.4,111.2', 'M580.4,388.8 L609.7,380.1 L641.3,371.4 L672.9,362.8 L704.5,354.1 L735.2,345.4 L766.0,336.8 L796.8,328.1 L825.7,319.4 L854.5,310.7 L883.3,302.1 L892.0,293.4 L900.7,284.7 L909.5,276.0 L893.9,267.3 L878.3,258.7 L862.8,250.0 L878.3,241.3 L893.9,232.7 L909.5,224.0 L900.7,215.3 L892.0,206.6 L883.3,198.0 L854.5,189.3 L825.7,180.6 L796.8,171.9 L766.0,163.2 L735.2,154.6 L704.5,145.9 L672.9,137.2 L641.3,128.6 L609.7,119.9 L580.4,111.2', 'M596.5,388.8 L631.6,380.1 L669.5,371.4 L707.4,362.8 L745.3,354.1 L782.3,345.4 L819.2,336.8 L856.2,328.1 L890.8,319.4 L925.4,310.7 L960.0,302.1 L970.4,293.4 L980.9,284.7 L991.3,276.0 L972.7,267.3 L954.0,258.7 L935.4,250.0 L954.0,241.3 L972.7,232.7 L991.3,224.0 L980.9,215.3 L970.4,206.6 L960.0,198.0 L925.4,189.3 L890.8,180.6 L856.2,171.9 L819.2,163.2 L782.3,154.6 L745.3,145.9 L707.4,137.2 L669.5,128.6 L631.6,119.9 L596.5,111.2'];
const MAP_GRAT_LAT = ['M254.6,354.1 L261.5,354.1 L268.3,354.1 L275.1,354.1 L281.9,354.1 L288.7,354.1 L295.5,354.1 L302.4,354.1 L309.2,354.1 L316.0,354.1 L322.8,354.1 L329.6,354.1 L336.4,354.1 L343.2,354.1 L350.1,354.1 L356.9,354.1 L363.7,354.1 L370.5,354.1 L377.3,354.1 L384.1,354.1 L391.0,354.1 L397.8,354.1 L404.6,354.1 L411.4,354.1 L418.2,354.1 L425.0,354.1 L431.8,354.1 L438.7,354.1 L445.5,354.1 L452.3,354.1 L459.1,354.1 L465.9,354.1 L472.7,354.1 L479.6,354.1 L486.4,354.1 L493.2,354.1 L500.0,354.1 L506.8,354.1 L513.6,354.1 L520.4,354.1 L527.3,354.1 L534.1,354.1 L540.9,354.1 L547.7,354.1 L554.5,354.1 L561.3,354.1 L568.2,354.1 L575.0,354.1 L581.8,354.1 L588.6,354.1 L595.4,354.1 L602.2,354.1 L609.0,354.1 L615.9,354.1 L622.7,354.1 L629.5,354.1 L636.3,354.1 L643.1,354.1 L649.9,354.1 L656.8,354.1 L663.6,354.1 L670.4,354.1 L677.2,354.1 L684.0,354.1 L690.8,354.1 L697.6,354.1 L704.5,354.1 L711.3,354.1 L718.1,354.1 L724.9,354.1 L731.7,354.1 L738.5,354.1 L745.3,354.1', 'M40.0,302.1 L52.8,302.1 L65.6,302.1 L78.4,302.1 L91.2,302.1 L103.9,302.1 L116.7,302.1 L129.5,302.1 L142.3,302.1 L155.0,302.1 L167.8,302.1 L180.6,302.1 L193.4,302.1 L206.1,302.1 L218.9,302.1 L231.7,302.1 L244.5,302.1 L257.2,302.1 L270.0,302.1 L282.8,302.1 L295.6,302.1 L308.4,302.1 L321.1,302.1 L333.9,302.1 L346.7,302.1 L359.5,302.1 L372.2,302.1 L385.0,302.1 L397.8,302.1 L410.6,302.1 L423.3,302.1 L436.1,302.1 L448.9,302.1 L461.7,302.1 L474.4,302.1 L487.2,302.1 L500.0,302.1 L512.8,302.1 L525.6,302.1 L538.3,302.1 L551.1,302.1 L563.9,302.1 L576.7,302.1 L589.4,302.1 L602.2,302.1 L615.0,302.1 L627.8,302.1 L640.5,302.1 L653.3,302.1 L666.1,302.1 L678.9,302.1 L691.6,302.1 L704.4,302.1 L717.2,302.1 L730.0,302.1 L742.8,302.1 L755.5,302.1 L768.3,302.1 L781.1,302.1 L793.9,302.1 L806.6,302.1 L819.4,302.1 L832.2,302.1 L845.0,302.1 L857.7,302.1 L870.5,302.1 L883.3,302.1 L896.1,302.1 L908.8,302.1 L921.6,302.1 L934.4,302.1 L947.2,302.1 L960.0,302.1', 'M64.6,250.0 L76.7,250.0 L88.8,250.0 L100.9,250.0 L113.0,250.0 L125.1,250.0 L137.2,250.0 L149.3,250.0 L161.4,250.0 L173.5,250.0 L185.6,250.0 L197.7,250.0 L209.8,250.0 L221.9,250.0 L234.0,250.0 L246.0,250.0 L258.1,250.0 L270.2,250.0 L282.3,250.0 L294.4,250.0 L306.5,250.0 L318.6,250.0 L330.7,250.0 L342.8,250.0 L354.9,250.0 L367.0,250.0 L379.1,250.0 L391.2,250.0 L403.3,250.0 L415.3,250.0 L427.4,250.0 L439.5,250.0 L451.6,250.0 L463.7,250.0 L475.8,250.0 L487.9,250.0 L500.0,250.0 L512.1,250.0 L524.2,250.0 L536.3,250.0 L548.4,250.0 L560.5,250.0 L572.6,250.0 L584.7,250.0 L596.7,250.0 L608.8,250.0 L620.9,250.0 L633.0,250.0 L645.1,250.0 L657.2,250.0 L669.3,250.0 L681.4,250.0 L693.5,250.0 L705.6,250.0 L717.7,250.0 L729.8,250.0 L741.9,250.0 L754.0,250.0 L766.0,250.0 L778.1,250.0 L790.2,250.0 L802.3,250.0 L814.4,250.0 L826.5,250.0 L838.6,250.0 L850.7,250.0 L862.8,250.0 L874.9,250.0 L887.0,250.0 L899.1,250.0 L911.2,250.0 L923.3,250.0 L935.4,250.0', 'M40.0,198.0 L52.8,198.0 L65.6,198.0 L78.4,198.0 L91.2,198.0 L103.9,198.0 L116.7,198.0 L129.5,198.0 L142.3,198.0 L155.0,198.0 L167.8,198.0 L180.6,198.0 L193.4,198.0 L206.1,198.0 L218.9,198.0 L231.7,198.0 L244.5,198.0 L257.2,198.0 L270.0,198.0 L282.8,198.0 L295.6,198.0 L308.4,198.0 L321.1,198.0 L333.9,198.0 L346.7,198.0 L359.5,198.0 L372.2,198.0 L385.0,198.0 L397.8,198.0 L410.6,198.0 L423.3,198.0 L436.1,198.0 L448.9,198.0 L461.7,198.0 L474.4,198.0 L487.2,198.0 L500.0,198.0 L512.8,198.0 L525.6,198.0 L538.3,198.0 L551.1,198.0 L563.9,198.0 L576.7,198.0 L589.4,198.0 L602.2,198.0 L615.0,198.0 L627.8,198.0 L640.5,198.0 L653.3,198.0 L666.1,198.0 L678.9,198.0 L691.6,198.0 L704.4,198.0 L717.2,198.0 L730.0,198.0 L742.8,198.0 L755.5,198.0 L768.3,198.0 L781.1,198.0 L793.9,198.0 L806.6,198.0 L819.4,198.0 L832.2,198.0 L845.0,198.0 L857.7,198.0 L870.5,198.0 L883.3,198.0 L896.1,198.0 L908.8,198.0 L921.6,198.0 L934.4,198.0 L947.2,198.0 L960.0,198.0', 'M254.6,145.9 L261.5,145.9 L268.3,145.9 L275.1,145.9 L281.9,145.9 L288.7,145.9 L295.5,145.9 L302.4,145.9 L309.2,145.9 L316.0,145.9 L322.8,145.9 L329.6,145.9 L336.4,145.9 L343.2,145.9 L350.1,145.9 L356.9,145.9 L363.7,145.9 L370.5,145.9 L377.3,145.9 L384.1,145.9 L391.0,145.9 L397.8,145.9 L404.6,145.9 L411.4,145.9 L418.2,145.9 L425.0,145.9 L431.8,145.9 L438.7,145.9 L445.5,145.9 L452.3,145.9 L459.1,145.9 L465.9,145.9 L472.7,145.9 L479.6,145.9 L486.4,145.9 L493.2,145.9 L500.0,145.9 L506.8,145.9 L513.6,145.9 L520.4,145.9 L527.3,145.9 L534.1,145.9 L540.9,145.9 L547.7,145.9 L554.5,145.9 L561.3,145.9 L568.2,145.9 L575.0,145.9 L581.8,145.9 L588.6,145.9 L595.4,145.9 L602.2,145.9 L609.0,145.9 L615.9,145.9 L622.7,145.9 L629.5,145.9 L636.3,145.9 L643.1,145.9 L649.9,145.9 L656.8,145.9 L663.6,145.9 L670.4,145.9 L677.2,145.9 L684.0,145.9 L690.8,145.9 L697.6,145.9 L704.5,145.9 L711.3,145.9 L718.1,145.9 L724.9,145.9 L731.7,145.9 L738.5,145.9 L745.3,145.9'];
const MAP_SPHERE = "M466.6,95.6 L467.0,95.6 L467.3,95.6 L467.7,95.6 L468.1,95.6 L468.4,95.6 L468.8,95.6 L469.2,95.6 L469.6,95.6 L469.9,95.6 L470.3,95.6 L470.7,95.6 L471.0,95.6 L471.4,95.6 L471.8,95.6 L472.2,95.6 L472.5,95.6 L472.9,95.6 L473.3,95.6 L473.6,95.6 L474.0,95.6 L474.4,95.6 L474.8,95.6 L475.1,95.6 L475.5,95.6 L475.9,95.6 L476.2,95.6 L476.6,95.6 L477.0,95.6 L477.4,95.6 L477.7,95.6 L478.1,95.6 L478.5,95.6 L478.8,95.6 L479.2,95.6 L479.6,95.6 L480.0,95.6 L480.3,95.6 L480.7,95.6 L481.1,95.6 L481.4,95.6 L481.8,95.6 L482.2,95.6 L482.6,95.6 L482.9,95.6 L483.3,95.6 L483.7,95.6 L484.0,95.6 L484.4,95.6 L484.8,95.6 L485.1,95.6 L485.5,95.6 L485.9,95.6 L486.3,95.6 L486.6,95.6 L487.0,95.6 L487.4,95.6 L487.7,95.6 L488.1,95.6 L488.5,95.6 L488.9,95.6 L489.2,95.6 L489.6,95.6 L490.0,95.6 L490.3,95.6 L490.7,95.6 L491.1,95.6 L491.5,95.6 L491.8,95.6 L492.2,95.6 L492.6,95.6 L492.9,95.6 L493.3,95.6 L493.7,95.6 L494.1,95.6 L494.4,95.6 L494.8,95.6 L495.2,95.6 L495.5,95.6 L495.9,95.6 L496.3,95.6 L496.7,95.6 L497.0,95.6 L497.4,95.6 L497.8,95.6 L498.1,95.6 L498.5,95.6 L498.9,95.6 L499.3,95.6 L499.6,95.6 L500.0,95.6 L500.4,95.6 L500.7,95.6 L501.1,95.6 L501.5,95.6 L501.9,95.6 L502.2,95.6 L502.6,95.6 L503.0,95.6 L503.3,95.6 L503.7,95.6 L504.1,95.6 L504.5,95.6 L504.8,95.6 L505.2,95.6 L505.6,95.6 L505.9,95.6 L506.3,95.6 L506.7,95.6 L507.1,95.6 L507.4,95.6 L507.8,95.6 L508.2,95.6 L508.5,95.6 L508.9,95.6 L509.3,95.6 L509.7,95.6 L510.0,95.6 L510.4,95.6 L510.8,95.6 L511.1,95.6 L511.5,95.6 L511.9,95.6 L512.3,95.6 L512.6,95.6 L513.0,95.6 L513.4,95.6 L513.7,95.6 L514.1,95.6 L514.5,95.6 L514.9,95.6 L515.2,95.6 L515.6,95.6 L516.0,95.6 L516.3,95.6 L516.7,95.6 L517.1,95.6 L517.4,95.6 L517.8,95.6 L518.2,95.6 L518.6,95.6 L518.9,95.6 L519.3,95.6 L519.7,95.6 L520.0,95.6 L520.4,95.6 L520.8,95.6 L521.2,95.6 L521.5,95.6 L521.9,95.6 L522.3,95.6 L522.6,95.6 L523.0,95.6 L523.4,95.6 L523.8,95.6 L524.1,95.6 L524.5,95.6 L524.9,95.6 L525.2,95.6 L525.6,95.6 L526.0,95.6 L526.4,95.6 L526.7,95.6 L527.1,95.6 L527.5,95.6 L527.8,95.6 L528.2,95.6 L528.6,95.6 L529.0,95.6 L529.3,95.6 L529.7,95.6 L530.1,95.6 L530.4,95.6 L530.8,95.6 L531.2,95.6 L531.6,95.6 L531.9,95.6 L532.3,95.6 L532.7,95.6 L533.0,95.6 L533.4,95.6 L533.4,404.4 L533.0,404.4 L532.7,404.4 L532.3,404.4 L531.9,404.4 L531.6,404.4 L531.2,404.4 L530.8,404.4 L530.4,404.4 L530.1,404.4 L529.7,404.4 L529.3,404.4 L529.0,404.4 L528.6,404.4 L528.2,404.4 L527.8,404.4 L527.5,404.4 L527.1,404.4 L526.7,404.4 L526.4,404.4 L526.0,404.4 L525.6,404.4 L525.2,404.4 L524.9,404.4 L524.5,404.4 L524.1,404.4 L523.8,404.4 L523.4,404.4 L523.0,404.4 L522.6,404.4 L522.3,404.4 L521.9,404.4 L521.5,404.4 L521.2,404.4 L520.8,404.4 L520.4,404.4 L520.0,404.4 L519.7,404.4 L519.3,404.4 L518.9,404.4 L518.6,404.4 L518.2,404.4 L517.8,404.4 L517.4,404.4 L517.1,404.4 L516.7,404.4 L516.3,404.4 L516.0,404.4 L515.6,404.4 L515.2,404.4 L514.9,404.4 L514.5,404.4 L514.1,404.4 L513.7,404.4 L513.4,404.4 L513.0,404.4 L512.6,404.4 L512.3,404.4 L511.9,404.4 L511.5,404.4 L511.1,404.4 L510.8,404.4 L510.4,404.4 L510.0,404.4 L509.7,404.4 L509.3,404.4 L508.9,404.4 L508.5,404.4 L508.2,404.4 L507.8,404.4 L507.4,404.4 L507.1,404.4 L506.7,404.4 L506.3,404.4 L505.9,404.4 L505.6,404.4 L505.2,404.4 L504.8,404.4 L504.5,404.4 L504.1,404.4 L503.7,404.4 L503.3,404.4 L503.0,404.4 L502.6,404.4 L502.2,404.4 L501.9,404.4 L501.5,404.4 L501.1,404.4 L500.7,404.4 L500.4,404.4 L500.0,404.4 L499.6,404.4 L499.3,404.4 L498.9,404.4 L498.5,404.4 L498.1,404.4 L497.8,404.4 L497.4,404.4 L497.0,404.4 L496.7,404.4 L496.3,404.4 L495.9,404.4 L495.5,404.4 L495.2,404.4 L494.8,404.4 L494.4,404.4 L494.1,404.4 L493.7,404.4 L493.3,404.4 L492.9,404.4 L492.6,404.4 L492.2,404.4 L491.8,404.4 L491.5,404.4 L491.1,404.4 L490.7,404.4 L490.3,404.4 L490.0,404.4 L489.6,404.4 L489.2,404.4 L488.9,404.4 L488.5,404.4 L488.1,404.4 L487.7,404.4 L487.4,404.4 L487.0,404.4 L486.6,404.4 L486.3,404.4 L485.9,404.4 L485.5,404.4 L485.1,404.4 L484.8,404.4 L484.4,404.4 L484.0,404.4 L483.7,404.4 L483.3,404.4 L482.9,404.4 L482.6,404.4 L482.2,404.4 L481.8,404.4 L481.4,404.4 L481.1,404.4 L480.7,404.4 L480.3,404.4 L480.0,404.4 L479.6,404.4 L479.2,404.4 L478.8,404.4 L478.5,404.4 L478.1,404.4 L477.7,404.4 L477.4,404.4 L477.0,404.4 L476.6,404.4 L476.2,404.4 L475.9,404.4 L475.5,404.4 L475.1,404.4 L474.8,404.4 L474.4,404.4 L474.0,404.4 L473.6,404.4 L473.3,404.4 L472.9,404.4 L472.5,404.4 L472.2,404.4 L471.8,404.4 L471.4,404.4 L471.0,404.4 L470.7,404.4 L470.3,404.4 L469.9,404.4 L469.6,404.4 L469.2,404.4 L468.8,404.4 L468.4,404.4 L468.1,404.4 L467.7,404.4 L467.3,404.4 L467.0,404.4 L466.6,404.4 Z";

/* ═══════════════════════════════════
   WORLD MAP — Inline NE Projection
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

  // Scale paths from 1000x500 design space to actual W x H
  const SX = W / 1000, SY = H / 500;
  function scalePath(d) {
    return d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g,
      (_, x, y) => `${(parseFloat(x)*SX).toFixed(1)},${(parseFloat(y)*SY).toFixed(1)}`);
  }

  // Pre-parse paths
  const paths2d = MAP_CONTINENTS.map(d => new Path2D(scalePath(d)));
  const sphere2d = new Path2D(scalePath(MAP_SPHERE));

  function parseGrat(arr) {
    return arr.map(d => new Path2D(scalePath(d)));
  }
  const gratLon2d = parseGrat(MAP_GRAT_LON);
  const gratLat2d = parseGrat(MAP_GRAT_LAT);

  // City positions (design-space 1000x500)
  const ANKARA   = {x:571.4*SX, y:180.7*SY, label:'ANKARA', origin:true};
  const cities = [
    {x:515.4*SX, y:163.1*SY, label:'FRANKFURT'},
    {x:622.3*SX, y:207.2*SY, label:'RIYADH'},
    {x:695.5*SX, y:216.9*SY, label:'MUMBAI'},
    {x:804.6*SX, y:195.8*SY, label:'SHANGHAI'},
    {x:508.7*SX, y:238.8*SY, label:'LAGOS'},
    {x:341.3*SX, y:179.4*SY, label:'NEW YORK'},
    {x:377.3*SX, y:290.9*SY, label:'SÃO PAULO'},
    {x:863.9*SX, y:308.8*SY, label:'SYDNEY'},
  ];

  // Arc control points (design-space)
  const ctrls = [
    {x:540*SX, y:150*SY},  // Frankfurt
    {x:600*SX, y:200*SY},  // Riyadh
    {x:650*SX, y:210*SY},  // Mumbai
    {x:720*SX, y:155*SY},  // Shanghai
    {x:530*SX, y:220*SY},  // Lagos
    {x:440*SX, y:130*SY},  // New York
    {x:440*SX, y:270*SY},  // São Paulo
    {x:760*SX, y:280*SY},  // Sydney
  ];

  // Particles
  const particles = cities.map((c, i) => ({
    i, t: Math.random(), speed: 0.0014 + Math.random() * 0.001, size: 2.6
  }));

  let pulseT = 0;
  if (loading) loading.style.display = 'none';

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Ocean
    const bg = ctx.createRadialGradient(W*.45, H*.38, 0, W*.5, H*.5, W*.72);
    bg.addColorStop(0, '#0d0d20'); bg.addColorStop(0.6, '#080812'); bg.addColorStop(1, '#05050d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Sphere outline
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.stroke(sphere2d);
    ctx.strokeStyle = 'rgba(55,55,100,0.35)'; ctx.lineWidth = 0.8;
    ctx.stroke(sphere2d);

    // Graticule
    ctx.setLineDash([]);
    gratLon2d.forEach(p => { ctx.beginPath(); ctx.stroke(p); });
    gratLat2d.forEach(p => { ctx.beginPath(); ctx.stroke(p); });
    ctx.strokeStyle = 'rgba(40,40,80,0.45)'; ctx.lineWidth = 0.35;
    gratLon2d.forEach(p => ctx.stroke(p));
    ctx.strokeStyle = 'rgba(40,40,80,0.45)';
    gratLat2d.forEach(p => ctx.stroke(p));
    // Equator
    ctx.strokeStyle = 'rgba(65,65,120,0.65)'; ctx.lineWidth = 0.7;
    if (gratLat2d[2]) ctx.stroke(gratLat2d[2]);

    // Continents fill
    const landGrad = ctx.createLinearGradient(0, 0, W, H);
    landGrad.addColorStop(0, 'rgba(200,168,75,0.30)');
    landGrad.addColorStop(0.5, 'rgba(175,142,55,0.24)');
    landGrad.addColorStop(1, 'rgba(130,100,32,0.18)');
    ctx.fillStyle = landGrad;
    paths2d.forEach(p => { ctx.fill(p); });
    ctx.strokeStyle = 'rgba(232,201,106,0.55)'; ctx.lineWidth = 0.55;
    paths2d.forEach(p => { ctx.stroke(p); });

    // Routes
    ctx.setLineDash([4, 6]); ctx.lineWidth = 0.9;
    cities.forEach((c, i) => {
      ctx.beginPath();
      ctx.moveTo(ANKARA.x, ANKARA.y);
      ctx.quadraticCurveTo(ctrls[i].x, ctrls[i].y, c.x, c.y);
      ctx.strokeStyle = 'rgba(200,168,75,0.22)';
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Particles
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const t = p.t, mt = 1-t;
      const c = cities[p.i], ctrl = ctrls[p.i];
      const px = mt*mt*ANKARA.x + 2*mt*t*ctrl.x + t*t*c.x;
      const py = mt*mt*ANKARA.y + 2*mt*t*ctrl.y + t*t*c.y;
      const alpha = Math.sin(t * Math.PI);
      const grd = ctx.createRadialGradient(px,py,0,px,py,p.size*5);
      grd.addColorStop(0, `rgba(232,201,106,${0.6*alpha})`);
      grd.addColorStop(1, 'rgba(200,168,75,0)');
      ctx.beginPath(); ctx.arc(px,py,p.size*5,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,p.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,245,190,${alpha})`; ctx.fill();
    });

    // City dots
    cities.forEach(c => {
      ctx.beginPath(); ctx.arc(c.x,c.y,5,0,Math.PI*2);
      ctx.strokeStyle='rgba(200,168,75,0.4)'; ctx.lineWidth=0.9; ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x,c.y,2.5,0,Math.PI*2);
      ctx.fillStyle='#c8a84b'; ctx.fill();
      ctx.font='700 7px "Barlow Condensed",sans-serif';
      ctx.fillStyle='rgba(210,178,90,0.9)';
      const right = c.x > ANKARA.x;
      ctx.textAlign = right ? 'left' : 'right';
      ctx.fillText(c.label, right ? c.x+9 : c.x-9, c.y+3);
    });

    // Ankara pulse
    pulseT += 0.011;
    [0, 0.35, 0.7].forEach(off => {
      const t = (pulseT+off)%1;
      ctx.beginPath(); ctx.arc(ANKARA.x,ANKARA.y,t*28,0,Math.PI*2);
      ctx.strokeStyle=`rgba(232,201,106,${(1-t)*0.38})`; ctx.lineWidth=1.5; ctx.stroke();
    });
    const grd2 = ctx.createRadialGradient(ANKARA.x,ANKARA.y,0,ANKARA.x,ANKARA.y,20);
    grd2.addColorStop(0,'rgba(232,201,106,0.5)'); grd2.addColorStop(1,'rgba(200,168,75,0)');
    ctx.beginPath(); ctx.arc(ANKARA.x,ANKARA.y,20,0,Math.PI*2); ctx.fillStyle=grd2; ctx.fill();
    ctx.beginPath(); ctx.arc(ANKARA.x,ANKARA.y,6,0,Math.PI*2);
    ctx.strokeStyle='rgba(232,201,106,0.95)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(ANKARA.x,ANKARA.y,3.5,0,Math.PI*2); ctx.fillStyle='#e8c96a'; ctx.fill();
    ctx.beginPath(); ctx.arc(ANKARA.x,ANKARA.y,1.8,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
    ctx.textAlign='center';
    ctx.font='bold 9px "Barlow Condensed",sans-serif'; ctx.fillStyle='#e8c96a';
    ctx.fillText('ANKARA', ANKARA.x, ANKARA.y-16);
    ctx.font='500 7px "Barlow Condensed",sans-serif'; ctx.fillStyle='rgba(200,168,75,0.6)';
    ctx.fillText('EXPORT ORIGIN', ANKARA.x, ANKARA.y-8);

    // Corner labels
    ctx.textAlign='left'; ctx.font='600 8px "Barlow Condensed",sans-serif';
    ctx.fillStyle='rgba(200,168,75,0.22)';
    ctx.fillText('EMASGEZ GLOBAL EXPORT NETWORK', 14, 18);
    ctx.textAlign='right';
    ctx.fillText('WORLDWIDE DELIVERY', W-14, 18);

    requestAnimationFrame(draw);
  }

  draw();
})();

/* ═══════════════════════════════════
   WORLD MAP — SVG Particle Animation
═══════════════════════════════════ */
(function() {
  const svg = document.getElementById('worldMap');
  if (!svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const ANKARA = [591, 129];
  const routes = [
    { end:[497,104], cp:[520,95]  },
    { end:[622,178], cp:[614,152] },
    { end:[694,176], cp:[640,145] },
    { end:[857,121], cp:[730,90]  },
    { end:[432,216], cp:[510,185] },
    { end:[202,145], cp:[390,65]  },
    { end:[248,285], cp:[410,215] },
    { end:[903,320], cp:[750,225] },
  ];

  // Create particle layer
  const pLayer = document.createElementNS(NS, 'g');
  pLayer.setAttribute('id', 'particles');
  svg.appendChild(pLayer);

  // Particles per route
  const particles = routes.map((r, i) => ({
    r, t: Math.random(), speed: 0.0022 + Math.random() * 0.001,
    el: null, glowEl: null
  }));

  particles.forEach(p => {
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('r', '8');
    glow.setAttribute('fill', 'rgba(232,201,106,0)');
    p.glowEl = glow;

    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '2.8');
    dot.setAttribute('fill', '#fff9e0');
    p.el = dot;

    pLayer.appendChild(glow);
    pLayer.appendChild(dot);
  });

  function bezier(t, p0, cp, p1) {
    const mt = 1 - t;
    return [
      mt*mt*p0[0] + 2*mt*t*cp[0] + t*t*p1[0],
      mt*mt*p0[1] + 2*mt*t*cp[1] + t*t*p1[1],
    ];
  }

  function frame() {
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const [x, y] = bezier(p.t, ANKARA, p.r.cp, p.r.end);
      const alpha = Math.sin(p.t * Math.PI);

      p.el.setAttribute('cx', x);
      p.el.setAttribute('cy', y);
      p.el.setAttribute('opacity', alpha);

      p.glowEl.setAttribute('cx', x);
      p.glowEl.setAttribute('cy', y);
      p.glowEl.setAttribute('fill', `rgba(232,201,106,${alpha * 0.45})`);
    });
    requestAnimationFrame(frame);
  }

  frame();
})();
