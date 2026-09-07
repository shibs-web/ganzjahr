document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow/background once scrolled
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Gallery lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const href = item.getAttribute('href');
      const alt = item.querySelector('img')?.getAttribute('alt') || '';
      lightboxImg.setAttribute('src', href);
      lightboxImg.setAttribute('alt', alt);
      lightbox.classList.add('is-open');
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightboxImg.setAttribute('src', '');
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

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
  const service = get('service');
  const date = get('date');
  const time = get('time');
  const message = get('message');

  const formattedDate = date
    ? new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
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

  if (message) {
    lines.push('', 'Anmerkungen:', message);
  }

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
    return false;
  }
  if (!email && !phone) {
    showFormStatus('Bitte E-Mail-Adresse oder Telefonnummer angeben, damit wir Sie erreichen können.', 'error');
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
