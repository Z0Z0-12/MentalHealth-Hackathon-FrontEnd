import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

const clients = [
  { id: 1, name: 'Sarah', sub: 'Session 4',  value: '$64.2K' },
  { id: 2, name: 'James',  sub: 'Session 7',  value: '$48.1K' },
  { id: 3, name: 'Veto',   sub: 'Session 12', value: '$82.4K' },
  { id: 4, name: 'Aisha',  sub: 'Session 2',  value: '$31.9K' },
  { id: 5, name: 'Trevor', sub: 'Session 9',  value: '$57.3K' },
]

export default function HeroSection() {
  const [selected, setSelected] = useState(3)

  const active = clients.find(c => c.id === selected)

  return (
    <div
      className="mx-6 mt-4 rounded-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #dbeeff 0%, #c8e8ff 50%, #b8dcff 100%)', minHeight: '220px' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between px-8 pt-6">
        {/* Left — title */}
        <div>
          <p className="text-xs text-blue-400 font-medium mb-1 tracking-wide uppercase">
            Aggregated Client Metrics
          </p>
          <h1 className="text-3xl font-bold text-gray-800">All Client Data</h1>
        </div>

        {/* Right — status badges */}
        <div className="flex items-center gap-2 mt-1">
          <Badge label="Name" value={active.name} />
          <Badge label="" value={active.value} highlight />
          <StatusBadge />
        </div>
      </div>

      {/* Decorative circles — approximating the 3D glass shapes */}
      <div className="absolute right-48 top-4 pointer-events-none">
        <div className="relative w-32 h-32">
          {[0, 20, 40, 60, 80, 100, 120].map((rotate, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-blue-200/60"
              style={{
                transform: `rotate(${rotate}deg) scaleX(0.3)`,
                background: `rgba(147, 197, 253, ${0.06 + i * 0.04})`,
              }}
            />
          ))}
          <div
            className="absolute inset-4 rounded-full"
            style={{ background: 'linear-gradient(135deg, rgba(191,219,254,0.8), rgba(147,197,253,0.4))' }}
          />
        </div>
      </div>

      {/* Client selector cards */}
      <div className="flex gap-3 px-8 pb-5 mt-6">
        {clients.map(client => (
          <button
            key={client.id}
            onClick={() => setSelected(client.id)}
            className={`flex flex-col px-4 py-2.5 rounded-xl text-left transition-all ${
              selected === client.id
                ? 'bg-white shadow-md scale-105'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          >
            {/* Top row inside card */}
            <div className="flex items-center justify-between gap-6 mb-1">
              <div className="flex items-center gap-1.5">
                {/* Avatar dot */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">{client.name[0]}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">{client.name}</span>
              </div>
              <RefreshCw size={10} className="text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400">{client.sub}</span>

            {/* Value shown only on selected */}
            {selected === client.id && (
              <span className="text-sm font-bold text-gray-800 mt-1">{client.value} ↑</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function Badge({ label, value, highlight }) {
  return (
    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
      highlight ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-600'
    }`}>
      {label && <span className="text-gray-400">{label}:</span>}
      <span>{value}</span>
    </div>
  )
}

function StatusBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
      <span>Status:</span>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
      <span className="text-green-600">in progress</span>
    </div>
  )
}