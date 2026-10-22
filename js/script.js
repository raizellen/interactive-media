const D = 3;                            // distance between frames along the hall
const W = 3.6, H = 3.2;                 // hall width and height
const S = 1.8;                          // art size
const N = PROJECTS.length, L = N * D;   // one full loop

// earthy palette: terracotta, ochre, olive, clay, sage, umber
const EARTH = [0xb5573a, 0xcf9f4a, 0x7b7d47, 0xc58a72, 0x9ba58a, 0x6b4a38];
const FRAME_FINISH = [0x2b2420, 0xb98f5d, 0x4a3426, 0x7b7d47];
const css = c => '#' + c.toString(16).padStart(6, '0');
const AIR = 0xd2c6b3;        // light haze the far end of the hall fades into

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.prepend(renderer.domElement);

const FOG_FAR = 22;
const scene = new THREE.Scene();
scene.background = new THREE.Color(AIR);
scene.fog = new THREE.Fog(AIR, 4, FOG_FAR);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 100);
camera.rotation.order = 'YXZ';
scene.add(new THREE.HemisphereLight(0xfff6e6, 0xb59a7c, 1.0));
const lamp = new THREE.PointLight(0xffe8c8, 0.8, 12);
scene.add(lamp);

/* ---------- helpers ---------- */
const std = (c, r = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
const basic = c => new THREE.MeshBasicMaterial({ color: c });
function mesh(geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }
function tex(canvas, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); }
  return t;
}
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// limewash plaster: warm base with soft earthy clouds, drawn wrapped so the tile repeats cleanly
function plasterTexture() {
  const S = 512, c = canvas(S, S), x = c.getContext('2d');
  x.fillStyle = '#e4d9c6'; x.fillRect(0, 0, S, S);
  const tints = ['181,87,58', '207,159,74', '123,125,71', '255,255,255', '120,90,60'];
  for (let k = 0; k < 60; k++) {
    const cx = Math.random() * S, cy = Math.random() * S, r = 50 + Math.random() * 130;
    const t = tints[k % tints.length], a = 0.05 + Math.random() * 0.07;
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
      const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, r);
      g.addColorStop(0, `rgba(${t},${a})`); g.addColorStop(1, `rgba(${t},0)`);
      x.fillStyle = g; x.fillRect(0, 0, S, S);
    }
  }
  return tex(c, Math.round(L / 3.2), 1);
}

// warm oak planks running down the hall
function floorTexture() {
  const S = 512, planks = 6, pw = S / planks, c = canvas(S, S), x = c.getContext('2d');
  for (let p = 0; p < planks; p++) {
    x.fillStyle = `hsl(${27 + Math.random() * 6},${34 + Math.random() * 8}%,${38 + Math.random() * 10}%)`;
    x.fillRect(p * pw, 0, pw, S);
    for (let k = 0; k < 30; k++) {
      const gx = p * pw + Math.random() * pw;
      x.strokeStyle = `rgba(60,35,15,${0.04 + Math.random() * 0.06})`; x.lineWidth = 1;
      x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx + (Math.random() - 0.5) * 6, S); x.stroke();
    }
    x.fillStyle = 'rgba(40,25,12,.45)'; x.fillRect(p * pw, Math.random() * S, pw, 2);   // end joint
    x.fillStyle = 'rgba(40,25,12,.35)'; x.fillRect(p * pw, 0, 2, S);                    // seam
  }
  return tex(c, 1, Math.round(L / 3.6));
}

// striped runner rug, symmetrical: terracotta, olive and ochre with cream pinstripes
function rugTexture() {
  const c = canvas(128, 8), x = c.getContext('2d');
  const bands = [[0xb5573a, 14], [0xf1e8d6, 4], [0x7b7d47, 16], [0xf1e8d6, 4], [0xcf9f4a, 52],
                 [0xf1e8d6, 4], [0x7b7d47, 16], [0xf1e8d6, 4], [0xb5573a, 14]];
  let px = 0;
  for (const [col, w] of bands) { x.fillStyle = css(col); x.fillRect(px, 0, w, 8); px += w; }
  return tex(c);
}

