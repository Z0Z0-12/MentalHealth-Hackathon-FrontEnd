import { useState } from 'react'
import Navbar from '../components/Navbar'
import ChatsTab from '../components/ChatsTab'
import CommunityTab from '../components/CommunityTab'
import ForumTab from '../components/ForumTab'
import CareerTab from '../components/CareerTab'
import HousingTab from '../components/HousingTab'

const tabs = [
  { id: 'chats',     label: 'Chats'     },
  { id: 'community', label: 'Community' },
  { id: 'forum',     label: 'Forum'     },
  { id: 'career',    label: 'Career'    },
  { id: 'housing',   label: 'Housing'   },
]

const glassCard = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}

export default function Dashboard() {
  const [activeTab, setActiveTab]   = useState('chats')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%)', position: 'relative' }}>

      {/* Waves — fixed to bottom, same as landing page */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
          <path fill="rgba(140,200,120,0.22)"
            d="M0,220 C160,155 320,285 480,220 C640,155 800,285 960,220 C1120,155 1280,265 1440,210 L1440,380 L0,380 Z"/>
          <path fill="rgba(100,175,90,0.2)"
            d="M0,265 C200,195 400,325 600,265 C800,205 1000,325 1200,268 C1320,238 1390,258 1440,252 L1440,380 L0,380 Z"/>
          <path fill="rgba(70,155,70,0.18)"
            d="M0,305 C240,245 480,365 720,305 C960,245 1200,365 1440,305 L1440,380 L0,380 Z"/>
        </svg>
      </div>

      <Navbar onSearch={setSearchQuery} />

      <main className="px-3 pt-2 pb-3 flex flex-col flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        {/* Space reserved for future content */}
        <div className="mb-28" />

        {/* Tab strip */}
        <div className="flex items-end gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...(activeTab === tab.id ? glassCard : {}),
                fontFamily: "'DM Sans', sans-serif",
                color: activeTab === tab.id ? '#0a2a0f' : '#3a6040',
              }}
              className={`flex-1 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'py-4 rounded-t-3xl rounded-b-none'
                  : 'py-1.5 bg-white/25 hover:bg-white/35 rounded-t-2xl mx-0.5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content panel — rounded, scrollable, no single solid card */}
        <div
          className="rounded-b-3xl flex-1 overflow-y-auto p-5"
          style={glassCard}
        >
          {activeTab === 'chats'     && <ChatsTab searchQuery={searchQuery} />}
          {activeTab === 'community' && <CommunityTab />}
          {activeTab === 'forum'     && <ForumTab />}
          {activeTab === 'career'    && <CareerTab />}
          {activeTab === 'housing'   && <HousingTab />}
        </div>
      </main>
    </div>
  )
}
