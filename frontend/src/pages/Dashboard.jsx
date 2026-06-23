import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumes } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const statusBadge = s => {
  const map = { READY: ['badge-green', '✓ Ready'], OPTIMIZING: ['badge-yellow', '⟳ Optimizing'], PARSING: ['badge-yellow', '⟳ Parsing'], FAILED: ['badge-red', '✗ Failed'], UPLOADING: ['badge-gray', '↑ Uploading'] }
  const [cls, label] = map[s] || ['badge-gray', s]
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  const load = () => {
    resumes.list().then(r => setList(r.data)).catch(() => toast.error('Failed to load resumes')).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // Poll for any in-progress resumes
    const interval = setInterval(() => {
      if (list.some(r => ['OPTIMIZING', 'PARSING', 'UPLOADING'].includes(r.status))) load()
    }, 4000)
    return () => clearInterval(interval)
  }, [list.length])

  const readyCount = list.filter(r => r.status === 'READY').length
  const processingCount = list.filter(r => ['OPTIMIZING', 'PARSING'].includes(r.status)).length

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋
            </h1>
            <p style={{ color: '#9898b8' }}>Manage your AI-optimized resumes</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/upload" className="btn btn-secondary">📄 Senior — Upload Resume</Link>
            <Link to="/build" className="btn btn-primary">✨ Fresher — Build Resume</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Resumes', val: list.length, color: '#a78bfa' },
            { label: 'Ready to Download', val: readyCount, color: '#22c55e' },
            { label: 'Processing', val: processingCount, color: '#f59e0b' },
            { label: 'Cost Saved vs. Coaches', val: `₹${list.length * 500 - list.length * 9}+`, color: '#6c63ff' },
          ].map(s => (
            <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#9898b8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Resumes list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Your Resumes</h2>
            <button onClick={load} style={{ background: 'none', border: 'none', color: '#9898b8', cursor: 'pointer', fontSize: 13 }}>↻ Refresh</button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9898b8' }}>Loading...</div>
          ) : list.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <h3 style={{ color: '#9898b8', fontWeight: 400, marginBottom: 20 }}>No resumes yet</h3>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/upload" className="btn btn-secondary">Upload existing resume</Link>
                <Link to="/build" className="btn btn-primary">Build from scratch</Link>
              </div>
            </div>
          ) : (
            <div>
              {list.map((r, i) => (
                <div key={r.id} onClick={() => r.status === 'READY' && nav(`/resume/${r.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < list.length - 1 ? '1px solid rgba(108,99,255,0.1)' : 'none', cursor: r.status === 'READY' ? 'pointer' : 'default', transition: 'background 0.15s' }}
                  onMouseEnter={e => r.status === 'READY' && (e.currentTarget.style.background = 'rgba(108,99,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ fontSize: 28 }}>{r.type === 'FRESHER' ? '✨' : '📄'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled Resume'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {statusBadge(r.status)}
                      <span className="badge badge-gray">{r.type === 'FRESHER' ? 'Fresher Build' : 'Senior Upload'}</span>
                      {r.atsScore > 0 && <span className="badge badge-purple">ATS {r.atsScore}/100</span>}
                      <span style={{ fontSize: 12, color: '#6666aa' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  {r.status === 'READY' && (
                    <Link to={`/resume/${r.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={e => e.stopPropagation()}>
                      View & Download →
                    </Link>
                  )}
                  {['OPTIMIZING', 'PARSING'].includes(r.status) && (
                    <div style={{ color: '#f59e0b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Processing
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="card" style={{ marginTop: 20, background: 'rgba(108,99,255,0.06)', borderColor: 'rgba(108,99,255,0.2)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#a78bfa' }}>💡 Pro Tips</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Paste the full JD from LinkedIn or Naukri for best keyword matching', 'Create a separate optimized resume for each job application', 'ATS score above 75 means strong keyword alignment'].map(t => (
              <li key={t} style={{ fontSize: 13, color: '#9898b8', display: 'flex', gap: 8 }}>
                <span style={{ color: '#6c63ff' }}>→</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
