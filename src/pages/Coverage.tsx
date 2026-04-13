import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Car, Baby, Brain, Ambulance, Eye, Pill, Activity, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { usePolicy } from '../contexts/PolicyContext';

interface CoverageCard {
  id: string;
  icon: React.ReactNode;
  name: string;
  limit: number;
  used: number;
  color: 'green' | 'amber' | 'red';
  subLimits: { label: string; value: string }[];
  coPay: number;
  waitingPeriod: string;
  roomRentCap?: string;
}

const defaultCoverages: CoverageCard[] = [
  {
    id: 'hospitalization',
    icon: <Heart size={22} />,
    name: 'Hospitalization',
    limit: 1000000,
    used: 0,
    color: 'green',
    subLimits: [
      { label: 'Room Rent', value: 'Single AC Room' },
      { label: 'ICU', value: 'Actual' },
      { label: 'Surgeon Fees', value: 'As per CGHS' },
    ],
    coPay: 0,
    waitingPeriod: '30 days (initial)',
    roomRentCap: 'Single AC Room',
  },
  {
    id: 'daycare',
    icon: <Activity size={22} />,
    name: 'Day Care',
    limit: 1000000,
    used: 0,
    color: 'green',
    subLimits: [
      { label: 'Procedures Covered', value: '540+' },
      { label: 'Minimum Hours', value: 'Less than 24 hrs' },
    ],
    coPay: 0,
    waitingPeriod: '30 days',
  },
  {
    id: 'precare',
    icon: <Eye size={22} />,
    name: 'Pre & Post Care',
    limit: 50000,
    used: 0,
    color: 'green',
    subLimits: [
      { label: 'Pre-hospitalization', value: '30 days' },
      { label: 'Post-hospitalization', value: '60 days' },
    ],
    coPay: 0,
    waitingPeriod: 'None',
  },
  {
    id: 'maternity',
    icon: <Baby size={22} />,
    name: 'Maternity',
    limit: 50000,
    used: 0,
    color: 'amber',
    subLimits: [
      { label: 'Normal Delivery', value: '₹35,000' },
      { label: 'C-Section', value: '₹50,000' },
      { label: 'Newborn Coverage', value: 'Up to 90 days' },
    ],
    coPay: 0,
    waitingPeriod: '9 months',
  },
  {
    id: 'mental',
    icon: <Brain size={22} />,
    name: 'Mental Health',
    limit: 100000,
    used: 0,
    color: 'green',
    subLimits: [
      { label: 'Inpatient', value: '₹1,00,000' },
      { label: 'Outpatient', value: 'Not covered' },
    ],
    coPay: 0,
    waitingPeriod: '1 year',
  },
  {
    id: 'ambulance',
    icon: <Ambulance size={22} />,
    name: 'Ambulance',
    limit: 3000,
    used: 0,
    color: 'amber',
    subLimits: [
      { label: 'Per Event', value: '₹3,000' },
      { label: 'Air Ambulance', value: 'Not covered' },
    ],
    coPay: 0,
    waitingPeriod: 'None',
  },
  {
    id: 'opd',
    icon: <Pill size={22} />,
    name: 'OPD',
    limit: 0,
    used: 0,
    color: 'red',
    subLimits: [
      { label: 'Doctor Consult', value: 'Not covered' },
      { label: 'Medicines', value: 'Not covered' },
    ],
    coPay: 0,
    waitingPeriod: 'N/A',
  },
  {
    id: 'critical',
    icon: <Car size={22} />,
    name: 'Critical Illness',
    limit: 0,
    used: 0,
    color: 'red',
    subLimits: [
      { label: 'Cancer', value: 'Not covered (add-on)' },
      { label: 'Heart Attack', value: 'Covered under base' },
    ],
    coPay: 0,
    waitingPeriod: '90 days',
  },
];

const colorMap = {
  green: { bar: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  amber: { bar: '#D4AF37', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  red: { bar: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function Coverage() {
  const { activePolicy } = usePolicy();
  const [expanded, setExpanded] = useState<string | null>(null);

  const coverages = activePolicy ? defaultCoverages : [];
  const totalLimit = defaultCoverages.reduce((s, c) => s + c.limit, 0);

  return (
    <div className="min-h-screen bg-[#1A0F0A] pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl text-[#F5F1E8] mb-2">Coverage Visualizer</h1>
          <p className="font-poppins text-[#A89070]">See exactly what your policy covers and the limits for each category.</p>
        </motion.div>

        {!activePolicy ? (
          <div className="flex flex-col items-center py-24 text-center">
            <AlertCircle size={48} className="text-[#D4AF37] mb-4" />
            <h2 className="font-playfair text-2xl text-[#F5F1E8] mb-2">No Policy Uploaded</h2>
            <p className="font-poppins text-[#A89070] mb-4">Upload a policy document to see your coverage details.</p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 rounded-xl border border-[#D4AF37]/20"
              style={{ background: '#2D1810' }}
            >
              {[
                { label: 'Total Sum Insured', value: `₹${(activePolicy.sum_insured / 100000).toFixed(0)}L` },
                { label: 'Annual Premium', value: `₹${activePolicy.premium.toLocaleString('en-IN')}` },
                { label: 'Policy Year', value: `Year ${activePolicy.policy_year}` },
                { label: 'Co-pay', value: '0%' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="font-poppins text-xs text-[#A89070] mb-1">{s.label}</p>
                  <p className="font-playfair text-xl text-[#D4AF37]">{s.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Coverage cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultCoverages.map((card, i) => {
                const c = colorMap[card.color];
                const pct = card.limit > 0 ? Math.min(((totalLimit - card.limit) / totalLimit) * 100 + 20, 95) : 0;
                const isExpanded = expanded === card.id;

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border ${c.border} overflow-hidden cursor-pointer transition-all hover:border-[#D4AF37]/30`}
                    style={{ background: '#2D1810' }}
                    onClick={() => setExpanded(isExpanded ? null : card.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.text}`}>
                          {card.icon}
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-[#A89070]" /> : <ChevronDown size={16} className="text-[#A89070]" />}
                      </div>
                      <h3 className="font-poppins text-sm font-medium text-[#F5F1E8] mb-1">{card.name}</h3>
                      <p className="font-playfair text-lg text-[#D4AF37]">
                        {card.limit > 0 ? `₹${(card.limit / 1000).toFixed(0)}K` : 'Not Covered'}
                      </p>
                      {card.limit > 0 && (
                        <div className="mt-3 h-1.5 bg-[#1A0F0A] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ background: c.bar }}
                          />
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-[#D4AF37]/10 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            {card.subLimits.map((sl, j) => (
                              <div key={j} className="flex justify-between">
                                <span className="font-poppins text-xs text-[#A89070]">{sl.label}</span>
                                <span className="font-poppins text-xs text-[#F5F1E8]">{sl.value}</span>
                              </div>
                            ))}
                            <div className="flex justify-between border-t border-[#D4AF37]/10 pt-2">
                              <span className="font-poppins text-xs text-[#A89070]">Co-pay</span>
                              <span className="font-poppins text-xs text-[#F5F1E8]">{card.coPay}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-poppins text-xs text-[#A89070]">Waiting Period</span>
                              <span className="font-poppins text-xs text-[#F5F1E8]">{card.waitingPeriod}</span>
                            </div>
                            {card.roomRentCap && (
                              <div className="flex justify-between">
                                <span className="font-poppins text-xs text-[#A89070]">Room Rent Cap</span>
                                <span className="font-poppins text-xs text-[#F5F1E8]">{card.roomRentCap}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
