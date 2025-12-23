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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(0xfdf1df, 1.2);
  keyLight.position.set(2.5, 3.5, 4);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-2.5, -1, 3);
  scene.add(fillLight);

  const envelopeGroup = new THREE.Group();
  scene.add(envelopeGroup);

  const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf9f0e2, roughness: 0.55, metalness: 0.08 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xefe1cd, roughness: 0.6, metalness: 0.08 });
  const foldMaterial = new THREE.MeshStandardMaterial({ color: 0xe8d7c1, roughness: 0.62, metalness: 0.06 });
  const flapMaterial = new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.52, metalness: 0.1 });
  const letterMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.05 });
  const sealMaterial = new THREE.MeshStandardMaterial({ color: 0x932f43, roughness: 0.4, metalness: 0.25 });

  const backGeometry = new THREE.BoxGeometry(5.4, 3.4, 0.2);
  const back = new THREE.Mesh(backGeometry, paperMaterial);
  back.position.set(0, -0.05, 0);
  envelopeGroup.add(back);

  const letterGeometry = new THREE.BoxGeometry(4.15, 2.05, 0.14);
  const letter = new THREE.Mesh(letterGeometry, letterMaterial);
  letter.position.set(0, -0.15, 0.14);
  envelopeGroup.add(letter);

  const frontShape = new THREE.Shape();
  frontShape.moveTo(-2.7, 1.7);
  frontShape.lineTo(2.7, 1.7);
  frontShape.lineTo(2.7, -1.7);
  frontShape.lineTo(-2.7, -1.7);
  frontShape.lineTo(-2.7, 1.7);

  const cutoutPath = new THREE.Path();
  cutoutPath.moveTo(-2.7, 0.95);
  cutoutPath.lineTo(2.7, 0.95);
  cutoutPath.lineTo(0, -1.2);
  cutoutPath.lineTo(-2.7, 0.95);
  frontShape.holes.push(cutoutPath);

  const frontGeometry = new THREE.ShapeGeometry(frontShape);
  const front = new THREE.Mesh(frontGeometry, accentMaterial);
  front.position.set(0, -0.05, 0.22);
  envelopeGroup.add(front);

  const openingShape = new THREE.Shape();
  openingShape.moveTo(-2.2, 0.7);
  openingShape.lineTo(2.2, 0.7);
  openingShape.lineTo(0, -0.8);
  openingShape.lineTo(-2.2, 0.7);
  const openingGeometry = new THREE.ShapeGeometry(openingShape);
  const opening = new THREE.Mesh(openingGeometry, foldMaterial);
  opening.position.set(0, -0.05, 0.2);
  envelopeGroup.add(opening);

  const topFlapShape = new THREE.Shape();
  topFlapShape.moveTo(-2.7, 0);
  topFlapShape.lineTo(2.7, 0);
  topFlapShape.lineTo(0, -2.15);
  topFlapShape.lineTo(-2.7, 0);
  const topFlapGeometry = new THREE.ExtrudeGeometry(topFlapShape, {
    depth: 0.08,
    bevelEnabled: false
  });
  const flap = new THREE.Mesh(topFlapGeometry, flapMaterial);
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, 1.55, 0.24);
  flap.position.set(0, 0, -0.04);
  flapPivot.add(flap);
  envelopeGroup.add(flapPivot);

  const sealGroup = new THREE.Group();
  const sealGeometry = new THREE.CircleGeometry(0.5, 64);
  const seal = new THREE.Mesh(sealGeometry, sealMaterial);
  seal.position.set(0, 0, 0.08);
  sealGroup.add(seal);

  const sealInnerGeometry = new THREE.CircleGeometry(0.28, 48);
  const sealInner = new THREE.Mesh(
    sealInnerGeometry,
    new THREE.MeshStandardMaterial({ color: 0xb14b5d, roughness: 0.35, metalness: 0.2 })
  );
  sealInner.position.set(0, 0, 0.1);
  sealGroup.add(sealInner);

  const sealRingGeometry = new THREE.TorusGeometry(0.34, 0.04, 32, 72);
  const sealRing = new THREE.Mesh(
    sealRingGeometry,
    new THREE.MeshStandardMaterial({ color: 0x6e1f30, roughness: 0.4, metalness: 0.3 })
  );
  sealRing.position.set(0, 0, 0.11);
  sealGroup.add(sealRing);

  sealGroup.position.set(0, -1.85, 0.01);
  flapPivot.add(sealGroup);

  envelopeGroup.rotation.x = -0.01;
  envelopeGroup.rotation.y = 0;

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

    const hoverLift = Math.max(0, hoverProgress - 0.25) / 0.75;
    const letterLift = Math.max(0, openProgress - 0.18) / 0.82;
    const baseFlapAngle = Math.PI * 0.08;
    flapPivot.rotation.x = -(baseFlapAngle + combined * (Math.PI - baseFlapAngle));
    letter.position.y = -0.15 + hoverLift * 0.18 + letterLift * 1.05;
    envelopeGroup.position.y = -0.08 + combined * 0.04;

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
