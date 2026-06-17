import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'

export interface AnalysisResult {
  overallScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  skills: {
    technical: string[]
    soft: string[]
    languages: string[]
  }
  experience: {
    totalYears: number
    roles: { title: string; company: string; duration: string; highlights: string[] }[]
  }
  education: { degree: string; institution: string; year: string }[]
  recommendations: string[]
  jobMatches: { title: string; match: number; reason: string }[]
}

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleReset = () => {
    setResult(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {result ? (
        <ResultsPage result={result} fileName={fileName} onReset={handleReset} />
      ) : (
        <UploadPage onResult={setResult} onFileName={setFileName} />
      )}
    </div>
  )
}
