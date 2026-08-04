import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../App'
import { Avatar } from '../components/Avatar'
import { formatListTime } from '../utils/formatTime'
import { Plus, Search, Users } from 'lucide-react'
import { uploadFile } from '../utils/uploadFile'
import Layout from '../components/Layout'

export default function ChatList() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [newPreview, setNewPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid))
    const unsub = onSnapshot(
      q,
      async (snap) => {
        setError('')
        const list = await Promise.all(snap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() }
          if (data.lastMessage?.senderId) {
            try {
              const u = await getDoc(doc(db, 'users', data.lastMessage.senderId))
              data.lastSender = u.exists() ? u.data() : null
            } catch (e) { data.lastSender = null }
          }
          return data
        }))
        list.sort((a, b) => {
          const ta = b.lastMessage?.createdAt?.seconds || b.createdAt?.seconds || 0
          const tb = a.lastMessage?.createdAt?.seconds || a.createdAt?.seconds || 0
          return ta - tb
        })
        setGroups(list)
      },
      (err) => {
        console.error('Groups load error', err)
        setError('تعذّر تحميل المحادثات، تحقق من صلاحيات Firestore.')
      }
    )
    return unsub
  }, [user])

  const createGroup = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !user) return
    setLoading(true)
    setError('')
    try {
      const ref = await addDoc(collection(db, 'groups'), {
        name: newName.trim(),
        image: '',
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: null,
      })
      let imageUrl = ''
      if (newImage) {
        try {
          imageUrl = await uploadFile(newImage, `groups/${ref.id}/image`)
          await updateDoc(ref, { image: imageUrl })
        } catch (e) {
          console.warn('Group image upload failed', e)
          setError('تم إنشاء المحادثة لكن فشل رفع صورتها.')
        }
      }
      setNewName('')
      setNewImage(null)
      setNewPreview('')
      setShowCreate(false)
      navigate(`/chat/${ref.id}`)
    } catch (e) {
      console.error(e)
      setError('تعذّر إنشاء المحادثة، تحقق من الاتصال والصلاحيات.')
    }
    setLoading(false)
  }

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout>
      <div className="px-4 sm:px-5 py-3">
        <div className="relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="البحث في المحادثات..."
            className="w-full rounded-2xl py-3 pr-11 pl-4"
          />
        </div>
      </div>

      {error && <p className="mx-4 sm:mx-5 text-sm text-white bg-white/10 border border-white/10 rounded-xl p-3">{error}</p>}

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-28 space-y-3">
        {filtered.map(g => (
          <div key={g.id} onClick={() => navigate(`/chat/${g.id}`)}
            className="glass rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#0a0a0a] hover:border-white/20 transition border border-transparent">
            <Avatar src={g.image} name={g.name} size={52} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <h3 className="font-semibold truncate">{g.name}</h3>
                <span className="text-xs text-white/40 shrink-0">{formatListTime(g.lastMessage?.createdAt)}</span>
              </div>
              <p className="text-sm text-white/50 truncate mt-0.5">
                {g.lastMessage ? (
                  <>
                    <span className="text-white">{g.lastSender?.fullName || ''}:</span>{' '}
                    {g.lastMessage.type === 'text' ? g.lastMessage.content : g.lastMessage.type === 'image' ? 'صورة' : g.lastMessage.type === 'video' ? 'فيديو' : g.lastMessage.type === 'audio' ? 'رسالة صوتية' : 'ملف'}
                  </>
                ) : 'لا توجد رسائل بعد'}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !error && (
          <div className="text-center text-white/40 py-12 glass rounded-3xl mx-2">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>لا توجد محادثات. أنشئ محادثتك الأولى.</p>
          </div>
        )}
      </div>

      <button onClick={() => setShowCreate(true)} className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg hover:scale-105 transition z-30">
        <Plus size={28} />
      </button>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="glass-strong rounded-3xl w-full max-w-sm p-5 page-enter border border-white/10">
            <h3 className="font-bold text-xl mb-4 gradient-text">محادثة جديدة</h3>
            <form onSubmit={createGroup} className="space-y-4">
              <div className="flex justify-center">
                <label className="w-20 h-20 rounded-full overflow-hidden bg-[#111] border border-white/20 flex items-center justify-center cursor-pointer">
                  {newPreview ? <img src={newPreview} className="w-full h-full object-cover" alt="group" /> : <Users size={28} className="text-white/60" />}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files[0]
                    if (f) { setNewImage(f); setNewPreview(URL.createObjectURL(f)) }
                  }} />
                </label>
              </div>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم المحادثة" required
                className="w-full rounded-2xl px-4 py-3" />
              {error && <p className="text-sm text-white bg-white/10 rounded-xl p-3 border border-white/10">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-2xl bg-[#111] hover:bg-white/10 border border-white/20 transition">إلغاء</button>
                <button type="submit" disabled={loading} className="flex-1 gradient-bg text-black font-bold py-3 rounded-2xl disabled:opacity-60">إنشاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
