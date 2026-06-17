import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 55) return 'text-amber-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 55) return 'bg-amber-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}
