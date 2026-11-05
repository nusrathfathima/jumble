// A short burst of garden-coloured confetti over the whole screen, for
// happy moments (the wheel landing, "Loved it"). Drawn on a temporary
// canvas that ignores clicks and removes itself after about two seconds.
// Skipped entirely for people who ask for reduced motion.

const COLORS = ['#7CC59A', '#FFB38A', '#FFD66B', '#9CCBF2', '#F7A8C1', '#2F7D4F']

export function burstConfetti({ x = 0.5, y = 0.4, count = 110 } = {}) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.width = width * dpr
  canvas.height = height * dpr
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2000', // above MUI dialogs (1300)
  })
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pieces = Array.from({ length: count }, () => ({
    x: width * x,
    y: height * y,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 12 - 4,
    size: 5 + Math.random() * 6,
    angle: Math.random() * 6,
    spin: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    round: Math.random() < 0.4,
  }))

  const start = performance.now()
  function frame(now) {
    ctx.clearRect(0, 0, width, height)
    for (const p of pieces) {
      p.vy += 0.32
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      }
      ctx.restore()
    }
    if (now - start < 2200) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
