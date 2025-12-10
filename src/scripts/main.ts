interface RSVPFormState {
  contactName: string;
  phone: string;
  partyName: string;
  guestNames: string;
  mealPreference: 'Beef' | 'Chicken';
}

const weddingDate = new Date('2026-09-20T20:00:00Z');
const localStorageKey = 'megan-charlie-rsvp';
let hasStoredRsvp = false;

const state: RSVPFormState = {
  contactName: '',
  phone: '',
  partyName: '',
  guestNames: '',
  mealPreference: 'Beef'
};

const countdownEl = document.getElementById('countdown');
const form = document.getElementById('rsvp-form') as HTMLFormElement | null;
const summaryEl = document.getElementById('rsvp-summary');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
const envelopePrompt = document.getElementById('envelope-prompt');
const waxSealCanvas = document.getElementById('wax-seal-canvas') as HTMLCanvasElement | null;
const waxSealButton = document.getElementById('wax-seal-btn') as HTMLButtonElement | null;

function hasExistingState(data: RSVPFormState): boolean {
  return Boolean(data.contactName || data.partyName || data.guestNames || data.phone);
}

function restoreState(): void {
  const cached = localStorage.getItem(localStorageKey);
  if (cached) {
    try {
      const parsed: RSVPFormState = JSON.parse(cached);
      Object.assign(state, parsed);
      hasStoredRsvp = hasExistingState(parsed);
    } catch (error) {
      console.error('Unable to parse saved RSVP state', error);
    }
  }

  if (!form) return;
  (form.elements.namedItem('contact') as HTMLInputElement).value = state.contactName;
  (form.elements.namedItem('phone') as HTMLInputElement).value = state.phone;
  (form.elements.namedItem('party') as HTMLInputElement).value = state.partyName;
  (form.elements.namedItem('guests') as HTMLInputElement).value = state.guestNames;
  form
    .querySelectorAll<HTMLInputElement>("input[name='meal']")
    .forEach((input) => (input.checked = input.value === state.mealPreference));
}

function persistState(): void {
  localStorage.setItem(localStorageKey, JSON.stringify(state));
}

function buildSummary(): string {
  const phoneDisplay = state.phone ? ` • ${state.phone}` : '';
  return `Party: ${state.partyName || 'Unnamed'}\nGuests: ${state.guestNames || 'Not specified'}\nMeal: ${state.mealPreference}\nContact: ${
    state.contactName || 'No name provided'
  }${phoneDisplay}`;
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (!summaryEl || !form) return;

  state.contactName = (form.elements.namedItem('contact') as HTMLInputElement).value;
  state.phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
  state.partyName = (form.elements.namedItem('party') as HTMLInputElement).value;
  state.guestNames = (form.elements.namedItem('guests') as HTMLInputElement).value;
  const mealSelection = form.querySelector<HTMLInputElement>("input[name='meal']:checked");
  state.mealPreference = (mealSelection?.value as RSVPFormState['mealPreference']) || 'Beef';
  persistState();

  const summary = buildSummary();
  summaryEl.classList.add('visible');
  summaryEl.innerHTML = `
    <h3>RSVP saved!</h3>
    <p>We have stored your details locally. Click below to send the summary directly to the couple via email.</p>
    <pre>${summary}</pre>
    <a class="btn" href="mailto:weddingofmeganandcharlie@gmail.com?subject=RSVP&body=${encodeURIComponent(summary)}">Email the couple</a>
  `;
}

function setRsvpVisibility(isOpen: boolean, shouldFocus = false): void {
  if (!form) return;
  form.hidden = !isOpen;
  form.classList.toggle('is-collapsed', !isOpen);
  if (waxSealButton) {
    waxSealButton.setAttribute('aria-expanded', String(isOpen));
  }
  if (envelopePrompt) {
    envelopePrompt.classList.toggle('revealed', isOpen);
    if (!envelopePrompt.dataset.opened && isOpen) {
      envelopePrompt.textContent = 'RSVP form ready below';
      envelopePrompt.dataset.opened = 'true';
    }
  }
  if (isOpen && shouldFocus) {
    const contactInput = form.elements.namedItem('contact');
    if (contactInput instanceof HTMLInputElement) {
      contactInput.focus({ preventScroll: true });
    }
  }
}

function revealRsvpForm(shouldFocus = false): void {
  setRsvpVisibility(true, shouldFocus);
}

function collapseRsvpForm(): void {
  setRsvpVisibility(false);
}

function toggleRsvpForm(): void {
  if (!form) return;
  if (form.hidden || form.classList.contains('is-collapsed')) {
    revealRsvpForm(true);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    collapseRsvpForm();
  }
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

async function initWaxSeal(): Promise<void> {
  if (!waxSealCanvas || !waxSealButton) return;

  waxSealButton.addEventListener('click', toggleRsvpForm);

  try {
    // @ts-ignore external module loaded at runtime
    const THREE = (await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js')) as any;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas: waxSealCanvas, alpha: true, antialias: true });
    renderer.setSize(waxSealCanvas.clientWidth || 220, waxSealCanvas.clientHeight || 220);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xf7d9c4, 0.9);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const waxMaterial = new THREE.MeshStandardMaterial({ color: 0x7a2435, roughness: 0.55, metalness: 0.18 });
    const diskGeometry = new THREE.CircleGeometry(1.6, 128);
    const disk = new THREE.Mesh(diskGeometry, waxMaterial);
    disk.rotation.x = -0.5;
    disk.rotation.z = 0.35;
    scene.add(disk);

    const crestShape = new THREE.Shape();
    crestShape.absarc(0, 0, 0.55, 0, Math.PI * 2, false);
    const crestGeometry = new THREE.ExtrudeGeometry(crestShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.06, bevelSegments: 6 });
    const crestMaterial = new THREE.MeshStandardMaterial({ color: 0xf4e7d8, roughness: 0.35, metalness: 0.4 });
    const crest = new THREE.Mesh(crestGeometry, crestMaterial);
    crest.position.set(0.2, -0.2, 0.15);
    crest.rotation.x = -0.45;
    crest.rotation.z = 0.1;
    scene.add(crest);

    function animate(): void {
      crest.rotation.z += 0.006;
      disk.rotation.z += 0.003;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  } catch (error) {
    console.error('Three.js could not be loaded for the wax seal interaction.', error);
  }
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
if (hasStoredRsvp) {
  revealRsvpForm();
}
initWaxSeal();

form?.addEventListener('submit', handleSubmit);
