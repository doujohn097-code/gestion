import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Avatar } from './Avatar'
import { formatMessageTime } from '../utils/formatTime'
import { Play, Pause, FileText, Download, X, Reply, Heart, Trash2 } from 'lucide-react'

const EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '😡']

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
  const barCount = 36
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

function AudioPlayer({ url }) {
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
    <div className="flex items-center gap-3 min-w-[200px] max-w-full" dir="rtl">
      <button
        onClick={toggle}
        type="button"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/10 hover:bg-white/20 transition"
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="mr-0.5" />}
      </button>
      <div className="flex-1 min-w-0" onClick={seek}>
        <div className="h-9 cursor-pointer flex items-center">
          <WaveformBars url={url} pct={pct} />
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

function MediaLightbox({ url, type, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="media-lightbox" onClick={onClose}>
      <button onClick={onClose} className="media-lightbox-close"><X size={28} /></button>
      <div className="media-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {type === 'image' ? (
          <img src={url} alt="preview" className="max-w-full max-h-[85vh] rounded-2xl" />
        ) : (
          <video src={url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl" />
        )}
      </div>
    </div>
  )
}

function replyPreviewText(reply) {
  if (!reply) return ''
  if (reply.type === 'image') return 'صورة'
  if (reply.type === 'video') return 'فيديو'
  if (reply.type === 'audio') return 'رسالة صوتية'
  if (reply.type === 'file') return reply.fileName || 'ملف'
  return reply.content || ''
}

function MessageMenu({ x, y, onClose, onReply, onReact, onDelete }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="message-menu glass-strong" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
        <div className="message-menu-emojis">
          {EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => onReact(emoji)} className="message-menu-emoji">{emoji}</button>
          ))}
        </div>
        <div className="message-menu-actions">
          <button onClick={() => onReply()} className="message-menu-action"><Reply size={16} /> رد</button>
          {onDelete && <button onClick={() => onDelete()} className="message-menu-action text-red-300"><Trash2 size={16} /> حذف</button>}
        </div>
      </div>
    </>
  )
}

