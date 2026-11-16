// The living garden behind every page: butterflies that wander and land on
// flowers, a bee visiting blossoms, a ladybug walking along the grass, and
// grass, flowers, a tree and a kite all moving with one shared breeze.
//
// It draws straight into an <svg> with plain DOM calls and one
// requestAnimationFrame loop, rather than through React state, so 60
// updates a second never re-render any React components.
//
// Two layouts:
//   - full (laptops and wider): a flower bed on the left edge and a tree
//     with a kite on the right edge, at the bottom of the window.
//   - compact (phones and tablets): just one butterfly drifting about, so
//     small screens never feel busy.
//
// Everything is drawn in a 1200 x 560 "design" space. The left group sits
// at the left edge of the window and the right group is shifted so its
// right edge (x = 1200) lines up with the right edge of the window.

const NS = 'http://www.w3.org/2000/svg'
const HEIGHT = 560
const GROUND = 532
const C = {
  leaf: '#7CC59A', leafL: '#A8DBB9', mid: '#5FAE80', ink: '#16301F', sun: '#FFC94A',
  orange: '#E0703F', sky: '#9CCBF2', lilac: '#C9B6F5', rose: '#FF8FA3', bark: '#A87440',
  wingEdge: '#24402E',
}

// Real butterfly anatomy, seen from above, drawn for the right side (the
// left side is the same shape mirrored): a long pointed forewing, a rounder
// hindwing with a wavy edge, a dark border with small white spots, and veins.
const FORE = 'M2 -6 C 8 -16, 22 -27, 38 -31 C 43 -32, 46 -29, 45 -25 C 43 -17, 39 -9, 33 -3 C 25 1, 13 0, 2 -2 Z'
const FORE_IN = 'M4 -6 C 9 -14, 21 -23, 34 -27 C 37 -27, 39 -25, 38 -22 C 36 -15, 33 -9, 28 -5 C 21 -2, 12 -2, 4 -3 Z'
const HIND = 'M2 0 C 12 -2, 25 1, 31 8 C 34 12, 33 15, 31 17 C 31 21, 28 24, 25 25 C 22 29, 18 29, 15 27 C 11 27, 8 24, 6 20 C 3 14, 2 7, 2 0 Z'
const HIND_IN = 'M4 1 C 12 0, 22 3, 27 9 C 29 12, 28 15, 26 17 C 25 20, 23 22, 20 22 C 17 24, 14 24, 12 22 C 9 21, 7 18, 6 15 C 4 10, 4 5, 4 1 Z'
const VEINS = 'M3 -4 L36 -27 M3 -4 L40 -18 M3 -3 L33 -6 M10 -10 L22 -22 M3 1 L28 9 M3 2 L24 21 M3 2 L13 25'
const SPOTS = [[42, -26], [41, -19], [38, -12], [34, -6], [30, 12], [29, 19], [23, 25], [16, 26]]

const rnd = (a, b) => a + Math.random() * (b - a)