// stand-in picture shown until a live sketch is running
function placeholderTexture(p, i) {
  const c = canvas(800, 600), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 800, 600);
  g.addColorStop(0, css(EARTH[i % EARTH.length])); g.addColorStop(1, css(EARTH[(i + 2) % EARTH.length]));
  x.fillStyle = g; x.fillRect(0, 0, 800, 600);
  for (let k = 0; k < 14; k++) {
    x.beginPath(); x.arc((k * 173 + i * 91) % 800, (k * 97 + i * 53) % 600, 30 + (k * 37) % 90, 0, 7);
    x.fillStyle = 'rgba(255,248,230,.13)'; x.fill();
  }
  x.fillStyle = '#fbf6ea'; x.textAlign = 'center';
  x.font = '600 50px Helvetica, Arial, sans-serif'; x.fillText(p.title, 400, 310);
  return tex(c);
}

// small wall label that sits beside each frame
function labelTexture(p, i) {
  const c = canvas(256, 128), x = c.getContext('2d');
  x.fillStyle = '#f6f1e7'; x.fillRect(0, 0, 256, 128);
  x.fillStyle = css(EARTH[i % EARTH.length]); x.fillRect(16, 22, 10, 10);
  x.fillStyle = '#2b2420'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  x.font = '600 24px Helvetica, Arial, sans-serif'; x.fillText(p.title, 16, 70);
  x.fillStyle = '#7a6a5a'; x.font = '18px Helvetica, Arial, sans-serif'; x.fillText('p5.js sketch', 16, 100);
  return tex(c);
}

function glowTexture(rgb, alpha) {       // soft radial pool of light / shadow
  const c = canvas(256, 256), x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, `rgba(${rgb},${alpha})`); g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return tex(c);
}

/* ---------- one segment of hallway (repeated to make the loop) ---------- */
const placeholders = PROJECTS.map(placeholderTexture);
const artMats = PROJECTS.map((p, i) => new THREE.MeshBasicMaterial({ map: placeholders[i] }));
const wallMat = new THREE.MeshStandardMaterial({ map: plasterTexture(), roughness: 1 });
const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.5 });
const rugMat = new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 });
const glowMat = new THREE.MeshBasicMaterial({ map: glowTexture('255,226,176', 0.55), transparent: true,
  blending: THREE.AdditiveBlending, depthWrite: false });
const shadowMat = new THREE.MeshBasicMaterial({ map: glowTexture('40,25,15', 0.5), transparent: true, depthWrite: false });

const seg = new THREE.Group();
const floor = mesh(new THREE.PlaneGeometry(W, L), floorMat, 0, 0, -L / 2);
floor.rotation.x = -Math.PI / 2; seg.add(floor);
const rug = mesh(new THREE.PlaneGeometry(1.3, L), rugMat, 0, 0.006, -L / 2);
rug.rotation.x = -Math.PI / 2; seg.add(rug);
const ceil = mesh(new THREE.PlaneGeometry(W, L), std(0xf1ebe0), 0, H, -L / 2);
ceil.rotation.x = Math.PI / 2; seg.add(ceil);
for (const s of [-1, 1]) {
  const wall = mesh(new THREE.PlaneGeometry(L, H), wallMat, s * W / 2, H / 2, -L / 2);
  wall.rotation.y = -s * Math.PI / 2; seg.add(wall);
  seg.add(mesh(new THREE.BoxGeometry(0.06, 0.14, L), std(0x4a3426), s * (W / 2 - 0.03), 0.07, -L / 2));   // baseboard
  seg.add(mesh(new THREE.BoxGeometry(0.05, 0.04, L), std(0x2b2420), s * 0.5, H - 0.02, -L / 2));           // light track
}

