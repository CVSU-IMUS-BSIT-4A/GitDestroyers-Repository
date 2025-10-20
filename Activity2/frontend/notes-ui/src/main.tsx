import React from 'react'
import ReactDOM from 'react-dom/client'
import Auth from './Auth'
import Dashboard from './Dashboard'
import { setAuth } from './api'

function App() {
  const [token, setToken] = React.useState<string | null>(null)

  // hydrate token from localStorage on mount
  React.useEffect(() => {
    const t = localStorage.getItem('notes_token')
    if (t) {
      setToken(t)
      setAuth(t)
    }
  }, [])

  function handleAuthed(t: string) {
    localStorage.setItem('notes_token', t)
    setAuth(t)
    setToken(t)
  }

  function handleLogout() {
    localStorage.removeItem('notes_token')
    setAuth(null)
    setToken(null)
  }

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} />
  ) : (
    <Auth onAuthed={handleAuthed} />
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
