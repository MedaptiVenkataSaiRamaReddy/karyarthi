import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const features = [
  { icon: '🤖', title: 'AI-Powered Optimization', desc: 'Claude AI rewrites your resume with exact keywords from the job description for maximum ATS match.' },
  { icon: '📊', title: 'ATS Score', desc: 'Instantly see your compatibility score (0–100) and know which keywords were matched.' },
  { icon: '⚡', title: 'Built for Freshers Too', desc: 'No resume? No problem. Our step-by-step builder creates a professional resume from scratch.' },
  { icon: '💸', title: 'Pay Only ₹9', desc: 'No subscription. No lock-in. Pay ₹9 per download — only when you\'re happy.' },
]

const steps = [
  { n: '01', title: 'Upload or Build', desc: 'Upload your existing PDF/DOCX resume or fill our guided form if you\'re a fresher.' },
  { n: '02', title: 'Paste the Job Description', desc: 'Add the JD from any job portal — LinkedIn, Naukri, Indeed, or anywhere else.' },
  { n: '03', title: 'AI Optimizes It', desc: 'Our AI rewrites every bullet, matches keywords, and boosts your ATS score in seconds.' },
  { n: '04', title: 'Pay ₹9 & Download', desc: 'Review your optimized resume. Pay ₹9 and download the polished PDF instantly.' },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: '#a78bfa', marginBottom: 24 }}>
          ✨ AI-powered · ATS-optimized · ₹9 flat
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg, #e8e8f0 40%, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Land More Interviews.<br />Pay Just ₹9.
        </h1>
        <p style={{ fontSize: 18, color: '#9898b8', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Karyarthi uses AI to tailor your resume to any job description — matching keywords, strengthening bullet points, and maximising your ATS score.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">I have an account</Link>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: '#6666aa' }}>No credit card required to start · Pay only when you download</p>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48 }}>Everything you need to get hired</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ borderColor: 'rgba(108,99,255,0.15)' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 17 }}>{f.title}</h3>
              <p style={{ color: '#9898b8', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '60px 24px', background: 'rgba(108,99,255,0.04)', borderTop: '1px solid rgba(108,99,255,0.1)', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48 }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {steps.map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: 'rgba(108,99,255,0.3)', marginBottom: 12 }}>{s.n}</div>
                <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#9898b8', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(167,139,250,0.08))', borderColor: 'rgba(108,99,255,0.4)' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#a78bfa', marginBottom: 4 }}>₹9</div>
          <div style={{ color: '#9898b8', marginBottom: 20, fontSize: 15 }}>Per download · Any format · No subscription</div>
          <ul style={{ listStyle: 'none', marginBottom: 28, textAlign: 'left', display: 'inline-block' }}>
            {['AI-optimized resume', 'ATS score report', 'Keyword match analysis', 'PDF & DOCX download', 'Unlimited revisions before paying'].map(i => (
              <li key={i} style={{ padding: '4px 0', fontSize: 14, color: '#e8e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#22c55e' }}>✓</span> {i}
              </li>
            ))}
          </ul>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Get Started — It's Free</Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(108,99,255,0.1)', padding: '24px', textAlign: 'center', color: '#6666aa', fontSize: 13 }}>
        © 2025 Karyarthi · AI Resume Platform for India
      </footer>
    </div>
  )
}