const frameGeo = new THREE.BoxGeometry(S + 0.1, S + 0.1, 0.06), artGeo = new THREE.PlaneGeometry(S, S);
const glowGeo = new THREE.PlaneGeometry(S + 2.4, S + 2.0), shadowGeo = new THREE.PlaneGeometry(S + 0.8, S + 0.8);
const labelGeo = new THREE.PlaneGeometry(0.6, 0.3);
const lampGeo = new THREE.CylinderGeometry(0.055, 0.07, 0.22, 16);
const plinthGeo = new THREE.BoxGeometry(0.6, 0.75, 0.6), plinthMat = std(0xece4d6, 0.9);
const vaseGeo = new THREE.LatheGeometry([[0.001, 0], [0.1, 0], [0.16, 0.1], [0.18, 0.2], [0.12, 0.32], [0.07, 0.38], [0.09, 0.44]]
  .map(([r, y]) => new THREE.Vector2(r, y)), 24);
const ballGeo = new THREE.SphereGeometry(0.2, 24, 16), ringGeo = new THREE.TorusGeometry(0.17, 0.06, 14, 32);

PROJECTS.forEach((p, i) => {
  const z = -(i * D + D / 2), side = i % 2 === 0 ? -1 : 1;
  const g = new THREE.Group();
  g.position.set(side * (W / 2 - 0.02), 1.6, z);
  g.rotation.y = -side * Math.PI / 2;
  g.add(mesh(glowGeo, glowMat, 0, 0, 0.004));
  g.add(mesh(shadowGeo, shadowMat, 0, -0.06, 0.008));
  g.add(mesh(frameGeo, std(FRAME_FINISH[i % FRAME_FINISH.length], 0.5), 0, 0, 0.04));
  const art = mesh(artGeo, artMats[i], 0, 0, 0.072);
  art.userData = { art: true, i }; g.add(art);
  // wall label just ahead of the frame, at about eye-level of a standing viewer's hip
  g.add(mesh(labelGeo, new THREE.MeshBasicMaterial({ map: labelTexture(p, i) }), -side * (S / 2 + 0.55), -S / 2 + 0.15, 0.012));
  seg.add(g);

  // spotlight hanging from the track, aimed at the frame
  const lampMesh = mesh(lampGeo, std(0x2b2420, 0.4), side * 0.5, H - 0.16, z);
  lampMesh.rotation.z = side * 0.7; seg.add(lampMesh);

  // plinth with a small sculpture on the opposite wall
  const px = -side * (W / 2 - 0.4);
  seg.add(mesh(plinthGeo, plinthMat, px, 0.375, z));
  const glaze = std(EARTH[(i + 1) % EARTH.length], 0.45);
  const kind = i % 3;
  if (kind === 0) { glaze.side = THREE.DoubleSide; seg.add(mesh(vaseGeo, glaze, px, 0.75, z)); }
  else if (kind === 1) seg.add(mesh(ballGeo, glaze, px, 0.95, z));
  else { const r = mesh(ringGeo, glaze, px, 0.95, z); r.rotation.y = Math.PI / 2; seg.add(r); }
});

// enough copies end to end that the far end is always lost in the haze, so the wrap-around is invisible
const K = Math.ceil(FOG_FAR / L);
for (let k = -K; k <= K; k++) {
  const c = k === 0 ? seg : seg.clone();
  c.position.z = -k * L; scene.add(c);
}
const arts = [];
scene.traverse(o => { if (o.userData && o.userData.art) arts.push(o); });

/* ---------- live p5 sketches: load the nearby ones in hidden iframes and use their canvas as the picture ---------- */
const live = PROJECTS.map(() => ({ iframe: null, tex: null, canvas: null, cw: 0, ch: 0, failed: false }));

