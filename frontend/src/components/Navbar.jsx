import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    nav('/')
  }

  return (
    <nav style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(108,99,255,0.15)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e8e8f0', fontWeight: 700, fontSize: 20, textDecoration: 'none' }}>
        <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', borderRadius: 8, padding: '4px 10px', fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>K</span>
        Karyarthi
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: '#9898b8', fontSize: 14 }}>Dashboard</Link>
            <Link to="/upload" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>+ New Resume</Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#9898b8', fontSize: 14 }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>Get Started Free</Link>
          </>
        )}
      </div>
    </nav>
  )
}
