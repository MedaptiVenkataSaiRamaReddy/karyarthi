import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('karyarthi_token')
    if (token) {
      auth.me().then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('karyarthi_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await auth.login({ email, password })
    localStorage.setItem('karyarthi_token', data.token)
    setUser(data.user)
    return data
  }

  const register = async (fullName, email, password) => {
    await auth.register({ fullName, email, password })
  }

  const logout = async () => {
    await auth.logout().catch(() => {})
    localStorage.removeItem('karyarthi_token')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
