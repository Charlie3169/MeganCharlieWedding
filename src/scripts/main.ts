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
const envelopeCanvas = document.getElementById('envelope-canvas') as HTMLCanvasElement | null;
const envelopeButton = document.getElementById('envelope-toggle') as HTMLButtonElement | null;

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

async function initEnvelope(): Promise<void> {
  if (!envelopeCanvas || !envelopeButton) return;

  envelopeButton.addEventListener('click', toggleRsvpForm);

  try {
    // @ts-ignore external module loaded at runtime
    const THREE = (await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js')) as any;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ canvas: envelopeCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const resizeRenderer = (): void => {
      const { clientWidth, clientHeight } = envelopeCanvas;
      const height = clientHeight || 360;
      const width = clientWidth || 520;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resizeRenderer();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xf7d9c4, 1);
    keyLight.position.set(2.5, 3, 4);
    scene.add(keyLight);

    const envelopeGroup = new THREE.Group();
    scene.add(envelopeGroup);

    const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf1dcc2, roughness: 0.7, metalness: 0.05 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xe0c29a, roughness: 0.75, metalness: 0.08 });
    const flapMaterial = new THREE.MeshStandardMaterial({ color: 0xf8ead8, roughness: 0.6, metalness: 0.1 });
    const letterMaterial = new THREE.MeshStandardMaterial({ color: 0xfdf7ef, roughness: 0.4, metalness: 0.05 });

    const baseGeometry = new THREE.BoxGeometry(4.4, 2.6, 0.2);
    const base = new THREE.Mesh(baseGeometry, paperMaterial);
    base.position.set(0, -0.2, 0);
    envelopeGroup.add(base);

    const frontGeometry = new THREE.PlaneGeometry(4.4, 2.6);
    const front = new THREE.Mesh(frontGeometry, accentMaterial);
    front.position.set(0, -0.2, 0.12);
    envelopeGroup.add(front);

    const sideGeometry = new THREE.PlaneGeometry(2.2, 2.6);
    const leftSide = new THREE.Mesh(sideGeometry, accentMaterial);
    leftSide.position.set(-1.1, -0.2, 0.11);
    leftSide.rotation.y = Math.PI * 0.5;
    envelopeGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeometry, accentMaterial);
    rightSide.position.set(1.1, -0.2, 0.11);
    rightSide.rotation.y = -Math.PI * 0.5;
    envelopeGroup.add(rightSide);

    const flapGeometry = new THREE.PlaneGeometry(4.4, 2.2);
    const flap = new THREE.Mesh(flapGeometry, flapMaterial);
    flap.position.set(0, 1.1, 0.11);
    flap.rotation.x = Math.PI * 0.05;
    flap.rotation.z = Math.PI;
    envelopeGroup.add(flap);

    const letterGeometry = new THREE.PlaneGeometry(3.6, 2.2);
    const letter = new THREE.Mesh(letterGeometry, letterMaterial);
    letter.position.set(0, -0.1, 0.15);
    envelopeGroup.add(letter);

    envelopeGroup.rotation.x = -0.2;
    envelopeGroup.rotation.y = 0.15;

    let hoverTarget = 0;
    let hoverProgress = 0;

    envelopeButton.addEventListener('pointerenter', () => {
      hoverTarget = 1;
    });
    envelopeButton.addEventListener('pointerleave', () => {
      hoverTarget = 0;
    });

    window.addEventListener('resize', resizeRenderer);

    function animate(): void {
      hoverProgress += (hoverTarget - hoverProgress) * 0.08;
      flap.rotation.x = Math.PI * 0.05 - hoverProgress * 1.1;
      letter.position.y = -0.1 + hoverProgress * 0.9;
      envelopeGroup.position.y = hoverProgress * 0.2;
      envelopeGroup.rotation.z = hoverProgress * 0.05;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  } catch (error) {
    console.error('Three.js could not be loaded for the envelope interaction.', error);
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
initEnvelope();

form?.addEventListener('submit', handleSubmit);
