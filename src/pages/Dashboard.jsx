import { useState } from 'react'
import { MessageCircle, CalendarDays, LayoutList, Briefcase, Home } from 'lucide-react'
import Navbar from '../components/Navbar'
import WheelNav from '../components/WheelNav'
import ChatsTab from '../components/ChatsTab'
import EventsTab from '../components/EventsTab'
import ForumTab from '../components/ForumTab'
import CareerTab from '../components/CareerTab'
import HousingTab from '../components/HousingTab'

const tabs = [
  { id: 'chats',   label: 'Chats',  icon: MessageCircle },
  { id: 'events',  label: 'Events', icon: CalendarDays  },
  { id: 'forum',   label: 'Forum',  icon: LayoutList    },
  { id: 'career',  label: 'Career', icon: Briefcase     },
  { id: 'housing', label: 'Housing',icon: Home          },
]

const glassCard = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chats')

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{
      background: 'linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%)',
      position: 'relative',
    }}>
      {/* Background waves */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
          <path fill="rgba(140,200,120,0.22)" d="M0,220 C160,155 320,285 480,220 C640,155 800,285 960,220 C1120,155 1280,265 1440,210 L1440,380 L0,380 Z"/>
          <path fill="rgba(100,175,90,0.2)"  d="M0,265 C200,195 400,325 600,265 C800,205 1000,325 1200,268 C1320,238 1390,258 1440,252 L1440,380 L0,380 Z"/>
          <path fill="rgba(70,155,70,0.18)"  d="M0,305 C240,245 480,365 720,305 C960,245 1200,365 1440,305 L1440,380 L0,380 Z"/>
        </svg>
      </div>

      <Navbar />

      <main className="px-3 pt-2 pb-3 flex flex-col flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* Reserved space — wheel lives here, card hides its bottom half */}
        <div style={{ position: 'relative', height: '180px', flexShrink: 0 }}>
          <WheelNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab strip — z-index above wheel */}
        <div className="flex items-end gap-1" style={{ position: 'relative', zIndex: 3 }}>
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

        {/* Card — z-index above wheel so it hides the wheel's bottom half */}
        <div
          className="rounded-b-3xl flex-1 overflow-y-auto p-5"
          style={{ ...glassCard, position: 'relative', zIndex: 3 }}
        >
          {activeTab === 'chats'   && <ChatsTab />}
          {activeTab === 'events'  && <EventsTab />}
          {activeTab === 'forum'   && <ForumTab />}
          {activeTab === 'career'  && <CareerTab />}
          {activeTab === 'housing' && <HousingTab />}
        </div>
      </main>
    </div>
  )
}