'use client'

import { useEffect, useRef } from 'react'

interface EquazionLogoProps {
  /** Background colour to use for the Q-needle and Z-grid overlay strokes.
   *  Should match whatever surface the logo sits on. */
  bg?: string
  /** Letter colour. Defaults to the app's pwc-orange. */
  color?: string
  /** Font size in px — controls overall logo scale. Default: 38 */
  fontSize?: number
}

const NS = 'http://www.w3.org/2000/svg'

function mk(tag: string, attrs: Record<string, string | number>) {
  const el = document.createElementNS(NS, tag)
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)))
  return el
}

export function EquazionLogo({ bg = '#ffffff', color = '#eb8c00', fontSize = 38 }: EquazionLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const ovRef   = useRef<SVGSVGElement>(null)
  const qRef    = useRef<HTMLSpanElement>(null)
  const zRef    = useRef<HTMLSpanElement>(null)

  const scale = fontSize / 84   // relative to the original 84px design

  useEffect(() => {
    function applyOverlays() {
      const wrap = wrapRef.current
      const ov   = ovRef.current
      const qEl  = qRef.current
      const zEl  = zRef.current
      if (!wrap || !ov || !qEl || !zEl) return

      const wR = wrap.getBoundingClientRect()
      if (wR.width < 10) return

      const W = wR.width
      const H = wR.height
      ov.setAttribute('width',   String(W))
      ov.setAttribute('height',  String(H))
      ov.setAttribute('viewBox', `0 0 ${W} ${H}`)
      ov.style.width  = W + 'px'
      ov.style.height = H + 'px'
      ov.innerHTML = ''

      /* Q compass needle */
      const qR  = qEl.getBoundingClientRect()
      const qx  = qR.left - wR.left
      const qy  = qR.top  - wR.top
      const qw  = qR.width
      const qh  = qR.height
      const pad = qw * 0.1
      ov.appendChild(mk('line', {
        x1: qx + qw * 0.07 - pad,   y1: qy + qh * 0.09 - pad * 0.8,
        x2: qx + qw * 0.84 + pad,   y2: qy + qh * 0.86 + pad * 0.8,
        stroke: bg, 'stroke-width': Math.max(2, 6 * scale), 'stroke-linecap': 'round',
      }))

      /* Z pixel grid */
      const zR = zEl.getBoundingClientRect()
      const zx = zR.left - wR.left
      const zy = zR.top  - wR.top
      const zw = zR.width
      const zh = zR.height
      const sw = Math.max(1, 2.6 * scale)
      for (let i = 1; i <= 4; i++) {
        const y = zy + zh * i / 5
        ov.appendChild(mk('line', {
          x1: zx - 1, y1: y, x2: zx + zw + 1, y2: y,
          stroke: bg, 'stroke-width': sw,
        }))
      }
      for (let i = 1; i <= 2; i++) {
        const x = zx + zw * i / 3
        ov.appendChild(mk('line', {
          x1: x, y1: zy - 1, x2: x, y2: zy + zh + 1,
          stroke: bg, 'stroke-width': sw,
        }))
      }
    }

    document.fonts.ready.then(() => {
      applyOverlays()
      setTimeout(applyOverlays, 100)
    })
    setTimeout(applyOverlays, 300)

    const ro = new ResizeObserver(applyOverlays)
    const wrap = wrapRef.current
    if (wrap) ro.observe(wrap)
    return () => ro.disconnect()
  }, [bg, scale])

  const regSize    = Math.round(21 * scale)
  const regMtop    = Math.round(5  * scale)

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
      <div style={{
        fontFamily:    "'Bebas Neue', Impact, Arial, sans-serif",
        fontSize:      `${fontSize}px`,
        color:         color,
        letterSpacing: '1.5px',
        lineHeight:    1,
        display:       'inline-flex',
        alignItems:    'flex-start',
        userSelect:    'none',
        whiteSpace:    'nowrap',
      }}>
        <span>e</span>
        <span ref={qRef}>Q</span>
        <span>UA</span>
        <span ref={zRef}>Z</span>
        <span>ION</span>
        <span style={{
          fontFamily:    'Arial, sans-serif',
          fontSize:      `${regSize}px`,
          lineHeight:    1,
          marginTop:     `${regMtop}px`,
          marginLeft:    '2px',
          letterSpacing: 0,
        }}>®</span>
      </div>
      <svg
        ref={ovRef}
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          pointerEvents: 'none',
          overflow:      'visible',
        }}
      />
    </div>
  )
}
