import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { getIdToken } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useAuth } from '../App'
import { Avatar } from '../components/Avatar'
import { MessageBubble } from '../components/MessageBubble'
import { VoiceRecorder } from '../components/VoiceRecorder'
import { uploadFile, getFileType } from '../utils/uploadFile'
import { ChevronRight, Send, Paperclip, MoreVertical, UserPlus, Trash2, LogOut, X } from 'lucide-react'

export default function Chat() {
  const { groupId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [members, setMembers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadErr, setUploadErr] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [addUsername, setAddUsername] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const bottomRef = useRef(null)
  const fileRef = useRef()

  useEffect(() => {
    if (!groupId) return
    setError('')
    const unsubGroup = onSnapshot(
      doc(db, 'groups', groupId),
      (snap) => { setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null) },
      (err) => { console.error('Group load error', err); setError('تعذّر تحميل المحادثة، تحقق من الصلاحيات.') }
    )
    const q = query(collection(db, 'groups', groupId, 'messages'), orderBy('createdAt', 'asc'))
    const unsubMessages = onSnapshot(
      q,
      (snap) => { setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))) },
      (err) => { console.error('Messages load error', err); setError('تعذّر تحميل الرسائل، تحقق من الصلاحيات.') }
    )
    return () => { unsubGroup(); unsubMessages() }
  }, [groupId])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!group?.members) return
      const map = {}
      await Promise.all(group.members.map(async (uid) => {
        const snap = await getDoc(doc(db, 'users', uid))
        map[uid] = snap.exists() ? snap.data() : { fullName: 'مجهول', profilePic: '' }
      }))
      setMembers(map)
    }
    fetchMembers()
  }, [group])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendNotification = async (msgContent, msgType) => {
    try {
      const token = await getIdToken(auth.currentUser, true)
      const base = import.meta.env.VITE_API_BASE || ''
      await fetch(`${base}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ groupId, content: msgContent, type: msgType, senderName: profile?.fullName || 'Gestion' }),
      })
    } catch (e) { console.warn('Notification send failed', e) }
  }

  const sendMessage = async (content, type = 'text', mediaUrl = '', fileName = '') => {
    const finalContent = content || ''
    const newMsg = {
      senderId: user.uid,
      type,
      content: finalContent,
      mediaUrl,
      fileName,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'groups', groupId, 'messages'), newMsg)
    await updateDoc(doc(db, 'groups', groupId), { lastMessage: { ...newMsg, createdAt: serverTimestamp() } })
    sendNotification(finalContent, type)
    setText('')
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    sendMessage(text.trim(), 'text')
  }

  const uploadAndSend = async (file, type) => {
    if (!file) return
    setLoading(true)
    setUploadErr('')
    try {
      const folder = type === 'audio' ? `groups/${groupId}/audio` : `groups/${groupId}/media`
      const url = await uploadFile(file, folder)
      await sendMessage('', type, url, file.name)
    } catch (e) {
      console.error(e)
      setUploadErr('فشل الرفع. تأكد من أن R2 عام وCORS مفعّل.')
    }
    setLoading(false)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const type = getFileType(file)
    uploadAndSend(file, type)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleVoice = (file) => {
    uploadAndSend(file, 'audio')
  }

  const addMember = async (e) => {
    e.preventDefault()
    if (!addUsername.trim()) return
    const clean = addUsername.trim().toLowerCase()
    const q = query(collection(db, 'users'), where('username', '==', clean))
    const res = await getDocs(q)
    if (res.empty) { alert('المستخدم غير موجود'); return }
    const targetUser = res.docs[0].data()
    await updateDoc(doc(db, 'groups', groupId), { members: arrayUnion(targetUser.uid) })
    setAddUsername('')
    setShowAdd(false)
  }

  const leaveGroup = async () => {
    if (!confirm('هل تريد مغادرة المحادثة؟')) return
    await updateDoc(doc(db, 'groups', groupId), { members: arrayRemove(user.uid) })
    navigate('/')
  }

  const deleteGroup = async () => {
    if (!confirm('هل تريد حذف المحادثة نهائيًا؟')) return
    await deleteDoc(doc(db, 'groups', groupId))
    navigate('/')
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden bg-black" dir="rtl">
        <p className="text-white/70 text-center mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 rounded-2xl gradient-bg text-black font-bold">العودة</button>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="h-screen w-full flex items-center justify-center overflow-hidden bg-black" dir="rtl">
        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  const isAdmin = group.createdBy === user.uid

  return (
    <div className="h-screen max-h-screen w-full bg-black flex flex-col overflow-hidden" dir="rtl">
      <header className="glass-strong px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-[#111] hover:bg-white/10 border border-white/20 flex items-center justify-center transition shrink-0">
            <ChevronRight size={22} className="text-white" />
          </button>
          <Avatar src={group.image} name={group.name} size={46} />
          <div className="min-w-0">
            <h2 className="font-bold text-lg leading-tight truncate">{group.name}</h2>
            <p className="text-xs text-white/40">{group.members?.length || 0} عضو</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-full bg-[#111] hover:bg-white/10 border border-white/20 flex items-center justify-center transition">
            <MoreVertical size={20} className="text-white" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-2 w-44 glass-strong rounded-2xl overflow-hidden z-20 text-sm border border-white/10" dir="rtl">
              <button onClick={() => { setShowAdd(true); setMenuOpen(false) }} className="w-full text-right px-4 py-3 hover:bg-[#0a0a0a] flex items-center gap-2 text-white"><UserPlus size={16} /> إضافة عضو</button>
              {isAdmin && <button onClick={() => { deleteGroup(); setMenuOpen(false) }} className="w-full text-right px-4 py-3 hover:bg-white/10 text-white flex items-center gap-2"><Trash2 size={16} /> حذف</button>}
              <button onClick={() => { leaveGroup(); setMenuOpen(false) }} className="w-full text-right px-4 py-3 hover:bg-[#0a0a0a] flex items-center gap-2 text-white/70"><LogOut size={16} /> مغادرة</button>
            </div>
          )}
        </div>
      </header>

      {showAdd && (
        <div className="px-4 py-2 bg-[#0a0a0a] border-b border-white/20 flex gap-2">
          <input value={addUsername} onChange={e => setAddUsername(e.target.value)} placeholder="اسم المستخدم للإضافة" className="flex-1 rounded-xl px-3 py-2 text-sm" />
          <button onClick={addMember} className="px-4 py-2 rounded-xl gradient-bg text-sm font-bold text-black">إضافة</button>
          <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl bg-[#0a0a0a] neon-border"><X size={16} className="text-white" /></button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24" dir="rtl">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} user={members[msg.senderId]} isMe={msg.senderId === user.uid} />
        ))}
        <div ref={bottomRef} />
      </div>

      {uploadErr && (
        <div className="px-4 py-2 text-xs text-red-300 bg-red-900/20 border-t border-red-500/20" dir="rtl">{uploadErr}</div>
      )}

      <form onSubmit={handleSend} className="glass-strong p-3 flex items-center gap-2 shrink-0 border-t border-white/10">
        <input
          type="file"
          ref={fileRef}
          accept="image/*,video/*,audio/*"
          onChange={handleFile}
          className="hidden"
        />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading} className="w-11 h-11 rounded-full bg-[#111] hover:bg-white/10 border border-white/20 flex items-center justify-center transition shrink-0 disabled:opacity-40" title="إرفاق صورة أو فيديو أو صوت">
          <Paperclip size={20} className="text-white" />
        </button>

        <div className="shrink-0"><VoiceRecorder onRecord={handleVoice} disabled={loading} /></div>

        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={loading ? 'جارٍ الإرسال...' : 'رسالة...'}
          disabled={loading}
          className="flex-1 rounded-2xl px-4 py-3 min-w-0 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="w-11 h-11 rounded-full gradient-bg disabled:opacity-40 transition flex items-center justify-center shrink-0"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
