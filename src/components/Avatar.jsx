import React, { useState } from 'react'

export function Avatar({ src, name, size = 40, online, status }) {
  const [err, setErr] = useState(false)
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
  const showImg = src && !err

  return (
    <div
      className="relative rounded-full overflow-hidden flex items-center justify-center text-white font-semibold shrink-0 avatar-ring bg-[#111]"
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
      {online && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black"
          title={status || 'نشط الآن'}
        />
      )}
    </div>
  )
}
