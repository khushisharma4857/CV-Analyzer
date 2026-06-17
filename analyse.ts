import { AnalysisResult } from './types'

const TECHNICAL_SKILLS = [
  'javascript','typescript','python','java','c++','c#','ruby','go','rust','swift','kotlin','php','scala','r',
  'react','angular','vue','next.js','nuxt','svelte','node.js','express','django','flask','fastapi','spring','laravel',
  'html','css','sass','tailwind','bootstrap','graphql','rest','api','sql','nosql','postgresql','mysql','mongodb',
  'redis','elasticsearch','firebase','supabase','docker','kubernetes','aws','azure','gcp','terraform','ansible',
  'git','github','gitlab','ci/cd','jenkins','github actions','linux','bash','shell','nginx','apache',
  'machine learning','deep learning','tensorflow','pytorch','scikit-learn','pandas','numpy','data science',
  'excel','powerpoint','word','tableau','power bi','figma','sketch','photoshop','illustrator','xd',
  'ios','android','react native','flutter','unity','unreal','selenium','cypress','jest','pytest','junit',
  'blockchain','solidity','smart contracts','devops','agile','scrum','kanban','jira','confluence',
  'salesforce','sap','oracle','hadoop','spark','kafka','airflow','dbt','looker','snowflake',
]

const SOFT_SKILLS = [
  'leadership','communication','teamwork','collaboration','problem solving','critical thinking',
  'time management','project management','adaptability','creativity','innovation','attention to detail',
  'customer service','negotiation','presentation','mentoring','coaching','decision making',
  'analytical','research','planning','organisation','organizational','multitasking','interpersonal',
  'conflict resolution','emotional intelligence','strategic thinking','stakeholder management',
]

const LANGUAGE_KEYWORDS = [
  'english','french','spanish','german','mandarin','chinese','arabic','hindi','portuguese','italian',
  'dutch','japanese','korean','russian','polish','turkish','swedish','norwegian','danish','finnish',
  'hebrew','greek','czech','romanian','hungarian','thai','vietnamese','indonesian','malay','urdu',
]

const DEGREE_KEYWORDS = [
  'bachelor','master','phd','doctorate','msc','bsc','ba','ma','mba','meng','beng','llb','llm',
  'associate','diploma','certificate','hnd','hnc','a level','gcse','degree','graduate','postgraduate',
  'undergraduate','honours','hons',
]

const INSTITUTION_KEYWORDS = [
  'university','college','institute','school','academy','polytechnic',
]

const JOB_TITLE_KEYWORDS = [
  'engineer','developer','designer','manager','analyst','consultant','director','coordinator',
  'specialist','architect','lead','head','senior','junior','executive','officer','administrator',
  'scientist','researcher','advisor','associate','intern','assistant','technician','programmer',
  'product','project','software','data','cloud','devops','qa','ux','ui','full stack','frontend','backend',
]

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^\w\s.]/g, ' ')
}

function extractSkills(text: string): { technical: string[]; soft: string[]; languages: string[] } {
  const lower = normalise(text)
  const technical = TECHNICAL_SKILLS.filter(s => lower.includes(s))
  const soft = SOFT_SKILLS.filter(s => lower.includes(s))
  const languages = LANGUAGE_KEYWORDS.filter(lang => {
    const re = new RegExp(`\\b${lang}\\b`)
    return re.test(lower)
  })
  return {
    technical: [...new Set(technical)].slice(0, 20),
    soft: [...new Set(soft)].slice(0, 10),
    languages: [...new Set(languages)].slice(0, 6),
  }
}

function extractYears(text: string): number {
  // Look for explicit "X years" mentions
  const explicitMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i)
  if (explicitMatch) return parseInt(explicitMatch[1])

  // Estimate from date ranges in the text
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g)
  if (!yearMatches) return 0
  const years = yearMatches.map(Number).filter(y => y >= 1980 && y <= new Date().getFullYear())
  if (years.length < 2) return 0
  const min = Math.min(...years)
  const max = Math.max(...years)
  return Math.min(Math.round((max - min) * 0.8), 40)
}

