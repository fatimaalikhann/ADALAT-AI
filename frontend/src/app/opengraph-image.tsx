import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'AdalatAI — Legal Aid for Every Pakistani'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          background:      '#080810',
          fontFamily:      'system-ui, -apple-system, sans-serif',
          position:        'relative',
          overflow:        'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position:   'absolute',
            top:        '50%',
            left:       '50%',
            transform:  'translate(-50%, -60%)',
            width:      '800px',
            height:     '400px',
            background: 'radial-gradient(ellipse at center, rgba(201,162,39,0.12) 0%, transparent 65%)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          {/* Scales icon — simplified SVG inline */}
          <svg width="48" height="58" viewBox="0 0 90 110" fill="none" stroke="#c9a227" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="45" y1="8" x2="45" y2="92" />
            <line x1="27" y1="92" x2="63" y2="92" />
            <circle cx="45" cy="8" r="4" fill="#c9a227" stroke="none" />
            <line x1="13" y1="28" x2="77" y2="28" />
            <circle cx="45" cy="28" r="3.5" fill="#c9a227" stroke="none" />
            <line x1="15" y1="28" x2="15" y2="58" />
            <path d="M5 62 Q15 56 25 62 Q15 68 5 62Z" fill="#c9a227" stroke="none" />
            <line x1="75" y1="28" x2="75" y2="58" />
            <path d="M65 62 Q75 56 85 62 Q75 68 65 62Z" fill="#c9a227" stroke="none" />
          </svg>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '64px', fontWeight: 800, color: '#c9a227', letterSpacing: '-1px' }}>
              Adalat
            </span>
            <div style={{ width: '3px', height: '44px', background: 'rgba(201,162,39,0.5)', borderRadius: '2px' }} />
            <span style={{ fontSize: '64px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>
              AI
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize:      '42px',
            fontWeight:    700,
            color:         '#ffffff',
            letterSpacing: '-0.5px',
            textAlign:     'center',
            lineHeight:    1.15,
            maxWidth:      '820px',
            marginBottom:  '20px',
          }}
        >
          Legal Aid for Every Pakistani Citizen
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            fontSize:   '22px',
            color:      'rgba(255,255,255,0.45)',
            textAlign:  'center',
            maxWidth:   '700px',
            marginBottom: '40px',
          }}
        >
          6 AI Agents · Free · Urdu & English · 24/7
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['✓ Free', '🔒 Confidential', '⚖ Pakistani Law'].map(label => (
            <div
              key={label}
              style={{
                background:   'rgba(201,162,39,0.10)',
                border:       '1px solid rgba(201,162,39,0.30)',
                borderRadius: '100px',
                padding:      '8px 22px',
                fontSize:     '18px',
                color:        '#c9a227',
                fontWeight:   600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position:  'absolute',
            bottom:    '28px',
            fontSize:  '16px',
            color:     'rgba(255,255,255,0.18)',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}
        >
          adalat-ai.vercel.app
        </div>
      </div>
    ),
    { ...size },
  )
}
