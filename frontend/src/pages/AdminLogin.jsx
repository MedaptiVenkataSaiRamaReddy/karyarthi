import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(email, password)
      if (data.user?.role !== 'ADMIN' && data.user?.role !== 'admin') {
        toast.error('Access denied — Admin only')
        return
      }
      toast.success('Welcome, Admin!')
      nav('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a12', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 8, padding: '6px 12px', fontSize: 16, fontWeight: 800, color: '#fff' }}>⚡ Admin</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0f0f8', marginBottom: 6 }}>Karyarthi Admin</h1>
          <p style={{ color: '#6666aa', fontSize: 14 }}>Restricted access — admins only</p>
        </div>

        <div style={{ background: '#1a1a2e', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 28 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#9898b8', fontWeight: 500 }}>Admin Email</label>
              <input
                style={{ background: '#0f0f1a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none' }}
                type="email" placeholder="admin@karyarthi.in"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#9898b8', fontWeight: 500 }}>Password</label>
              <input
                style={{ background: '#0f0f1a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none' }}
                type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? '#5a4000' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {loading ? 'Signing in...' : '🔐 Sign In as Admin'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6666aa' }}>
          Not an admin? <a href="/login" style={{ color: '#a78bfa' }}>Go to user login</a>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#44445a' }}>
          First time? <a href="/admin/setup" style={{ color: '#f59e0b' }}>Create admin account</a>
        </p>
      </div>
    </div>
  )
}
