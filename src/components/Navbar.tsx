import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { List, X, LockKey, GraduationCap, Article, Users, Database, Flask, Student, Info, CalendarCheck } from '@phosphor-icons/react'

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Home', path: '/', icon: Flask },
    { name: 'Research', path: '/research', icon: GraduationCap },
    { name: 'Publications', path: '/papers', icon: Article },
    { name: 'Conferences', path: '/conferences', icon: CalendarCheck },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Students', path: '/students', icon: Student },
    { name: 'Datasets', path: '/datasets', icon: Database },
    { name: 'About', path: '/about', icon: Info },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/uit-together-logo.png"
              alt="UIT-Together Logo"
              className="w-10 h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-blue-950 tracking-tight leading-tight group-hover:text-blue-800 transition-colors">
                UIT-Together
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                Computer Vision & Machine Learning • VNU-HCM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-blue-900 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}

            <div className="h-5 w-px bg-slate-200 mx-2" />

            {/* Admin Link */}
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 transition-all border border-slate-200"
              title="Single-Admin Management Portal"
            >
              <LockKey size={14} weight="bold" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/admin"
              className="p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200"
              title="Admin Portal"
            >
              <LockKey size={18} />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-blue-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  active
                    ? 'text-blue-900 bg-blue-50 font-bold'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} className={active ? 'text-blue-900' : 'text-slate-400'} />
                <span>{link.name}</span>
              </Link>
            )
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-blue-900 bg-blue-50"
            >
              <LockKey size={20} />
              <span>Admin Management Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
