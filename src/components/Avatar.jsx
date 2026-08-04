import React, { useState } from 'react'

export function Avatar({ src, name, size = 40, online, status }) {
  const [err, setErr] = useState(false)
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
  const showImg = src && !err
  const dotSize = Math.max(12, Math.round(size * 0.32))
  const ringSize = Math.max(2, Math.round(size * 0.09))

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size + ringSize * 2, height: size + ringSize * 2 }}
    >
      <div
        className="rounded-full overflow-hidden flex items-center justify-center text-white font-semibold bg-[#111]"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
        }}
      >
        {showImg ? (
          <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
        ) : (
          initials
        )}
      </div>
      {online && (
        <span
          className="absolute rounded-full bg-green-500 z-10"
          title={status || 'نشط الآن'}
          style={{
            width: dotSize,
            height: dotSize,
            top: ringSize / 2,
            left: ringSize / 2,
            border: `${ringSize}px solid #000`,
            boxShadow: `0 0 0 ${Math.max(1, ringSize / 2)}px rgba(34,197,94,0.55)`,
          }}
        />
      )}
    </div>
  )
}
