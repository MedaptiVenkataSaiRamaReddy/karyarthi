import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumes, payments } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

/* ── ATS Score Ring ─────────────────────────────────────────── */
function ScoreRing({ score, size = 90, label = '', color }) {
  const r = size * 0.4, circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(score, 100)) / 100 * circ
  const c = color || (score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444')
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(108,99,255,0.12)" strokeWidth={size*0.09}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={size*0.09}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1.2s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:size*0.22, fontWeight:800, color:c, lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:size*0.11, color:'#9898b8', marginTop:2 }}>/100</span>
      </div>
      {label && <div style={{ textAlign:'center', fontSize:11, color:'#9898b8', marginTop:4 }}>{label}</div>}
    </div>
  )
}

/* ── ATS Comparison Panel ───────────────────────────────────── */
function AtsComparison({ previousScore, newScore }) {
  const diff    = newScore - previousScore
  const improved = diff > 0
  const pct     = previousScore > 0 ? Math.round((diff / previousScore) * 100) : 100

  const barColor = s => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ background:'#1a1a2e', border:'1px solid rgba(108,99,255,0.2)', borderRadius:12, padding:20, marginBottom:16 }}>
      <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16, color:'#9898b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>
        ATS Score Comparison
      </h3>

      {/* Side-by-side rings */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, marginBottom:20 }}>
        <div style={{ textAlign:'center' }}>
          <ScoreRing score={previousScore} size={80} color={barColor(previousScore)}/>
          <div style={{ fontSize:12, color:'#9898b8', marginTop:8 }}>
            {previousScore === 0 ? 'No Resume' : 'Before AI'}
          </div>
        </div>

        {/* Arrow + delta */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:28, margin:'0 4px', color: improved?'#22c55e':'#ef4444' }}>
            {improved ? '→' : '→'}
          </div>
          <div style={{
            background: improved ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${improved?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,
            borderRadius:8, padding:'4px 10px', fontSize:13, fontWeight:700,
            color: improved ? '#22c55e' : '#ef4444'
          }}>
            {improved ? '+' : ''}{diff} pts
          </div>
          {previousScore > 0 && (
            <div style={{ fontSize:11, color:'#6666aa', marginTop:4 }}>
              {improved ? '↑' : '↓'} {Math.abs(pct)}%
            </div>
          )}
        </div>

        <div style={{ textAlign:'center' }}>
          <ScoreRing score={newScore} size={80} color={barColor(newScore)}/>
          <div style={{ fontSize:12, color:'#22c55e', marginTop:8, fontWeight:500 }}>After AI ✨</div>
        </div>
      </div>

      {/* Progress bars */}
      {['Before Optimization', 'After AI Optimization'].map((label, i) => {
        const score = i === 0 ? previousScore : newScore
        const color = barColor(score)
        return (
          <div key={label} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
              <span style={{ color:'#9898b8' }}>{label}</span>
              <span style={{ fontWeight:600, color }}>{score}/100</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:99 }}>
              <div style={{ height:'100%', width:`${score}%`, background:color,
                borderRadius:99, transition:'width 1.2s ease' }}/>
            </div>
          </div>
        )
      })}

      {/* Verdict */}
      <div style={{ marginTop:14, padding:'10px 14px', borderRadius:8,
        background: improved ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${improved?'rgba(34,197,94,0.2)':'rgba(245,158,11,0.2)'}`,
        fontSize:13, color: improved ? '#22c55e' : '#f59e0b' }}>
        {newScore >= 80
          ? '🎯 Excellent ATS match — strong chance of passing automated screening'
          : newScore >= 65
          ? '✅ Good ATS match — improved keyword alignment with the job description'
          : '⚠️ Moderate match — add the AI API key for better optimization'}
      </div>
    </div>
  )
}

/* ── Resume Section Display ─────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h3 style={{ fontSize:11, fontWeight:600, textTransform:'uppercase',
        letterSpacing:'0.08em', color:'#9898b8', marginBottom:10,
        display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ flex:1, height:1, background:'rgba(108,99,255,0.2)' }}/>
        {title}
        <span style={{ flex:1, height:1, background:'rgba(108,99,255,0.2)' }}/>
      </h3>
      {children}
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function ResumeReady() {
  const { id } = useParams()
  const nav = useNavigate()
  const [resume, setResume] = useState(null)
  const [status, setStatus] = useState('LOADING')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const loadResume = useCallback(async () => {
    try {
      const { data } = await resumes.get(id)
      setResume(data)
      setStatus(data.status)
    } catch {
      toast.error('Resume not found')
      nav('/dashboard')
    }
  }, [id])

  useEffect(() => {
    loadResume()
    const iv = setInterval(async () => {
      try {
        const { data } = await resumes.status(id)
        setStatus(data.status)
        if (data.status === 'READY') { await loadResume(); clearInterval(iv) }
        else if (data.status === 'FAILED') { clearInterval(iv); toast.error('Optimization failed.') }
      } catch {}
    }, 3000)
    return () => clearInterval(iv)
  }, [id])

  const initiatePayment = async (format = 'pdf') => {
    setPaymentLoading(true)
    try {
      const { data: order } = await payments.createOrder(id, format)
      if (order.alreadyPaid) {
        toast.success('Already paid — downloading...')
        triggerDownload(id, format)
        setPaymentLoading(false)
        return
      }
      if (!window.Razorpay) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = res; s.onerror = rej
          document.head.appendChild(s)
        })
      }
      const rzp = new window.Razorpay({
        key:         order.razorpayKeyId,
        amount:      order.amount,
        currency:    order.currency || 'INR',
        name:        'Karyarthi',
        description: `Resume Download — ${format.toUpperCase()}`,
        order_id:    order.orderId,
        theme:       { color:'#6c63ff' },
        handler: async (response) => {
          try {
            await payments.verify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              resumeId: id, format,
            })
            toast.success('Payment successful! Downloading...')
            triggerDownload(id, format)
          } catch { toast.error('Verification failed. Contact support.') }
        },
        modal: { ondismiss: () => setPaymentLoading(false) }
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed')
      setPaymentLoading(false)
    }
  }

  const triggerDownload = (rid, fmt) => {
    const a = document.createElement('a')
    a.href = `/api/downloads/${rid}?format=${fmt}`
    a.download = `resume.${fmt}`
    a.click()
    setPaymentLoading(false)
  }

  const opt = resume?.optimized

  /* ── Processing state ─────────────────────────────────────── */
  if (status !== 'READY' && status !== 'FAILED') {
    return (
      <div style={{ minHeight:'100vh' }}>
        <Navbar />
        <div style={{ maxWidth:600, margin:'0 auto', padding:'80px 24px', textAlign:'center' }}>
          <div style={{ fontSize:60, marginBottom:20, animation:'pulse 2s infinite' }}>🤖</div>
          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:12 }}>AI is optimizing your resume</h1>
          <p style={{ color:'#9898b8', marginBottom:32, lineHeight:1.7 }}>
            Matching keywords, rewriting bullet points, and boosting your ATS score.<br/>
            This takes about 15–30 seconds…
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:280, margin:'0 auto' }}>
            {['Parsing your resume…','Matching job keywords…','Rewriting bullet points…','Calculating ATS score…'].map((s,i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#6c63ff', animation:`pulse ${1+i*0.3}s infinite` }}/>
                <span style={{ fontSize:14, color:'#9898b8' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    )
  }

  if (status === 'FAILED') {
    return (
      <div style={{ minHeight:'100vh' }}>
        <Navbar />
        <div style={{ maxWidth:500, margin:'80px auto', padding:'0 24px', textAlign:'center' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>❌</div>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:12 }}>Optimization Failed</h1>
          <p style={{ color:'#9898b8', marginBottom:24 }}>Something went wrong. Please try again.</p>
          <button onClick={() => nav('/upload')} className="btn btn-primary btn-lg">Try Again</button>
        </div>
      </div>
    )
  }

  const prevScore = resume?.previousAtsScore ?? 0
  const newScore  = resume?.atsScore ?? 0

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>

          {/* ── Left: Resume Preview ─────────────────────────── */}
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>{resume?.title || 'Optimized Resume'}</h1>
              <p style={{ color:'#9898b8', fontSize:14 }}>AI-optimized · ATS-ready</p>
            </div>

            <div className="card" style={{ fontFamily:'Georgia,serif', background:'#fafaf8', color:'#111', border:'1px solid #ddd' }}>
              {opt && (
                <>
                  {opt.summary && (
                    <Section title="Professional Summary">
                      <p style={{ fontSize:14, lineHeight:1.7, color:'#333' }}>{opt.summary}</p>
                    </Section>
                  )}
                  {opt.skills?.length > 0 && (
                    <Section title="Skills">
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {opt.skills.map(s => (
                          <span key={s} style={{ background:'#f0f0f0', padding:'3px 10px', borderRadius:4, fontSize:13, color:'#333' }}>{s}</span>
                        ))}
                      </div>
                    </Section>
                  )}
                  {opt.experience?.length > 0 && (
                    <Section title="Experience">
                      {opt.experience.map((exp,i) => (
                        <div key={i} style={{ marginBottom:16 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15 }}>{exp.title}</div>
                              <div style={{ fontSize:13, color:'#555' }}>{exp.company}</div>
                            </div>
                            <span style={{ fontSize:12, color:'#777', whiteSpace:'nowrap' }}>{exp.duration}</span>
                          </div>
                          <ul style={{ margin:0, paddingLeft:18 }}>
                            {exp.bullets?.map((b,j) => <li key={j} style={{ fontSize:13, lineHeight:1.6, marginBottom:3, color:'#333' }}>{b}</li>)}
                          </ul>
                        </div>
                      ))}
                    </Section>
                  )}
                  {opt.projects?.length > 0 && (
                    <Section title="Projects">
                      {opt.projects.map((p,i) => (
                        <div key={i} style={{ marginBottom:12 }}>
                          <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{p.name}</div>
                          <div style={{ fontSize:13, color:'#444', marginBottom:2 }}>{p.description}</div>
                          {p.impact && <div style={{ fontSize:12, color:'#22c55e', fontStyle:'italic' }}>{p.impact}</div>}
                        </div>
                      ))}
                    </Section>
                  )}
                  {opt.education?.length > 0 && (
                    <Section title="Education">
                      {opt.education.map((e,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <div>
                            <div style={{ fontWeight:600, fontSize:14 }}>{e.degree}</div>
                            <div style={{ fontSize:13, color:'#555' }}>{e.institution}</div>
                          </div>
                          <span style={{ fontSize:12, color:'#777' }}>{e.year}</span>
                        </div>
                      ))}
                    </Section>
                  )}
                  {opt.certifications?.length > 0 && (
                    <Section title="Certifications">
                      <ul style={{ margin:0, paddingLeft:18 }}>
                        {opt.certifications.map((c,i) => <li key={i} style={{ fontSize:13, lineHeight:1.6 }}>{c}</li>)}
                      </ul>
                    </Section>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ─────────────────────────────────── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:80 }}>

            {/* ATS Comparison */}
            <AtsComparison previousScore={prevScore} newScore={newScore}/>

            {/* Keywords matched */}
            {opt?.keywordsMatched?.length > 0 && (
              <div style={{ background:'#1a1a2e', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, padding:16 }}>
                <h3 style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'#22c55e' }}>✓ Keywords Matched</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {opt.keywordsMatched.map(k => (
                    <span key={k} style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:500 }}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Tips */}
            {opt?.improvementTips?.length > 0 && (
              <div style={{ background:'#1a1a2e', border:'1px solid rgba(108,99,255,0.2)', borderRadius:12, padding:16 }}>
                <h3 style={{ fontSize:13, fontWeight:600, marginBottom:10, color:'#a78bfa' }}>💡 AI Tips</h3>
                {opt.improvementTips.map((t,i) => (
                  <div key={i} style={{ fontSize:12, color:'#9898b8', display:'flex', gap:6, marginBottom:6 }}>
                    <span style={{ color:'#6c63ff', flexShrink:0 }}>→</span><span>{t}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Download */}
            <div style={{ background:'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(167,139,250,0.08))', border:'1px solid rgba(108,99,255,0.4)', borderRadius:12, padding:20 }}>
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ fontSize:32, fontWeight:800, color:'#a78bfa' }}>₹9</div>
                <div style={{ fontSize:13, color:'#9898b8' }}>One-time · Instant download</div>
              </div>
              <button onClick={() => initiatePayment('pdf')} className="btn btn-primary"
                style={{ width:'100%', justifyContent:'center', marginBottom:8 }} disabled={paymentLoading}>
                {paymentLoading ? '⟳ Processing…' : '⬇ Download PDF — ₹9'}
              </button>
              <p style={{ fontSize:11, color:'#6666aa', textAlign:'center', marginTop:8 }}>
                Secured by Razorpay · UPI, Cards, Net Banking
              </p>
            </div>

            <div style={{ fontSize:12, color:'#6666aa', lineHeight:1.8 }}>
              <p>✓ ATS-optimized single-column format</p>
              <p>✓ Keywords matched to job description</p>
              <p>✓ Action verbs &amp; quantified bullets</p>
            </div>

            <button onClick={() => nav('/dashboard')} className="btn btn-ghost"
              style={{ width:'100%', justifyContent:'center' }}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
