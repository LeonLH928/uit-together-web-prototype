import React from 'react'
import { Users, GraduationCap, Student, Envelope } from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import { MemberCard } from '../components/MemberCard'

export const Team: React.FC = () => {
  const { members } = useDataStore()

  const faculty = members.filter((m) => m.role === 'Faculty / PI')
  const researchers = members.filter((m) => m.role === 'Researcher')
  const gradStudents = members.filter((m) => m.role === 'Graduate Researcher')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <Users size={14} weight="bold" />
          <span>People & Collaborators</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Research Team
        </h1>
        <p className="text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Our group comprises passionate faculty professors, postdoctoral researchers, graduate students,
          and undergraduate student cohorts at the University of Information Technology (VNU-HCM).
        </p>
      </div>

      {/* Faculty & PIs */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
          <GraduationCap size={22} className="text-blue-900" />
          <span>Faculty & Principal Investigators</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* Researchers */}
      {researchers.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Researchers & Lecturers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* Graduate Researchers */}
      {gradStudents.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Graduate Researchers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gradStudents.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* Looking for Student Researchers Directory Callout */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-100/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
            <Student size={14} weight="bold" />
            <span>Student Researchers & Cohorts</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Looking for the full directory of student researchers?
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Filter by cohort (Cohort K2020, K2019, K2018, K2016, K2015, 2022) with search and pagination.
          </p>
        </div>
        <a
          href="/students"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all hover:shadow-md shrink-0"
        >
          <span>Explore Students Directory</span>
          <span>→</span>
        </a>
      </section>

      {/* Join the Lab Box */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800">
        <div className="max-w-2xl space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Interested in Joining UIT-Together?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We are continuously recruiting passionate PhD candidates, Master students, and talented undergraduates
            interested in Computer Vision, Machine Learning, and Aerial Remote Sensing.
            Candidates with strong programming skills and mathematical background are strongly encouraged to contact us.
          </p>
          <div className="pt-2">
            <a
              href="mailto:khangnttm@uit.edu.vn?subject=Inquiry%20about%20Joining%20UIT-Together%20Lab"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-950 font-bold text-sm hover:bg-blue-50 transition-colors shadow-md"
            >
              <Envelope size={16} weight="bold" />
              <span>Contact Lab Leadership</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
