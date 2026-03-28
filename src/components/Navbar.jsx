import { Bell, Grid, Heart, Search, User } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3" style={{ background: 'transparent' }}>
      {/* Left — Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
          <Heart size={14} className="text-green-600" />
        </div>
        <span className="font-semibold text-gray-700 text-sm">MindCare</span>
      </div>

      {/* Center — Nav icons, no container box */}
      <div className="flex items-center gap-4">
        <NavIcon icon={<Grid size={16} />} active />
        <NavIcon icon={<Search size={16} />} />
        <NavIcon icon={<Bell size={16} />} />
      </div>

      {/* Right — Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center">
        <User size={14} className="text-white" />
      </div>
    </nav>
  )
}

function NavIcon({ icon, active }) {
  return (
    <button
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
        active ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:bg-white/50'
      }`}
    >
      {icon}
    </button>
  )
}