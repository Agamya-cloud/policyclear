import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Car, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const rawCoverRotation = useTransform(scrollYProgress, [0, 0.5], [0, -172]);
  const coverRotation = useSpring(rawCoverRotation, { stiffness: 60, damping: 20 });
  const coverShadowOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [0.6, 0.3, 0]);
  const pageContentOpacity = useTransform(scrollYProgress, [0.35, 0.6], [0, 1]);
  const bookScale = useTransform(scrollYProgress, [0, 0.05, 0.85, 1], [0.85, 1, 1, 0.95]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div ref={sectionRef} style={{ height: '350vh', position: 'relative' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        paddingTop: '64px',
      }}>

        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }} />

        {/* Book - perspective must wrap the entire 3D scene */}
        <motion.div
          style={{ scale: bookScale }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        >
          <div style={{
            perspective: '1600px',
            perspectiveOrigin: 'center center',
            width: '580px',
            height: '400px',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
            }}>
              <BackCover />
              <PageStack />
              <LeftPage opacity={pageContentOpacity} />
              <RightPage opacity={pageContentOpacity} />

              <motion.div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
                rotateY: coverRotation,
                zIndex: 10,
              }}>
                <FrontCoverFace />
                <CoverInside coverShadowOpacity={coverShadowOpacity} />
              </motion.div>

              <Spine />
              <Ribbon />
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div style={{
          opacity: scrollHintOpacity,
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          marginLeft: '-50px',
          width: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: '#A89070',
            whiteSpace: 'nowrap',
          }}>
            Scroll to open
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{
              width: '20px', height: '32px',
              borderRadius: '9999px',
              border: '1px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'center', paddingTop: '6px',
            }}
          >
            <div style={{ width: '4px', height: '8px', borderRadius: '9999px', background: '#D4AF37' }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function FrontCoverFace() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      borderRadius: '0 8px 8px 0',
      overflow: 'hidden',
      backfaceVisibility: 'hidden' as const,
      WebkitBackfaceVisibility: 'hidden' as const,
      backgroundColor: '#2D1810',
      backgroundImage: `
        repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px),
        repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px),
        linear-gradient(135deg, #3D2218 0%, #2D1810 40%, #1F0E07 100%)
      `,
      boxShadow: '-4px 0 20px rgba(0,0,0,0.8), 4px 0 30px rgba(0,0,0,0.5), inset -3px 0 15px rgba(0,0,0,0.4)',
      borderLeft: '8px solid #1F0E07',
    }}>
      <div style={{
        position: 'absolute', inset: '16px',
        borderRadius: '4px',
        border: '1px solid rgba(212,175,55,0.35)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '20px',
      }}>
        <div style={{ position: 'absolute', inset: '8px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.5)', opacity: 0.3 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '1px', marginBottom: '10px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '12px', height: '16px', borderRadius: '2px', background: '#1A0F0A' }} />
          </div>
          <div style={{ width: '40px', height: '1px', marginTop: '10px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.15em', color: '#D4AF37', textShadow: '0 2px 10px rgba(212,175,55,0.4)', margin: 0 }}>
            PolicyClear
          </h2>
          <div style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: 'rgba(212,175,55,0.6)', marginTop: '4px' }}>
            Insurance Made Simple
          </div>
        </div>
        <div style={{ width: '64px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
        <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(212,175,55,0.4)' }}>
          Family Floater Plan · 2024
        </div>
      </div>
    </div>
  );
}

function CoverInside({ coverShadowOpacity }: { coverShadowOpacity: ReturnType<typeof useTransform> }) {
  return (
    <motion.div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      borderRadius: '0 8px 8px 0',
      backfaceVisibility: 'hidden' as const,
      WebkitBackfaceVisibility: 'hidden' as const,
      rotateY: 180,
      background: 'linear-gradient(135deg, #E8E0D0, #DDD5C0)',
      opacity: coverShadowOpacity,
    }} />
  );
}