function extractExperience(text: string): AnalysisResult['experience'] {
  const totalYears = extractYears(text)
  const lines = text.split(/\n/)
  const roles: AnalysisResult['experience']['roles'] = []

  // Date range pattern: 2018 - 2021, Jan 2020 – Present, etc.
  const dateRangeRe = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(20\d{2}|19\d{2})\s*[-–—to]+\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(20\d{2}|19\d{2}|present|current|now)/gi

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const dateMatch = line.match(dateRangeRe)
    if (!dateMatch) continue

    const duration = dateMatch[0].trim()

    // Look nearby lines for a job title
    let title = ''
    let company = ''

    for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
      const nearby = lines[j].trim()
      if (!nearby || nearby === line) continue
      const lowerNearby = nearby.toLowerCase()

      if (!title && JOB_TITLE_KEYWORDS.some(k => lowerNearby.includes(k))) {
        title = nearby.replace(/[|•·]/g, '').trim().substring(0, 60)
      } else if (!company && nearby.length > 2 && nearby.length < 60 && !nearby.match(dateRangeRe)) {
        company = nearby.replace(/[|•·]/g, '').trim().substring(0, 50)
      }
    }

    if (!title && !company) continue

    // Collect bullet highlights after the date line
    const highlights: string[] = []
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const hl = lines[j].trim().replace(/^[•\-\*]\s*/, '')
      if (hl.length > 10 && hl.length < 200 && !hl.match(dateRangeRe)) {
        highlights.push(hl)
      }
      if (highlights.length >= 2) break
    }

    roles.push({ title: title || 'Role', company: company || '', duration, highlights })
    if (roles.length >= 5) break
  }

  return { totalYears, roles }
}

function extractEducation(text: string): AnalysisResult['education'] {
  const lines = text.split(/\n/)
  const education: AnalysisResult['education'] = []
  const seen = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lower = line.toLowerCase()

    const hasDegree = DEGREE_KEYWORDS.some(d => lower.includes(d))
    const hasInstitution = INSTITUTION_KEYWORDS.some(k => lower.includes(k))

    if (!hasDegree && !hasInstitution) continue

    const yearMatch = line.match(/\b(19|20)\d{2}\b/)
    const year = yearMatch ? yearMatch[0] : ''

    let degree = ''
    let institution = ''

    if (hasDegree) {
      degree = line.replace(/[|•·]/g, '').trim().substring(0, 80)
    }

    // Look at nearby lines for institution
    for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
      const nearby = lines[j].trim().toLowerCase()
      if (INSTITUTION_KEYWORDS.some(k => nearby.includes(k))) {
        institution = lines[j].trim().replace(/[|•·]/g, '').trim().substring(0, 70)
        break
      }
    }

    const key = (degree + institution).toLowerCase().substring(0, 30)
    if (seen.has(key)) continue
    seen.add(key)

    education.push({ degree: degree || institution, institution: institution !== degree ? institution : '', year })
    if (education.length >= 4) break
  }

  return education
}

function extractName(text: string): string {
  // Usually the first non-empty line is the name
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length > 0 && lines[0].length < 50 && /^[A-Za-z\s.'-]+$/.test(lines[0])) {
    return lines[0]
  }
  return ''
}

function scoreCV(skills: AnalysisResult['skills'], experience: AnalysisResult['experience'], education: AnalysisResult['education'], textLength: number): number {
  let score = 30 // base

  // Skills (up to 30 pts)
  const skillCount = skills.technical.length + skills.soft.length
  score += Math.min(skillCount * 1.5, 30)

  // Experience (up to 25 pts)
  if (experience.totalYears >= 10) score += 25
  else if (experience.totalYears >= 5) score += 20
  else if (experience.totalYears >= 2) score += 14
  else if (experience.totalYears >= 1) score += 8
  score += Math.min(experience.roles.length * 2, 8)

  // Education (up to 10 pts)
  score += Math.min(education.length * 4, 10)

  // Languages bonus (up to 5 pts)
  score += Math.min(skills.languages.length * 2, 5)

  // Content richness
  if (textLength > 1500) score += 3
  if (textLength > 3000) score += 2

  return Math.min(Math.round(score), 100)
}

