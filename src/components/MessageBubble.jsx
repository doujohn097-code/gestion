import React, { useRef, useState, useEffect } from 'react'
import { Avatar } from './Avatar'
import { formatMessageTime } from '../utils/formatTime'
import { Play, Pause, FileText, Download } from 'lucide-react'

function formatAudioTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function AudioPlayer({ url, isMe }) {
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
    <div className={`flex items-center gap-3 min-w-[180px] max-w-full ${isMe ? 'text-black' : 'text-white'}`} dir="rtl">
      <button onClick={toggle} type="button" className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-black/10' : 'bg-white/10'}`}>
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="mr-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div onClick={seek} className={`h-1.5 rounded-full cursor-pointer overflow-hidden ${isMe ? 'bg-black/20' : 'bg-white/20'}`}>
          <div className="h-full bg-current rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] opacity-70 mt-1" dir="ltr">
          <span>{formatAudioTime(current)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>
      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  )
}

export function MessageBubble({ msg, user, isMe }) {
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState(false)
  const name = user?.fullName || 'مجهول'
  const time = formatMessageTime(msg.createdAt)

  const renderContent = () => {
    if (msg.type === 'image') {
      return (
        <div className="rounded-xl overflow-hidden">
          {!loaded && !err && <div className="w-48 h-32 bg-white/10 animate-pulse rounded-xl" />}
          {err ? (
            <div className="w-48 h-32 flex items-center justify-center text-white/50 text-sm bg-white/5 rounded-xl">تعذر تحميل الصورة</div>
          ) : (
            <img
              src={msg.mediaUrl}
              alt="media"
              className={`max-w-full max-h-60 object-cover rounded-xl ${loaded ? 'block' : 'hidden'}`}
              onLoad={() => setLoaded(true)}
              onError={() => { setLoaded(true); setErr(true) }}
            />
          )}
        </div>
      )
    }
    if (msg.type === 'video') {
      return (
        <video controls className="max-w-full max-h-60 rounded-xl" preload="metadata">
          <source src={msg.mediaUrl} />
        </video>
      )
    }
    if (msg.type === 'audio') {
      return <AudioPlayer url={msg.mediaUrl} isMe={isMe} />
    }
    if (msg.type === 'file') {
      return (
        <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-current underline" dir="rtl">
          <FileText size={18} />
          <span className="max-w-[140px] truncate">{msg.fileName || 'ملف'}</span>
          <Download size={16} />
        </a>
      )
    }
    return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>{msg.content}</p>
  }

  return (
    <div
      className={`w-full flex items-end gap-2 mb-3 page-enter ${isMe ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}
      dir="ltr"
    >
      <Avatar src={user?.profilePic} name={name} size={30} />
      <div className={`flex flex-col max-w-[82%] min-w-0 ${isMe ? 'items-end' : 'items-start'}`} dir="ltr">
        <span className="text-[11px] text-white/50 mb-0.5 px-1" dir="rtl">{name}</span>
        <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
          <div className="flex flex-col gap-1" dir="rtl">
            {renderContent()}
            <div className={`text-[10px] opacity-60 mt-1 ${isMe ? 'text-right' : 'text-left'}`} dir="ltr">{time}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
