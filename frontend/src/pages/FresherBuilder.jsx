import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumes } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const STEPS = ['Personal Info', 'Education', 'Skills', 'Projects', 'Certifications & Goals']

const emptyProject = () => ({ name: '', description: '', impact: '' })

export default function FresherBuilder() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [personal, setPersonal] = useState({ fullName: '', email: '', phone: '', location: '', targetRole: '', linkedinUrl: '', githubUrl: '' })
  const [education, setEducation] = useState({ degree: '', institution: '', year: '', cgpa: '', stream: '' })
  const [skills, setSkills] = useState({ skillInput: '', skills: [] })
  const [projects, setProjects] = useState([emptyProject()])
  const [extras, setExtras] = useState({ certifications: [], certInput: '', achievements: '' })

  const setP = k => e => setPersonal(f => ({ ...f, [k]: e.target.value }))
  const setE = k => e => setEducation(f => ({ ...f, [k]: e.target.value }))

  const addSkill = () => {
    const s = skills.skillInput.trim()
    if (s && !skills.skills.includes(s)) setSkills(f => ({ skills: [...f.skills, s], skillInput: '' }))
  }
  const removeSkill = s => setSkills(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))

  const addCert = () => {
    const c = extras.certInput.trim()
    if (c) setExtras(f => ({ ...f, certifications: [...f.certifications, c], certInput: '' }))
  }
  const removeCert = c => setExtras(f => ({ ...f, certifications: f.certifications.filter(x => x !== c) }))

  const setProject = (i, k) => e => setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: e.target.value } : p))
  const addProject = () => setProjects(ps => [...ps, emptyProject()])
  const removeProject = i => setProjects(ps => ps.filter((_, idx) => idx !== i))

  const canNext = () => {
    if (step === 0) return personal.fullName && personal.email && personal.targetRole
    if (step === 1) return education.degree && education.institution && education.year
    if (step === 2) return skills.skills.length >= 3
    return true
  }

  const submit = async () => {
    setLoading(true)
    try {
      const payload = {
        fullName: personal.fullName,
        email: personal.email,
        phone: personal.phone,
        location: personal.location,
        targetRole: personal.targetRole,
        linkedinUrl: personal.linkedinUrl,
        githubUrl: personal.githubUrl,
        education: `${education.degree} in ${education.stream}, ${education.institution}, ${education.year}${education.cgpa ? ', CGPA ' + education.cgpa : ''}`,
        skills: skills.skills,
        projects: projects.filter(p => p.name).map(p => `${p.name}: ${p.description}. Impact: ${p.impact}`).join('\n'),
        certifications: extras.certifications,
        achievements: extras.achievements,
      }
      const { data } = await resumes.buildFresher(payload)
      toast.success('Building your resume with AI...')
      nav(`/resume/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to build resume')
      setLoading(false)
    }
  }

  const tagStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa', borderRadius: 99, padding: '4px 12px', fontSize: 13 }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>✨</span>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Build Your Resume</h1>
          </div>
          <p style={{ color: '#9898b8' }}>No experience needed. Fill in your details and AI will craft a professional resume.</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STEPS.map((s, i) => (
              <span key={s} style={{ fontSize: 11, fontWeight: 500, color: i <= step ? '#a78bfa' : '#6666aa', display: step < 2 || i === step ? 'block' : 'none' }}>
                {s}
              </span>
            ))}
          </div>
          <div style={{ height: 4, background: 'rgba(108,99,255,0.15)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #6c63ff, #a78bfa)', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#6666aa', marginTop: 4 }}>Step {step + 1} of {STEPS.length}</div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label>Full Name *</label>
                  <input className="input" placeholder="Priya Sharma" value={personal.fullName} onChange={setP('fullName')} />
                </div>
                <div className="input-group">
                  <label>Email *</label>
                  <input className="input" type="email" placeholder="priya@gmail.com" value={personal.email} onChange={setP('email')} />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input className="input" placeholder="+91 98765 43210" value={personal.phone} onChange={setP('phone')} />
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label>Target Role / Job Title *</label>
                  <input className="input" placeholder="Software Developer, Data Analyst, Marketing Executive..." value={personal.targetRole} onChange={setP('targetRole')} />
                </div>
                <div className="input-group">
                  <label>Location</label>
                  <input className="input" placeholder="Bangalore, India" value={personal.location} onChange={setP('location')} />
                </div>
                <div className="input-group">
                  <label>LinkedIn URL</label>
                  <input className="input" placeholder="linkedin.com/in/priya-sharma" value={personal.linkedinUrl} onChange={setP('linkedinUrl')} />
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label>GitHub / Portfolio URL</label>
                  <input className="input" placeholder="github.com/priyasharma" value={personal.githubUrl} onChange={setP('githubUrl')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Education */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Education</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label>Degree *</label>
                  <input className="input" placeholder="B.Tech, BCA, BBA, B.Sc, MBA..." value={education.degree} onChange={setE('degree')} />
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label>Stream / Specialization</label>
                  <input className="input" placeholder="Computer Science, Electronics, Finance..." value={education.stream} onChange={setE('stream')} />
                </div>
                <div className="input-group" style={{ gridColumn: '1/-1' }}>
                  <label>College / University *</label>
                  <input className="input" placeholder="IIT Delhi, VIT, BITS Pilani, Anna University..." value={education.institution} onChange={setE('institution')} />
                </div>
                <div className="input-group">
                  <label>Graduation Year *</label>
                  <input className="input" placeholder="2024" value={education.year} onChange={setE('year')} />
                </div>
                <div className="input-group">
                  <label>CGPA / Percentage</label>
                  <input className="input" placeholder="8.5 / 82%" value={education.cgpa} onChange={setE('cgpa')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Skills</h2>
              <p style={{ color: '#9898b8', fontSize: 14 }}>Add at least 3 skills. Be specific — "React.js" is better than "JavaScript frameworks".</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  placeholder="e.g. Python, SQL, React, Figma, Excel..."
                  value={skills.skillInput}
                  onChange={e => setSkills(f => ({ ...f, skillInput: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  style={{ flex: 1 }}
                />
                <button onClick={addSkill} className="btn btn-secondary" style={{ flexShrink: 0 }}>Add</button>
              </div>
              {skills.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.skills.map(s => (
                    <span key={s} style={tagStyle}>
                      {s} <span onClick={() => removeSkill(s)} style={{ cursor: 'pointer', opacity: 0.7, fontSize: 16, lineHeight: 1 }}>×</span>
                    </span>
                  ))}
                </div>
              )}
              {skills.skills.length < 3 && <p style={{ fontSize: 12, color: '#f59e0b' }}>Add at least {3 - skills.skills.length} more skill{3 - skills.skills.length !== 1 ? 's' : ''}</p>}
              <div style={{ padding: 14, background: 'rgba(108,99,255,0.06)', borderRadius: 10, fontSize: 13, color: '#9898b8' }}>
                <strong style={{ color: '#a78bfa' }}>Suggestions:</strong> Java, Python, React, Node.js, SQL, Excel, Tableau, Figma, AutoCAD, Adobe Photoshop, SEO, Google Analytics...
              </div>
            </div>
          )}

          {/* Step 3: Projects */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Projects</h2>
                <p style={{ color: '#9898b8', fontSize: 14 }}>Include college projects, personal projects, freelance work, or hackathons.</p>
              </div>
              {projects.map((p, i) => (
                <div key={i} style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#a78bfa' }}>Project {i + 1}</span>
                    {projects.length > 1 && <button onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Remove</button>}
                  </div>
                  <div className="input-group">
                    <label>Project Name</label>
                    <input className="input" placeholder="E-Commerce Website, Sentiment Analyzer, Budget Tracker..." value={p.name} onChange={setProject(i, 'name')} />
                  </div>
                  <div className="input-group">
                    <label>Description & Technologies Used</label>
                    <textarea className="input" placeholder="Built a full-stack web app using React and Node.js that allows users to..." value={p.description} onChange={setProject(i, 'description')} style={{ minHeight: 80 }} />
                  </div>
                  <div className="input-group">
                    <label>Impact / Result</label>
                    <input className="input" placeholder="Reduced load time by 40%, Achieved 90% accuracy, Won 1st place at hackathon..." value={p.impact} onChange={setProject(i, 'impact')} />
                  </div>
                </div>
              ))}
              {projects.length < 4 && (
                <button onClick={addProject} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>+ Add Another Project</button>
              )}
            </div>
          )}

          {/* Step 4: Certifications & Achievements */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Certifications & Achievements</h2>
              <div>
                <div className="input-group" style={{ marginBottom: 8 }}>
                  <label>Certifications</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="AWS Cloud Practitioner, Google Analytics, NPTEL Python..." value={extras.certInput} onChange={e => setExtras(f => ({ ...f, certInput: e.target.value }))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} style={{ flex: 1 }} />
                    <button onClick={addCert} className="btn btn-secondary" style={{ flexShrink: 0 }}>Add</button>
                  </div>
                </div>
                {extras.certifications.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {extras.certifications.map(c => (
                      <span key={c} style={tagStyle}>{c} <span onClick={() => removeCert(c)} style={{ cursor: 'pointer', opacity: 0.7, fontSize: 16 }}>×</span></span>
                    ))}
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Achievements, Activities & Extra-Curriculars</label>
                <textarea className="input" placeholder="Hackathon winner, NSS volunteer, Debate team captain, Published paper on..., College rank 2, 100 days coding streak..." value={extras.achievements} onChange={e => setExtras(f => ({ ...f, achievements: e.target.value }))} style={{ minHeight: 120 }} />
              </div>
              <div style={{ padding: 14, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 500, marginBottom: 4 }}>🎉 Almost there!</p>
                <p style={{ fontSize: 13, color: '#9898b8' }}>Click "Build Resume" and our AI will turn all your details into a polished, ATS-optimized resume in seconds.</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary" disabled={step === 0} style={{ minWidth: 120 }}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" disabled={!canNext()} style={{ minWidth: 160, justifyContent: 'center' }}>
              Next: {STEPS[step + 1]} →
            </button>
          ) : (
            <button onClick={submit} className="btn btn-primary" disabled={loading} style={{ minWidth: 200, justifyContent: 'center' }}>
              {loading ? '⟳ Building...' : '🚀 Build My Resume with AI →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
