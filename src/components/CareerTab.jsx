import { useState, useEffect } from 'react'
import { getCareerListings } from '../api/career'

export default function CareerTab() {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    getCareerListings()
      .then(setListings)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="grid grid-cols-2 gap-4">
      {listings.map(job => (
        <div key={job.id} className="rounded-2xl p-5 bg-white/50">
          <p className="text-sm font-semibold text-gray-800">{job.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
          <div className="flex gap-2 mt-2 text-xs text-gray-400">
            <span>{job.location}</span>
            <span>·</span>
            <span>{job.type}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="rounded-2xl h-28 animate-pulse bg-white/40" />
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