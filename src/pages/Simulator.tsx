import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, GitCompare, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { usePolicy } from '../contexts/PolicyContext';
import { Simulation } from '../types';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

const PRESETS = [
  'Heart Attack', 'Knee Replacement', 'Diabetes Admission',
  'Maternity C-Section', 'Road Accident', 'Dental', 'Psychiatric Admission', 'Cancer Chemo'
];

const HOSPITAL_TYPES = ['Network Hospital', 'Non-Network Hospital', 'Government Hospital'];
const CITY_TIERS = ['Tier 1 (Metro)', 'Tier 2 (City)', 'Tier 3 (Town)'];

function calcSimulation(scenario: string, bill: number, hospitalType: string, policyYear: number, roomType: string) {
  let insurer = 0;
  let verdict: 'FULLY COVERED' | 'PARTIALLY COVERED' | 'NOT COVERED' = 'FULLY COVERED';
  const breakdown: { label: string; amount: number; type: 'deduction' | 'covered' | 'info' }[] = [];

  const networkMultiplier = hospitalType === 'Non-Network Hospital' ? 0.9 : 1;
  const roomDeduction = roomType === 'Shared Room' ? Math.min(bill * 0.05, 5000) : 0;

  if (scenario === 'Dental') {
    verdict = 'NOT COVERED';
    breakdown.push({ label: 'Dental (excluded)', amount: bill, type: 'deduction' });
    return { insurer: 0, user: bill, verdict, breakdown };
  }

  if (scenario === 'Cancer Chemo') {
    const coPay = 0;
    const covered = Math.min(bill, 1000000) * networkMultiplier - roomDeduction;
    insurer = Math.max(covered - coPay, 0);
    breakdown.push(
      { label: 'Base coverage', amount: covered, type: 'covered' },
      { label: 'Room rent deduction', amount: roomDeduction, type: 'deduction' },
    );
    verdict = insurer >= bill * 0.9 ? 'FULLY COVERED' : 'PARTIALLY COVERED';
  } else if (scenario === 'Maternity C-Section') {
    if (policyYear < 1) {
      verdict = 'NOT COVERED';
      breakdown.push({ label: 'Waiting period not met (9 months)', amount: bill, type: 'deduction' });
      return { insurer: 0, user: bill, verdict, breakdown };
    }
    const cap = 50000;
    insurer = Math.min(bill, cap);
    breakdown.push(
      { label: 'Maternity limit', amount: cap, type: 'info' },
      { label: 'Covered amount', amount: insurer, type: 'covered' },
    );
    verdict = bill > cap ? 'PARTIALLY COVERED' : 'FULLY COVERED';
  } else if (scenario === 'Psychiatric Admission') {
    const cap = 100000;
    insurer = Math.min(bill, cap) * networkMultiplier - roomDeduction;
    breakdown.push(
      { label: 'Mental health limit', amount: cap, type: 'info' },
      { label: 'Covered amount', amount: Math.min(bill, cap), type: 'covered' },
      { label: 'Room deduction', amount: roomDeduction, type: 'deduction' },
    );
    verdict = bill <= cap ? 'FULLY COVERED' : 'PARTIALLY COVERED';
  } else {
    const deductible = 0;
    const covered = Math.min(bill, 1000000) * networkMultiplier - roomDeduction - deductible;
    insurer = Math.max(covered, 0);
    breakdown.push(
      { label: 'Hospitalization covered', amount: Math.min(bill, 1000000), type: 'covered' },
      ...(roomDeduction > 0 ? [{ label: 'Room rent deduction', amount: roomDeduction, type: 'deduction' as const }] : []),
      ...(hospitalType === 'Non-Network Hospital' ? [{ label: 'Non-network deduction (10%)', amount: bill * 0.1, type: 'deduction' as const }] : []),
    );
    if (bill > 1000000) {
      breakdown.push({ label: 'Beyond sum insured', amount: bill - 1000000, type: 'deduction' });
      verdict = 'PARTIALLY COVERED';
    } else {
      verdict = 'FULLY COVERED';
    }
  }

  return { insurer: Math.round(insurer), user: Math.round(bill - insurer), verdict, breakdown };
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const cfg = verdict === 'FULLY COVERED'
    ? 'bg-green-500/15 text-green-400 border-green-500/30'
    : verdict === 'NOT COVERED'
    ? 'bg-red-500/15 text-red-400 border-red-500/30'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold font-poppins ${cfg}`}
    >
      {verdict}
    </motion.span>
  );
}

export default function Simulator() {
  const { activePolicy, simulations, saveSimulation, deleteSimulation } = usePolicy();
  const [scenario, setScenario] = useState('');
  const [bill, setBill] = useState('');
  const [hospitalType, setHospitalType] = useState(HOSPITAL_TYPES[0]);
  const [policyYear, setPolicyYear] = useState(activePolicy?.policy_year || 1);
  const [cityTier, setCityTier] = useState(CITY_TIERS[0]);
  const [roomType, setRoomType] = useState<'Single Room' | 'Shared Room'>('Single Room');
  const [result, setResult] = useState<ReturnType<typeof calcSimulation> | null>(null);
  const [loading, setLoading] = useState(false);
  const [openBreakdown, setOpenBreakdown] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const confettiFired = useRef(false);

  const inputClass = "w-full bg-[#1A0F0A] border border-[#A89070]/30 rounded-lg px-4 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#D4AF37] transition-colors font-poppins text-sm";

  const runSim = async () => {
    if (!scenario || !bill) return;
    setLoading(true);
    confettiFired.current = false;
    await new Promise(r => setTimeout(r, 600));
    const res = calcSimulation(scenario, parseFloat(bill), hospitalType, policyYear, roomType);
    setResult(res);
    setLoading(false);

    if (res.verdict === 'FULLY COVERED' && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 120, spread: 80, colors: ['#D4AF37', '#22c55e', '#F5F1E8'] });
    }

    await saveSimulation({
      scenario, bill_amount: parseFloat(bill), hospital_type: hospitalType,
      policy_year: policyYear, city_tier: cityTier,
      insurer_pays: res.insurer, user_pays: res.user,
      verdict: res.verdict, breakdown: res.breakdown,
    });
  };

  useEffect(() => {
    if (result && roomType) {
      const res = calcSimulation(scenario, parseFloat(bill || '0'), hospitalType, policyYear, roomType);
      setResult(res);
    }
  }, [roomType]);

  const selectedSims = simulations.filter(s => selected.includes(s.id));

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PolicyClear - Simulation History', 20, 20);
    let y = 40;
    simulations.forEach((sim, i) => {
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${sim.scenario} — ₹${sim.bill_amount.toLocaleString('en-IN')}`, 20, y);
      doc.setFontSize(10);
      doc.text(`   Verdict: ${sim.verdict} | Insurer: ₹${sim.insurer_pays.toLocaleString('en-IN')} | You: ₹${sim.user_pays.toLocaleString('en-IN')}`, 20, y + 7);
      doc.text(`   ${new Date(sim.created_at).toLocaleString('en-IN')}`, 20, y + 14);
      y += 25;
    });
    doc.save('policyclear_simulations.pdf');
  };

  return (
    <div className="min-h-screen bg-[#1A0F0A] pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl text-[#F5F1E8] mb-2">Claim Simulator</h1>
          <p className="font-poppins text-[#A89070]">Find out exactly what your insurer will pay before you file a claim.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl border border-[#D4AF37]/20" style={{ background: '#2D1810' }}>
            <h2 className="font-playfair text-xl text-[#F5F1E8] mb-4">Configure Scenario</h2>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              {PRESETS.map(p => (
                <button key={p} onClick={() => setScenario(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-poppins transition-all ${
                    scenario === p ? 'bg-[#D4AF37] text-[#1A0F0A] font-semibold' : 'border border-[#D4AF37]/20 text-[#A89070] hover:text-[#F5F1E8]'
                  }`}
                >{p}</button>
              ))}
            </div>

            <div className="space-y-4">
              <input type="text" placeholder="Or describe a custom scenario..." value={scenario} onChange={e => setScenario(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Bill Amount (₹)" value={bill} onChange={e => setBill(e.target.value)} className={inputClass} />
              <select value={hospitalType} onChange={e => setHospitalType(e.target.value)} className={inputClass}>
                {HOSPITAL_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Policy Year" value={policyYear} onChange={e => setPolicyYear(parseInt(e.target.value) || 1)} className={inputClass} />
                <select value={cityTier} onChange={e => setCityTier(e.target.value)} className={inputClass}>
                  {CITY_TIERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Room toggle */}
              <div className="flex gap-2">
                {(['Single Room', 'Shared Room'] as const).map(r => (
                  <button key={r} onClick={() => setRoomType(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-poppins transition-all ${
                      roomType === r ? 'bg-[#D4AF37] text-[#1A0F0A] font-semibold' : 'border border-[#D4AF37]/20 text-[#A89070]'
                    }`}
                  >{r}</button>
                ))}
              </div>
              <button
                onClick={runSim}
                disabled={loading || !scenario || !bill}
                className="w-full py-3 bg-[#D4AF37] text-[#1A0F0A] rounded-xl font-semibold font-poppins flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
              >
                <Zap size={18} />
                {loading ? 'Calculating...' : 'Run Simulation'}
              </button>
            </div>
          </motion.div>

          {/* Result panel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={JSON.stringify(result)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl border border-[#D4AF37]/20"
                  style={{ background: '#2D1810' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-playfair text-xl text-[#F5F1E8]">Result</h2>
                    <VerdictBadge verdict={result.verdict} />
                  </div>

                  {/* Split bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-poppins text-xs text-green-400">Insurer pays ₹{result.insurer.toLocaleString('en-IN')}</span>
                      <span className="font-poppins text-xs text-amber-400">You pay ₹{result.user.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden bg-[#1A0F0A] flex">
                      {parseFloat(bill) > 0 && (
                        <>
                          <motion.div
                            className="h-full bg-green-500 rounded-l-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(result.insurer / parseFloat(bill)) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                          <motion.div
                            className="h-full bg-amber-500 rounded-r-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(result.user / parseFloat(bill)) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Breakdown accordion */}
                  <button
                    onClick={() => setOpenBreakdown(!openBreakdown)}
                    className="flex items-center justify-between w-full text-[#A89070] text-sm font-poppins py-2 border-t border-[#D4AF37]/10"
                  >
                    <span>Detailed Breakdown</span>
                    {openBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <AnimatePresence>
                    {openBreakdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2">
                          {result.breakdown.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex justify-between items-center py-1.5 border-b border-[#D4AF37]/5"
                            >
                              <span className="font-poppins text-xs text-[#A89070]">{item.label}</span>
                              <span className={`font-poppins text-xs font-medium ${
                                item.type === 'covered' ? 'text-green-400' :
                                item.type === 'deduction' ? 'text-red-400' : 'text-[#D4AF37]'
                              }`}>
                                {item.type === 'deduction' ? '-' : ''}₹{item.amount.toLocaleString('en-IN')}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            {simulations.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-2xl border border-[#D4AF37]/20" style={{ background: '#2D1810' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-lg text-[#F5F1E8]">History</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setCompareMode(!compareMode)} className="text-xs text-[#D4AF37] font-poppins flex items-center gap-1 hover:underline">
                      <GitCompare size={12} /> Compare
                    </button>
                    <button onClick={exportPDF} className="text-xs text-[#A89070] font-poppins hover:underline">Export PDF</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {simulations.map(sim => (
                    <div key={sim.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1A0F0A]">
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={selected.includes(sim.id)}
                          onChange={e => {
                            if (e.target.checked && selected.length < 2) setSelected([...selected, sim.id]);
                            else setSelected(selected.filter(id => id !== sim.id));
                          }}
                          className="accent-[#D4AF37]"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins text-xs text-[#F5F1E8] truncate">{sim.scenario}</p>
                        <p className="font-poppins text-[10px] text-[#A89070]">₹{sim.bill_amount.toLocaleString('en-IN')} · {new Date(sim.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`text-[10px] font-poppins font-medium px-1.5 py-0.5 rounded ${
                        sim.verdict === 'FULLY COVERED' ? 'bg-green-500/15 text-green-400' :
                        sim.verdict === 'NOT COVERED' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>{sim.verdict.split(' ')[0]}</span>
                      <button onClick={() => { setScenario(sim.scenario); setBill(String(sim.bill_amount)); }} className="text-[#D4AF37] hover:opacity-70">
                        <RotateCcw size={12} />
                      </button>
                      <button onClick={() => deleteSimulation(sim.id)} className="text-red-400 hover:opacity-70">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Compare modal */}
      <AnimatePresence>
        {compareMode && selected.length === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl p-6 rounded-2xl border border-[#D4AF37]/30"
              style={{ background: '#2D1810' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-playfair text-xl text-[#F5F1E8]">Side-by-Side Comparison</h3>
                <button onClick={() => { setCompareMode(false); setSelected([]); }} className="text-[#A89070] hover:text-[#F5F1E8]">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedSims.map(sim => (
                  <div key={sim.id} className="p-4 rounded-xl bg-[#1A0F0A]">
                    <h4 className="font-poppins font-semibold text-[#F5F1E8] text-sm mb-3">{sim.scenario}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-xs text-[#A89070] font-poppins">Bill</span><span className="text-xs text-[#F5F1E8] font-poppins">₹{sim.bill_amount.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#A89070] font-poppins">Insurer pays</span><span className="text-xs text-green-400 font-poppins">₹{sim.insurer_pays.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#A89070] font-poppins">You pay</span><span className="text-xs text-amber-400 font-poppins">₹{sim.user_pays.toLocaleString('en-IN')}</span></div>
                      <div className="pt-2 border-t border-[#D4AF37]/10">
                        <VerdictBadge verdict={sim.verdict} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
