import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Envelope, GithubLogo, Globe } from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'

export const Footer: React.FC = () => {
  const { siteConfig } = useDataStore()

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/uit-together-logo.png"
                alt="UIT-Together Logo"
                className="w-9 h-9 object-contain"
              />
              <span className="font-bold text-xl text-white tracking-tight">
                {siteConfig.footer.brandName || 'UIT-Together Research Group'}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {siteConfig.footer.tagline}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/UIT-Together"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                title="GitHub Organization"
              >
                <GithubLogo size={20} />
              </a>
              <a
                href="https://uit.edu.vn"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                title="University Homepage"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  About & Lab Gallery
                </Link>
              </li>
              <li>
                <Link to="/papers" className="hover:text-blue-400 transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link to="/conferences" className="hover:text-blue-400 transition-colors">
                  Conference Deadlines
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-blue-400 transition-colors">
                  Research Topics
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-blue-400 transition-colors">
                  People & Collaborators
                </Link>
              </li>
              <li>
                <Link to="/students" className="hover:text-blue-400 transition-colors">
                  Students & Cohorts
                </Link>
              </li>
              <li>
                <Link to="/datasets" className="hover:text-blue-400 transition-colors">
                  Datasets & Benchmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Location */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact & Address
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {siteConfig.footer.address}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Envelope size={18} className="text-blue-400 shrink-0" />
                <a href={`mailto:${siteConfig.footer.email}`} className="hover:text-white transition-colors">
                  {siteConfig.footer.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {siteConfig.footer.copyright || 'UIT-Together Research Group. All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-slate-400 transition-colors">
              Single-Admin Portal
            </Link>
            <span>•</span>
            <a href="https://uit.edu.vn" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">
              VNU-HCM UIT
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
