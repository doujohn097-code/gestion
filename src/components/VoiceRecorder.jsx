import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square } from 'lucide-react'

export function VoiceRecorder({ onRecord, disabled }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timer = useRef(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop()
      }
    }
  }, [])

  const start = async () => {
    if (disabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorder.current = recorder
      chunks.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
        onRecord(file)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start(100)
      setRecording(true)
      setSeconds(0)
      timer.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (e) {
      alert('تم رفض إذن الميكروفون أو هو غير مدعوم.')
    }
  }

  const stop = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
    }
    setRecording(false)
    if (timer.current) clearInterval(timer.current)
  }

  if (!recording) {
    return (
      <button onClick={start} type="button" disabled={disabled} className="w-11 h-11 rounded-full bg-[#111] hover:bg-white/10 border border-white/20 flex items-center justify-center transition disabled:opacity-40" title="تسجيل صوتي">
        <Mic size={20} className="text-white" />
      </button>
    )
  }

  return (
    <button onClick={stop} type="button" className="h-11 px-4 rounded-full bg-white/10 text-white animate-pulse border border-white/20 flex items-center gap-2">
      <Square size={16} fill="currentColor" />
      <span>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>
    </button>
  )
}
