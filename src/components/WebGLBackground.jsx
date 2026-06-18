import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ambient WebGL background — ~400 particles drifting upward like terminal noise.
 * Green-tinted at very low opacity. Mouse parallax is subtle.
 * Disabled entirely when prefers-reduced-motion is set.
 */
export default function WebGLBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth || window.innerWidth
    const h = mount.clientHeight || window.innerHeight

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
    mount.appendChild(renderer.domElement)

    // ── Scene + Camera ─────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100)
    camera.position.set(0, 0, 5)

    // ── Particle Geometry ──────────────────────────────────────────────────
    const COUNT = 420
    const positions = new Float32Array(COUNT * 3)
    const speeds   = new Float32Array(COUNT)
    const swayPhase = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12  // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10  // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4   // z
      speeds[i]    = 0.0004 + Math.random() * 0.0006
      swayPhase[i] = Math.random() * Math.PI * 2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Soft circular sprite via canvas
    const spriteCanvas = document.createElement('canvas')
    spriteCanvas.width = 16; spriteCanvas.height = 16
    const ctx = spriteCanvas.getContext('2d')
    const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 7)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 16, 16)
    const sprite = new THREE.CanvasTexture(spriteCanvas)

    const material = new THREE.PointsMaterial({
      size: 0.045,
      map: sprite,
      transparent: true,
      opacity: 0.22,
      color: new THREE.Color('#00C28A'),
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── Mouse tracking ─────────────────────────────────────────────────────
    const mouse  = { x: 0, y: 0 }
    const camLag = { x: 0, y: 0 }

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) *  0.5
      mouse.y = (e.clientY / window.innerHeight - 0.5) * -0.35
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = mount.clientWidth
      const nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // ── Animation loop ─────────────────────────────────────────────────────
    let rafId
    let tick = 0
    const pos = geometry.attributes.position

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      tick++

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        // upward drift
        pos.array[i3 + 1] += speeds[i]
        // subtle lateral sway
        pos.array[i3] += Math.sin(tick * 0.004 + swayPhase[i]) * 0.0003

        // wrap top → bottom
        if (pos.array[i3 + 1] > 5) {
          pos.array[i3]     = (Math.random() - 0.5) * 12
          pos.array[i3 + 1] = -5
          pos.array[i3 + 2] = (Math.random() - 0.5) * 4
        }
      }
      pos.needsUpdate = true

      // Lerp camera to mouse (very gentle)
      camLag.x += (mouse.x - camLag.x) * 0.04
      camLag.y += (mouse.y - camLag.y) * 0.04
      camera.position.x = camLag.x
      camera.position.y = camLag.y

      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      sprite.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}
    />
  )
}
