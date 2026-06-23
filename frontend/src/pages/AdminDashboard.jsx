import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

/* ── Helpers ─────────────────────────────────────────────────── */
const S = {
  nav: { background: '#0f0f1a', borderBottom: '1px solid rgba(245,158,11,0.15)', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  page: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  card: { background: '#1a1a2e', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 },
  statCard: { background: '#1a1a2e', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 12, padding: '20px 24px', textAlign: 'center' },
  tab: active => ({ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, background: active ? 'rgba(245,158,11,0.15)' : 'transparent', color: active ? '#f59e0b' : '#9898b8', transition: 'all .15s' }),
  th: { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6666aa', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid rgba(245,158,11,0.1)' },
  td: { padding: '12px', fontSize: 13, color: '#e8e8f0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  badge: (color) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: `rgba(${color},0.15)`, color: `rgb(${color})` }),
  btn: (color='108,99,255') => ({ background: `rgba(${color},0.15)`, color: `rgb(${color})`, border: `1px solid rgba(${color},0.3)`, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }),
}

function StatCard({ icon, label, value, sub, color = '#f59e0b' }) {
  return (
    <div style={S.statCard}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#9898b8', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#6666aa', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Badge({ text, type }) {
  const colors = { COMPLETED: '34,197,94', CREATED: '245,158,11', FAILED: '239,68,68', READY: '34,197,94', OPTIMIZING: '245,158,11', UPLOADING: '148,163,184', ADMIN: '239,68,68', USER: '108,99,255', SENIOR: '139,92,246', FRESHER: '6,182,212' }
  const c = colors[text] || '148,163,184'
  return <span style={S.badge(c)}>{text}</span>
}

/* ── Users Tab ─────────────────────────────────────────────── */
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { userId, type: 'role'|'password'|'delete' }
  const [input, setInput] = useState('')

  const load = () => api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase())
  )

  const doAction = async () => {
    try {
      if (modal.type === 'role') {
        await api.put(`/admin/users/${modal.userId}/role`, { role: modal.newRole })
        toast.success('Role updated')
      } else if (modal.type === 'password') {
        await api.post(`/admin/users/${modal.userId}/reset-password`, { password: input })
        toast.success('Password reset')
      } else if (modal.type === 'delete') {
        await api.delete(`/admin/users/${modal.userId}`)
        toast.success('User deleted')
      }
      setModal(null); setInput(''); load()
    } catch (e) { toast.error(e.response?.data?.error || 'Action failed') }
  }

  const toggleEnabled = async (id) => {
    await api.put(`/admin/users/${id}/toggle`)
    toast.success('Status toggled')
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          style={{ background: '#0f0f1a', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '8px 14px', color: '#e8e8f0', fontSize: 13, flex: 1, outline: 'none' }}
          placeholder="Search by email or name..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <span style={{ color: '#6666aa', fontSize: 13 }}>{filtered.length} users</span>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Resumes', 'Status', 'Actions'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: 32, color: '#6666aa' }}>Loading...</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ opacity: u.enabled ? 1 : 0.5 }}>
                <td style={S.td}>{u.fullName || '—'}</td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.email}</span></td>
                <td style={S.td}><Badge text={u.role} type="role" /></td>
                <td style={{ ...S.td, textAlign: 'center' }}>{u.resumeCount}</td>
                <td style={S.td}><Badge text={u.enabled ? 'Active' : 'Disabled'} type={u.enabled ? 'COMPLETED' : 'FAILED'} /></td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button style={S.btn('245,158,11')} onClick={() => setModal({ userId: u.id, type: 'role', newRole: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}>
                      {u.role === 'ADMIN' ? '↓ Make User' : '↑ Make Admin'}
                    </button>
                    <button style={S.btn('108,99,255')} onClick={() => { setModal({ userId: u.id, type: 'password' }); setInput('') }}>
                      🔑 Reset Pwd
                    </button>
                    <button style={S.btn('148,163,184')} onClick={() => toggleEnabled(u.id)}>
                      {u.enabled ? '🚫 Disable' : '✅ Enable'}
                    </button>
                    <button style={S.btn('239,68,68')} onClick={() => setModal({ userId: u.id, type: 'delete', email: u.email })}>
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#1a1a2e', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: 28, width: 360 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, color: '#f0f0f8' }}>
              {modal.type === 'role' ? `Make ${modal.newRole}?` : modal.type === 'password' ? 'Reset Password' : '⚠️ Delete User'}
            </h3>
            {modal.type === 'password' && (
              <input
                style={{ background: '#0f0f1a', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, width: '100%', outline: 'none', marginBottom: 16 }}
                type="password" placeholder="New password (min 8)" value={input} onChange={e => setInput(e.target.value)}
              />
            )}
            {modal.type === 'delete' && (
              <p style={{ color: '#9898b8', fontSize: 14, marginBottom: 16 }}>
                Delete <strong style={{ color: '#ef4444' }}>{modal.email}</strong>? This cannot be undone.
              </p>
            )}
            {modal.type === 'role' && (
              <p style={{ color: '#9898b8', fontSize: 14, marginBottom: 16 }}>
                Change this user's role to <strong style={{ color: '#f59e0b' }}>{modal.newRole}</strong>?
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...S.btn('239,68,68'), flex: 1, padding: '10px' }} onClick={doAction}>Confirm</button>
              <button style={{ ...S.btn('148,163,184'), flex: 1, padding: '10px' }} onClick={() => { setModal(null); setInput('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Resumes Tab ─────────────────────────────────────────────── */
function ResumesTab() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const load = () => api.get('/admin/resumes').then(r => setResumes(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = filter === 'ALL' ? resumes : resumes.filter(r => r.status === filter || r.type === filter)

  const del = async (id) => {
    if (!window.confirm('Delete this resume?')) return
    await api.delete(`/admin/resumes/${id}`)
    toast.success('Deleted'); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['ALL', 'READY', 'OPTIMIZING', 'FAILED', 'SENIOR', 'FRESHER'].map(f => (
          <button key={f} style={S.tab(filter === f)} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6666aa', alignSelf: 'center' }}>{filtered.length} resumes</span>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Title', 'Owner', 'Type', 'Status', 'ATS Score', 'Created', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: 32, color: '#6666aa' }}>Loading...</td></tr>
              : filtered.map(r => (
              <tr key={r.id}>
                <td style={S.td}><span style={{ fontWeight: 500 }}>{r.title}</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.ownerEmail || '—'}</span></td>
                <td style={S.td}><Badge text={r.type} /></td>
                <td style={S.td}><Badge text={r.status} /></td>
                <td style={{ ...S.td, textAlign: 'center' }}>
                  {r.atsScore > 0 ? (
                    <span style={{ color: r.atsScore >= 80 ? '#22c55e' : r.atsScore >= 60 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                      {r.atsScore}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ ...S.td, fontSize: 11, color: '#6666aa' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td style={S.td}>
                  <button style={S.btn('239,68,68')} onClick={() => del(r.id)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Payments Tab ─────────────────────────────────────────────── */
function PaymentsTab() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get('/admin/payments').then(r => setPayments(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? payments : payments.filter(p => p.status === filter)
  const totalRevenue = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amountRupees, 0)

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'COMPLETED', 'CREATED', 'FAILED'].map(f => (
            <button key={f} style={S.tab(filter === f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '6px 14px', fontSize: 14, color: '#22c55e', fontWeight: 600 }}>
          Total Revenue: ₹{totalRevenue.toFixed(0)}
        </div>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['User', 'Resume', 'Amount', 'Format', 'Status', 'Payment ID', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: 32, color: '#6666aa' }}>Loading...</td></tr>
              : filtered.map(p => (
              <tr key={p.id}>
                <td style={{ ...S.td, fontSize: 11, fontFamily: 'monospace' }}>{p.userEmail || '—'}</td>
                <td style={{ ...S.td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.resumeTitle || '—'}</td>
                <td style={S.td}><span style={{ color: '#22c55e', fontWeight: 600 }}>₹{p.amountRupees}</span></td>
                <td style={S.td}><span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 500 }}>{p.format}</span></td>
                <td style={S.td}><Badge text={p.status} /></td>
                <td style={{ ...S.td, fontSize: 10, fontFamily: 'monospace', color: '#6666aa' }}>{p.providerPaymentId || p.orderId || '—'}</td>
                <td style={{ ...S.td, fontSize: 11, color: '#6666aa' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { nav('/admin'); return }
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => toast.error('Failed to load stats'))
  }, [user])

  const handleLogout = async () => {
    await logout()
    nav('/admin')
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'resumes', label: '📄 Resumes' },
    { id: 'payments', label: '💳 Payments' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#e8e8f0' }}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 6, padding: '3px 10px', fontSize: 13, fontWeight: 800, color: '#fff' }}>⚡ ADMIN</span>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#f0f0f8' }}>Karyarthi Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#9898b8' }}>👤 {user?.email}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={S.page}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, borderBottom: '1px solid rgba(245,158,11,0.1)', paddingBottom: 8 }}>
          {TABS.map(t => (
            <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <a href="/dashboard" style={{ fontSize: 13, color: '#6666aa' }}>← User Dashboard</a>
          </div>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon="👥" label="Total Users" value={stats?.totalUsers ?? '—'} color="#a78bfa" />
              <StatCard icon="📄" label="Total Resumes" value={stats?.totalResumes ?? '—'} sub={`${stats?.readyResumes ?? 0} ready`} color="#6c63ff" />
              <StatCard icon="💳" label="Paid Downloads" value={stats?.completedPayments ?? '—'} color="#22c55e" />
              <StatCard icon="💰" label="Total Revenue" value={stats ? `₹${stats.totalRevenueRupees.toFixed(0)}` : '—'} sub={`₹${stats?.last7DaysRevenueRupees ?? 0} last 7d`} color="#f59e0b" />
              <StatCard icon="✨" label="Fresher Builds" value={stats?.fresherResumes ?? '—'} color="#06b6d4" />
              <StatCard icon="📋" label="Senior Uploads" value={stats?.seniorResumes ?? '—'} color="#8b5cf6" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={S.card}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#9898b8' }}>RESUME BREAKDOWN</h3>
                {stats && [
                  { label: 'Ready', val: stats.readyResumes, color: '#22c55e', total: stats.totalResumes },
                  { label: 'Senior uploads', val: stats.seniorResumes, color: '#8b5cf6', total: stats.totalResumes },
                  { label: 'Fresher builds', val: stats.fresherResumes, color: '#06b6d4', total: stats.totalResumes },
                ].map(({ label, val, color, total }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#9898b8' }}>{label}</span>
                      <span style={{ color, fontWeight: 600 }}>{val}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${total ? (val / total) * 100 : 0}%`, background: color, borderRadius: 99, transition: 'width 1s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#9898b8' }}>REVENUE SUMMARY</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 13, color: '#9898b8' }}>Total earned</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>₹{stats?.totalRevenueRupees?.toFixed(0) ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 13, color: '#9898b8' }}>Last 7 days</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>₹{stats?.last7DaysRevenueRupees ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: 13, color: '#9898b8' }}>Per download</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa' }}>₹9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && <UsersTab />}
        {tab === 'resumes' && <ResumesTab />}
        {tab === 'payments' && <PaymentsTab />}
      </div>
    </div>
  )
}
