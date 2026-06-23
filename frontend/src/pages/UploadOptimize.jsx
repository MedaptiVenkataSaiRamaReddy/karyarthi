import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumes } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

export default function UploadOptimize() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()
  const nav = useNavigate()

  const handleFile = f => {
    if (!f) return
    const ok = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
    const ext = f.name.toLowerCase()
    if (!ok.includes(f.type) && !ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.doc')) {
      toast.error('Only PDF, DOCX, or TXT files accepted')
      return
    }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large (max 10 MB)'); return }
    setFile(f)
  }

  const onDrop = e => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const submit = async () => {
    if (!file) { toast.error('Please select a resume file'); return }
    if (!jd.trim()) { toast.error('Please paste the job description'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('jobDescription', jd)
      const { data } = await resumes.uploadOptimize(fd, setProgress)
      toast.success('Resume uploaded! AI is optimizing it now...')
      nav(`/resume/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>📄</span>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Optimize Existing Resume</h1>
          </div>
          <p style={{ color: '#9898b8' }}>Upload your resume and paste the job description — AI will rewrite it to perfectly match the role.</p>
        </div>

        {/* Step 1: File upload */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(108,99,255,0.2)', color: '#a78bfa', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</span>
            Upload Your Resume
          </h2>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${dragging ? '#6c63ff' : file ? '#22c55e' : 'rgba(108,99,255,0.3)'}`, borderRadius: 12, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(108,99,255,0.08)' : file ? 'rgba(34,197,94,0.05)' : 'rgba(108,99,255,0.03)', transition: 'all 0.2s' }}>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 13, color: '#9898b8' }}>{(file.size / 1024).toFixed(0)} KB · <span onClick={e => { e.stopPropagation(); setFile(null) }} style={{ color: '#ef4444', cursor: 'pointer' }}>Remove</span></div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 40, marginBottom: 12 }}>☁️</div>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>Drop your resume here or click to browse</div>
                <div style={{ fontSize: 13, color: '#9898b8' }}>PDF, DOCX, or TXT · Max 10 MB</div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Job description */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(108,99,255,0.2)', color: '#a78bfa', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</span>
            Paste Job Description
          </h2>
          <div className="input-group">
            <label>Full job description from LinkedIn, Naukri, Indeed, etc.</label>
            <textarea
              className="input"
              placeholder="Paste the complete job description here — the more detail, the better the AI can match your resume to this role..."
              value={jd}
              onChange={e => setJd(e.target.value)}
              style={{ minHeight: 180 }}
            />
            <div style={{ fontSize: 12, color: '#6666aa', textAlign: 'right' }}>{jd.length} characters</div>
          </div>
        </div>

        {/* Submit */}
        {uploading && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9898b8', marginBottom: 6 }}>
              <span>Uploading...</span><span>{progress}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(108,99,255,0.15)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6c63ff, #a78bfa)', borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <button onClick={submit} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={uploading || !file || !jd.trim()}>
          {uploading ? '⟳ Uploading & Optimizing...' : '🚀 Upload & Optimize with AI →'}
        </button>

        <div style={{ marginTop: 16, padding: 14, background: 'rgba(108,99,255,0.06)', borderRadius: 10, fontSize: 13, color: '#9898b8', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span>ℹ️</span>
          <span>AI optimization typically takes 15–30 seconds. You'll be taken to your results page where you can review before paying ₹9 to download.</span>
        </div>
      </div>
    </div>
  )
}
