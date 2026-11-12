import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Papers } from './pages/Papers'
import { Research } from './pages/Research'
import { Team } from './pages/Team'
import { Students } from './pages/Students'
import { DatasetsPage } from './pages/DatasetsPage'
import { Conferences } from './pages/Conferences'
import { About } from './pages/About'
import { Admin } from './pages/Admin'

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/conferences" element={<Conferences />} />
          <Route path="/research" element={<Research />} />
          <Route path="/team" element={<Team />} />
          <Route path="/students" element={<Students />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
