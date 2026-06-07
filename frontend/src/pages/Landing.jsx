import { useNavigate, Link } from 'react-router-dom';
import {
  Pill, ShieldCheck, Bell, BarChart3, PackageCheck,
  ArrowRight, CheckCircle, Zap, Clock, Users, TrendingUp,
  AlertTriangle, Database
} from 'lucide-react';

/* ── floating decorative pills ── */
const FloatingPill = ({ className, color, size = 'w-10 h-4', delay }) => (
  <div className={`absolute rounded-full opacity-70 shadow-lg ${size} ${color} ${delay} ${className}`} />
);

const FloatingIcon = ({ Icon, className, delay, bg }) => (
  <div className={`absolute ${delay} ${className}`}>
    <div className={`${bg} p-3 rounded-2xl shadow-xl`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

/* ── stat card ── */
const Stat = ({ value, label, delay }) => (
  <div className={`text-center stat-card ${delay}`}>
    <div className="text-4xl font-extrabold gradient-text">{value}</div>
    <div className="text-sm text-slate-500 mt-1">{label}</div>
  </div>
);

/* ── step card ── */
const Step = ({ num, title, desc, icon: Icon, delay }) => (
  <div className={`flex items-start space-x-4 animate-fade-up ${delay}`}>
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
      {num}
    </div>
    <div>
      <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
      <p className="text-slate-500 text-sm mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ── feature card ── */
const Feature = ({ icon: Icon, title, desc, color, bg, delay }) => (
  <div className={`feature-card bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-up ${delay}`}>
    <div className={`inline-flex p-3 rounded-xl mb-4 ${bg}`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

/* ── alert card for the visual demo ── */
const DemoAlert = ({ type, title, sub, className }) => {
  const styles = {
    warn: 'bg-orange-50 border-orange-200 text-orange-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 flex items-start space-x-3 ${styles[type]} ${className}`}>
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs opacity-80">{sub}</p>
      </div>
    </div>
  );
};

const features = [
  {
    icon: PackageCheck,
    title: 'Batch-Level Tracking',
    desc: 'Every medicine batch gets its own entry — with quantity, expiry date, purchase price, and supplier.',
    color: 'text-blue-600', bg: 'bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    desc: 'Never get caught off guard. Get alerted when stock falls below your custom threshold.',
    color: 'text-orange-600', bg: 'bg-orange-50',
  },
  {
    icon: Zap,
    title: 'FIFO Auto-Deduction',
    desc: 'Sales automatically consume the earliest-expiring batch first — no manual tracking needed.',
    color: 'text-purple-600', bg: 'bg-purple-50',
  },
  {
    icon: Clock,
    title: 'Expiry Monitoring',
    desc: 'See all medicines expiring in the next 30 days at a glance. Reduce waste, never sell expired stock.',
    color: 'text-red-600', bg: 'bg-red-50',
  },
  {
    icon: BarChart3,
    title: 'Sales Analytics',
    desc: 'Track daily revenue, best-selling medicines, and monthly trends — all on your dashboard.',
    color: 'text-emerald-600', bg: 'bg-emerald-50',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    desc: 'Your data stays yours. Secured with JWT authentication and role-based access control.',
    color: 'text-indigo-600', bg: 'bg-indigo-50',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create your free account',
    desc: 'Sign up in under a minute. No credit card, no complex setup — just your email and password.',
    icon: Users,
  },
  {
    num: '02',
    title: 'Add your medicines & stock',
    desc: 'Enter your medicine catalog and current stock batches with expiry dates, prices, and suppliers.',
    icon: Database,
  },
  {
    num: '03',
    title: 'Track, sell, and get alerted',
    desc: 'Process sales, auto-update stock, and receive real-time low-stock and expiry alerts.',
    icon: TrendingUp,
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="pulse-glow bg-blue-600 p-2 rounded-xl">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">PharmaTrack</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm text-slate-600 font-medium">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how" className="hover:text-blue-600 transition-colors">How It Works</a>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary px-5 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg bg-white"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary px-5 py-2 text-sm font-medium text-white rounded-lg"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-bg pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Floating decoration elements */}
        <FloatingPill className="top-24 left-[8%] float-1" color="bg-blue-400" size="w-14 h-5" delay="" />
        <FloatingPill className="top-40 left-[12%] float-3" color="bg-purple-300" size="w-8 h-3" delay="" />
        <FloatingPill className="top-32 right-[10%] float-2" color="bg-emerald-400" size="w-12 h-4" delay="" />
        <FloatingPill className="top-60 right-[6%] float-1" color="bg-orange-300" size="w-10 h-4" delay="" />
        <FloatingPill className="bottom-20 left-[5%] float-2" color="bg-indigo-300" size="w-16 h-5" delay="" />
        <FloatingPill className="bottom-32 right-[12%] float-3" color="bg-pink-300" size="w-9 h-3" delay="" />

        <FloatingIcon Icon={Bell} className="top-28 right-[22%] float-3" bg="bg-orange-500" delay="" />
        <FloatingIcon Icon={ShieldCheck} className="top-48 left-[18%] float-2" bg="bg-blue-500" delay="" />
        <FloatingIcon Icon={BarChart3} className="bottom-28 right-[20%] float-1" bg="bg-purple-500" delay="" />

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-blue-100 spin-slow opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-purple-100 spin-slow-reverse opacity-30 pointer-events-none" />

        {/* Content */}
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 shimmer-badge border border-blue-200 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-up delay-100">
            <Pill className="h-3.5 w-3.5" />
            <span>Built exclusively for small pharmacies</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight animate-fade-up delay-200">
            Your Pharmacy.<br />
            <span className="gradient-text">Fully Under Control.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed animate-fade-up delay-300">
            PharmaTrack is an all-in-one inventory system that tracks your medicines, sends expiry alerts, auto-manages stock on every sale, and gives you clear reports — all for free.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3 animate-fade-up delay-400">
            {['No credit card required', 'Expiry & low-stock alerts', 'FIFO stock management'].map(p => (
              <span key={p} className="flex items-center space-x-1.5 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{p}</span>
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-500">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-base text-white"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary flex items-center space-x-2 border border-slate-200 bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <span>Log In to Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-slate-100 bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="100%" label="Free to use" delay="delay-100" />
          <Stat value="FIFO" label="Auto stock logic" delay="delay-200" />
          <Stat value="30-day" label="Expiry alerts" delay="delay-300" />
          <Stat value="∞" label="Batches trackable" delay="delay-400" />
        </div>
      </section>

      {/* ── LIVE ALERTS PREVIEW ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Text */}
          <div className="flex-1 animate-fade-left delay-100">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Smart Alerts</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2 leading-tight">
              Know before it's<br />
              <span className="gradient-text">too late</span>
            </h2>
            <p className="mt-4 text-slate-500 text-base leading-relaxed">
              PharmaTrack watches your inventory around the clock. Whether it's a medicine running low or a batch about to expire, you'll know about it before it becomes a problem.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Low-stock alerts per medicine with custom thresholds',
                'Expiry alerts 30, 60, or 90 days in advance',
                'Expired medicines highlighted and blocked from sales',
              ].map(item => (
                <li key={item} className="flex items-start space-x-3 text-sm text-slate-600">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Alert cards demo */}
          <div className="flex-1 w-full max-w-sm animate-fade-right delay-300">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">Active Alerts</span>
                <span className="text-xs text-white bg-red-500 rounded-full px-2 py-0.5 font-bold">3</span>
              </div>
              <DemoAlert type="danger" title="Paracetamol 500mg" sub="Only 8 units left · Threshold: 20" className="float-1" />
              <DemoAlert type="warn" title="Amoxicillin Batch #B204" sub="Expires in 18 days · Qty: 45" className="float-2" />
              <DemoAlert type="warn" title="Cough Syrup 100ml" sub="Expires in 26 days · Qty: 12" className="float-3" />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">Updated just now</span>
                <span className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline">View all →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 animate-fade-up delay-100">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Features</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">
              Everything your pharmacy needs
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              From stock tracking to sales analytics — built for the real workflow of a small pharmacy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Feature key={f.title} {...f} delay={`delay-${(i + 1) * 100}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">How It Works</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2 mb-10 leading-tight">
              Up and running<br />
              <span className="gradient-text">in 3 simple steps</span>
            </h2>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <Step key={s.title} {...s} delay={`delay-${(i + 1) * 200}`} />
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="flex-1 max-w-sm animate-fade-right delay-200">
            <div className="relative">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 -rotate-3 scale-105" />
              <div className="relative bg-white border border-slate-100 rounded-3xl shadow-xl p-6 space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">01</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Account Created ✓</p>
                    <p className="text-xs text-slate-500">admin@pharmatrack.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">02</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">48 Medicines Added ✓</p>
                    <p className="text-xs text-slate-500">With batch & expiry data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">03</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">₹12,400 in sales today</p>
                    <p className="text-xs text-slate-500">Stock auto-updated · 3 alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        {/* Decorative pills */}
        <FloatingPill className="top-8 left-[5%] float-1" color="bg-white/20" size="w-20 h-6" delay="" />
        <FloatingPill className="bottom-8 right-[5%] float-2" color="bg-white/15" size="w-14 h-5" delay="" />
        <FloatingPill className="top-12 right-[15%] float-3" color="bg-white/10" size="w-10 h-4" delay="" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to take control of your pharmacy?
          </h2>
          <p className="text-blue-100 mb-10 text-base max-w-lg mx-auto">
            Join pharmacists who have already ditched spreadsheets and manual tracking. It takes less than 2 minutes to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center space-x-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-base"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-base"
            >
              <span>Already have an account? Log In</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 bg-slate-900 text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Pill className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">PharmaTrack</span>
        </div>
        <p className="text-slate-400 text-sm">
          © {new Date().getFullYear()} PharmaTrack. Built for small pharmacies. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
