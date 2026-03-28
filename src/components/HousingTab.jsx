import { useState, useEffect } from 'react'
import { getHousingListings } from '../api/housing'

export default function HousingTab() {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    getHousingListings()
      .then(setListings)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="grid grid-cols-3 gap-4">
      {listings.map(listing => (
        <div key={listing.id} className="rounded-2xl p-5 bg-white/50">
          <p className="text-sm font-semibold text-gray-800">{listing.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{listing.location}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{listing.type}</span>
            <span className="text-sm font-semibold text-green-600">{listing.price}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map(i => (
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