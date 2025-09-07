(() => {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const form = $('#qr-form');
  const generateButton = $('#generate');
  const downloadButton = $('#download');
  const qrContainer = $('#qrcode');
  const tabButtons = $$('.tab-button');

  const defaults = JSON.parse(localStorage.getItem('qr_defaults') || '{}');
  if (defaults.size) $('#size').value = defaults.size;
  if (defaults.colorDark) $('#color-dark').value = defaults.colorDark;
  if (defaults.colorLight) $('#color-light').value = defaults.colorLight;
  if (defaults.ec) $('#ec-level').value = defaults.ec;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      $$('.form-section').forEach((sec) => sec.classList.add('hidden'));
      $(`.form-section[data-section="${type}"]`).classList.remove('hidden');
    });
  });

  function sanitizeText(value) {
    return (value || '').toString().trim();
  }

  function buildPayload() {
    const activeType = document.querySelector('.tab-button.active').dataset.type;
    if (activeType === 'text') {
      const text = sanitizeText($('#text-input').value);
      return text;
    }
    if (activeType === 'wifi') {
      const ssid = sanitizeText($('#wifi-ssid').value);
      const pass = sanitizeText($('#wifi-password').value);
      const auth = $('#wifi-auth').value;
      const hidden = $('#wifi-hidden').checked ? 'true' : 'false';
      let payload = `WIFI:T:${auth};S:${escapeWiFi(ssid)};`;
      if (auth !== 'nopass') payload += `P:${escapeWiFi(pass)};`;
      if (hidden === 'true') payload += 'H:true;';
      payload += ';';
      return payload;
    }
    if (activeType === 'vcard') {
      const first = sanitizeText($('#v-first').value);
      const last = sanitizeText($('#v-last').value);
      const phone = sanitizeText($('#v-phone').value);
      const email = sanitizeText($('#v-email').value);
      const org = sanitizeText($('#v-org').value);
      const title = sanitizeText($('#v-title').value);
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${last};${first};;;`,
        `FN:${first} ${last}`.trim(),
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        org ? `ORG:${org}` : '',
        title ? `TITLE:${title}` : '',
        'END:VCARD'
      ].filter(Boolean);
      return lines.join('\n');
    }
    return '';
  }

  function escapeWiFi(text) {
    return text.replace(/([\\,;\"])/g, '\\$1');
  }

  function getOptions() {
    const size = Math.max(120, Math.min(1024, parseInt($('#size').value || '256', 10)));
    const colorDark = $('#color-dark').value || '#000000';
    const colorLight = $('#color-light').value || '#ffffff';
    const ecVal = $('#ec-level').value;
    const correctLevel = {
      L: QRCode.CorrectLevel.L,
      M: QRCode.CorrectLevel.M,
      Q: QRCode.CorrectLevel.Q,
      H: QRCode.CorrectLevel.H
    }[ecVal] || QRCode.CorrectLevel.M;
    return { size, colorDark, colorLight, correctLevel, ecVal };
  }

  function clearQR() {
    while (qrContainer.firstChild) qrContainer.removeChild(qrContainer.firstChild);
  }

  function renderQR() {
    const text = buildPayload();
    const { size, colorDark, colorLight, correctLevel, ecVal } = getOptions();
    if (!text) {
      clearQR();
      downloadButton.disabled = true;
      return;
    }
    clearQR();
    new QRCode(qrContainer, {
      text,
      width: size,
      height: size,
      colorDark,
      colorLight,
      correctLevel
    });
    localStorage.setItem('qr_defaults', JSON.stringify({ size, colorDark, colorLight, ec: ecVal }));
    setTimeout(() => {
      const canvas = qrContainer.querySelector('canvas');
      downloadButton.disabled = !canvas;
    }, 0);
  }

  function downloadPNG() {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  generateButton.addEventListener('click', renderQR);
  downloadButton.addEventListener('click', downloadPNG);

  document.getElementById('qr-form').addEventListener('input', () => {
    renderQR();
  });

  renderQR();
})();
