import { ArrowLeft, Download, FileText, Sparkles, Star, TrendingUp, BookOpen, Briefcase, Code, Users, Globe, Target, ChevronRight } from 'lucide-react'
import { AnalysisResult } from '../App'
import { cn, formatScore, getScoreColor, getScoreBg } from '../lib/utils'

interface Props {
  result: AnalysisResult
  fileName: string
  onReset: () => void
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const dash = circumference - progress

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 55 ? '#f59e0b' : '#ef4444'}
          strokeWidth="12"
          strokeDasharray={`${progress} ${dash}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute text-center">
        <div className={cn('text-3xl font-bold', getScoreColor(score))}>{score}</div>
        <div className="text-xs text-slate-400 font-medium mt-0.5">/100</div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
        <h2 className="font-semibold text-slate-800 text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Tag({ children, color = 'primary' }: { children: string; color?: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-700 border-primary-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  }
  return (
    <span className={cn('inline-block border text-xs font-medium px-2.5 py-1 rounded-full', colors[color] || colors.primary)}>
      {children}
    </span>
  )
}

export default function ResultsPage({ result, fileName, onReset }: Props) {
  const scoreLabel = formatScore(result.overallScore)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
              data-testid="button-back"
            >
              <ArrowLeft size={16} />
              <span>New analysis</span>
            </button>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <FileText size={14} />
              <span className="truncate max-w-48">{fileName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
            <Sparkles size={12} />
            <span>Analysis Complete</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6 animate-fade-in">
        {/* Hero score card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={result.overallScore} />
              <div className={cn('font-bold text-lg', getScoreColor(result.overallScore))} data-testid="text-score-label">
                {scoreLabel}
              </div>
              <div className="text-xs text-slate-400">Overall Score</div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-3">CV Analysis Summary</h1>
              <p className="text-slate-600 leading-relaxed text-base" data-testid="text-summary">
                {result.summary}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{result.experience.totalYears}</span> years exp.
                </div>
                <span className="text-slate-300">·</span>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{result.skills.technical.length + result.skills.soft.length}</span> skills identified
                </div>
                <span className="text-slate-300">·</span>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{result.education.length}</span> qualifications
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-t border-slate-100">
            <div className="px-8 py-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Strengths</h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700" data-testid={`text-strength-${i}`}>
                    <Star className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-8 py-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Areas to Improve</h3>
              <ul className="space-y-2">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700" data-testid={`text-improvement-${i}`}>
                    <TrendingUp className="text-amber-500 flex-shrink-0 mt-0.5" size={14} />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Skills */}
        <Section title="Skills Identified" icon={<Code size={16} />}>
          <div className="space-y-4">
            {result.skills.technical.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.technical.map((s) => (
                    <Tag key={s} color="primary">{s}</Tag>
                  ))}
                </div>
              </div>
            )}
            {result.skills.soft.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Soft Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.soft.map((s) => (
                    <Tag key={s} color="emerald">{s}</Tag>
                  ))}
                </div>
              </div>
            )}
            {result.skills.languages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Globe size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.languages.map((s) => (
                    <Tag key={s} color="purple">{s}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Experience */}
        <Section title="Work Experience" icon={<Briefcase size={16} />}>
          <div className="space-y-5">
            {result.experience.roles.map((role, i) => (
              <div key={i} className="flex gap-4" data-testid={`card-experience-${i}`}>
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {i < result.experience.roles.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-2" />}
                </div>
                <div className="pb-5 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800">{role.title}</h3>
                      <p className="text-sm text-slate-500">{role.company}</p>
                    </div>
                    <Tag color="blue">{role.duration}</Tag>
                  </div>
                  {role.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {role.highlights.map((h, j) => (
                        <li key={j} className="text-sm text-slate-600 flex items-start gap-1.5">
                          <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <Section title="Education" icon={<BookOpen size={16} />}>
            <div className="space-y-4">
              {result.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-3" data-testid={`card-education-${i}`}>
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen size={14} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{edu.degree}</p>
                    <p className="text-xs text-slate-500">{edu.institution}</p>
                    {edu.year && <p className="text-xs text-slate-400 mt-0.5">{edu.year}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Job Matches */}
          <Section title="Suggested Roles" icon={<Target size={16} />}>
            <div className="space-y-3">
              {result.jobMatches.map((job, i) => (
                <div key={i} className="flex items-center gap-3" data-testid={`card-job-${i}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-slate-800 text-sm truncate">{job.title}</p>
                      <span className={cn('text-xs font-bold flex-shrink-0', getScoreColor(job.match))}>
                        {job.match}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={cn('h-1.5 rounded-full transition-all duration-700', getScoreBg(job.match))}
                        style={{ width: `${job.match}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{job.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Recommendations */}
        <Section title="Recommendations" icon={<Sparkles size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gradient-to-r from-primary-50/80 to-purple-50/50 border border-primary-100/80 rounded-xl p-4"
                data-testid={`card-recommendation-${i}`}
              >
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 font-bold text-xs">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={onReset}
            className="flex-1 py-3 px-6 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
            data-testid="button-analyse-another"
          >
            Analyse Another CV
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
            data-testid="button-print"
          >
            <Download size={16} />
            <span>Save Report</span>
          </button>
        </div>
      </main>
    </div>
  )
}