function BackCover() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      borderRadius: '0 8px 8px 0',
      transform: 'translateZ(-8px)',
      boxShadow: '4px 4px 30px rgba(0,0,0,0.7)',
      backgroundColor: '#1F0E07',
      backgroundImage: 'linear-gradient(135deg, #3D2218 0%, #2D1810 40%, #1F0E07 100%)',
    }} />
  );
}

function PageStack() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: '8px', right: '8px', top: '2px', bottom: '2px',
          borderRadius: '0 2px 2px 0',
          background: `rgb(${245 - i * 3}, ${241 - i * 3}, ${232 - i * 3})`,
          transform: `translateZ(${-2 - i * 0.8}px)`,
          boxShadow: i === 5 ? 'none' : '1px 0 3px rgba(0,0,0,0.15)',
        }} />
      ))}
    </>
  );
}

function LeftPage({ opacity }: { opacity: ReturnType<typeof useTransform> }) {
  return (
    <motion.div style={{
      position: 'absolute',
      left: '8px', top: '2px',
      width: 'calc(50% - 12px)',
      height: 'calc(100% - 4px)',
      borderRadius: '2px', overflow: 'hidden',
      opacity,
      backgroundColor: '#F5F1E8',
      boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.08)',
      borderRight: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <Car size={24} color="#1A0F0A" />
        </div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 'bold', color: '#2D1810', margin: '0 0 8px 0' }}>Car Insurance</h3>
        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#7A6550', margin: '0 0 16px 0' }}>
          Complete protection for your vehicle with comprehensive coverage and zero-dep add-ons.
        </p>
        <Link to="/coverage" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', padding: '8px 16px', borderRadius: '9999px', background: 'linear-gradient(135deg, #D4AF37, #B8962A)', color: '#1A0F0A', textDecoration: 'none' }}>
          Explore <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
}

function RightPage({ opacity }: { opacity: ReturnType<typeof useTransform> }) {
  return (
    <motion.div style={{
      position: 'absolute',
      left: '50%', top: '2px',
      width: 'calc(50% - 8px)',
      height: 'calc(100% - 4px)',
      borderRadius: '2px', overflow: 'hidden',
      opacity,
      backgroundColor: '#F5F1E8',
      boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.06)',
    }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <Heart size={24} color="#1A0F0A" />
        </div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 'bold', color: '#2D1810', margin: '0 0 8px 0' }}>Health Insurance</h3>
        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#7A6550', margin: '0 0 16px 0' }}>
          Family floater plan covering ₹10 Lakhs with maternity, mental health, and critical illness benefits.
        </p>
        <Link to="/coverage" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', padding: '8px 16px', borderRadius: '9999px', background: 'linear-gradient(135deg, #D4AF37, #B8962A)', color: '#1A0F0A', textDecoration: 'none' }}>
          Explore <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
}

function Spine() {
  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, left: 0,
      width: '16px',
      background: 'linear-gradient(90deg, #0F0705 0%, #1F0E07 40%, #2D1810 100%)',
      boxShadow: '2px 0 10px rgba(0,0,0,0.8), inset -2px 0 5px rgba(0,0,0,0.5)',
      zIndex: 20, borderRadius: '3px 0 0 3px',
    }}>
      <div style={{
        position: 'absolute', left: '4px', right: '4px', top: '32px', bottom: '32px',
        borderRadius: '9999px', opacity: 0.3,
        background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.4), transparent)',
      }} />
    </div>
  );
}

function Ribbon() {
  return (
    <div style={{
      position: 'absolute', right: '30px', top: '-6px',
      width: '12px', height: '60px',
      background: 'linear-gradient(180deg, #D4AF37, #A8892A)',
      boxShadow: '0 2px 8px rgba(212,175,55,0.4)',
      zIndex: 5,
      clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
    }} />
  );
}