function generateSummary(name: string, skills: AnalysisResult['skills'], experience: AnalysisResult['experience'], score: number): string {
  const candidate = name ? name : 'This candidate'
  const expStr = experience.totalYears > 0 ? `with ${experience.totalYears} year${experience.totalYears !== 1 ? 's' : ''} of experience` : ''
  const topSkill = skills.technical[0] || skills.soft[0] || 'a range of skills'
  const roleStr = experience.roles[0]?.title ? `, most recently as ${experience.roles[0].title}` : ''

  if (score >= 75) {
    return `${candidate} is a strong professional ${expStr}${roleStr}, demonstrating proficiency in ${topSkill} and ${skills.technical.length + skills.soft.length} other skills. The CV is well-structured and presents a compelling career narrative.`
  } else if (score >= 50) {
    return `${candidate} shows a solid background ${expStr}${roleStr}, with skills in ${topSkill}. The CV covers key areas well, with some room to expand on achievements and quantify impact.`
  } else {
    return `${candidate} is an early-career professional ${expStr || 'building their career'} with skills in ${topSkill}. Adding more detail around accomplishments and expanding the skills section would significantly strengthen this CV.`
  }
}

function generateStrengths(skills: AnalysisResult['skills'], experience: AnalysisResult['experience'], education: AnalysisResult['education']): string[] {
  const strengths: string[] = []

  if (skills.technical.length >= 8) strengths.push(`Broad technical skill set across ${skills.technical.length} technologies`)
  else if (skills.technical.length >= 4) strengths.push(`Solid technical skills including ${skills.technical.slice(0, 3).join(', ')}`)

  if (experience.totalYears >= 5) strengths.push(`${experience.totalYears}+ years of professional experience`)
  else if (experience.roles.length >= 2) strengths.push(`Diverse experience across ${experience.roles.length} roles`)

  if (education.length >= 1) strengths.push(`${education[0].degree}${education[0].institution ? ` from ${education[0].institution}` : ''}`)

  if (skills.soft.length >= 3) strengths.push(`Strong soft skills: ${skills.soft.slice(0, 3).join(', ')}`)

  if (skills.languages.length >= 2) strengths.push(`Multilingual: ${skills.languages.join(', ')}`)

  // Ensure we always return 3
  const fallbacks = [
    'Clear and readable CV structure',
    'Demonstrates commitment to professional growth',
    'Good breadth of experience documented',
  ]
  while (strengths.length < 3) {
    strengths.push(fallbacks.shift()!)
  }
  return strengths.slice(0, 3)
}

function generateImprovements(skills: AnalysisResult['skills'], experience: AnalysisResult['experience'], education: AnalysisResult['education'], textLength: number): string[] {
  const improvements: string[] = []

  if (skills.technical.length < 5) improvements.push('Expand the technical skills section with more specific tools and technologies')
  if (experience.roles.length === 0) improvements.push('Add detailed work experience with dates, company names, and responsibilities')
  else if (experience.roles.every(r => r.highlights.length === 0)) improvements.push('Include bullet points with quantified achievements under each role (e.g. "increased X by Y%")')

  if (education.length === 0) improvements.push('Add an education section with qualifications, institutions, and graduation years')
  if (skills.soft.length < 3) improvements.push('Highlight soft skills such as leadership, communication, and teamwork')
  if (textLength < 800) improvements.push('Expand the CV with more detail — aim for at least one full page of content')

  const fallbacks = [
    'Add a professional summary at the top of the CV',
    'Include links to a portfolio, GitHub, or LinkedIn profile',
    'Tailor the CV to specific job descriptions for better results',
  ]
  while (improvements.length < 3) improvements.push(fallbacks.shift()!)
  return improvements.slice(0, 3)
}

