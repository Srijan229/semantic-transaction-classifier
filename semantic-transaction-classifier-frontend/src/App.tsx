import { NavLink, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { UploadPage } from './pages/UploadPage'

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Portfolio Demo</p>
          <h1>Semantic Transaction Classifier</h1>
          <p className="lede">
            AI-assisted transaction review with generalized category codes, dashboard metrics, and CSV ingestion.
          </p>
        </div>

        <nav className="nav-stack" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Upload CSV
          </NavLink>
        </nav>

        <div className="sidebar-note">
          <p>Synthetic taxonomy</p>
          <strong>10 transaction category codes</strong>
        </div>
      </aside>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
