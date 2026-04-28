'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode]         = useState<'password' | 'magic'>('password')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [message, setMessage]   = useState<{type:'success'|'error', text:string}|null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const supabase = createClientComponentClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
        if (error) throw error
        setMessage({ type: 'success', text: `Magic link sent to ${email}. Check your inbox.` })
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Account created! Check your email to confirm, or sign in if confirmation is disabled.' })
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.session) {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f9f8' }}>
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12" style={{ background: '#0c1714' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#16a37f', boxShadow: '0 2px 12px rgba(22,163,127,.4)' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="white"><path d="M8 1L1 6v9h5v-5h4v5h5V6L8 1z"/></svg>
          </div>
          <div>
            <div className="text-[18px] font-bold text-white tracking-tight">Vera PM</div>
            <div className="text-[10px] font-mono tracking-widest" style={{ color: '#7fa89e' }}>VERAPM.AI</div>
          </div>
        </div>
        <div>
          <blockquote className="text-[22px] font-light text-white leading-relaxed tracking-tight mb-8">"Property management software that works the way you do — not the other way around."</blockquote>
          <div className="grid grid-cols-2 gap-4">
            {[{label:'Properties',value:'400+'},{label:'Modules',value:'6'},{label:'Setup time',value:'< 1 hr'},{label:'Monthly cost',value:'$0'}].map(stat => (
              <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                <div className="text-[24px] font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-[12px] mt-0.5" style={{ color: '#7fa89e' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#16a37f' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><path d="M8 1L1 6v9h5v-5h4v5h5V6L8 1z"/></svg>
            </div>
            <span className="text-[16px] font-bold tracking-tight">Vera PM</span>
          </div>

          <h1 className="text-[26px] font-bold tracking-tight mb-1">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-[13px] mb-8" style={{ color: '#8a9889' }}>{isSignUp ? 'Start managing your properties for free.' : 'Sign in to your portfolio.'}</p>

          <div className="flex rounded-lg p-1 mb-6" style={{ background: '#f0f0ef', border: '1px solid #e4e7e4' }}>
            <button onClick={() => setMode('password')} className="flex-1 py-2 text-[12.5px] font-medium rounded-md transition-all" style={{ background: mode==='password'?'white':'transparent', color: mode==='password'?'#111612':'#8a9889', boxShadow: mode==='password'?'0 1px 3px rgba(0,0,0,.08)':'none' }}>Password</button>
            <button onClick={() => setMode('magic')} className="flex-1 py-2 text-[12.5px] font-medium rounded-md transition-all" style={{ background: mode==='magic'?'white':'transparent', color: mode==='magic'?'#111612':'#8a9889', boxShadow: mode==='magic'?'0 1px 3px rgba(0,0,0,.08)':'none' }}>Magic Link</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#4a5549' }}>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
                style={{ background: '#f8f9f8', border: '1px solid #e4e7e4', fontFamily: 'inherit', color: '#111612' }}
                onFocus={e => { e.target.style.borderColor='#16a37f'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,127,.12)' }}
                onBlur={e  => { e.target.style.borderColor='#e4e7e4'; e.target.style.boxShadow='none' }} />
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#4a5549' }}>Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={8}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
                  style={{ background: '#f8f9f8', border: '1px solid #e4e7e4', fontFamily: 'inherit', color: '#111612' }}
                  onFocus={e => { e.target.style.borderColor='#16a37f'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,127,.12)' }}
                  onBlur={e  => { e.target.style.borderColor='#e4e7e4'; e.target.style.boxShadow='none' }} />
              </div>
            )}

            {message && (
              <div className="rounded-lg px-3 py-2.5 text-[12.5px]" style={{ background: message.type==='success'?'#f0fdf9':'#fef2f2', border: `1px solid ${message.type==='success'?'#bbf7d0':'#fecaca'}`, color: message.type==='success'?'#15803d':'#b91c1c' }}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all"
              style={{ background: loading?'#7fa89e':'#16a37f', boxShadow: loading?'none':'0 1px 4px rgba(22,163,127,.3)', cursor: loading?'not-allowed':'pointer' }}>
              {loading ? 'Please wait...' : mode==='magic' ? 'Send Magic Link' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {mode === 'password' && (
            <p className="text-center text-[12px] mt-5" style={{ color: '#8a9889' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsSignUp(!isSignUp); setMessage(null) }} className="font-medium" style={{ color: '#16a37f' }}>
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          )}

          <p className="text-center text-[11px] mt-8" style={{ color: '#b0bcb0' }}>Your data is encrypted and isolated per account.</p>
        </div>
      </div>
    </div>
  )
}