function generateRecommendations(skills: AnalysisResult['skills'], experience: AnalysisResult['experience'], score: number): string[] {
  const recs: string[] = [
    'Add a concise professional summary (3–4 lines) at the top highlighting your value proposition',
    'Quantify achievements wherever possible (e.g. "reduced load time by 40%", "managed a team of 8")',
    'Tailor your CV for each application by mirroring keywords from the job description',
    'Include a link to your LinkedIn profile and any relevant portfolio or GitHub',
  ]

  if (skills.technical.length < 6) {
    recs[0] = 'List all technical tools and technologies you are comfortable with — recruiters scan for keywords'
  }
  if (experience.totalYears === 0) {
    recs[1] = 'Add internships, freelance projects, volunteer work, or academic projects to demonstrate experience'
  }

  return recs.slice(0, 4)
}

function generateJobMatches(skills: AnalysisResult['skills'], experience: AnalysisResult['experience']): AnalysisResult['jobMatches'] {
  const techSkills = skills.technical.map(s => s.toLowerCase())
  const candidates: { title: string; keywords: string[]; base: number }[] = [
    { title: 'Software Engineer', keywords: ['javascript','typescript','python','java','react','node.js','git'], base: 60 },
    { title: 'Frontend Developer', keywords: ['react','angular','vue','html','css','javascript','typescript','tailwind'], base: 55 },
    { title: 'Backend Developer', keywords: ['node.js','python','java','sql','postgresql','mongodb','rest','api'], base: 55 },
    { title: 'Full Stack Developer', keywords: ['react','node.js','javascript','typescript','sql','git','docker'], base: 55 },
    { title: 'Data Analyst', keywords: ['python','sql','excel','tableau','power bi','pandas','numpy','r'], base: 55 },
    { title: 'Data Scientist', keywords: ['python','machine learning','deep learning','tensorflow','pytorch','pandas','sql'], base: 50 },
    { title: 'DevOps Engineer', keywords: ['docker','kubernetes','aws','azure','gcp','ci/cd','linux','terraform'], base: 55 },
    { title: 'Product Manager', keywords: ['agile','scrum','jira','analytics','stakeholder management','project management'], base: 50 },
    { title: 'UX/UI Designer', keywords: ['figma','sketch','photoshop','illustrator','ux','ui','css'], base: 50 },
    { title: 'Cloud Engineer', keywords: ['aws','azure','gcp','docker','kubernetes','terraform','linux'], base: 55 },
    { title: 'Business Analyst', keywords: ['sql','excel','tableau','power bi','agile','scrum','project management'], base: 50 },
    { title: 'IT Support Specialist', keywords: ['linux','windows','networking','troubleshooting'], base: 45 },
  ]

  const expBonus = Math.min(experience.totalYears * 2, 20)

  const scored = candidates.map(c => {
    const matched = c.keywords.filter(k => techSkills.includes(k) || skills.soft.map(s => s.toLowerCase()).includes(k))
    const matchRatio = matched.length / c.keywords.length
    const match = Math.min(Math.round(c.base + matchRatio * 30 + expBonus), 98)
    const reason = matched.length > 0
      ? `Matched skills: ${matched.slice(0, 3).join(', ')}`
      : 'Transferable skills applicable to this role'
    return { title: c.title, match, reason }
  })

  return scored.sort((a, b) => b.match - a.match).slice(0, 5)
}

export function analyseCV(text: string): AnalysisResult {
  const skills = extractSkills(text)
  const experience = extractExperience(text)
  const education = extractEducation(text)
  const name = extractName(text)
  const score = scoreCV(skills, experience, education, text.length)
  const summary = generateSummary(name, skills, experience, score)
  const strengths = generateStrengths(skills, experience, education)
  const improvements = generateImprovements(skills, experience, education, text.length)
  const recommendations = generateRecommendations(skills, experience, score)
  const jobMatches = generateJobMatches(skills, experience)

  return { overallScore: score, summary, strengths, improvements, skills, experience, education, recommendations, jobMatches }
}
