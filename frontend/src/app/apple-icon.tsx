import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     '#080810',
          borderRadius:   '40px',
        }}
      >
        {/* Scales of justice — same geometry as icon.svg, scaled to 180px */}
        <svg
          width="110"
          height="110"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical pole */}
          <line x1="16" y1="6"  x2="16" y2="26" stroke="#c9a227" strokeWidth="1.5"  strokeLinecap="round" />
          {/* Base */}
          <line x1="11" y1="26" x2="21" y2="26" stroke="#c9a227" strokeWidth="1.5"  strokeLinecap="round" />
          {/* Top pivot */}
          <circle cx="16" cy="6"  r="1.2" fill="#c9a227" />
          {/* Beam */}
          <line x1="7"  y1="11" x2="25" y2="11" stroke="#c9a227" strokeWidth="1.2"  strokeLinecap="round" />
          <circle cx="16" cy="11" r="1"   fill="#c9a227" />
          {/* Left chain + pan */}
          <line x1="8"  y1="11" x2="8"  y2="18" stroke="#c9a227" strokeWidth="1"    strokeLinecap="round" />
          <path d="M4 19.5 Q8 17.5 12 19.5 Q8 21.5 4 19.5Z" fill="#c9a227" />
          {/* Right chain + pan */}
          <line x1="24" y1="11" x2="24" y2="18" stroke="#c9a227" strokeWidth="1"    strokeLinecap="round" />
          <path d="M20 19.5 Q24 17.5 28 19.5 Q24 21.5 20 19.5Z" fill="#c9a227" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
