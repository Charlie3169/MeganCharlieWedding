interface Guest {
  id: number;
  fullName: string;
  status: 'yes' | 'no' | 'undecided';
  meal: string;
  dietary: string;
}

interface RSVPFormState {
  contactName: string;
  email: string;
  phone: string;
  partyName: string;
  notes: string;
  guests: Guest[];
}

const weddingDate = new Date('2026-09-20T20:00:00Z');
const localStorageKey = 'megan-charlie-rsvp';

const defaultGuest = (): Guest => ({
  id: Date.now(),
  fullName: '',
  status: 'undecided',
  meal: 'Chef\'s choice',
  dietary: ''
});

const state: RSVPFormState = {
  contactName: '',
  email: '',
  phone: '',
  partyName: '',
  notes: '',
  guests: [defaultGuest()]
};

const countdownEl = document.getElementById('countdown');
const guestListEl = document.getElementById('guest-list');
const form = document.getElementById('rsvp-form') as HTMLFormElement | null;
const summaryEl = document.getElementById('rsvp-summary');
const addGuestBtn = document.getElementById('add-guest');
const clearBtn = document.getElementById('clear-form');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

function restoreState(): void {
  const cached = localStorage.getItem(localStorageKey);
  if (!cached) {
    renderGuestCards();
    return;
  }

  try {
    const parsed: RSVPFormState = JSON.parse(cached);
    Object.assign(state, parsed);
  } catch (error) {
    console.error('Unable to parse saved RSVP state', error);
  }

  renderGuestCards();
  if (!form) return;
  (form.elements.namedItem('contact') as HTMLInputElement).value = state.contactName;
  (form.elements.namedItem('email') as HTMLInputElement).value = state.email;
  (form.elements.namedItem('phone') as HTMLInputElement).value = state.phone;
  (form.elements.namedItem('party') as HTMLInputElement).value = state.partyName;
  (form.elements.namedItem('notes') as HTMLTextAreaElement).value = state.notes;
}

function persistState(): void {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}

function renderGuestCards(): void {
  if (!guestListEl) return;
  guestListEl.innerHTML = '';
  state.guests.forEach((guest) => {
    const card = document.createElement('div');
    card.className = 'guest-card';

    card.innerHTML = `
      <header>
        <h4>Guest</h4>
        <button type="button" data-remove="${guest.id}">Remove</button>
      </header>
      <label>
        Full name
        <input type="text" data-field="fullName" value="${guest.fullName}" data-id="${guest.id}" />
      </label>
      <label>
        Attendance
        <select data-field="status" data-id="${guest.id}">
          <option value="yes" ${guest.status === 'yes' ? 'selected' : ''}>Happily attending</option>
          <option value="no" ${guest.status === 'no' ? 'selected' : ''}>Sadly can't make it</option>
          <option value="undecided" ${guest.status === 'undecided' ? 'selected' : ''}>Need more time</option>
        </select>
      </label>
      <label>
        Meal preference
        <input type="text" data-field="meal" data-id="${guest.id}" value="${guest.meal}" />
      </label>
      <label>
        Dietary notes
        <input type="text" data-field="dietary" data-id="${guest.id}" value="${guest.dietary}" />
      </label>
    `;

    guestListEl.appendChild(card);
  });
}

function handleGuestChange(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
    return;
  }

  const id = Number(target.getAttribute('data-id'));
  const field = target.getAttribute('data-field') as keyof Guest | null;
  if (!id || !field) return;

  const guest = state.guests.find((g) => g.id === id);
  if (!guest) return;

  if (field === 'status') {
    guest.status = target.value as Guest['status'];
  } else if (field === 'fullName' || field === 'meal' || field === 'dietary') {
    guest[field] = target.value;
  }
  persistState();
}

function handleGuestRemoval(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target || !target.matches('button[data-remove]')) return;
  const id = Number(target.getAttribute('data-remove'));
  state.guests = state.guests.filter((guest) => guest.id !== id);
  if (state.guests.length === 0) state.guests.push(defaultGuest());
  renderGuestCards();
  persistState();
}

function handleAddGuest(): void {
  state.guests.push(defaultGuest());
  renderGuestCards();
  persistState();
}

function buildSummary(): string {
  const attending = state.guests.filter((guest) => guest.status === 'yes');
  const declines = state.guests.filter((guest) => guest.status === 'no');
  return `Party: ${state.partyName || 'Unnamed'}\nContact: ${state.contactName} (${state.email})\n\nAttending (${attending.length}):\n${attending
    .map((guest) => `• ${guest.fullName || 'Guest'} — ${guest.meal}`)
    .join('\n')}\n\nDeclines (${declines.length}):\n${declines.map((guest) => `• ${guest.fullName || 'Guest'}`).join('\n')}\n\nNotes: ${
    state.notes || 'None'
  }`;
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (!summaryEl || !form) return;

  state.contactName = (form.elements.namedItem('contact') as HTMLInputElement).value;
  state.email = (form.elements.namedItem('email') as HTMLInputElement).value;
  state.phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
  state.partyName = (form.elements.namedItem('party') as HTMLInputElement).value;
  state.notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value;
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

function handleReset(event: Event): void {
  event.preventDefault();
  localStorage.removeItem(localStorageKey);
  state.contactName = '';
  state.email = '';
  state.phone = '';
  state.partyName = '';
  state.notes = '';
  state.guests = [defaultGuest()];
  renderGuestCards();
  if (form) form.reset();
  if (summaryEl) summaryEl.classList.remove('visible');
}

function initCountdown(): void {
  if (!countdownEl) return;
  const spans = countdownEl.querySelectorAll('span');

  const update = (): void => {
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

function initNav(): void {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
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

function initPhotoInteractions(): void {
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

guestListEl?.addEventListener('input', handleGuestChange);
guestListEl?.addEventListener('click', handleGuestRemoval);
addGuestBtn?.addEventListener('click', handleAddGuest);
form?.addEventListener('submit', handleSubmit);
clearBtn?.addEventListener('click', handleReset);
