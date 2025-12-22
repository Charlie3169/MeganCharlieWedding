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
const envelopeButton = document.getElementById('envelope-toggle') as HTMLButtonElement | null;
const envelopeCanvas = document.getElementById('envelope-canvas') as HTMLCanvasElement | null;

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
  if (envelopeButton) {
    envelopeButton.setAttribute('aria-expanded', String(isOpen));
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

async function initEnvelope(): Promise<void> {
  if (!envelopeButton || !envelopeCanvas) return;
  envelopeButton.addEventListener('click', toggleRsvpForm);

  // @ts-ignore external module loaded at runtime
  const THREE = (await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js')) as any;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ canvas: envelopeCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const resizeRenderer = (): void => {
    const { clientWidth, clientHeight } = envelopeCanvas;
    const width = clientWidth || 560;
    const height = clientHeight || 420;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resizeRenderer();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(0xf7d9c4, 1.1);
  keyLight.position.set(2.5, 3.5, 4);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-2.5, -1, 3);
  scene.add(fillLight);

  const envelopeGroup = new THREE.Group();
  scene.add(envelopeGroup);

  const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf6ead7, roughness: 0.65, metalness: 0.08 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xead8bf, roughness: 0.68, metalness: 0.08 });
  const flapMaterial = new THREE.MeshStandardMaterial({ color: 0xfff3e2, roughness: 0.6, metalness: 0.1 });
  const letterMaterial = new THREE.MeshStandardMaterial({ color: 0xfffbf3, roughness: 0.35, metalness: 0.05 });
  const sealMaterial = new THREE.MeshStandardMaterial({ color: 0x8d2f3f, roughness: 0.45, metalness: 0.22 });

  const baseGeometry = new THREE.BoxGeometry(5.4, 3.4, 0.4);
  const base = new THREE.Mesh(baseGeometry, paperMaterial);
  base.position.set(0, -0.05, 0);
  envelopeGroup.add(base);

  const frontGeometry = new THREE.PlaneGeometry(5.4, 3.4);
  const front = new THREE.Mesh(frontGeometry, accentMaterial);
  front.position.set(0, -0.05, 0.22);
  envelopeGroup.add(front);

  const frontFlapShape = new THREE.Shape();
  frontFlapShape.moveTo(-2.7, 0);
  frontFlapShape.lineTo(2.7, 0);
  frontFlapShape.lineTo(0, -1.75);
  frontFlapShape.lineTo(-2.7, 0);
  const frontFlapGeometry = new THREE.ShapeGeometry(frontFlapShape);
  const frontFlap = new THREE.Mesh(frontFlapGeometry, accentMaterial);
  frontFlap.position.set(0, 0.45, 0.23);
  envelopeGroup.add(frontFlap);

  const flapGeometry = new THREE.PlaneGeometry(5.4, 2.6);
  const flap = new THREE.Mesh(flapGeometry, flapMaterial);
  flap.position.set(0, 1.45, 0.24);
  flap.rotation.x = Math.PI * 0.02;
  flap.rotation.z = Math.PI;

  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, 1.45, 0.24);
  flap.position.set(0, -0.05, 0);
  flapPivot.add(flap);
  envelopeGroup.add(flapPivot);

  const letterGeometry = new THREE.BoxGeometry(4.1, 2.5, 0.18);
  const letter = new THREE.Mesh(letterGeometry, letterMaterial);
  letter.position.set(0, -0.4, 0.05);
  envelopeGroup.add(letter);

  const sealGeometry = new THREE.CircleGeometry(0.5, 64);
  const seal = new THREE.Mesh(sealGeometry, sealMaterial);
  seal.position.set(0, -0.05, 0.3);
  envelopeGroup.add(seal);

  envelopeGroup.rotation.x = -0.12;
  envelopeGroup.rotation.y = 0.08;

  let hoverTarget = 0;
  let hoverProgress = 0;
  let openTarget = 0;
  let openProgress = 0;

  envelopeButton.addEventListener('pointerenter', () => {
    hoverTarget = 1;
  });
  envelopeButton.addEventListener('pointerleave', () => {
    hoverTarget = 0;
  });

  const updateOpenTarget = (): void => {
    const isOpen = envelopeButton.getAttribute('aria-expanded') === 'true';
    openTarget = isOpen ? 1 : 0;
  };
  updateOpenTarget();

  const observer = new MutationObserver(updateOpenTarget);
  observer.observe(envelopeButton, { attributes: true, attributeFilter: ['aria-expanded'] });

  window.addEventListener('resize', resizeRenderer);

  const animate = (): void => {
    hoverProgress += (hoverTarget - hoverProgress) * 0.08;
    openProgress += (openTarget - openProgress) * 0.06;
    const combined = Math.min(1, openProgress + hoverProgress * 0.35);

    flapPivot.rotation.x = Math.PI * 0.02 - combined * 1.25;
    letter.position.y = -0.4 + combined * 1.2;
    seal.position.y = -0.05 + combined * 0.05;
    envelopeGroup.position.y = combined * 0.15;
    envelopeGroup.rotation.z = combined * 0.04;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
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
initEnvelope();

form?.addEventListener('submit', handleSubmit);
