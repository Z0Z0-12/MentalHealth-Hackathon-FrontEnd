import { useState, useEffect } from 'react'
import { getForumThreads } from '../api/forum'

export default function ForumTab() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getForumThreads()
      .then(setThreads)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="flex flex-col gap-3">
      {threads.map(thread => (
        <div key={thread.id} className="rounded-2xl p-5 bg-white/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">{thread.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">by {thread.author} · {thread.lastActivity}</p>
          </div>
          <span className="text-xs text-gray-400">{thread.replies} replies</span>
        </div>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="rounded-2xl h-16 animate-pulse bg-white/40" />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500 h-64">
      <p className="text-sm">Could not connect to the server.</p>
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  )
}