export function MessageBubble({ msg, user, isMe, readBy = [], currentUserId, onReply, onReact, onDelete, onProfileClick }) {
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [showHeart, setShowHeart] = useState(false)
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 })
  const longPressRef = useRef(null)
  const touchStartRef = useRef(null)
  const longPressTriggered = useRef(false)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)
  const name = user?.fullName || 'مجهول'
  const time = formatMessageTime(msg.createdAt)

  const reactions = msg.reactions || {}
  const reactionList = useMemo(() => {
    return Object.entries(reactions)
      .map(([emoji, users = {}]) => ({ emoji, count: Object.keys(users).length, me: !!users[currentUserId] }))
      .filter(r => r.count > 0)
  }, [reactions, currentUserId])

  const handleReaction = (emoji) => { onReact(msg, emoji); setMenuOpen(false) }
  const handleReply = () => { onReply(msg); setMenuOpen(false) }
  const handleDelete = () => { onDelete?.(msg); setMenuOpen(false) }

  const showMenuAt = (x, y) => { longPressTriggered.current = true; setMenuPos({ x, y }); setMenuOpen(true) }

  const startLongPress = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    longPressTriggered.current = false
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    longPressRef.current = setTimeout(() => {
      longPressRef.current = null
      showMenuAt(clientX, clientY)
    }, 600)
  }

  const moveLongPress = (e) => {
    if (!touchStartRef.current) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const y = e.touches ? e.touches[0].clientY : e.clientY
    const dx = x - touchStartRef.current.x
    const dy = y - touchStartRef.current.y
    if (Math.hypot(dx, dy) > 12) cancelLongPress()
  }

  const cancelLongPress = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null }
    touchStartRef.current = null
  }

  const onContextMenu = (e) => {
    e.preventDefault()
    showMenuAt(e.clientX, e.clientY)
  }

  const onBubbleClick = (e) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      clickCountRef.current = 0
      return
    }
    const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    const y = e.clientY || (e.touches && e.touches[0]?.clientY) || 0
    clickCountRef.current += 1
    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0 }, 300)
    } else {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
      clickCountRef.current = 0
      setHeartPos({ x, y })
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 900)
      onReact(msg, '❤️')
    }
  }

  useEffect(() => {
    return () => { if (clickTimerRef.current) clearTimeout(clickTimerRef.current) }
  }, [])

  const renderContent = () => {
    if (msg.type === 'image') {
      return (
        <div className="rounded-xl overflow-hidden cursor-pointer group" onClick={(e) => { e.stopPropagation(); setLightbox(true) }}>
          {!loaded && !err && <div className="w-48 h-32 bg-white/10 animate-pulse rounded-xl" />}
          {err ? (
            <div className="w-48 h-32 flex items-center justify-center text-white/50 text-sm bg-white/5 rounded-xl">تعذر تحميل الصورة</div>
          ) : (
            <img
              src={msg.mediaUrl}
              alt="media"
              className={`max-w-full max-h-60 object-cover rounded-xl ${loaded ? 'block' : 'hidden'} group-hover:opacity-95 transition`}
              onLoad={() => setLoaded(true)}
              onError={() => { setLoaded(true); setErr(true) }}
            />
          )}
        </div>
      )
    }
    if (msg.type === 'video') {
      return (
        <div className="rounded-xl overflow-hidden cursor-pointer relative group" onClick={(e) => { e.stopPropagation(); setLightbox(true) }}>
          <video className="max-w-full max-h-60 rounded-xl" preload="metadata">
            <source src={msg.mediaUrl} />
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition">
            <Play size={32} fill="currentColor" className="text-white drop-shadow-lg" />
          </div>
        </div>
      )
    }
    if (msg.type === 'audio') {
      return <AudioPlayer url={msg.mediaUrl} />
    }
    if (msg.type === 'file') {
      return (
        <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-current underline" dir="rtl" onClick={(e) => e.stopPropagation()}>
          <FileText size={18} />
          <span className="max-w-[140px] truncate">{msg.fileName || 'ملف'}</span>
          <Download size={16} />
        </a>
      )
    }
    return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>{msg.content}</p>
  }

  return (
    <>
      <div
        className={`w-full flex items-end gap-2 mb-3 page-enter ${isMe ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}
        dir="ltr"
      >
        <div className="cursor-pointer" onClick={() => onProfileClick?.(msg.senderId)}>
          <Avatar src={user?.profilePic} name={name} size={30} />
        </div>
        <div className={`flex flex-col max-w-[82%] min-w-0 ${isMe ? 'items-end' : 'items-start'}`} dir="ltr">
          <span
            className="text-[11px] text-white/50 mb-0.5 px-1 cursor-pointer hover:text-white/80 transition"
            dir="rtl"
            onClick={() => onProfileClick?.(msg.senderId)}
          >
            {name}
          </span>
          <div
            className={`message-bubble ${isMe ? 'sent' : 'received'} relative`}
            onTouchStart={startLongPress}
            onTouchMove={moveLongPress}
            onTouchEnd={cancelLongPress}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onContextMenu={onContextMenu}
            onClick={onBubbleClick}
          >
            {msg.replyTo && (
              <div className="reply-preview">
                <Reply size={12} className="shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] opacity-80 truncate">{msg.replyTo.senderName}</p>
                  <p className="text-[12px] opacity-70 truncate">{replyPreviewText(msg.replyTo)}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1" dir="rtl">
              {msg.content && msg.type !== 'text' && (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-1" style={{ overflowWrap: 'anywhere' }}>{msg.content}</p>
              )}
              {renderContent()}
              <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`} dir="ltr">
                <span className="text-[10px] opacity-60">{time}</span>
                {reactionList.length > 0 && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {reactionList.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => handleReaction(r.emoji)}
                        className={`reaction-pill ${r.me ? 'active' : ''}`}
                      >
                        <span>{r.emoji}</span>
                        {r.count > 1 && <span className="text-[10px]">{r.count}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {readBy.length > 0 && (
                  <div className="flex -space-x-1.5 rtl:space-x-reverse" dir="ltr">
                    {readBy.slice(0, 4).map((u, i) => (
                      <div key={i} className="w-[14px] h-[14px] rounded-full overflow-hidden border border-black ring-1 ring-white/20" title={u.fullName}>
                        <Avatar src={u.profilePic} name={u.fullName} size={14} />
                      </div>
                    ))}
                    {readBy.length > 4 && (
                      <span className="text-[10px] text-white/70 ml-1">+{readBy.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {showHeart && (
              <div className="heart-anim" style={{ left: heartPos.x, top: heartPos.y }}>
                <Heart size={48} fill="#ff4d6d" color="#ff4d6d" />
              </div>
            )}
          </div>
        </div>
      </div>
      {lightbox && (msg.type === 'image' || msg.type === 'video') && (
        <MediaLightbox url={msg.mediaUrl} type={msg.type} onClose={() => setLightbox(false)} />
      )}
      {menuOpen && (
        <MessageMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuOpen(false)} onReply={handleReply} onReact={handleReaction} onDelete={isMe ? handleDelete : undefined} />
      )}
    </>
  )
}
