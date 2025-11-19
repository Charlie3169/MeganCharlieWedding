const weddingDate = new Date('2026-09-20T20:00:00Z');
const localStorageKey = 'megan-charlie-rsvp';

const state = {
  contactName: '',
  phone: '',
  partyName: '',
  guestNames: '',
  mealPreference: 'Beef'
};

const countdownEl = document.getElementById('countdown');
const form = document.getElementById('rsvp-form');
const summaryEl = document.getElementById('rsvp-summary');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

function restoreState() {
  const cached = localStorage.getItem(localStorageKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      Object.assign(state, parsed);
    } catch (error) {
      console.error('Unable to parse saved RSVP state', error);
    }
  }

  if (!form) return;
  const contactField = form.elements.namedItem('contact');
  const phoneField = form.elements.namedItem('phone');
  const partyField = form.elements.namedItem('party');
  const guestsField = form.elements.namedItem('guests');
  if (contactField instanceof HTMLInputElement) contactField.value = state.contactName;
  if (phoneField instanceof HTMLInputElement) phoneField.value = state.phone;
  if (partyField instanceof HTMLInputElement) partyField.value = state.partyName;
  if (guestsField instanceof HTMLInputElement) guestsField.value = state.guestNames;
  form.querySelectorAll("input[name='meal']").forEach((input) => {
    if (input instanceof HTMLInputElement) {
      input.checked = input.value === state.mealPreference;
    }
  });
}

function persistState() {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}

function buildSummary() {
  const phoneDisplay = state.phone ? ` • ${state.phone}` : '';
  return `Party: ${state.partyName || 'Unnamed'}\nGuests: ${state.guestNames || 'Not specified'}\nMeal: ${state.mealPreference}\nContact: ${
    state.contactName || 'No name provided'
  }${phoneDisplay}`;
}

function handleSubmit(event) {
  event.preventDefault();
  if (!summaryEl || !form) return;

  const contactField = form.elements.namedItem('contact');
  const phoneField = form.elements.namedItem('phone');
  const partyField = form.elements.namedItem('party');
  const guestsField = form.elements.namedItem('guests');
  if (contactField instanceof HTMLInputElement) state.contactName = contactField.value;
  if (phoneField instanceof HTMLInputElement) state.phone = phoneField.value;
  if (partyField instanceof HTMLInputElement) state.partyName = partyField.value;
  if (guestsField instanceof HTMLInputElement) state.guestNames = guestsField.value;
  const mealSelection = form.querySelector("input[name='meal']:checked");
  state.mealPreference = mealSelection instanceof HTMLInputElement ? mealSelection.value : 'Beef';
  persistState();

  const summary = buildSummary();
  summaryEl.classList.add('visible');
  summaryEl.innerHTML = `
    <h3>RSVP saved!</h3>
    <p>We have stored your details locally. Click below to send the summary directly to the couple via email.</p>
    <pre>${summary}</pre>
    <a class="btn" href="mailto:celebrate@meganandcharlie.com?subject=RSVP&body=${encodeURIComponent(summary)}">Email the couple</a>
  `;
}

function initCountdown() {
  if (!countdownEl) return;
  const spans = countdownEl.querySelectorAll('span');

  const update = () => {
    const now = new Date().getTime();
    const diff = weddingDate.getTime() - now;
    const totalSeconds = Math.max(diff / 1000, 0);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const values = [days, hours, minutes, seconds];
    spans.forEach((span, index) => {
      span.textContent = String(values[index] ?? 0);
    });
  };

  update();
  setInterval(update, 1000);
}

function initNav() {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = event.currentTarget.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }
      if (navMenu && navToggle) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  if (!navToggle || !navMenu) return;
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });
}

function initPhotoInteractions() {
  document.querySelectorAll('[data-photo]').forEach((figure) => {
    figure.addEventListener('click', () => {
      figure.classList.toggle('active');
    });
  });
}

restoreState();
initCountdown();
initNav();
initPhotoInteractions();

form?.addEventListener('submit', handleSubmit);
