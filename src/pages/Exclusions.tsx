import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import { usePolicy } from '../contexts/PolicyContext';

interface Exclusion {
  id: string;
  category: 'permanent' | 'waiting' | 'misunderstood';
  title: string;
  description: string;
  tip: string;
}

const exclusions: Exclusion[] = [
  { id: '1', category: 'permanent', title: 'Cosmetic Surgery', description: 'Any surgery purely for aesthetic improvement, including rhinoplasty, liposuction, and facelifts, is not covered under any circumstances.', tip: 'Look for specific cosmetic procedure riders if this matters to you.' },
  { id: '2', category: 'permanent', title: 'Self-Inflicted Injuries', description: 'Claims arising from intentional self-harm or suicide attempts are permanently excluded from your policy.', tip: 'Seek help from mental health professionals — many are now covered under mental health clauses.' },
  { id: '3', category: 'permanent', title: 'Substance Abuse', description: 'Treatment for alcoholism, drug addiction, or any condition caused by substance abuse is not covered.', tip: 'Some insurers offer de-addiction riders — ask your agent about add-ons.' },
  { id: '4', category: 'permanent', title: 'War & Terrorism', description: 'Any injury sustained during war, invasion, or terrorist activity is excluded from coverage.', tip: 'Government schemes sometimes cover war-related injuries for civilians.' },
  { id: '5', category: 'waiting', title: 'Pre-existing Diseases', description: 'Any condition you had before buying the policy is not covered for the first 4 years (48 months) of the policy.', tip: 'Disclose all pre-existing conditions honestly. After 4 years, they are fully covered.' },
  { id: '6', category: 'waiting', title: 'Maternity Benefits', description: 'Maternity-related expenses including delivery are not covered until 9 months of continuous policy coverage.', tip: 'Buy health insurance early — well before planning a family.' },
  { id: '7', category: 'waiting', title: 'Cataract Surgery', description: 'Cataract operations are excluded for the first 2 years of your policy.', tip: 'If you know you need cataract surgery, wait until after the 2-year mark.' },
  { id: '8', category: 'waiting', title: 'Joint Replacement', description: 'Hip and knee replacement surgeries are not covered in the first 3 years of the policy.', tip: 'Opt for a policy with shorter waiting periods if you have joint conditions.' },
  { id: '9', category: 'misunderstood', title: 'OPD & Consultations', description: 'Outpatient doctor visits, routine check-ups, and prescribed medicines outside hospitalization are usually not covered.', tip: 'Consider an OPD rider that reimburses routine doctor visits and medicines.' },
  { id: '10', category: 'misunderstood', title: 'Dental Treatment', description: 'Most dental procedures including fillings, root canals, and dentures are excluded unless resulting from an accident.', tip: 'Look for dental add-on riders or standalone dental insurance plans.' },
  { id: '11', category: 'misunderstood', title: 'Non-Network Hospitals', description: 'If you go to a hospital outside the insurer\'s network, you pay upfront and get reimbursed later — no cashless facility.', tip: 'Always check the nearest network hospital before admission for cashless treatment.' },
  { id: '12', category: 'misunderstood', title: 'Ambulance Cap', description: 'Ambulance expenses are capped at ₹3,000 per event. Air ambulance costs (₹50,000+) are almost never covered.', tip: 'Keep emergency ambulance funds separate. Critical illness riders may help with air ambulance.' },
];

const catConfig = {
  permanent: { label: 'Permanent Exclusion', color: 'red', dot: 'bg-red-500', bg: 'bg-red-500/5', border: 'border-red-500/20', badge: 'bg-red-500/15 text-red-400' },
  waiting: { label: 'Waiting Period', color: 'amber', dot: 'bg-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20', badge: 'bg-amber-500/15 text-amber-400' },
  misunderstood: { label: 'Often Misunderstood', color: 'blue', dot: 'bg-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20', badge: 'bg-blue-500/15 text-blue-400' },
};

export default function Exclusions() {
  const { activePolicy } = usePolicy();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'permanent' | 'waiting' | 'misunderstood'>('all');

  const filtered = exclusions.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || e.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#1A0F0A] pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl text-[#F5F1E8] mb-2">What's Not Covered</h1>
          <p className="font-poppins text-[#A89070]">Understand your exclusions in plain English — before you need to make a claim.</p>
        </motion.div>

        {!activePolicy && (
          <div className="flex flex-col items-center py-16 text-center mb-8">
            <AlertCircle size={40} className="text-[#D4AF37] mb-3" />
            <p className="font-poppins text-[#A89070] text-sm">Upload a policy for personalized exclusions. Showing standard exclusions below.</p>
          </div>
        )}

        {/* Search and filter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89070]" />
            <input
              type="text"
              placeholder="Search exclusions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#2D1810] border border-[#A89070]/30 rounded-xl pl-10 pr-4 py-3 text-[#F5F1E8] placeholder-[#A89070]/50 focus:outline-none focus:border-[#D4AF37] font-poppins text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'permanent', 'waiting', 'misunderstood'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-poppins font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-[#D4AF37] text-[#1A0F0A]'
                    : 'border border-[#D4AF37]/20 text-[#A89070] hover:text-[#F5F1E8]'
                }`}
              >
                {f === 'all' ? 'All' : f === 'misunderstood' ? 'Misunderstood' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((excl, i) => {
            const cfg = catConfig[excl.category];
            return (
              <motion.div
                key={excl.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-xl border ${cfg.border} ${cfg.bg} relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-poppins font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <h3 className="font-playfair text-lg text-[#F5F1E8] mb-2">{excl.title}</h3>
                <p className="font-poppins text-sm text-[#A89070] leading-relaxed mb-4">{excl.description}</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#1A0F0A]/60">
                  <span className="text-[#D4AF37] text-sm">💡</span>
                  <p className="font-poppins text-xs text-[#F5F1E8]/80 leading-relaxed">
                    <span className="text-[#D4AF37] font-medium">What to do instead: </span>
                    {excl.tip}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-poppins text-[#A89070]">No exclusions match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