function startLive(i) {
  const f = document.createElement('iframe');
  f.src = BASE + PROJECTS[i].folder + '/index.html';
  f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
  f.style.cssText = 'position:fixed;left:0;top:0;width:800px;height:600px;border:0;opacity:0;pointer-events:none;z-index:-1';
  document.body.appendChild(f);
  live[i].iframe = f;
}
function stopLive(i) {
  const s = live[i];
  if (s.iframe) s.iframe.remove();
  if (s.tex) s.tex.dispose();
  Object.assign(s, { iframe: null, tex: null, canvas: null, cw: 0, ch: 0 });
  artMats[i].map = placeholders[i]; artMats[i].needsUpdate = true;
}
function tryBind(i) {
  const s = live[i];
  try {
    const doc = s.iframe.contentDocument;
    const c = doc && doc.querySelector('canvas');
    if (!c || !c.width) return;
    s.canvas = c;
    s.tex = new THREE.CanvasTexture(c);
    s.tex.encoding = THREE.sRGBEncoding; s.tex.minFilter = THREE.LinearFilter; s.tex.generateMipmaps = false;
    try { s.iframe.contentWindow.outputVolume(0); } catch (e) { /* sketch has no p5.sound */ }
    artMats[i].map = s.tex; artMats[i].needsUpdate = true;
  } catch (e) {
    console.warn('Could not read the sketch. Serve this page over http(s) instead of opening it as a file.', e);
    s.failed = true; stopLive(i);
  }
}
function fitLive(i) {            // crop the sketch to the frame's 4:3 shape
  const s = live[i], c = s.canvas;
  if (!c.width || !c.height || (s.cw === c.width && s.ch === c.height)) return;
  s.cw = c.width; s.ch = c.height;
  const a = c.width / c.height, f = S;
  const rx = a > f ? f / a : 1, ry = a > f ? 1 : a / f;
  s.tex.repeat.set(rx, ry); s.tex.offset.set((1 - rx) / 2, (1 - ry) / 2);
}

/* ---------- movement: forward only ---------- */
let yaw = 0, pitch = 0, pz = -1, vz = 0, auto = false;
const keys = {}, hold = { f: 0 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
addEventListener('keydown', e => {
  if (e.code === 'Space') { auto = !auto; e.preventDefault(); }
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('wheel', e => { if (e.deltaY > 0) pz -= e.deltaY * 0.01; }, { passive: true });

let drag = null;
const cv = renderer.domElement;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  yaw -= dx * 0.005; pitch = clamp(pitch - dy * 0.004, -1, 1);
  drag.x = e.clientX; drag.y = e.clientY;
});
const ray = new THREE.Raycaster();
cv.addEventListener('pointerup', e => {
  const wasClick = drag && drag.moved < 6; drag = null;
  if (!wasClick) return;
  ray.setFromCamera({ x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 }, camera);
  const hit = ray.intersectObjects(arts, false)[0];
  if (hit) window.open(BASE + PROJECTS[hit.object.userData.i].folder + '/index.html', '_blank', 'noopener');
});

/* ---------- caption for the nearest frame ---------- */
const label = document.getElementById('label');
const slotDist = i => { let d = pz + (i * D + D / 2); return d - Math.round(d / L) * L; };  // + means the frame is ahead
let shown = -2;
function updateLabel() {
  let best = -1, bd = 1e9;
  for (let i = 0; i < N; i++) { const d = Math.abs(slotDist(i)); if (d < bd) { bd = d; best = i; } }
  const idx = bd < D * 0.6 ? best : -1;
  if (idx === shown) return;
  shown = idx;
  if (idx < 0) { label.classList.remove('on'); return; }
  const p = PROJECTS[idx];
  label.querySelector('h2').textContent = p.title;
  label.querySelector('p').textContent = p.desc;
  label.classList.add('on');
}

/* ---------- loop ---------- */
let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const go = keys.KeyW || keys.ArrowUp || hold.f;
  const target = go ? -3.0 : auto ? -1.4 : 0;
  vz += (target - vz) * Math.min(1, dt * 5);
  pz += vz * dt;
  if (pz < -L) pz += L;            // walk off the end, arrive back at the start
  camera.position.set(0, 1.55, pz);
  camera.rotation.set(pitch, yaw, 0);
  lamp.position.set(0, 2.6, pz);

  PROJECTS.forEach((p, i) => {
    const s = live[i], d = slotDist(i);
    const near = d > -D * 1.5 && d < D * 3.5, far = d < -D * 2.5 || d > D * 5;
    if (!s.iframe && !s.failed && near) startLive(i);
    else if (s.iframe && far) stopLive(i);
    if (s.iframe && !s.tex && !s.failed) tryBind(i);
    if (s.tex) { fitLive(i); s.tex.needsUpdate = true; }
  });

  updateLabel();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
requestAnimationFrame(tick);