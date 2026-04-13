import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, MessageSquare, Download, Bell, AlertTriangle, X, TrendingUp, Calendar, Shield, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePolicy } from '../contexts/PolicyContext';

function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function MetricCard({ icon, label, value, sub, delay }: { icon: React.ReactNode; label: string; value: string; sub?: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-5 rounded-xl border border-[#D4AF37]/20 relative overflow-hidden"
      style={{ background: '#2D1810', boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.1)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">{icon}</div>
      </div>
      <p className="font-poppins text-xs text-[#A89070] mb-1">{label}</p>
      <p className="font-playfair text-2xl text-[#F5F1E8]">{value}</p>
      {sub && <p className="font-poppins text-xs text-[#A89070] mt-1">{sub}</p>}
    </motion.div>
  );
}

function CircularProgress({ score }: { score: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#D4AF37' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#2D1810" strokeWidth="14" />
        <motion.circle
          cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-playfair text-4xl" style={{ color }}>{score}</p>
        <p className="font-poppins text-xs text-[#A89070]">Health Score</p>
      </div>
    </div>
  );
}

const COLORS = ['#22c55e', '#3b82f6', '#D4AF37', '#a855f7', '#ec4899', '#f97316'];

export default function Dashboard() {
  const { profile } = useAuth();
  const { activePolicy, simulations, loading } = usePolicy();
  const [alertDismissed, setAlertDismissed] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const sumInsured = useCountUp(activePolicy?.sum_insured || 0);
  const premium = useCountUp(activePolicy?.premium || 0);
  const renewalDays = useCountUp(365 - ((activePolicy?.policy_year || 1) % 365));

// Replace hardcoded coverageData with this:
const coverageData = activePolicy ? [
  { name: 'Hospitalization', value: (activePolicy.coverages as any)?.hospitalization?.limit || 1000000 },
  { name: 'Maternity', value: (activePolicy.coverages as any)?.maternity?.cesarean || 50000 },
  { name: 'Mental Health', value: (activePolicy.coverages as any)?.mentalHealth?.limit || 100000 },
  { name: 'Day Care', value: (activePolicy.coverages as any)?.daycare?.procedures ? 200000 : 0 },
  { name: 'Pre/Post Care', value: ((activePolicy.coverages as any)?.preHospitalization?.days || 0) * 1000 },
  { name: 'Ambulance', value: (activePolicy.coverages as any)?.ambulance?.perEvent || 3000 },
].filter(d => d.value > 0) : [];
  const waitingPeriods = [
    { label: 'Pre-existing Diseases', months: 48, status: (activePolicy?.policy_year || 0) * 12 >= 48 },
    { label: 'Maternity', months: 9, status: (activePolicy?.policy_year || 0) * 12 >= 9 },
    { label: 'Cataract', months: 24, status: (activePolicy?.policy_year || 0) * 12 >= 24 },
    { label: 'Joint Replacement', months: 36, status: (activePolicy?.policy_year || 0) * 12 >= 36 },
  ];

  const healthScore = activePolicy ? Math.min(40 + (activePolicy.policy_year * 10) + 20, 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center pt-20">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-3 h-3 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A0F0A] pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl text-[#F5F1E8] mb-1">
            Welcome back, {firstName} 👋
          </h1>
          {activePolicy ? (
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-poppins">
                ● Active: {activePolicy.policy_name}
              </span>
              <span className="text-[#A89070] text-sm font-poppins">
                Updated {new Date(activePolicy.uploaded_at).toLocaleDateString('en-IN')}
              </span>
            </div>
          ) : (
            <p className="text-[#A89070] font-poppins text-sm mt-1">No policy uploaded yet</p>
          )}
        </motion.div>

        {/* Empty state */}
        {!activePolicy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[#D4AF37]/20"
            style={{ background: '#2D1810' }}
          >
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <Upload size={36} className="text-[#D4AF37]" />
            </div>
            <h2 className="font-playfair text-2xl text-[#F5F1E8] mb-2">Upload your first policy</h2>
            <p className="font-poppins text-[#A89070] text-sm mb-6 text-center max-w-sm">
              Upload a PDF or image of your insurance policy to get started with AI-powered analysis.
            </p>
            <Link
              to="/chat"
              className="px-6 py-3 bg-[#D4AF37] text-[#1A0F0A] rounded-xl font-semibold font-poppins hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
            >
              Upload Policy
            </Link>
          </motion.div>
        )}

        {activePolicy && (
          <>
            {/* Coverage gap alert */}
            {!alertDismissed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                  <p className="text-amber-300 text-sm font-poppins">
                    Coverage gap detected: OPD and dental coverage not included in your plan.
                    <Link to="/exclusions" className="ml-2 underline text-[#D4AF37]">Review exclusions →</Link>
                  </p>
                </div>
                <button onClick={() => setAlertDismissed(true)} className="text-[#A89070] hover:text-[#F5F1E8] ml-4">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard icon={<Shield size={18} />} label="Sum Insured" value={`₹${(sumInsured / 100000).toFixed(1)}L`} delay={0} />
              <MetricCard icon={<DollarSign size={18} />} label="Annual Premium" value={`₹${premium.toLocaleString('en-IN')}`} delay={0.1} />
              <MetricCard icon={<TrendingUp size={18} />} label="Policy Year" value={`Year ${activePolicy.policy_year}`} sub="Continuous coverage" delay={0.2} />
              <MetricCard icon={<Calendar size={18} />} label="Renewal In" value={`${renewalDays} days`} sub="Auto-reminder set" delay={0.3} />
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl border border-[#D4AF37]/20"
                style={{ background: '#2D1810' }}
              >
                <h3 className="font-playfair text-xl text-[#F5F1E8] mb-4">Coverage Health Score</h3>
                <div className="relative flex items-center justify-center">
                  <CircularProgress score={healthScore} />
                </div>
                <p className="text-center text-[#A89070] text-sm font-poppins mt-4">
                  {healthScore >= 75 ? 'Excellent coverage' : healthScore >= 50 ? 'Good, some gaps' : 'Needs attention'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl border border-[#D4AF37]/20"
                style={{ background: '#2D1810' }}
              >
                <h3 className="font-playfair text-xl text-[#F5F1E8] mb-4">Coverage Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={coverageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {coverageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ background: '#2D1810', border: '1px solid #D4AF37', borderRadius: '8px', color: '#F5F1E8' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {coverageData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[#A89070] text-xs font-poppins truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Waiting periods timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl border border-[#D4AF37]/20 mb-6"
              style={{ background: '#2D1810' }}
            >
              <h3 className="font-playfair text-xl text-[#F5F1E8] mb-6">Waiting Period Timeline</h3>
              <div className="space-y-4">
                {waitingPeriods.map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${w.status ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-poppins text-sm text-[#F5F1E8]">{w.label}</span>
                        <span className="font-poppins text-xs text-[#A89070]">{w.months} months</span>
                      </div>
                      <div className="h-1.5 bg-[#1A0F0A] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: w.status ? '100%' : `${((activePolicy.policy_year * 12) / w.months) * 100}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${w.status ? 'bg-green-500' : 'bg-red-500/60'}`}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-poppins font-medium ${w.status ? 'text-green-400' : 'text-red-400'}`}>
                      {w.status ? 'Active' : 'Waiting'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent simulations */}
            {simulations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl border border-[#D4AF37]/20 mb-6"
                style={{ background: '#2D1810' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-xl text-[#F5F1E8]">Recent Simulations</h3>
                  <Link to="/simulator" className="text-[#D4AF37] text-sm font-poppins hover:underline">
                    Run new →
                  </Link>
                </div>
                <div className="space-y-3">
                  {simulations.slice(0, 3).map((sim) => (
                    <div key={sim.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1A0F0A]">
                      <div>
                        <p className="font-poppins text-sm text-[#F5F1E8]">{sim.scenario}</p>
                        <p className="font-poppins text-xs text-[#A89070]">₹{sim.bill_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-poppins font-medium ${
                        sim.verdict === 'FULLY COVERED' ? 'bg-green-500/15 text-green-400' :
                        sim.verdict === 'NOT COVERED' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {sim.verdict}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: <Upload size={18} />, label: 'Upload Policy', to: '/chat' },
                { icon: <MessageSquare size={18} />, label: 'Ask AI', to: '/chat' },
                { icon: <Download size={18} />, label: 'Download PDF', action: () => {} },
                { icon: <Bell size={18} />, label: 'Set Reminder', action: () => {} },
              ].map((a, i) => (
                a.to ? (
                  <Link key={i} to={a.to}
                    className="p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col items-center gap-2 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all text-center"
                    style={{ background: '#2D1810' }}
                  >
                    <div className="text-[#D4AF37]">{a.icon}</div>
                    <span className="font-poppins text-xs text-[#A89070]">{a.label}</span>
                  </Link>
                ) : (
                  <button key={i} onClick={a.action}
                    className="p-4 rounded-xl border border-[#D4AF37]/20 flex flex-col items-center gap-2 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all"
                    style={{ background: '#2D1810' }}
                  >
                    <div className="text-[#D4AF37]">{a.icon}</div>
                    <span className="font-poppins text-xs text-[#A89070]">{a.label}</span>
                  </button>
                )
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
