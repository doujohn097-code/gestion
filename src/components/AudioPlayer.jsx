import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

function formatAudioTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function seededRandom(seed) {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 1000003
  return function () {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function WaveformBars({ url, pct }) {
  const barCount = 40
  const bars = useMemo(() => {
    const rand = seededRandom(url || 'default')
    return Array.from({ length: barCount }, () => 0.25 + rand() * 0.75)
  }, [url])
  const active = Math.max(0, Math.min(barCount, Math.round((pct / 100) * barCount)))

  return (
    <div className="waveform">
      <div className="waveform-glow" style={{ width: `${pct}%` }} />
      {bars.map((h, i) => {
        const playing = i < active
        return (
          <span
            key={i}
            className={`waveform-bar ${playing ? 'active' : ''}`}
            style={{ height: `${Math.max(12, h * 100)}%` }}
          />
        )
      })}
      <div className="waveform-playhead" style={{ left: `${pct}%` }} />
    </div>
  )
}

export default function AudioPlayer({ url, className = '' }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrent(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [url])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const seek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audio.currentTime = Math.max(0, Math.min(duration, duration * pct))
  }

  const pct = duration ? (current / duration) * 100 : 0

  return (
    <div className={`flex items-center gap-2 w-full max-w-full px-1 py-1 ${className}`} dir="ltr">
      <button
        onClick={toggle}
        type="button"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white hover:bg-white/10 transition"
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="mr-0.5" />}
      </button>
      <div className="flex-1 min-w-0" onClick={seek}>
        <div className="h-10 cursor-pointer flex items-center">
          <WaveformBars url={url} pct={pct} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5 text-[10px] opacity-70 w-10">
        <span>{formatAudioTime(current)}</span>
        <span>{formatAudioTime(duration)}</span>
      </div>
      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  )
}
