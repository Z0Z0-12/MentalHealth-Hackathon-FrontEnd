import { useState, useEffect } from 'react'
import { getCommunityPosts, createCommunityPost } from '../api/community'

export default function CommunityTab() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getCommunityPosts()
      .then(setPosts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map(post => (
        <div key={post.id} className="rounded-2xl p-5 bg-white/50">
          <p className="text-sm font-semibold text-gray-800">{post.author}</p>
          <p className="text-xs text-gray-500 mt-1">{post.content}</p>
          <div className="flex gap-3 mt-3 text-xs text-gray-400">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
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
        <div key={i} className="rounded-2xl h-32 animate-pulse bg-white/40" />
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