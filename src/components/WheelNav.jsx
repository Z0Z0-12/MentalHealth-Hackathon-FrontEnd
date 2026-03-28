// Semi-circular rotating wheel navigation
// Only the top half is visible — the bottom half is hidden behind the card

const SEGMENT_H = 185  // height of each blade from center outward
const SEGMENT_W = 82   // width of each blade

export default function WheelNav({ tabs, activeTab, onTabChange }) {
  const count        = tabs.length
  const activeIndex  = tabs.findIndex(t => t.id === activeTab)
  const wheelRotation = -activeIndex * (360 / count)

  return (
    <div style={{
      position:  'absolute',
      bottom:    0,
      left:      '50%',
      transform: 'translateX(-50%)',
      width:     '620px',
      height:    `${SEGMENT_H + 20}px`,   // just enough to show top half
      overflow:  'hidden',                 // hides anything below center
      pointerEvents: 'none',
      zIndex: 2,
    }}>
      {/* Hub — the rotation pivot lives at the bottom-center of this container */}
      <div style={{
        position:   'absolute',
        bottom:     0,
        left:       '50%',
        width:      0,
        height:     0,
        transform:  `translateX(-50%) rotate(${wheelRotation}deg)`,
        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {tabs.map((tab, i) => {
          const segAngle  = i * (360 / count)
          const isActive  = tab.id === activeTab
          // counter-rotate text so it always reads upright regardless of wheel rotation
          const textAngle = -(wheelRotation + segAngle)

          return (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position:        'absolute',
                bottom:          0,
                left:            `${-SEGMENT_W / 2}px`,
                width:           `${SEGMENT_W}px`,
                height:          `${SEGMENT_H}px`,
                transformOrigin: 'bottom center',
                transform:       `rotate(${segAngle}deg)`,
                pointerEvents:   'all',
                cursor:          'pointer',
              }}
            >
              <div style={{
                width:        '100%',
                height:       '100%',
                borderRadius: `${SEGMENT_W / 2}px ${SEGMENT_W / 2}px 10px 10px`,
                background:   isActive
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(210,240,195,0.85) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(190,225,170,0.35) 100%)',
                boxShadow: isActive
                  ? '0 -6px 24px rgba(10,42,15,0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
                  : '0 -2px 10px rgba(10,42,15,0.06)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border:       `1px solid ${isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'}`,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                transition:   'background 0.4s ease, box-shadow 0.4s ease',
              }}>
                <div style={{
                  display:    'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap:        '5px',
                  transform:  `rotate(${textAngle}deg)`,
                  transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none',
                }}>
                  <tab.icon
                    size={isActive ? 28 : 22}
                    style={{
                      color: isActive ? '#0a2a0f' : '#4a7050',
                      transition: 'color 0.3s ease, width 0.3s ease',
                    }}
                  />
                  <span style={{
                    fontSize:   '10px',
                    fontWeight: isActive ? 700 : 500,
                    color:      isActive ? '#0a2a0f' : '#4a7050',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.3px',
                  }}>
                    {tab.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Center hub dot */}
        <div style={{
          position:  'absolute',
          bottom:    '-6px',
          left:      '-6px',
          width:     '12px',
          height:    '12px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          boxShadow: '0 0 8px rgba(10,42,15,0.15)',
        }} />
      </div>
    </div>
  )
}