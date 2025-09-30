import React from 'react'
import ReactDOM from 'react-dom/client'
import Auth from './Auth'
import Dashboard from './Dashboard'

function App() {
  const [token, setToken] = React.useState<string | null>(null)
  return token ? (
    <Dashboard token={token} onLogout={() => setToken(null)} />
  ) : (
    <Auth onAuthed={setToken} />
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
