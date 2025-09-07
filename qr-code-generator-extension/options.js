(() => {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));
  const form = document.getElementById('defaults-form');
  const size = document.getElementById('d-size');
  const dark = document.getElementById('d-dark');
  const light = document.getElementById('d-light');
  const ec = document.getElementById('d-ec');
  const reset = document.getElementById('reset');

  function load() {
    const d = JSON.parse(localStorage.getItem('qr_defaults') || '{}');
    size.value = d.size || 256;
    dark.value = d.colorDark || '#000000';
    light.value = d.colorLight || '#ffffff';
    ec.value = d.ec || 'M';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      size: Math.max(120, Math.min(1024, parseInt(size.value || '256', 10))),
      colorDark: dark.value || '#000000',
      colorLight: light.value || '#ffffff',
      ec: ec.value || 'M'
    };
    localStorage.setItem('qr_defaults', JSON.stringify(payload));
    alert('Сохранено');
  });

  reset.addEventListener('click', () => {
    localStorage.removeItem('qr_defaults');
    load();
  });

  load();
})();
