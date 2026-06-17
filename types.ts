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
