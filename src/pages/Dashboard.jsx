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
  const [activeTab, setActiveTab] = useState('chats')

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: '#B5D8A0' }}>
      <Navbar />

      <main className="px-3 pt-2 pb-3 flex flex-col flex-1 overflow-hidden">
        {/* Space reserved for future content */}
        <div className="mb-28" />

        {/* Tab strip */}
        <div className="flex items-end gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? glassCard : {}}
              className={`flex-1 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'py-4 text-green-700 rounded-t-3xl rounded-b-none'
                  : 'py-1.5 bg-white/25 text-gray-500 hover:bg-white/35 hover:text-gray-700 rounded-t-2xl mx-0.5'
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
          {activeTab === 'chats'     && <ChatsTab />}
          {activeTab === 'community' && <CommunityTab />}
          {activeTab === 'forum'     && <ForumTab />}
          {activeTab === 'career'    && <CareerTab />}
          {activeTab === 'housing'   && <HousingTab />}
        </div>
      </main>
    </div>
  )
}
