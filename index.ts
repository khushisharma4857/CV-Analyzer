import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { analyseCV } from './analyse'

const app = express()
const PORT = 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed = ['.pdf', '.txt', '.doc', '.docx']
    if (allowed.includes(ext) || file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, TXT, DOC, DOCX files are allowed'))
    }
  }
})

async function extractText(buffer: Buffer, mimetype: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase()

  if (mimetype === 'text/plain' || ext === '.txt') {
    return buffer.toString('utf-8')
  }

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    try {
      const pdfParse = await import('pdf-parse')
      const data = await pdfParse.default(buffer)
      return data.text
    } catch (err) {
      console.error('PDF parse error:', err)
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    }
  }

  // For .doc/.docx fall back to raw text extraction
  return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ')
}

app.post('/api/analyse', upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CV file provided' })
  }

  let cvText: string
  try {
    cvText = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname)
  } catch (err) {
    console.error('Text extraction error:', err)
    return res.status(500).json({ error: 'Failed to read the file. Please try a TXT file or paste the CV text directly.' })
  }

  if (!cvText || cvText.trim().length < 30) {
    return res.status(400).json({ error: 'CV appears to be empty or could not be read. Please try a TXT file or paste the text directly.' })
  }

  try {
    const result = analyseCV(cvText)
    return res.json(result)
  } catch (err) {
    console.error('Analysis error:', err)
    return res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
