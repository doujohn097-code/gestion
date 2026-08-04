import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, addDoc, getDocs, onSnapshot, query, collection, serverTimestamp, where } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useAuth } from '../App'
import { ChevronRight, MessageCircle, User, Mail, Calendar, UserPlus, Check, Send } from 'lucide-react'
import { Avatar } from '../components/Avatar'

export default function Profile() {
  const { uid } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [target, setTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relation, setRelation] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = doc(db, 'users', uid)
        const snap = await getDoc(ref)
        if (snap.exists()) setTarget({ uid: snap.id, ...snap.data() })
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetch()
  }, [uid])

  useEffect(() => {
    if (!user || uid === user.uid) return
    const q1 = query(collection(db, 'friendRequests'), where('from', '==', user.uid), where('to', '==', uid))
    const q2 = query(collection(db, 'friendRequests'), where('from', '==', uid), where('to', '==', user.uid))
    const findMatch = (snap) => {
      const match = snap.docs.find(d => {
        const data = d.data()
        return (data.from === user.uid && data.to === uid) || (data.from === uid && data.to === user.uid)
      })
      if (match) {
        setRelation({ id: match.id, status: match.data().status, direction: match.data().from === user.uid ? 'out' : 'in' })
      } else {
        setRelation(prev => prev)
      }
    }
    const unsub1 = onSnapshot(q1, findMatch)
    const unsub2 = onSnapshot(q2, findMatch)
    return () => { unsub1(); unsub2() }
  }, [user, uid])

  const sendRequest = async () => {
    try { await addDoc(collection(db, 'friendRequests'), { from: user.uid, to: uid, status: 'pending', createdAt: serverTimestamp() }) } catch (e) { console.error(e) }
  }

  const startChat = async () => {
    if (uid === user.uid) return
    try {
      const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid))
      const snap = await getDocs(q)
      const existing = snap.docs.find(d => {
        const m = d.data().members || []
        return m.length === 2 && m.includes(uid)
      })
      if (existing) { navigate(`/chat/${existing.id}`); return }
      const ref = await addDoc(collection(db, 'groups'), {
        name: target.fullName,
        image: target.profilePic || '',
        members: [user.uid, uid].sort(),
        isDirect: true,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: null,
      })
      navigate(`/chat/${ref.id}`)
    } catch (e) { console.error(e) }
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center overflow-y-auto bg-black" dir="rtl">
        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  if (!target) {
    return (
      <div className="h-screen w-full flex items-center justify-center overflow-y-auto bg-black" dir="rtl">
        <p className="text-white/50">تعذر تحميل البيانات.</p>
      </div>
    )
  }

  const isMe = uid === user.uid

  return (
    <div className="h-screen w-full overflow-y-auto bg-black flex flex-col" dir="rtl">
      <div className="relative h-44 sm:h-48 w-full shrink-0">
        {target.coverPic ? (
          <img src={target.coverPic} alt="cover" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <div className="w-full h-full bg-[#111]" />
        )}
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center transition">
            <ChevronRight size={22} className="text-white" />
          </button>
        </div>
      </div>
      <div className="relative px-5 sm:px-6 -mt-12 flex flex-col items-center text-center">
        <div className="rounded-full ring-4 ring-black overflow-hidden border border-white/20 shadow-xl">
          <Avatar src={target.profilePic} name={target.fullName} size={112} />
        </div>
        <h1 className="mt-3 text-xl sm:text-2xl font-bold gradient-text">{target.fullName}</h1>
        <p className="text-white/50">@{target.username}</p>

        {!isMe && (
          <div className="mt-4 flex gap-2">
            {relation?.status === 'accepted' ? (
              <button onClick={startChat} className="flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-2xl gradient-bg text-black font-bold hover:scale-105 transition">
                <MessageCircle size={20} /> مراسلة
              </button>
            ) : relation?.status === 'pending' ? (
              <button disabled className="flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-2xl bg-[#111] border border-white/20 text-white/60">
                {relation.direction === 'out' ? <><Send size={18} /> تم الإرسال</> : <><Check size={18} /> طلب معلق</>}
              </button>
            ) : (
              <button onClick={sendRequest} className="flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-2xl gradient-bg text-black font-bold hover:scale-105 transition">
                <UserPlus size={20} /> إضافة صديق
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 px-5 sm:px-6 py-6">
        <div className="glass-strong rounded-2xl p-4 sm:p-5 border border-white/10">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-white"><User size={18} /> نبذة</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white/60"><User size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs">الاسم الكامل</p>
                <p className="text-white font-medium truncate">{target.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white/60"><Mail size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs">البريد الإلكتروني</p>
                <p className="text-white font-medium truncate">{target.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white/60"><Calendar size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs">تاريخ الانضمام</p>
                <p className="text-white font-medium">{target.createdAt ? new Date(target.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
