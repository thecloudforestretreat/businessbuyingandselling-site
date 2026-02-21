@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Montserrat:wght@400;500;600&family=Poppins:wght@600;700&display=swap");

:root{
  /* Brand palette */
  --error: #EF4444;
  --warning: #F97316;
  --info: #0EA5E9;
  --amber: #F59E0B;
  --success: #22C55E;

  --charcoal: #1F2937;
  --muted-gray: #6B7280;
  --light-ui: #E5E7EB;
  --soft-white: #FAFAFA;

  --marketplace-blue: #2563EB;
  --light-sky: #60A5FA;

  --primary-navy: #1B263B;
  --soft-midnight: #111827;

  /* Typography */
  --font-heading: "Poppins", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  --font-body: "Montserrat", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  --font-accent: "DM Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;

  /* Layout */
  --container: 1100px;
  --radius: 16px;
  --shadow: 0 12px 30px rgba(17, 24, 39, 0.12);
  --shadow-soft: 0 10px 24px rgba(17, 24, 39, 0.08);
}

*{ box-sizing: border-box; }
html, body{ height: 100%; }
body{
  margin: 0;
  font-family: var(--font-body);
  color: var(--charcoal);
  background: var(--soft-white);
  line-height: 1.45;
}

img{ max-width: 100%; height: auto; display: block; }
a{ color: inherit; text-decoration: none; }
a:hover{ text-decoration: underline; }

.container{
  width: min(var(--container), calc(100% - 40px));
  margin: 0 auto;
}

.skip-link{
  position: absolute;
  left: -9999px;
  top: 8px;
  background: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  box-shadow: var(--shadow-soft);
  z-index: 9999;
}
.skip-link:focus{ left: 12px; }

.sr-only{
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.site-header{
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(250, 250, 250, 0.86);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--light-ui);
}

.header-inner{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  gap: 16px;
}

.brand{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.brand-logo{
  height: 34px;
  width: auto;
}

.nav{
  display: flex;
  align-items: center;
  gap: 18px;
  font-family: var(--font-accent);
  font-weight: 600;
  color: var(--primary-navy);
}

.nav a{
  padding: 8px 10px;
  border-radius: 10px;
}

.nav a:hover{
  background: #fff;
  text-decoration: none;
}

.nav-toggle{
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--light-ui);
  background: #fff;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}

.nav-toggle span{
  display: block;
  width: 18px;
  height: 2px;
  background: var(--primary-navy);
  border-radius: 2px;
}

.mobile-nav{
  border-top: 1px solid var(--light-ui);
  background: #fff;
}

.mobile-nav-inner{
  display: grid;
  gap: 10px;
  padding: 14px 0 18px 0;
  font-family: var(--font-accent);
  font-weight: 700;
}

.mobile-nav-inner a{
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--light-ui);
}

.hero{
  padding: 46px 0 24px 0;
}

.hero-grid{
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 26px;
  align-items: start;
}

.badge{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-accent);
  font-weight: 800;
  color: var(--primary-navy);
  background: rgba(96, 165, 250, 0.18);
  border: 1px solid rgba(96, 165, 250, 0.35);
  padding: 8px 12px;
  border-radius: 999px;
  margin: 0 0 14px 0;
}

h1, h2, h3{
  font-family: var(--font-heading);
  color: var(--primary-navy);
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
}

h1{
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.07;
}

.lead{
  font-size: 16px;
  color: var(--muted-gray);
  margin: 0 0 18px 0;
  max-width: 60ch;
}

.cta-row{
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 10px 0 18px 0;
}

.btn{
  border: 0;
  cursor: pointer;
  border-radius: 14px;
  padding: 11px 14px;
  font-family: var(--font-accent);
  font-weight: 800;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
}

.btn-primary{
  background: var(--marketplace-blue);
  color: #fff;
  box-shadow: var(--shadow-soft);
}
.btn-primary:hover{ filter: brightness(0.98); text-decoration: none; }

.btn-secondary{
  background: rgba(27, 38, 59, 0.10);
  color: var(--primary-navy);
  border: 1px solid rgba(27, 38, 59, 0.18);
}
.btn-secondary:hover{ text-decoration: none; }