export function startLivingGarden(svg, { compact = false } = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function el(tag, attrs = {}, parent = svg) {
    const e = document.createElementNS(NS, tag)
    for (const k in attrs) e.setAttribute(k, attrs[k])
    parent.appendChild(e)
    return e
  }

  svg.replaceChildren()

  // ---------- colours ----------
  const defs = el('defs')
  function radial(id, stops) {
    const g = el('radialGradient', { id, cx: 0.15, cy: 0.5, r: 0.95 }, defs)
    stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g))
  }
  function linear(id, stops) {
    const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }, defs)
    stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g))
  }
  // Wing colours blended from Jumble's palette.
  radial('lg-butter', [[0, '#FFF1B8'], [0.45, '#FFD66B'], [1, '#FFA77A']])
  radial('lg-mint', [[0, '#E3F6EA'], [0.5, '#A8DBB9'], [1, '#5FAE80']])
  radial('lg-rose', [[0, '#FFE3EC'], [0.5, '#F7A8C1'], [1, '#B59BEB']])
  linear('lg-kite', [[0, '#FFD66B'], [1, '#FFB38A']])

  const left = el('g')
  const right = el('g')

  function layout() {
    const width = Math.max(1, window.innerWidth)
    svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`)
    // On narrower laptops there is less room beside the page content, so
    // the garden is drawn a little smaller, still sitting on the bottom edge.
    const s = compact || width >= 1700 ? 1 : width >= 1440 ? 0.85 : 0.74
    const lift = HEIGHT * (1 - s)
    left.setAttribute('transform', `translate(0 ${lift}) scale(${s})`)
    right.setAttribute('transform', `translate(${width - 1200 * s} ${lift}) scale(${s})`)
    return width
  }
  let viewWidth = layout()

  // ---------- wind: one breeze for everything ----------
  function wind(t) {
    const gust = Math.pow(Math.max(0, Math.sin(t * 0.21 + 0.6)), 10) * 1.1
    return 0.35 + 0.22 * Math.sin(t * 0.55) + 0.14 * Math.sin(t * 1.6 + 1.3) + gust
  }

  const flowers = []
  const blades = []
  const clusters = []
  const leaves = []
  let tree = null
  let kite = null
  let bug = null
  let bee = null

  if (!compact) {
    // hills
    el('path', { d: `M0 ${GROUND - 20} C 120 ${GROUND - 46}, 220 ${GROUND - 30}, 300 ${GROUND - 12} V${HEIGHT} H0 Z`, fill: C.leafL }, left)
    el('path', { d: `M900 ${GROUND - 14} C 980 ${GROUND - 40}, 1100 ${GROUND - 48}, 1200 ${GROUND - 26} V${HEIGHT} H900 Z`, fill: C.leafL }, right)

    // ---------- kite (behind the tree) ----------
    kite = {
      string: el('path', { fill: 'none', stroke: '#93AE9B', 'stroke-width': 1.4 }, right),
      tail: el('path', { fill: 'none', stroke: '#93AE9B', 'stroke-width': 1.4 }, right),
      bows: [C.sky, C.sun, C.rose, C.lilac].map((c) => el('path', { d: 'M-7 -5 L7 5 L7 -5 L-7 5 Z', fill: c }, right)),
      body: el('g', {}, right),
      points: Array.from({ length: 12 }, () => ({ x: 980, y: 200 })),
    }
    el('path', { d: 'M0 -42 L30 0 L0 52 L-30 0 Z', fill: 'url(#lg-kite)' }, kite.body)
    el('path', { d: 'M0 -42 L-30 0 L0 0 Z', fill: C.orange, opacity: 0.85 }, kite.body)
    el('path', { d: 'M0 0 L30 0 L0 52 Z', fill: '#FFFFFF', opacity: 0.35 }, kite.body)
    el('path', { d: 'M0 -42 L0 52 M-30 0 L30 0', stroke: '#FFFFFF', 'stroke-width': 2 }, kite.body)

    // ---------- tree: tapered trunk, forked branches, leafy clumps ----------
    tree = el('g', { transform: 'translate(1085 360)' }, right)
    let seed = 7
    const seeded = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    el('path', { d: 'M-30 174 C -18 168, -14 156, -12 130 C -10 100, -9 70, -7 40 L 7 40 C 9 70, 10 100, 12 130 C 14 156, 18 168, 30 174 Z', fill: C.bark }, tree)
    el('path', { d: 'M2 40 L 7 40 C 9 70, 10 100, 12 130 C 14 156, 18 168, 30 174 L 6 174 C 6 140, 4 90, 2 40 Z', fill: '#8A5E34', opacity: 0.45 }, tree)
    el('path', { d: 'M-4 160 C -3 130, -4 100, -2 70 M5 150 C 6 120, 5 95, 4 75', stroke: '#7A5230', 'stroke-width': 1.4, fill: 'none', opacity: 0.5, 'stroke-linecap': 'round' }, tree)
    ;[
      ['M-4 60 C -20 30, -40 10, -62 -6', 9], ['M4 55 C 22 30, 40 12, 60 -2', 9], ['M0 45 C 2 10, -2 -20, 0 -48', 8],
      ['M-34 18 C -50 14, -66 16, -84 22', 5], ['M36 16 C 52 10, 70 12, 86 20', 5],
      ['M-2 -10 C 14 -26, 26 -38, 36 -54', 5], ['M0 -18 C -14 -30, -24 -44, -34 -58', 5],
    ].forEach(([d, w]) => el('path', { d, stroke: C.bark, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' }, tree))
    ;[[-90, 20, 26], [92, 20, 26], [-66, -12, 40], [64, -8, 42], [0, -10, 30], [-38, -62, 34], [38, -62, 34], [0, -60, 44]].forEach(([x, y, r], i) => {
      const g = el('g', {}, tree)
      const blobs = Array.from({ length: 7 }, () => {
        const a = seeded() * Math.PI * 2
        const d = seeded() * r * 0.5
        return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.8, r: r * (0.42 + seeded() * 0.2) }
      })
      blobs.forEach((o) => el('circle', { cx: o.x + 3, cy: o.y + 6, r: o.r, fill: '#4E9A69' }, g))
      blobs.forEach((o) => el('circle', { cx: o.x, cy: o.y, r: o.r * 0.9, fill: C.mid }, g))
      blobs.slice(0, 4).forEach((o) => el('circle', { cx: o.x - r * 0.18, cy: o.y - r * 0.2, r: o.r * 0.62, fill: C.leaf }, g))
      el('circle', { cx: x - r * 0.35, cy: y - r * 0.42, r: r * 0.2, fill: C.leafL, opacity: 0.8 }, g)
      if (i === 2 || i === 3 || i === 7) el('circle', { cx: x + r * 0.2, cy: y + r * 0.25, r: 4.5, fill: '#FF8A7A' }, g)
      clusters.push({ g, x, y, phase: i * 0.4 })
    })

    // ---------- flowers ----------
    const sunflower = (parent, x, y, s) => {
      const g = el('g', {}, parent)
      el('path', { d: `M0 0 V${GROUND - y}`, stroke: '#4E9A69', 'stroke-width': 5, 'stroke-linecap': 'round' }, g)
      el('path', { d: 'M0 90 C -26 80, -36 60, -30 50 C -12 54, -2 70, 0 90 Z', fill: C.leaf }, g)
      el('path', { d: 'M0 130 C 24 120, 34 104, 30 92 C 12 96, 2 112, 0 130 Z', fill: C.leaf }, g)
      for (let a = 0; a < 360; a += 30) el('ellipse', { cx: 0, cy: -17, rx: 6, ry: 11, fill: C.sun, transform: `rotate(${a})` }, g)
      el('circle', { r: 12, fill: '#8A5A2B' }, g)
      el('circle', { r: 5, cx: -3, cy: -3, fill: '#A87440' }, g)
      flowers.push({ g, x, y, s, top: y - 22 * s, stiff: 1, side: parent })
    }
    const tulip = (parent, x, y, c, s) => {
      const g = el('g', {}, parent)
      el('path', { d: `M0 0 V${(GROUND - y) / s}`, stroke: '#4E9A69', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g)
      el('path', { d: 'M0 44 C -14 38, -18 26, -14 20 C -6 24, -1 34, 0 44 Z', fill: C.leafL }, g)
      el('path', { d: 'M-11 -2 L-11 -16 L-4 -9 L0 -18 L4 -9 L11 -16 L11 -2 C 11 8, -11 8, -11 -2 Z', fill: c }, g)
      flowers.push({ g, x, y, s, top: y - 16 * s, stiff: 1.6, side: parent })
    }
    sunflower(left, 95, 330, 1)
    tulip(left, 170, 452, C.rose, 1)
    tulip(left, 40, 462, C.sky, 0.9)
    tulip(left, 240, 470, C.lilac, 0.85)
    tulip(right, 950, 466, C.sun, 0.9)
    tulip(right, 1010, 480, C.rose, 0.8)

    // ---------- grass ----------
    const grassRow = (parent, x0, x1) => {
      for (let x = x0; x < x1; x += 7) {
        blades.push({ x, h: rnd(14, 30), p: el('path', { fill: Math.random() < 0.5 ? C.leaf : C.mid }, parent), seed: Math.random() * 6 })
      }
    }
    grassRow(left, 0, 300)
    grassRow(right, 900, 1200)

    // ---------- ladybug ----------
    bug = { x: 230, dir: -1, pause: 0, step: 0, g: el('g', {}, left), legs: [] }
    for (let i = 0; i < 3; i++) {
      for (const side of [-1, 1]) {
        bug.legs.push({ l: el('path', { stroke: C.ink, 'stroke-width': 1.6, 'stroke-linecap': 'round', fill: 'none' }, bug.g), i, side })
      }
    }
    el('ellipse', { rx: 12, ry: 9.5, fill: '#E5484D' }, bug.g)
    el('path', { d: 'M0 -9.5 V9.5', stroke: '#3A1F1F', 'stroke-width': 1.4 }, bug.g)
    el('circle', { cx: -13, cy: 0, r: 5.5, fill: '#3A1F1F' }, bug.g)
    ;[[-5, -4, 2.2], [5, 3, 2.2], [-5, 4, 1.8], [5, -4, 1.8]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#3A1F1F' }, bug.g))
    el('circle', { cx: -15, cy: -2, r: 1.2, fill: '#FFFFFF' }, bug.g)

    // ---------- bee ----------
    bee = { x: 120, y: 360, tx: 120, ty: 360, hover: 0, g: el('g', {}, left) }
    bee.wings = el('g', { opacity: 0.75 })
    el('ellipse', { cx: -3, cy: -8, rx: 5, ry: 7, fill: '#FFFFFF', stroke: '#C8D8EC' }, bee.wings)
    el('ellipse', { cx: 4, cy: -8, rx: 5, ry: 7, fill: '#FFFFFF', stroke: '#C8D8EC' }, bee.wings)
    el('ellipse', { rx: 9, ry: 6.5, fill: C.sun }, bee.g)
    el('path', { d: 'M-3 -6 V6 M3 -6 V6', stroke: C.ink, 'stroke-width': 2.4 }, bee.g)
    el('circle', { cx: -9, cy: 0, r: 3.5, fill: C.ink }, bee.g)
    bee.g.appendChild(bee.wings)
  }

  // ---------- butterflies ----------
  function wingSide(parent, side, fill) {
    const g = el('g', { transform: `scale(${side} 1)` }, parent)
    el('path', { d: FORE, fill: C.wingEdge }, g)
    el('path', { d: HIND, fill: C.wingEdge }, g)
    el('path', { d: FORE_IN, fill }, g)
    el('path', { d: HIND_IN, fill }, g)
    el('path', { d: VEINS, stroke: C.wingEdge, 'stroke-width': 1.1, fill: 'none', opacity: 0.75, 'stroke-linecap': 'round' }, g)
    SPOTS.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.1, fill: '#FFFFFF', opacity: 0.9 }, g))
    el('path', { d: 'M36 -26 L39 -24 M33 -24 L36 -22', stroke: '#FFFFFF', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.85 }, g)
  }

  function makeButterfly(parent, fill, region, scale) {
    const shadow = el('ellipse', { rx: 12, ry: 3, fill: C.ink, opacity: compact ? 0 : 0.08 }, parent)
    const g = el('g', {}, parent)
    const body = el('g', {}, g)
    const lw = el('g', {}, body)
    const rw = el('g', {}, body)
    wingSide(lw, -1, fill)
    wingSide(rw, 1, fill)
    el('path', { d: 'M0 -12 Q -9 -22 -12 -30 M0 -12 Q 9 -22 12 -30', stroke: C.wingEdge, 'stroke-width': 0.9, fill: 'none', 'stroke-linecap': 'round' }, body)
    el('circle', { cx: -12, cy: -30, r: 1.4, fill: C.wingEdge }, body)
    el('circle', { cx: 12, cy: -30, r: 1.4, fill: C.wingEdge }, body)
    el('circle', { cy: -11, r: 2.4, fill: C.wingEdge }, body)
    el('ellipse', { cy: -5, rx: 2.8, ry: 5, fill: '#2F5240' }, body)
    el('ellipse', { cy: 9, rx: 1.9, ry: 9.5, fill: C.wingEdge }, body)
    const x = rnd(region[0], region[1])
    const y = rnd(region[2], region[3])
    return {
      g, lw, rw, shadow, side: parent, x, y, vx: 0, vy: 0, angle: -90, phase: rnd(0, 6), region: () => region,
      scale, state: 'fly', timer: rnd(4, 8), tx: x, ty: y, perch: null, flapRate: 4, glide: 0,
    }
  }

  const flies = compact
    ? [(() => {
        const f = makeButterfly(left, 'url(#lg-butter)', [20, 400, 120, 420], 0.62)
        // On small screens the butterfly can roam the whole width.
        f.region = () => [20, Math.max(60, viewWidth - 20), 110, 430]
        return f
      })()]
    : [
        makeButterfly(left, 'url(#lg-butter)', [20, 280, 160, 430], 0.72),
        makeButterfly(right, 'url(#lg-mint)', [920, 1180, 110, 400], 0.68),
        makeButterfly(left, 'url(#lg-rose)', [30, 270, 80, 320], 0.64),
      ]

  function flowerTip(fl) {
    // A flower rotates around the point where its stem meets the ground.
    const a = ((fl.angle || 0) * Math.PI) / 180
    const len = GROUND - fl.top
    return { x: fl.x + Math.sin(a) * len, y: GROUND - Math.cos(a) * len }
  }

  function steer(f, tx, ty, speed, dt, t) {
    const dx = tx - f.x
    const dy = ty - f.y
    const d = Math.hypot(dx, dy) || 1
    const sp = Math.min(speed, d * 2.2)
    const dvx = (dx / d) * sp + Math.sin(t * 2.3 + f.phase * 0.05) * 9
    const dvy = (dy / d) * sp + Math.cos(t * 3.1 + f.x * 0.01) * 18
    f.vx += (dvx - f.vx) * Math.min(1, dt * 2.2)
    f.vy += (dvy - f.vy) * Math.min(1, dt * 2.2)
    f.x += f.vx * dt
    f.y += f.vy * dt
    if (Math.hypot(f.vx, f.vy) > 4) {
      const target = (Math.atan2(f.vy, f.vx) * 180) / Math.PI
      const diff = ((target - f.angle + 540) % 360) - 180
      f.angle += diff * Math.min(1, dt * 3.5)
    }
  }

  function moveButterfly(f, dt, t) {
    const region = f.region()
    f.timer -= dt
    if (f.state === 'fly') {
      if (Math.hypot(f.tx - f.x, f.ty - f.y) < 26 || Math.random() < dt * 0.25) {
        f.tx = rnd(region[0], region[1])
        f.ty = rnd(region[2], region[3])
      }
      if (f.timer <= 0) {
        const options = flowers.filter((fl) => fl.side === f.side && fl.x >= region[0] - 30 && fl.x <= region[1] + 30)
        if (options.length) {
          f.perch = options[Math.floor(Math.random() * options.length)]
          f.state = 'land'
        } else f.timer = rnd(5, 8)
      }
      steer(f, f.tx, f.ty, 52, dt, t)
      f.flapRate += (3.6 - f.flapRate) * dt * 3
      // Every so often, hold the wings open and glide for a moment.
      if (f.glide > 0) f.glide -= dt
      else if (Math.random() < dt * 0.35) f.glide = rnd(0.6, 1.4)
    } else if (f.state === 'land') {
      const p = flowerTip(f.perch)
      steer(f, p.x, p.y - 4, 45, dt, t)
      if (Math.hypot(p.x - f.x, p.y - 4 - f.y) < 3) {
        f.state = 'perch'
        f.timer = rnd(3, 5.5)
      }
    } else {
      const p = flowerTip(f.perch)
      f.x = p.x
      f.y = p.y - 4
      f.vx = 0
      f.vy = 0
      f.angle += (-90 - f.angle) * dt * 4
      f.flapRate += (0.6 - f.flapRate) * dt * 4
      if (f.timer <= 0) {
        f.state = 'fly'
        f.timer = rnd(6, 10)
        f.vy = -40
        f.tx = rnd(region[0], region[1])
        f.ty = rnd(region[2], region[2] + 120)
      }
    }
    if (!(f.state === 'fly' && f.glide > 0)) f.phase += dt * f.flapRate * Math.PI * 2
    // Gentle beats: in flight the wings only dip to about half open;
    // perched, they slowly open and close.
    let open
    if (f.state === 'perch') open = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.phase))
    else if (f.glide > 0) open = 0.94 + Math.sin(t * 3) * 0.03
    else open = 0.5 + 0.5 * Math.pow((Math.cos(f.phase) + 1) / 2, 0.7)
    f.lw.setAttribute('transform', `scale(${open.toFixed(3)} 1)`)
    f.rw.setAttribute('transform', `scale(${open.toFixed(3)} 1)`)
    const bob = f.state === 'perch' || f.glide > 0 ? 0 : -Math.sin(f.phase) * 1.6
    f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${(f.y + bob).toFixed(1)}) scale(${f.scale}) rotate(${(f.angle + 90).toFixed(1)})`)
    if (!compact) {
      const h = Math.max(0, Math.min(1, (GROUND - f.y) / 400))
      f.shadow.setAttribute('transform', `translate(${f.x.toFixed(1)} ${GROUND + 2})`)
      f.shadow.setAttribute('rx', (10 - h * 5).toFixed(1))
      f.shadow.setAttribute('opacity', (0.12 - h * 0.08).toFixed(3))
    }
  }

  // ---------- each frame ----------
  let nextLeaf = 2
  function update(dt, t) {
    const w = wind(t)

    for (const b of blades) {
      const bend = wind(t - b.x / 500) * 9 + Math.sin(t * 2.2 + b.seed) * 1.6
      const tipY = GROUND - b.h + Math.abs(bend) * 0.25
      b.p.setAttribute('d', `M${b.x - 3} ${GROUND + 6} Q${(b.x - 1 + bend * 0.4).toFixed(1)} ${GROUND - b.h * 0.5} ${(b.x + bend).toFixed(1)} ${tipY.toFixed(1)} Q${(b.x + 1 + bend * 0.4).toFixed(1)} ${GROUND - b.h * 0.5} ${b.x + 3} ${GROUND + 6} Z`)
    }

    for (const f of flowers) {
      f.angle = (wind(t - f.x / 500) * 4 + Math.sin(t * 1.3 + f.x) * 1.2) / f.stiff
      f.g.setAttribute('transform', `translate(${f.x} ${f.y}) scale(${f.s}) rotate(${f.angle.toFixed(2)} 0 ${(GROUND - f.y) / f.s})`)
    }

    if (tree) {
      for (const c of clusters) {
        const a = wind(t - c.phase * 0.4) * 1.8 + Math.sin(t * 1.1 + c.phase) * 0.6
        c.g.setAttribute('transform', `rotate(${a.toFixed(2)} 0 60)`)
      }
      // Leaves fall now and then, more often in strong gusts.
      nextLeaf -= dt * (0.15 + Math.max(0, w - 0.7) * 1.8)
      if (nextLeaf <= 0 && leaves.length < 8) {
        const c = clusters[Math.floor(Math.random() * clusters.length)]
        const p = el('path', { d: 'M0 -6 C 5 -4, 6 3, 0 7 C -6 3, -5 -4, 0 -6 Z', fill: Math.random() < 0.5 ? C.leaf : '#C9D96A' })
        right.insertBefore(p, tree.nextSibling)
        leaves.push({ p, x: 1085 + c.x + rnd(-20, 20), y: 360 + c.y + rnd(-10, 20), rot: rnd(0, 360), seed: rnd(0, 6), landed: 0 })
        nextLeaf = rnd(1.2, 3)
      }
      for (let i = leaves.length - 1; i >= 0; i--) {
        const L = leaves[i]
        if (!L.landed) {
          L.x += (w * 22 + Math.sin(t * 2.6 + L.seed) * 26) * dt
          L.y += (26 + Math.cos(t * 2.6 + L.seed) * 10) * dt
          L.rot += Math.sin(t * 3 + L.seed) * 120 * dt
          if (L.y >= GROUND - 2) {
            L.landed = t
            L.y = GROUND - 2
          }
        } else {
          const age = t - L.landed
          L.p.setAttribute('opacity', Math.max(0, 1 - age / 4).toFixed(2))
          if (age > 4) {
            L.p.remove()
            leaves.splice(i, 1)
            continue
          }
        }
        L.p.setAttribute('transform', `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) rotate(${L.rot.toFixed(0)})`)
      }
    }

    if (kite) {
      const kx = 985 + Math.sin(t * 0.7) * 16 + w * 14
      const ky = 150 + Math.cos(t * 0.5) * 12 - w * 10
      const kr = Math.sin(t * 0.9) * 7 + w * 5
      const rad = (kr * Math.PI) / 180
      kite.body.setAttribute('transform', `translate(${kx.toFixed(1)} ${ky.toFixed(1)}) rotate(${kr.toFixed(1)})`)
      const bx = kx - Math.sin(rad) * 6
      const by = ky + 20
      kite.string.setAttribute('d', `M${bx.toFixed(1)} ${by.toFixed(1)} Q ${((bx + 1200) / 2 - 20).toFixed(1)} ${((by + 600) / 2 + 70 - w * 25).toFixed(1)} 1200 600`)
      // The tail ripples: each piece hangs from the one above it, swinging
      // a little later and a little wider, pushed back by the wind.
      const pts = kite.points
      pts[0].x = kx - Math.sin(rad) * 52
      pts[0].y = ky + Math.cos(rad) * 52
      for (let i = 1; i < pts.length; i++) {
        const ang = ((100 + w * 22) * Math.PI) / 180 + Math.sin(t * 4.2 - i * 0.55) * (0.12 + i * 0.03)
        pts[i].x = pts[i - 1].x + Math.cos(ang) * 11
        pts[i].y = pts[i - 1].y + Math.sin(ang) * 11
      }
      kite.tail.setAttribute('d', `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}` + pts.slice(1).map((p, i) => {
        const q = pts[i]
        return ` Q${q.x.toFixed(1)} ${q.y.toFixed(1)} ${((q.x + p.x) / 2).toFixed(1)} ${((q.y + p.y) / 2).toFixed(1)}`
      }).join(''))
      kite.bows.forEach((b, i) => {
        const p = pts[3 + i * 2]
        b.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(Math.sin(t * 4 + i) * 25).toFixed(0)})`)
      })
    }

    if (bug) {
      if (bug.pause > 0) bug.pause -= dt
      else {
        bug.x += bug.dir * 14 * dt
        bug.step += dt * 9
        if (Math.random() < dt * 0.15) bug.pause = rnd(1, 2.5)
        if (bug.x < 20 || bug.x > 280) {
          bug.dir *= -1
          bug.x = Math.max(20, Math.min(280, bug.x))
        }
      }
      bug.legs.forEach(({ l, i, side }) => {
        const swing = bug.pause > 0 ? 0 : Math.sin(bug.step + i * 2.1 + (side > 0 ? Math.PI : 0)) * 4
        l.setAttribute('d', `M${-6 + i * 6} ${side * 6} L${(-6 + i * 6 + swing).toFixed(1)} ${side * 12}`)
      })
      const look = bug.pause > 0 ? Math.sin(t * 3) * 6 : 0
      bug.g.setAttribute('transform', `translate(${bug.x.toFixed(1)} ${GROUND - 3}) scale(${bug.dir < 0 ? 0.95 : -0.95} 0.95) rotate(${look.toFixed(1)})`)
    }

    if (bee) {
      const beds = flowers.filter((f) => f.side === left)
      if (bee.hover > 0) bee.hover -= dt
      else if (Math.hypot(bee.tx - bee.x, bee.ty - bee.y) < 4) {
        bee.hover = rnd(0.8, 2)
        const f = beds[Math.floor(Math.random() * beds.length)]
        bee.tx = f.x + rnd(-8, 8)
        bee.ty = f.top - rnd(14, 26)
      }
      const ease = bee.hover > 0 ? 0 : 2.2
      bee.x += (bee.tx - bee.x) * Math.min(1, ease * dt)
      bee.y += (bee.ty - bee.y) * Math.min(1, ease * dt)
      bee.g.setAttribute('transform', `translate(${(bee.x + Math.sin(t * 13) * 1.5).toFixed(1)} ${(bee.y + Math.cos(t * 17) * 1.5).toFixed(1)}) scale(${bee.tx < bee.x ? 1 : -1} 1)`)
      bee.wings.setAttribute('transform', `scale(1 ${(0.4 + 0.6 * Math.abs(Math.sin(t * 60))).toFixed(2)})`)
    }

    for (const f of flies) moveButterfly(f, dt, t)
  }

  // ---------- loop ----------
  let t = 0
  let last = performance.now()
  let frameId = 0
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    t += dt
    update(dt, t)
    frameId = requestAnimationFrame(frame)
  }
  function onVisibility() {
    // Browsers pause animation frames in hidden tabs; don't jump ahead
    // when the tab comes back.
    last = performance.now()
  }
  function onResize() {
    viewWidth = layout()
  }

  update(0.016, 0)
  if (!reduceMotion) frameId = requestAnimationFrame(frame)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)

  return function stop() {
    cancelAnimationFrame(frameId)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('resize', onResize)
    svg.replaceChildren()
  }
}
