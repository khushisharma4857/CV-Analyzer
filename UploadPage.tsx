import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, Sparkles, AlertCircle, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'
import { AnalysisResult } from '../App'

interface Props {
  onResult: (result: AnalysisResult) => void
  onFileName: (name: string) => void
}

export default function UploadPage({ onResult, onFileName }: Props) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.type === 'application/pdf' || dropped.type === 'text/plain' || dropped.name.endsWith('.pdf') || dropped.name.endsWith('.txt') || dropped.name.endsWith('.doc') || dropped.name.endsWith('.docx'))) {
      setFile(dropped)
      setError(null)
    } else {
      setError('Please upload a PDF, TXT, DOC, or DOCX file.')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setError(null)
      setPastedText('')
    }
  }

  const handleAnalyse = async () => {
    if (!file && !pastedText.trim()) {
      setError('Please upload a CV file or paste your CV text.')
      return
    }
    setLoading(true)
    setError(null)
    setProgress('Extracting CV content...')

    try {
      const formData = new FormData()
      if (file) {
        formData.append('cv', file)
        onFileName(file.name)
      } else {
        const blob = new Blob([pastedText], { type: 'text/plain' })
        formData.append('cv', blob, 'cv.txt')
        onFileName('Pasted CV')
      }

      setProgress('Analysing with AI...')

      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(err.error || 'Analysis failed')
      }

      const data = await response.json()
      onResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Smartiff</span>
            <span className="text-slate-400 text-sm font-medium">CV Analyser</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
            <Sparkles size={12} />
            <span>Powered by AI</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full mx-auto text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary-100">
            <Sparkles size={14} />
            <span>AI-Powered CV Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
            Get instant insights<br />
            <span className="text-primary-600">from your CV</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload your CV and our AI will extract skills, analyse experience, score your profile, and suggest career opportunities — in seconds.
          </p>
        </div>

        {/* Upload Card */}
        <div className="max-w-2xl w-full mx-auto animate-slide-up">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Drop Zone */}
            <div
              data-testid="upload-dropzone"
              className={cn(
                'relative border-2 border-dashed m-6 rounded-xl transition-all duration-200 cursor-pointer',
                dragging
                  ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-file"
              />

              {file ? (
                <div className="p-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="text-emerald-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB · Ready to analyse
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile() }}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-slate-400 transition-colors flex-shrink-0"
                    data-testid="button-remove-file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                    dragging ? 'bg-primary-100 scale-110' : 'bg-slate-100'
                  )}>
                    <Upload className={cn('transition-colors', dragging ? 'text-primary-500' : 'text-slate-400')} size={28} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-base">
                      {dragging ? 'Drop your CV here' : 'Drop your CV here'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      or <span className="text-primary-500 font-medium">click to browse</span> · PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Paste Text Option */}
            {!file && (
              <div className="px-6 pb-2">
                <button
                  className="w-full flex items-center justify-between text-sm text-slate-500 hover:text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  onClick={() => setShowPaste(!showPaste)}
                  data-testid="button-toggle-paste"
                >
                  <span className="font-medium">Or paste your CV text</span>
                  {showPaste ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showPaste && (
                  <textarea
                    className="w-full mt-2 p-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-slate-700 placeholder-slate-300 transition-all"
                    rows={8}
                    placeholder="Paste your CV or resume text here..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    data-testid="textarea-cv-text"
                  />
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm" data-testid="text-error">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress */}
            {loading && progress && (
              <div className="mx-6 mb-4 flex items-center gap-2.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-xl p-3.5 text-sm">
                <Loader2 size={16} className="animate-spin flex-shrink-0" />
                <span>{progress}</span>
              </div>
            )}

            {/* Analyse Button */}
            <div className="px-6 pb-6">
              <button
                onClick={handleAnalyse}
                disabled={loading || (!file && !pastedText.trim())}
                className={cn(
                  'w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2',
                  loading || (!file && !pastedText.trim())
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]'
                )}
                data-testid="button-analyse"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Analysing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Analyse CV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Skills Extraction', 'Experience Summary', 'Career Score', 'Job Matches', 'Improvement Tips'].map((f) => (
              <span key={f} className="text-xs text-slate-500 bg-white/80 border border-slate-200 px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400">
        <p>Your CV is processed securely and never stored.</p>
      </footer>
    </div>
  )
}
