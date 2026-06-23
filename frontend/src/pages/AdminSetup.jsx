import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminSetup() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await axios.post('/api/admin/bootstrap', {
        fullName: form.fullName,
        email: form.email,
        password: form.password
      })
      toast.success('Admin account created! Please login.')
      nav('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Setup failed — admin may already exist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a12', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0f0f8', marginBottom: 6 }}>Create Admin Account</h1>
          <p style={{ color: '#6666aa', fontSize: 14 }}>This can only be done once — when no admin exists.</p>
        </div>

        <div style={{ background: '#1a1a2e', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 28 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'fullName', label: 'Full Name', type: 'text', ph: 'Admin Name' },
              { key: 'email', label: 'Email', type: 'email', ph: 'admin@karyarthi.in' },
              { key: 'password', label: 'Password', type: 'password', ph: 'Min. 8 characters' },
              { key: 'confirmPassword', label: 'Confirm Password', type: 'password', ph: 'Repeat password' },
            ].map(({ key, label, type, ph }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#9898b8', fontWeight: 500 }}>{label}</label>
                <input
                  style={{ background: '#0f0f1a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none' }}
                  type={type} placeholder={ph}
                  value={form[key]} onChange={set(key)} required
                />
              </div>
            ))}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: 12, fontSize: 13, color: '#f59e0b' }}>
              ⚠️ This endpoint will be disabled once an admin account exists.
            </div>
            <button
              type="submit" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : '✅ Create Admin Account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#44445a' }}>
          <a href="/admin" style={{ color: '#f59e0b' }}>← Back to admin login</a>
        </p>
      </div>
    </div>
  )
}
