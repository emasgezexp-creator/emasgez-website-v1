# EMASGEZ Export Website

## Proje Yapısı
```
emasgez-project/
├── index.html          → Ana sayfa
├── css/
│   └── style.css       → Tüm stiller
├── js/
│   ├── translations.js → TR/EN/DE çeviri metinleri
│   └── main.js         → Form, modal, dil değiştirici
├── package.json
├── netlify.toml        → Netlify deploy ayarları
└── README.md
```

---

## Yerel Geliştirme (VS Code)

### 1. Gereksinimler
- [Node.js](https://nodejs.org) kurulu olmalı (LTS sürümü)
- VS Code'da **Live Server** eklentisi (Ritwick Dey)

### 2. Başlatma (iki yöntemden biri)

**A) VS Code Live Server ile (Önerilen)**
1. VS Code'da projeyi klasör olarak aç
2. `index.html` dosyasını aç
3. Sağ alt köşedeki **"Go Live"** butonuna tıkla
4. Tarayıcı otomatik açılır: `http://127.0.0.1:5500`

**B) Terminal ile**
```bash
npm install
npm run dev
# → http://localhost:3000 adresinde açılır
```

---

## Form Aktivasyonu (Netlify Forms)

Form sadece Netlify üzerinde deploy edildiğinde çalışır.

1. [netlify.com](https://netlify.com) → ücretsiz hesap
2. **Add new site → Deploy manually**
3. Proje klasörünü sürükle-bırak
4. Site yayına girer, form otomatik aktif olur
5. **Site Settings → Forms** → bildirim e-postası ekle

---

## Dil Dosyaları

Çevirileri düzenlemek için `js/translations.js` dosyasını aç.
Her dil `T.en`, `T.tr`, `T.de` objeleri içinde.