.btn-ghost{
  background: transparent;
  color: var(--primary-navy);
  border: 1px solid var(--light-ui);
}
.btn-ghost:hover{ background: #fff; text-decoration: none; }

.btn:disabled{
  opacity: 0.6;
  cursor: not-allowed;
}

.trust{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.trust-item{
  background: #fff;
  border: 1px solid var(--light-ui);
  border-radius: var(--radius);
  padding: 12px 12px;
  box-shadow: var(--shadow-soft);
}

.trust-kicker{
  font-family: var(--font-accent);
  font-weight: 900;
  color: var(--primary-navy);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.trust-text{
  color: var(--muted-gray);
  font-size: 13px;
  margin-top: 6px;
}

.hero-card .card{
  background: linear-gradient(180deg, #ffffff, rgba(229, 231, 235, 0.34));
  border: 1px solid var(--light-ui);
  border-radius: calc(var(--radius) + 6px);
  box-shadow: var(--shadow);
  padding: 16px;
}

.card-top{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.card-title{
  font-family: var(--font-accent);
  font-weight: 900;
  color: var(--primary-navy);
}

.pill{
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 12px;
  color: var(--primary-navy);
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 6px 10px;
  border-radius: 999px;
}

.metric-grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric{
  background: #fff;
  border: 1px solid var(--light-ui);
  border-radius: 14px;
  padding: 12px;
}

.metric-label{
  font-family: var(--font-accent);
  font-weight: 800;
  color: var(--muted-gray);
  font-size: 12px;
}

.metric-value{
  margin-top: 6px;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--primary-navy);
  font-size: 18px;
}

.card-actions{
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.card-note{
  color: var(--muted-gray);
  margin: 12px 0 0 0;
  font-size: 13px;
}

.section{
  padding: 46px 0;
}

.section-tight{
  padding: 32px 0 46px 0;
}

.section-alt{
  background: #fff;
  border-top: 1px solid var(--light-ui);
  border-bottom: 1px solid var(--light-ui);
}

.section-head{
  margin-bottom: 18px;
}

.muted{
  color: var(--muted-gray);
  margin: 0;
  max-width: 70ch;
}

.cards{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.info-card{
  background: #fff;
  border: 1px solid var(--light-ui);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow-soft);
}

.info-card h3{
  margin: 0 0 8px 0;
  font-size: 18px;
}

.info-card p{
  margin: 0;
  color: var(--muted-gray);
}

.steps{
  list-style: none;
  padding: 0;
  margin: 18px 0 0 0;
  display: grid;
  gap: 12px;
}

.steps li{
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  align-items: start;
  background: #fff;
  border: 1px solid var(--light-ui);
  border-radius: var(--radius);
  padding: 14px;
  box-shadow: var(--shadow-soft);
}

.step-num{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.22);
  display: grid;
  place-items: center;
  font-family: var(--font-heading);
  font-weight: 800;
  color: var(--marketplace-blue);
}

.step-title{
  font-family: var(--font-accent);
  font-weight: 900;
  color: var(--primary-navy);
}

.step-text{
  color: var(--muted-gray);
  margin-top: 4px;
}

.notify{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--light-ui);
  border-radius: calc(var(--radius) + 8px);
  padding: 18px;
  box-shadow: var(--shadow-soft);
  align-items: center;
}

.notify-form{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.notify-form input{
  width: 100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid var(--light-ui);
  background: var(--soft-white);
  font-family: var(--font-body);
  font-weight: 500;
  outline: none;
}

.notify-form input:focus{
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.form-note{
  grid-column: 1 / -1;
  margin: 6px 0 0 0;
  color: var(--muted-gray);
  font-size: 13px;
  font-family: var(--font-accent);
}

.contact{
  background: #fff;
  border: 1px solid var(--light-ui);
  border-radius: calc(var(--radius) + 8px);
  padding: 18px;
  box-shadow: var(--shadow-soft);
}

.site-footer{
  border-top: 1px solid var(--light-ui);
  background: #fff;
  padding: 28px 0 18px 0;
}

.footer-inner{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: start;
}

.footer-logo{
  height: 28px;
  width: auto;
}

.footer-right{
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-family: var(--font-accent);
  font-weight: 800;
  color: var(--primary-navy);
}

.footer-bottom{
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--light-ui);
  font-family: var(--font-accent);
}

/* Responsive */
@media (max-width: 920px){
  .hero-grid{
    grid-template-columns: 1fr;
  }
  .cards{
    grid-template-columns: 1fr;
  }
  .notify{
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px){
  .nav{ display: none; }
  .nav-toggle{ display: inline-flex; }
  .trust{
    grid-template-columns: 1fr;
  }
}
