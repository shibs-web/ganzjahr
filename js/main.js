document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header state on scroll + WhatsApp button hides near contact section
  const header = document.getElementById('siteHeader');
  const fab = document.getElementById('fabWa');
  const contact = document.getElementById('kontakt');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (fab && contact) {
      const r = contact.getBoundingClientRect();
      fab.classList.toggle('is-hidden', r.top < window.innerHeight * 0.6 && r.bottom > 0);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    const setOpen = (open) => {
      mainNav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    };
    navToggle.addEventListener('click', () => setOpen(!mainNav.classList.contains('is-open')));
    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  }

  // Active nav link (scroll spy)
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-cta)')];
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('is-active'));
          map.get(e.target.id)?.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // Jahresband: aktuellen Monat hervorheben
  const band = document.getElementById('yearband');
  if (band) {
    const m = new Date().getMonth() + 1;
    band.querySelectorAll(`[data-m="${m}"]`).forEach(el => el.classList.add(el.classList.contains('yb-cell') ? 'now' : 'is-now'));
    const active = [...band.querySelectorAll('.yb-service')]
      .filter(row => row.querySelector(`.yb-cell.on[data-m="${m}"]`))
      .map(row => row.querySelector('.yb-name').textContent.trim());
    const monthName = new Date().toLocaleDateString('de-DE', { month: 'long' });
    const nowEl = document.getElementById('ybNow');
    if (nowEl) nowEl.textContent = `${monthName}: ${active.join(', ')}`;
  }

  // Gallery lightbox with prev/next
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const items = [...document.querySelectorAll('[data-lightbox]')];
  let current = 0;

  const show = (i) => {
    current = (i + items.length) % items.length;
    const item = items[current];
    const alt = item.querySelector('img')?.getAttribute('alt') || '';
    lightboxImg.src = item.getAttribute('href');
    lightboxImg.alt = alt;
    if (caption) caption.textContent = alt;
  };
  const open = (i) => { show(i); lightbox.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const close = () => { lightbox.classList.remove('is-open'); document.body.style.overflow = ''; };

  items.forEach((item, i) => item.addEventListener('click', (e) => { e.preventDefault(); open(i); }));

  if (lightbox) {
    document.getElementById('lightboxClose')?.addEventListener('click', close);
    document.getElementById('lbPrev')?.addEventListener('click', () => show(current - 1));
    document.getElementById('lbNext')?.addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

});

// ==========================================================
// Angebotsanfrage — E-Mail & WhatsApp
// ==========================================================

const CONTACT_EMAIL = 'info@ganzjahr.de';
const WHATSAPP_NUMBER = '491634823664';

function buildRequestMessage() {
  const get = (id) => (document.getElementById(id)?.value || '').trim();

  const firstName = get('firstName');
  const lastName = get('lastName');
  const email = get('email');
  const phone = get('phone');
  const service = document.querySelector('input[name="service"]:checked')?.value || '';
  const date = get('date');
  const time = get('time');
  const message = get('message');

  const formattedDate = date
    ? new Date(date + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const lines = [
    'Guten Tag GanzJahr-Team,',
    '',
    'ich interessiere mich für eine Angebotsanfrage mit folgenden Angaben:',
    '',
    `Leistung: ${service || '–'}`,
    `Wunschtermin: ${formattedDate || '–'}${time ? ' um ' + time : ''}`,
    '',
    `Name: ${firstName} ${lastName}`.trim(),
    `E-Mail: ${email || '–'}`,
    `Telefon: ${phone || '–'}`,
  ];

  if (message) lines.push('', 'Anmerkungen:', message);
  lines.push('', 'Vielen Dank und viele Grüße');

  return { firstName, lastName, email, phone, service, text: lines.join('\n') };
}

function showFormStatus(text, type) {
  const status = document.getElementById('form-status');
  if (!status) return;
  status.textContent = text;
  status.className = 'form-status is-visible ' + (type === 'error' ? 'is-error' : 'is-success');
}

function validateRequest({ firstName, lastName, email, phone }) {
  if (!firstName || !lastName) {
    showFormStatus('Bitte Vor- und Nachname eintragen.', 'error');
    document.getElementById(firstName ? 'lastName' : 'firstName')?.focus();
    return false;
  }
  if (!email && !phone) {
    showFormStatus('Bitte E-Mail-Adresse oder Telefonnummer angeben, damit wir Sie erreichen können.', 'error');
    document.getElementById('email')?.focus();
    return false;
  }
  return true;
}

function sendEmail() {
  const data = buildRequestMessage();
  if (!validateRequest(data)) return;
  const subject = 'Angebotsanfrage' + (data.service ? ' – ' + data.service : '');
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(data.text)}`;
  showFormStatus('E-Mail-Programm wird geöffnet …', 'success');
  window.location.href = mailto;
}

function sendWhatsApp() {
  const data = buildRequestMessage();
  if (!validateRequest(data)) return;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(data.text)}`;
  showFormStatus('WhatsApp wird geöffnet …', 'success');
  window.open(waUrl, '_blank', 'noopener');
}
