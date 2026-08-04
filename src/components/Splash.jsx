import React, { useEffect, useRef, useState } from 'react'

export default function Splash() {
  const [show, setShow] = useState(false)
  const [fading, setFading] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const seen = localStorage.getItem('gestion_splash_seen')
    if (seen) return
    setShow(true)
  }, [])

  useEffect(() => {
    if (!show) return
    const timer = setTimeout(() => {
      finish()
    }, 4500)
    return () => clearTimeout(timer)
  }, [show])

  const finish = () => {
    if (!show) return
    setFading(true)
    setTimeout(() => {
      setShow(false)
      localStorage.setItem('gestion_splash_seen', '1')
    }, 600)
  }

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      dir="rtl"
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
