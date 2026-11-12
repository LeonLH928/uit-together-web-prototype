import React, { useState } from 'react'
import { GraduationCap, GithubLogo, Envelope, User } from '@phosphor-icons/react'
import type { Member } from '../types'

interface MemberCardProps {
  member: Member
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const [imgError, setImgError] = useState(false)
  const hasImage = Boolean(member.image && member.image.trim().length > 0)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center group">
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white shadow-md bg-gradient-to-br from-slate-100 to-blue-50/50 flex items-center justify-center">
          {hasImage && !imgError ? (
            <img
              src={member.image}
              alt={member.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 group-hover:text-blue-600 transition-colors">
              <User size={44} weight="duotone" />
            </div>
          )}
        </div>
        {member.alum ? (
          <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-600 text-white shadow-xs">
            Alumni
          </span>
        ) : member.cohort ? (
          <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900 text-white shadow-xs">
            {member.cohort.replace('Cohort ', '')}
          </span>
        ) : null}
      </div>

      {/* Info */}
      <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-900 transition-colors">
        {member.name}
      </h3>
      <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">
        {member.position}
      </p>
      {member.bio && (
        <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
          {member.bio}
        </p>
      )}

      {/* Social / Academic Links */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        {member.scholar && (
          <a
            href={member.scholar}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-900 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
            title="Google Scholar"
          >
            <GraduationCap size={16} />
          </a>
        )}

        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"
            title="GitHub Profile"
          >
            <GithubLogo size={16} />
          </a>
        )}

        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
            title="Email"
          >
            <Envelope size={16} />
          </a>
        )}
      </div>
    </div>
  )
}
