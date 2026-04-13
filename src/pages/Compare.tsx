import { motion } from 'framer-motion';
import { Check, X, Award } from 'lucide-react';

const plans = [
  {
    name: 'Star Health Family Floater',
    insurer: 'Star Health',
    premium: 18500,
    sumInsured: 1000000,
    features: {
      hospitalization: true,
      daycare: true,
      maternity: true,
      mentalHealth: true,
      ambulance: true,
      opd: false,
      dental: false,
      criticalIllness: false,
      noClaimBonus: '10% per year',
      networkHospitals: '9800+',
      renewalAge: '65 years',
      coPay: '0%',
      roomRent: 'Single AC',
      waitingPreExisting: '4 years',
    },
  },
  {
    name: 'HDFC ERGO Optima Restore',
    insurer: 'HDFC ERGO',
    premium: 22000,
    sumInsured: 1000000,
    features: {
      hospitalization: true,
      daycare: true,
      maternity: false,
      mentalHealth: true,
      ambulance: true,
      opd: false,
      dental: false,
      criticalIllness: true,
      noClaimBonus: 'Restore full SI',
      networkHospitals: '10000+',
      renewalAge: 'Lifetime',
      coPay: '0%',
      roomRent: 'No cap',
      waitingPreExisting: '3 years',
    },
  },
];

const rows: { key: keyof typeof plans[0]['features']; label: string; higherIsBetter?: boolean }[] = [
  { key: 'hospitalization', label: 'Hospitalization' },
  { key: 'daycare', label: 'Day Care Procedures' },
  { key: 'maternity', label: 'Maternity Cover' },
  { key: 'mentalHealth', label: 'Mental Health' },
  { key: 'ambulance', label: 'Ambulance Cover' },
  { key: 'opd', label: 'OPD Cover' },
  { key: 'dental', label: 'Dental Cover' },
  { key: 'criticalIllness', label: 'Critical Illness' },
  { key: 'noClaimBonus', label: 'No Claim Bonus' },
  { key: 'networkHospitals', label: 'Network Hospitals' },
  { key: 'renewalAge', label: 'Renewal Age' },
  { key: 'coPay', label: 'Co-pay' },
  { key: 'roomRent', label: 'Room Rent' },
  { key: 'waitingPreExisting', label: 'Pre-existing Wait' },
];

function CellValue({ value, isWinner }: { value: boolean | string; isWinner?: boolean }) {
  if (typeof value === 'boolean') {
    return value
      ? <Check size={18} className="text-green-400 mx-auto" />
      : <X size={18} className="text-red-400 mx-auto" />;
  }
  return (
    <span className={`font-poppins text-sm ${isWinner ? 'text-green-400 font-semibold' : 'text-[#A89070]'}`}>
      {value}
    </span>
  );
}

export default function Compare() {
  const scores = plans.map(plan => {
    let score = 0;
    if (plan.features.maternity) score += 2;
    if (plan.features.criticalIllness) score += 2;
    if (plan.features.opd) score += 2;
    if (plan.features.dental) score += 1;
    if (plan.features.renewalAge === 'Lifetime') score += 3;
    score += plan.sumInsured / 500000;
    score -= plan.premium / 10000;
    return score;
  });
  const winnerIdx = scores.indexOf(Math.max(...scores));

  return (
    <div className="min-h-screen bg-[#1A0F0A] pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl text-[#F5F1E8] mb-2">Plan Comparison</h1>
          <p className="font-poppins text-[#A89070]">Side-by-side comparison of top insurance plans to help you decide.</p>
        </motion.div>

        {/* Plan headers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-2">
          <div />
          {plans.map((plan, i) => (
            <div key={i} className={`p-4 rounded-xl border text-center ${i === winnerIdx ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-[#D4AF37]/10'}`} style={{ background: i === winnerIdx ? undefined : '#2D1810' }}>
              <p className="font-playfair text-base text-[#F5F1E8] mb-1">{plan.name}</p>
              <p className="font-poppins text-xs text-[#A89070] mb-3">{plan.insurer}</p>
              <p className="font-playfair text-2xl text-[#D4AF37]">₹{plan.premium.toLocaleString('en-IN')}</p>
              <p className="font-poppins text-xs text-[#A89070]">per year</p>
              <p className="font-poppins text-xs text-green-400 mt-1">₹{(plan.sumInsured / 100000).toFixed(0)}L coverage</p>
            </div>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-xl border border-[#D4AF37]/10 overflow-hidden" style={{ background: '#2D1810' }}>
          {rows.map((row, ri) => (
            <div key={row.key} className={`grid grid-cols-3 gap-4 p-3 ${ri % 2 === 0 ? 'bg-[#1A0F0A]/30' : ''} border-b border-[#D4AF37]/5 last:border-0`}>
              <span className="font-poppins text-sm text-[#A89070] flex items-center">{row.label}</span>
              {plans.map((plan, pi) => {
                const val = plan.features[row.key];
                const otherVals = plans.filter((_, i) => i !== pi).map(p => p.features[row.key]);
                const isWinner = typeof val === 'boolean'
                  ? val && !otherVals.some(v => v === true && pi > 0)
                  : false;
                return (
                  <div key={pi} className="flex justify-center items-center">
                    <CellValue value={val} isWinner={isWinner} />
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>

        {/* Winner card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-6 rounded-2xl border border-[#D4AF37]/40 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2D1810 0%, #3d2010 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <Award size={32} className="text-[#D4AF37] mx-auto mb-3" />
          <h3 className="font-playfair text-2xl text-[#D4AF37] mb-2">Best For You</h3>
          <p className="font-playfair text-xl text-[#F5F1E8] mb-2">{plans[winnerIdx].name}</p>
          <p className="font-poppins text-sm text-[#A89070] max-w-md mx-auto">
            {winnerIdx === 1
              ? 'With lifetime renewability, critical illness cover, and no room rent cap — this plan offers superior long-term value despite the higher premium.'
              : 'This plan offers comprehensive family coverage with maternity benefits and the lowest waiting period for pre-existing diseases.'}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <div className="text-center">
              <p className="font-playfair text-xl text-[#D4AF37]">₹{plans[winnerIdx].premium.toLocaleString('en-IN')}</p>
              <p className="font-poppins text-xs text-[#A89070]">Annual Premium</p>
            </div>
            <div className="text-center">
              <p className="font-playfair text-xl text-[#D4AF37]">₹{(plans[winnerIdx].sumInsured / 100000).toFixed(0)}L</p>
              <p className="font-poppins text-xs text-[#A89070]">Sum Insured</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
