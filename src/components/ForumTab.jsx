import { useState, useEffect } from 'react'
import {
  Heart, MessageSquare, Plus, X, Send,
  LayoutList, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import {
  getForumPosts, createForumPost,
  getComments, createComment, toggleLike,
} from '../api/forum'

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['general', 'internship', 'housing', 'academics', 'career', 'events', 'other']

const CAT_STYLE = {
  general:    { bg: '#f0f7f0', color: '#3d7a4f' },
  internship: { bg: '#e8f4ff', color: '#2563eb' },
  housing:    { bg: '#fef9c3', color: '#854d0e' },
  academics:  { bg: '#fce7f3', color: '#9d174d' },
  career:     { bg: '#ede9fe', color: '#5b21b6' },
  events:     { bg: '#ffedd5', color: '#9a3412' },
  other:      { bg: '#f1f5f9', color: '#475569' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ForumTab() {
  const [posts,       setPosts]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [filterCat,   setFilterCat]   = useState(null)   // null = all
  const [showNewPost, setShowNewPost] = useState(false)

  // comments state per post: { [postId]: { items, loading, loaded } }
  const [commentsMap,   setCommentsMap]   = useState({})
  // open post id (which post's comments are visible)
  const [openPostId,    setOpenPostId]    = useState(null)
  // comment input per post: { [postId]: { text, isAnon, submitting } }
  const [commentInput,  setCommentInput]  = useState({})

  function loadPosts(category = filterCat) {
    setLoading(true)
    setError(null)
    getForumPosts({ category: category || undefined })
      .then(data => setPosts(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPosts() }, []) // eslint-disable-line

  // ── like ──────────────────────────────────────────────────────────────────
  async function handleLike(post) {
    try {
      const res = await toggleLike(post.id)
      setPosts(prev => prev.map(p => p.id === post.id
        ? { ...p, likes_count: res?.likes_count ?? p.likes_count, is_liked_by_me: res?.liked ?? p.is_liked_by_me }
        : p
      ))
    } catch { /* silent */ }
  }

  // ── toggle comments ───────────────────────────────────────────────────────
  async function handleToggleComments(postId) {
    if (openPostId === postId) { setOpenPostId(null); return }
    setOpenPostId(postId)
    if (commentsMap[postId]?.loaded) return
    setCommentsMap(prev => ({ ...prev, [postId]: { items: [], loading: true, loaded: false } }))
    try {
      const data = await getComments(postId)
      const items = Array.isArray(data) ? data : data?.items ?? []
      setCommentsMap(prev => ({ ...prev, [postId]: { items, loading: false, loaded: true } }))
    } catch {
      setCommentsMap(prev => ({ ...prev, [postId]: { items: [], loading: false, loaded: true } }))
    }
  }

  // ── submit comment ────────────────────────────────────────────────────────
  async function handleSubmitComment(postId) {
    const input = commentInput[postId] ?? {}
    const text = (input.text ?? '').trim()
    if (!text) return
    setCommentInput(prev => ({ ...prev, [postId]: { ...prev[postId], submitting: true } }))
    try {
      const newComment = await createComment(postId, text, input.isAnon ?? false)
      setCommentsMap(prev => ({
        ...prev,
        [postId]: { ...prev[postId], items: [...(prev[postId]?.items ?? []), newComment] },
      }))
      setCommentInput(prev => ({ ...prev, [postId]: { text: '', isAnon: false, submitting: false } }))
      // bump comments_count on the post
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count ?? 0) + 1 } : p))
    } catch {
      setCommentInput(prev => ({ ...prev, [postId]: { ...prev[postId], submitting: false } }))
    }
  }

  // ── filter change ─────────────────────────────────────────────────────────
  function handleFilterChange(cat) {
    const next = filterCat === cat ? null : cat
    setFilterCat(next)
    loadPosts(next)
  }

  // ── post created callback ─────────────────────────────────────────────────
  function onPostCreated(newPost) {
    setPosts(prev => [newPost, ...prev])
    setShowNewPost(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* header row */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          Community Posts
        </span>
        <button
          onClick={() => setShowNewPost(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: '#4a7c59', color: '#fff', border: 'none',
            borderRadius: '999px', padding: '5px 12px', fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 600,
          }}
        >
          {showNewPost ? <X size={13} /> : <Plus size={13} />}
          {showNewPost ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {/* new post form */}
      {showNewPost && <NewPostForm onCreated={onPostCreated} onCancel={() => setShowNewPost(false)} />}

      {/* category filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const active = filterCat === cat
          return (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                border: active ? '2px solid rgba(10,42,15,0.25)' : '2px solid transparent',
                background: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
                color: active ? '#0a2a0f' : '#5a8060',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="rounded-2xl h-20 animate-pulse bg-white/40" />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-500">
          <p className="text-sm">Could not load forum.</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <LayoutList size={32} style={{ color: '#c0d8c0' }} />
          <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
            No posts yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isOpen={openPostId === post.id}
              commentsState={commentsMap[post.id]}
              commentInput={commentInput[post.id] ?? { text: '', isAnon: false, submitting: false }}
              onLike={() => handleLike(post)}
              onToggleComments={() => handleToggleComments(post.id)}
              onCommentChange={(text) =>
                setCommentInput(prev => ({ ...prev, [post.id]: { ...prev[post.id], text } }))
              }
              onAnonToggle={() =>
                setCommentInput(prev => ({
                  ...prev,
                  [post.id]: { ...prev[post.id], isAnon: !(prev[post.id]?.isAnon ?? false) },
                }))
              }
              onSubmitComment={() => handleSubmitComment(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post, isOpen, commentsState, commentInput, onLike, onToggleComments, onCommentChange, onAnonToggle, onSubmitComment }) {
  const [expanded, setExpanded] = useState(false)
  const cat = post.category ?? 'general'
  const s   = CAT_STYLE[cat] ?? CAT_STYLE.general

  return (
    <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: '16px', padding: '16px', backdropFilter: 'blur(4px)' }}>
      {/* title row */}
      <div className="flex items-start justify-between gap-2">
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', fontFamily: "'DM Sans', sans-serif", flex: 1 }}>
          {post.title}
        </p>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: s.bg, color: s.color, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {cat}
        </span>
      </div>

      {/* content */}
      <p
        style={{
          fontSize: '12px', color: '#6b7280', marginTop: '6px',
          fontFamily: "'DM Sans', sans-serif", lineHeight: '1.5',
          display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        {post.content}
      </p>
      {post.content?.length > 180 && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ fontSize: '11px', color: '#4a7c59', background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* meta + actions */}
      <div className="flex items-center justify-between mt-3">
        <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
          {post.is_anonymous ? 'Anonymous' : (post.display_name ?? 'Unknown')} · {timeAgo(post.created_at)}
        </span>
        <div className="flex items-center gap-3">
          {/* like */}
          <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Heart
              size={14}
              style={{
                color: post.is_liked_by_me ? '#dc2626' : '#9ca3af',
                fill:  post.is_liked_by_me ? '#dc2626' : 'none',
                transition: 'all 0.15s',
              }}
            />
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
              {post.likes_count ?? 0}
            </span>
          </button>
          {/* comments toggle */}
          <button onClick={onToggleComments} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <MessageSquare size={14} style={{ color: isOpen ? '#4a7c59' : '#9ca3af' }} />
            <span style={{ fontSize: '12px', color: isOpen ? '#4a7c59' : '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
              {post.comments_count ?? 0}
            </span>
            {isOpen ? <ChevronUp size={12} style={{ color: '#4a7c59' }} /> : <ChevronDown size={12} style={{ color: '#9ca3af' }} />}
          </button>
        </div>
      </div>

      {/* comments section */}
      {isOpen && (
        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
          <CommentsSection
            commentsState={commentsState}
            commentInput={commentInput}
            onCommentChange={onCommentChange}
            onAnonToggle={onAnonToggle}
            onSubmit={onSubmitComment}
          />
        </div>
      )}
    </div>
  )
}

// ─── CommentsSection ──────────────────────────────────────────────────────────

function CommentsSection({ commentsState, commentInput, onCommentChange, onAnonToggle, onSubmit }) {
  const loading  = commentsState?.loading ?? false
  const comments = commentsState?.items   ?? []

  return (
    <div className="flex flex-col gap-3">
      {/* comment list */}
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} style={{ color: '#9ca3af', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Loading comments…</span>
        </div>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {comments.map(c => (
            <div key={c.id} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '8px 10px' }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4a7c59', fontFamily: "'DM Sans', sans-serif" }}>
                  {c.is_anonymous ? 'Anonymous' : (c.display_name ?? 'Unknown')}
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* add comment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <textarea
          value={commentInput.text}
          onChange={e => onCommentChange(e.target.value)}
          placeholder="Write a comment…"
          rows={2}
          style={{
            width: '100%', borderRadius: '10px', border: '1px solid #d1d5db',
            padding: '8px 10px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
            resize: 'none', outline: 'none', background: '#fff', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={commentInput.isAnon ?? false}
              onChange={onAnonToggle}
              style={{ accentColor: '#4a7c59', width: '13px', height: '13px' }}
            />
            <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
          </label>
          <button
            onClick={onSubmit}
            disabled={commentInput.submitting || !(commentInput.text ?? '').trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: (commentInput.text ?? '').trim() ? '#4a7c59' : '#d1d5db',
              color: '#fff', border: 'none', borderRadius: '999px',
              padding: '5px 12px', fontSize: '12px', cursor: (commentInput.text ?? '').trim() ? 'pointer' : 'default',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}
          >
            {commentInput.submitting
              ? <Loader2 size={12} className="animate-spin" />
              : <Send size={12} />
            }
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── NewPostForm ──────────────────────────────────────────────────────────────

function NewPostForm({ onCreated, onCancel }) {
  const [title,     setTitle]     = useState('')
  const [content,   setContent]   = useState('')
  const [category,  setCategory]  = useState('general')
  const [isAnon,    setIsAnon]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err,       setErr]       = useState(null)

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setErr(null)
    try {
      const post = await createForumPost(title.trim(), content.trim(), isAnon, category)
      onCreated(post)
    } catch (e) {
      setErr(e.message)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '16px', border: '1px solid #d1fae5', backdropFilter: 'blur(4px)' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>
        New Post
      </p>

      {/* title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={500}
        style={{
          width: '100%', borderRadius: '10px', border: '1px solid #d1d5db',
          padding: '8px 10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
          outline: 'none', background: '#fff', marginBottom: '8px', boxSizing: 'border-box',
        }}
      />

      {/* content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
        maxLength={10000}
        style={{
          width: '100%', borderRadius: '10px', border: '1px solid #d1d5db',
          padding: '8px 10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
          resize: 'vertical', outline: 'none', background: '#fff', marginBottom: '8px', boxSizing: 'border-box',
        }}
      />

      {/* category + anon row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{
            borderRadius: '8px', border: '1px solid #d1d5db', padding: '5px 8px',
            fontSize: '12px', fontFamily: "'DM Sans', sans-serif", outline: 'none',
            background: '#fff', cursor: 'pointer', color: CAT_STYLE[category]?.color,
          }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={isAnon}
            onChange={() => setIsAnon(v => !v)}
            style={{ accentColor: '#4a7c59', width: '13px', height: '13px' }}
          />
          <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
        </label>
      </div>

      {err && <p style={{ fontSize: '11px', color: '#dc2626', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>{err}</p>}

      {/* actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: '1px solid #d1d5db', borderRadius: '999px',
            padding: '5px 14px', fontSize: '12px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", color: '#6b7280',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: title.trim() && content.trim() ? '#4a7c59' : '#d1d5db',
            color: '#fff', border: 'none', borderRadius: '999px',
            padding: '5px 16px', fontSize: '12px', fontWeight: 600,
            cursor: title.trim() && content.trim() ? 'pointer' : 'default',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : null}
          Post
        </button>
      </div>
    </div>
  )
}