import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'


function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          background: linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #071a0b;
        }

        #root { max-width: 100%; padding: 0; text-align: left; }

        /* WAVES */
        .lp-waves {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 0;
          pointer-events: none;
        }
        .lp-waves svg { width: 100%; display: block; }

        /* PAGE */
        .lp-page {
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          z-index: 1;
        }

        /* NAV */
        .lp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }
        .lp-nav.scrolled {
          background: rgba(232, 245, 226, 0.88);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(10, 42, 15, 0.08);
          box-shadow: 0 10px 30px rgba(10, 42, 15, 0.06);
        }
        .lp-nav-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: 24px;
          color: #0a2a0f;
          letter-spacing: -0.6px;
          text-decoration: none;
        }
        .lp-nav-links {
          display: flex;
          gap: 36px;
          list-style: none;
        }
        .lp-nav-links a {
          font-size: 14px;
          font-weight: 500;
          color: #0e3a16;
          text-decoration: none;
          opacity: 0.84;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .lp-nav-links a:hover { opacity: 1; transform: translateY(-1px); }
        .lp-nav-cta {
          font-size: 13px;
          font-weight: 700;
          background: #0a2a0f;
          color: #dff89a;
          border: none;
          padding: 11px 22px;
          border-radius: 999px;
          cursor: pointer;
          letter-spacing: 0.4px;
          transition: all 0.25s ease;
        }
        .lp-nav-cta:hover {
          background: #143c19;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(10, 42, 15, 0.16);
        }

        /* TICKER BANNER */
        .lp-ticker {
          position: fixed;
          top: 64px;
          left: 0; right: 0;
          z-index: 99;
          background: #0a2a0f;
          color: #dff89a;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
        }
        .lp-ticker-track {
          display: inline-flex;
          gap: 80px;
          animation: lp-ticker 22s linear infinite;
        }
        .lp-ticker-track span {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        @keyframes lp-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* HERO — LinkedIn split layout */
        .lp-hero {
          min-height: 92vh;
          display: flex;
          align-items: stretch;
          padding-top: 120px;
          overflow: hidden;
        }

        /* LEFT — text */
        .lp-hero-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 60px 80px 80px;
          animation: lp-fadeUp 0.9s ease both;
        }

        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-eyebrow-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(10, 42, 15, 0.1);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #19461f;
          letter-spacing: 0.9px;
          text-transform: uppercase;
          width: fit-content;
          backdrop-filter: blur(8px);
        }

        .lp-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 900;
          line-height: 1.06;
          color: #071a0b;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .lp-hero h1 em {
          font-style: italic;
          color: #1a4a20;
        }

        .lp-hero-sub {
          font-size: 17px;
          font-weight: 400;
          color: #2a5230;
          line-height: 1.75;
          max-width: 460px;
          margin-bottom: 40px;
        }

        .lp-hero-btns {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }

        .lp-btn {
          font-size: 14px;
          font-weight: 700;
          border: none;
          padding: 14px 28px;
          border-radius: 999px;
          cursor: pointer;
          letter-spacing: 0.4px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .lp-btn.primary { background: #0a2a0f; color: #ecfcbf; }
        .lp-btn.primary:hover {
          background: #071a0b;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(10, 42, 15, 0.22);
        }
        .lp-btn.secondary {
          background: rgba(255, 255, 255, 0.62);
          color: #0a2a0f;
          border: 1px solid rgba(10, 42, 15, 0.12);
          backdrop-filter: blur(8px);
        }
        .lp-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.85);
          transform: translateY(-2px);
        }

        /* Trust row */
        .lp-trust {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .lp-trust-note {
          font-size: 13px;
          color: #3a6040;
          line-height: 1.5;
          max-width: 300px;
        }
        .lp-trust-badges {
          display: flex;
          gap: 8px;
        }
        .lp-badge {
          padding: 6px 12px;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(10,42,15,0.1);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          color: #1a4a22;
          backdrop-filter: blur(6px);
        }

        /* RIGHT — image */
        .lp-hero-right {
          flex: 1;
          position: relative;
          overflow: hidden;
          animation: lp-fadeIn 1.1s ease 0.15s both;
        }

        @keyframes lp-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .lp-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .lp-hero-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #dff89a 0%, transparent 30%);
          z-index: 1;
          pointer-events: none;
        }

        /* Wave divider */
        .lp-hero-wave {
          position: relative;
          margin-top: -2px;
          line-height: 0;
        }
        .lp-hero-wave svg { width: 100%; display: block; }

        /* FEATURES */
        .lp-features-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 40px 80px;
        }
        .lp-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #5a8060;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 14px;
        }
        .lp-section-head {
          text-align: center;
          margin-bottom: 48px;
        }
        .lp-section-head h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 4vw, 46px);
          color: #071a0b;
          letter-spacing: -1px;
          line-height: 1.1;
        }
        .lp-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lp-feature-card {
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(10, 42, 15, 0.09);
          border-radius: 20px;
          padding: 28px 22px;
          backdrop-filter: blur(10px);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .lp-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(10, 42, 15, 0.09);
        }
        .lp-feature-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #b6f542, #7de870);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 14px;
        }
        .lp-feature-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #071a0b;
          margin-bottom: 8px;
        }
        .lp-feature-desc {
          font-size: 14px;
          color: #3a6040;
          line-height: 1.7;
        }

        /* CTA */
        .lp-cta-strip {
          max-width: 900px;
          margin: 0 auto 100px;
          padding: 0 40px;
        }
        .lp-cta-card {
          background: rgba(10, 42, 15, 0.9);
          color: #f8ffe6;
          border-radius: 24px;
          padding: 48px 44px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
          box-shadow: 0 24px 50px rgba(10, 42, 15, 0.18);
        }
        .lp-cta-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        .lp-cta-card p {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(248, 255, 230, 0.75);
          max-width: 480px;
        }
        .lp-cta-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        /* FOOTER */
        .lp-footer {
          text-align: center;
          padding: 32px 24px 44px;
          font-size: 13px;
          color: #4a7050;
          border-top: 1px solid rgba(10, 42, 15, 0.08);
        }
        .lp-footer a {
          color: #0a2a0f;
          text-decoration: none;
          font-weight: 700;
        }
        .lp-footer a:hover { text-decoration: underline; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .lp-hero { flex-direction: column; min-height: auto; }
          .lp-hero-left { padding: 100px 32px 40px; }
          .lp-hero-right { height: 300px; }
          .lp-hero-right::before {
            background: linear-gradient(180deg, #dff89a 0%, transparent 30%);
          }
          .lp-features { grid-template-columns: 1fr; }
          .lp-cta-card { flex-direction: column; align-items: flex-start; }
          .lp-nav { padding: 16px 24px; }
        }
        @media (max-width: 768px) {
          .lp-nav-links, .lp-nav-cta { display: none; }
          .lp-hero-left { padding: 100px 22px 32px; }
          .lp-features-section, .lp-cta-strip { padding-left: 18px; padding-right: 18px; }
          .lp-cta-card { padding: 28px 22px; }
          .lp-cta-card h3 { font-size: 26px; }
        }
      `}</style>

      {/* WAVE HILLS — fixed bottom */}
      <div className="lp-waves">
        <svg viewBox="0 0 1440 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path fill="rgba(140,200,120,0.22)"
            d="M0,220 C160,155 320,285 480,220 C640,155 800,285 960,220 C1120,155 1280,265 1440,210 L1440,380 L0,380 Z"/>
          <path fill="rgba(100,175,90,0.2)"
            d="M0,265 C200,195 400,325 600,265 C800,205 1000,325 1200,268 C1320,238 1390,258 1440,252 L1440,380 L0,380 Z"/>
          <path fill="rgba(70,155,70,0.18)"
            d="M0,305 C240,245 480,365 720,305 C960,245 1200,365 1440,305 L1440,380 L0,380 Z"/>
        </svg>
      </div>

      <div className="lp-page">

        {/* NAV */}
        <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
          <Link to="/" className="lp-nav-logo">StudentLife</Link>
          <ul className="lp-nav-links">
            <li><Link to="/platform">Platform</Link></li>
            <li><Link to="/community">Community</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
          <Link to="/login" className="lp-nav-cta">Join now →</Link>
        </nav>

        {/* TICKER BANNER */}
        <div className="lp-ticker">
          <div className="lp-ticker-track">
            <span>WE KNOW WHAT IT FEELS LIKE TO STEP OUT OF THE COMFORT ZONE. SO WE ARE HERE TO HELP YOU THROUGH THE WAY.</span>
            <span>WE KNOW WHAT IT FEELS LIKE TO STEP OUT OF THE COMFORT ZONE. SO WE ARE HERE TO HELP YOU THROUGH THE WAY.</span>
          </div>
        </div>

        {/* HERO — split layout */}
        <section className="lp-hero">

          {/* Left: text */}
          <div className="lp-hero-left">
            <div className="lp-eyebrow-row">
              <div className="lp-eyebrow">Access to university networks</div>
              <div className="lp-eyebrow">All round support for students</div>
            </div>

            <h1>
              You're not alone<br />
              <em>in figuring it out</em>
            </h1>

            <p className="lp-hero-sub"></p>

            <div className="lp-hero-btns">
              <Link to="/login" className="lp-btn primary">Get started →</Link>
              <Link to="/login" className="lp-btn secondary">Join a community</Link>
            </div>

            <div className="lp-trust">
              <div className="lp-trust-badges">
                <span className="lp-badge">Free to join</span>
                <span className="lp-badge">Student-led</span>
              </div>
              <p className="lp-trust-note">Built for students navigating pressure, purpose, and success.</p>
            </div>
          </div>

        </section>

        {/* Wave divider */}
        <div className="lp-hero-wave">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path fill="rgba(255,255,255,0.18)"
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>

        {/* FEATURES */}
        <section className="lp-features-section">
          <div className="lp-section-label">What we offer</div>
          <div className="lp-section-head">
            <h2>A support system built<br />for student life</h2>
          </div>

          <div className="lp-features">
            <div className="lp-feature-card">
              <div className="lp-feature-title">Student communities</div>
              <div className="lp-feature-desc">
                Connect with student unions and peer groups across campuses to share support and lived experiences.
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-title">Internships by major</div>
              <div className="lp-feature-desc">
                Explore opportunities tailored to your field, reducing the overwhelm of searching without guidance.
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-title">Mental health support</div>
              <div className="lp-feature-desc">
                Access burnout resources and peer check-ins that help you protect your wellbeing while building your future.
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="lp-cta-strip">
          <div className="lp-cta-card">
            <div>
              <h3>Find your path.<br />Protect your peace.</h3>
              <p>
                Build confidence, discover real opportunities, and connect with a community that truly understands.
              </p>
            </div>
            <div className="lp-cta-actions">
              <Link to="/login" className="lp-btn primary">Get started →</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          © 2026 StudentLife · <Link to="/about">About</Link> · <Link to="/platform">Platform</Link> · Built for student wellbeing
        </footer>

      </div>
    </>
  )
}

export default LandingPage
