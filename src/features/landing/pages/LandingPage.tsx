import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useLoader } from '../../../App'
import showToast from '../../../utils/toast'
import appLogo from '../../../assets/images/appLogo.png'

const FEATURES = [
  { icon: '📅', title: 'Smart Scheduling',  desc: 'Manage appointments with real-time availability across all departments.' },
  { icon: '👥', title: 'Patient Records',    desc: 'Unified patient profiles with history, prescriptions, and lab results.' },
  { icon: '📊', title: 'Live Analytics',     desc: 'Revenue, occupancy, and performance dashboards updated instantly.' },
  { icon: '🩺', title: 'Doctor Management',  desc: 'Track schedules, specializations, ratings, and availability in one view.' },
  { icon: '💊', title: 'Pharmacy & Billing', desc: 'Integrated billing, inventory, and insurance claim workflows.' },
  { icon: '🔐', title: 'Role-Based Access',  desc: 'Granular permissions for admins, doctors, nurses, and front desk.' },
]

const STATS = [
  { value: '50K+',  label: 'Patients Managed' },
  { value: '1,200', label: 'Doctors Onboarded' },
  { value: '99.9%', label: 'Uptime Guarantee'  },
  { value: '4.9★',  label: 'User Satisfaction' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { withLoader } = useLoader()
  const location = useLocation()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    const params = new URLSearchParams(location.search)
    if (params.get('session') === 'expired') {
      showToast.warn('Your session has expired. Please log in again.')
    }
    initialized.current = true
  }, [location])

  const handleLogin = async () => {
    await withLoader(() => new Promise(r => setTimeout(r, 600)), 'Preparing your workspace…')
    navigate('/login')
  }

  const handleFeatureClick = (f) => {
    showToast.info(`${f.title} — available inside the dashboard.`)
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden font-inter">

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#4B69FF]/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#2D3F99]/12 blur-[100px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#4B69FF]/8 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(75,105,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(75,105,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="Navhim Logo" className="w-9 h-9 rounded-xl object-contain shadow-[0_4px_20px_rgba(75,105,255,0.45)]" />
          <span className="font-poppins font-bold text-[17px] tracking-tight">Navhim<span className="text-[#809CFF]">-Patient-Admin</span></span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats"    className="hover:text-white transition-colors">Stats</a>
          <a href="#about"    className="hover:text-white transition-colors">About</a>
        </div>
        <button onClick={handleLogin}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4B69FF] to-[#2D3F99] text-white text-sm font-semibold shadow-[0_4px_20px_rgba(75,105,255,0.4)] hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5">
          Sign In →
        </button>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-[#4B69FF]/10 border border-[#4B69FF]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[#809CFF] mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4B69FF] animate-pulse" />
          Healthcare Administration Platform
        </div>

        <div className="relative mb-8">
          <img src={appLogo} alt="Navhim Logo" className="w-24 h-24 rounded-[28px] object-contain shadow-[0_20px_60px_rgba(75,105,255,0.5)] mx-auto" />
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-[28px] border-2 border-[#4B69FF]/30 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <h1 className="font-poppins font-extrabold text-5xl md:text-6xl leading-tight tracking-tight mb-5 max-w-3xl">
          <span className="text-white">Navhim</span><br />
          <span className="bg-gradient-to-r from-[#4B69FF] via-[#809CFF] to-[#CAD6FF] bg-clip-text text-transparent">Patient Admin</span>
        </h1>
        <p className="text-[#9BA5C0] text-lg md:text-xl font-medium max-w-xl leading-relaxed mb-4">
          The all-in-one healthcare admin platform — managing patients, doctors, appointments, and billing in a single unified dashboard.
        </p>
        <p className="text-[#5C6480] text-sm max-w-md mb-10">
          Built for hospitals, clinics, and diagnostic centres that demand speed, accuracy, and enterprise-grade reliability.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button onClick={handleLogin}
            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#4B69FF] to-[#2D3F99] text-white font-semibold text-[15px] shadow-[0_8px_30px_rgba(75,105,255,0.45)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200">
            Get Started — Login
            <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
          <a href="#features"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white/60 font-medium text-[15px] hover:border-white/20 hover:text-white/90 transition-all duration-200">
            Explore Features
          </a>
        </div>

        <div className="mt-16 flex flex-col items-center gap-2 text-white/20 text-xs animate-bounce">
          <span>Scroll to explore</span><span>↓</span>
        </div>
      </section>

      {/* STATS BAND */}
      <section id="stats" className="relative z-10 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <span className="font-poppins font-extrabold text-4xl text-white mb-1">{s.value}</span>
              <span className="text-sm text-[#5C6480] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[#4B69FF] text-sm font-semibold tracking-widest uppercase mb-3">Platform Features</p>
          <h2 className="font-poppins font-bold text-4xl text-white tracking-tight">
            Everything you need to run<br /><span className="text-[#809CFF]">a modern hospital</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <button key={f.title} onClick={() => handleFeatureClick(f)}
              className="group relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-[#4B69FF]/30 transition-all duration-300 text-left cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4B69FF]/0 to-[#4B69FF]/0 group-hover:from-[#4B69FF]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
              <div className="w-11 h-11 rounded-xl bg-[#4B69FF]/10 border border-[#4B69FF]/20 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
              <h3 className="font-poppins font-bold text-[15px] text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#5C6480] leading-relaxed">{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section id="about" className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="absolute left-1/2 -translate-x-1/2 w-96 h-64 bg-[#4B69FF]/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative bg-gradient-to-br from-[#4B69FF]/10 to-[#2D3F99]/10 border border-[#4B69FF]/20 rounded-3xl p-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B69FF] to-[#2D3F99] flex items-center justify-center text-3xl mx-auto mb-6 shadow-[0_8px_30px_rgba(75,105,255,0.4)]">🚀</div>
            <h2 className="font-poppins font-bold text-3xl text-white mb-3 tracking-tight">Ready to get started?</h2>
            <p className="text-[#9BA5C0] text-base mb-8 leading-relaxed">
              Sign in to your Navhim-Patient-Admin account and take full control of your healthcare operations today.
            </p>
            <button onClick={handleLogin}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#4B69FF] to-[#2D3F99] text-white font-semibold text-[15px] shadow-[0_8px_30px_rgba(75,105,255,0.45)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200">
              Login to Dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.06] px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={appLogo} alt="Navhim Logo" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-poppins font-bold text-sm text-white/60">Navhim<span className="text-[#4B69FF]/80">-Patient-Admin</span></span>
        </div>
        <p className="text-xs text-white/20">© 2026 Navhim. All rights reserved.</p>
      </footer>
    </div>
  )
}
