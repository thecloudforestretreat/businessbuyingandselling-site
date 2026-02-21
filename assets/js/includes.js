:root{
  --navy:#1B263B;
  --midnight:#111827;
  --blue:#2563EB;
  --light-blue:#60A5FA;

  --text:#1F2937;
  --muted:#6B7280;

  --bg:#FAFAFA;
  --card:#FFFFFF;
  --border:#E5E7EB;
}

*{ box-sizing: border-box; }
html,body{ height:100%; }
body{
  margin:0;
  font-family: "Montserrat", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

main{
  min-height: calc(100vh - 74px - 120px);
}

h1,h2,h3{
  font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--midnight);
  line-height: 1.15;
  margin: 0 0 10px;
}

p{ margin: 0 0 14px; color: var(--muted); }

.section{
  padding: 44px 0;
}

.card{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 10px 28px rgba(17,24,39,0.06);
} s
