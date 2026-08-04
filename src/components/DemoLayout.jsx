import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare, Users, Bell, User, LogOut } from 'lucide-react'

const nav = [
  { path: '/demo/chatlist', label: 'المحادثات', icon: MessageSquare },
  { path: '/demo/users', label: 'المستخدمون', icon: Users },
  { path: '/demo/requests', label: 'الطلبات', icon: Bell },
]

export default function DemoLayout({ children, userName = 'مستخدم تجريبي', username = 'demo_user' }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden" dir="rtl">
      <header className="glass-strong px-4 sm:px-5 py-3 flex items-center justify-between shrink-0 border-b border-white/10 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-[#111] border border-white/20 flex items-center justify-center font-bold text-lg">م</div>
          <div className="min-w-0">
            <h2 className="font-bold text-base leading-tight truncate">{userName}</h2>
            <p className="text-xs text-white/40">@{username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate('/demo/profile')} className="w-10 h-10 rounded-full bg-[#111] hover:bg-white/10 border border-white/20 flex items-center justify-center transition">
            <User size={20} />
          </button>
          <button onClick={() => navigate('/login')} className="w-10 h-10 rounded-full bg-[#111] hover:bg-white/10 border border-white/20 flex items-center justify-center transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto relative">
        {children}
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-strong rounded-full px-2 py-2 border border-white/10 flex items-center gap-1 shadow-2xl">
          {nav.map((item) => {
            const active = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition font-medium text-sm ${
                  active ? 'gradient-bg text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
