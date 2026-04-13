import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BookAnimation from "../components/BookAnimation";
import { Shield, Zap, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  openAuth: (tab: 'signin' | 'signup') => void;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; size: number;
      speedX: number; speedY: number;
      opacity: number; opacityDir: number;
    }[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.5 - 0.1,
        opacity: Math.random(),
        opacityDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    let animId: number;
    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacityDir * 0.005;
        if (p.opacity <= 0 || p.opacity >= 1) p.opacityDir *= -1;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity * 0.6})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function Landing({ openAuth }: Props) {
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      openAuth('signup');
    }
  };

  const features = [
    { icon: <Shield size={24} />, title: 'Policy Analysis', desc: 'Upload any insurance document and get an instant plain-English breakdown of your coverage.' },
    { icon: <Zap size={24} />, title: 'Claim Simulator', desc: 'See exactly what gets paid before you file — input a scenario and get real numbers.' },
    { icon: <Eye size={24} />, title: 'Gap Detection', desc: 'Identify missing coverage and understand waiting periods before it is too late.' },
  ];

  return (
    <div
      className="relative min-h-screen"
      style={{ background: '#1A0F0A', overflowX: 'clip' }}
    >
      <ParticleCanvas />

      {/* Background radial glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      {/* BOOK ANIMATION — no wrappers, no z-index, no overflow */}
      <BookAnimation />

      {/* Hero text below book */}
      <div className="relative z-10 text-center px-6 py-24 max-w-2xl mx-auto">
        <h1 className="font-playfair text-5xl md:text-6xl leading-tight mb-4 text-[#F5F1E8]">
          Understand Your Policy
          <span className="text-[#D4AF37]"> In Plain English</span>
        </h1>
        <p className="font-poppins text-lg text-[#A89070] mb-8">
          Stop guessing. Start knowing exactly what's covered.
        </p>
      </div>

      {/* Features section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl text-[#F5F1E8] mb-4">
              Everything you need to know about your insurance
            </h2>
            <p className="font-poppins text-[#A89070] text-lg max-w-2xl mx-auto">
              PolicyClear turns complex insurance jargon into clear, actionable insights in seconds.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-[#D4AF37]/20 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all"
                style={{
                  background: '#2D1810',
                  boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.1), 0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-playfair text-xl text-[#F5F1E8] mb-2">{f.title}</h3>
                <p className="font-poppins text-[#A89070] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="relative z-10 py-16 px-6 border-y border-[#D4AF37]/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '50,000+', label: 'Policies Analyzed' },
            { value: '₹2.4Cr', label: 'Claims Clarified' },
            { value: '98%', label: 'Accuracy Rate' },
            { value: '< 30s', label: 'Analysis Time' },
          ].map((s, i) => (
            <div key={i}>
              <p className="font-playfair text-3xl text-[#D4AF37] mb-1">{s.value}</p>
              <p className="font-poppins text-sm text-[#A89070]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-playfair text-4xl text-[#F5F1E8] mb-4">
            Ready to understand your insurance?
          </h2>
          <p className="font-poppins text-[#A89070] mb-8">
            Join thousands of policyholders who finally know what they're paying for.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={handleCTA}
              className="px-8 py-4 bg-[#D4AF37] text-[#1A0F0A] rounded-xl font-semibold font-poppins hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all"
            >
              Get Started Free
            </button>
            {user && (
              <Link
                to="/chat"
                className="px-8 py-4 border border-[#D4AF37]/40 text-[#D4AF37] rounded-xl font-semibold font-poppins hover:bg-[#D4AF37]/10 transition-all"
              >
                Upload a Policy
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#D4AF37]/10 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={16} className="text-[#D4AF37]" />
          <span className="font-playfair text-lg text-[#F5F1E8]">PolicyClear</span>
        </div>
        <p className="font-poppins text-sm text-[#A89070]">
          Making insurance transparent for everyone.
        </p>
      </footer>
    </div>
  );
}