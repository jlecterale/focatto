const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const jsonPath = path.join(__dirname, '../src/lib/plans.json');
const htmlOutputPath = path.join(__dirname, '../public/plans.html');

// Carrega os planos
let plans = [];
try {
  const fileContent = fs.readFileSync(jsonPath, 'utf8');
  plans = JSON.parse(fileContent);
} catch (err) {
  console.error("Erro ao carregar plans.json:", err);
  process.exit(1);
}

// Ícones SVG customizados para cada tipo de plano
function getIconSvg(iconName) {
  switch (iconName) {
    case 'wrench':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    case 'crown':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18v2H3z"/></svg>`;
    case 'megaphone':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
  }
}

// Gera o conteúdo dos cartões de planos
const planCardsHtml = plans.map(plan => {
  const isFuture = plan.status === 'future';
  const isHighlighted = plan.highlight;
  const badgeHtml = plan.badgeText 
    ? `<div class="plan-badge ${isFuture ? 'badge-future' : 'badge-pro'}">${plan.badgeText}</div>` 
    : '';
  
  const featuresHtml = plan.features.map(feat => `
    <li>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${feat}</span>
    </li>
  `).join('');

  return `
    <div class="plan-card ${isHighlighted ? 'highlighted' : ''} ${isFuture ? 'future-plan' : ''}">
      ${badgeHtml}
      <div class="plan-header">
        <div class="plan-icon-wrapper">
          ${getIconSvg(plan.icon)}
        </div>
        <h3 class="plan-name">${plan.name}</h3>
        <p class="plan-description">${plan.description}</p>
      </div>

      <div class="plan-price-section">
        <div class="price-monthly-block">
          <span class="currency">R$</span>
          <span class="price-val" data-monthly="${plan.priceMonthly.toFixed(2)}" data-yearly="${plan.priceYearlyMonthly.toFixed(2)}">
            ${plan.priceMonthly.toFixed(2)}
          </span>
          <span class="period">/mês</span>
        </div>
        <p class="billing-info" data-text-monthly="Cobrado mensalmente" data-text-yearly="Faturamento anual (${(plan.priceYearlyMonthly * 12).toFixed(2)}/ano)">
          Cobrado mensalmente
        </p>
      </div>

      <ul class="plan-features">
        ${featuresHtml}
      </ul>

      <div class="plan-actions">
        ${isFuture 
          ? `<button class="plan-btn btn-disabled" disabled>Implementação Futura</button>` 
          : `<button class="plan-btn ${isHighlighted ? 'btn-primary' : 'btn-secondary'}">Contratar Plano</button>`
        }
      </div>
    </div>
  `;
}).join('');

// Template HTML Completo
const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planos de Assinatura - Vibrattoo</title>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg-dark: hsl(22, 10%, 4%);
      --bg-card: hsla(22, 12%, 8%, 0.75);
      --bg-card-hover: hsla(22, 12%, 12%, 0.85);
      --border-color: hsla(22, 10%, 18%, 0.8);
      --border-hover: hsla(22, 10%, 28%, 0.8);
      
      --text-primary: hsl(22, 10%, 98%);
      --text-secondary: hsl(22, 8%, 75%);
      --text-muted: hsl(22, 6%, 55%);
      
      --vibrattoo-orange: hsl(25, 95%, 55%);
      --vibrattoo-orange-glow: hsla(25, 95%, 55%, 0.15);
      --vibrattoo-gold: hsl(48, 90%, 50%);
      
      --font-display: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      
      --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-primary);
      font-family: var(--font-body);
      min-height: 100vh;
      line-height: 1.6;
      background-image: 
        radial-gradient(circle at 10% 20%, hsla(25, 95%, 55%, 0.04) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, hsla(48, 90%, 50%, 0.04) 0%, transparent 40%);
      background-attachment: fixed;
      padding: 60px 24px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 48px;
    }

    .logo {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 2rem;
      letter-spacing: 2px;
      margin-bottom: 8px;
      color: white;
    }

    .logo span {
      color: var(--vibrattoo-orange);
    }

    h1 {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #ffffff 50%, var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
      font-size: 1.05rem;
    }

    /* Billing Toggle */
    .billing-toggle-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-bottom: 48px;
    }

    .toggle-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: var(--transition-smooth);
    }

    .toggle-label.active {
      color: var(--vibrattoo-orange);
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--border-color);
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--vibrattoo-orange);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .save-badge {
      background: hsla(145, 80%, 45%, 0.15);
      color: hsl(145, 80%, 45%);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
    }

    /* Plans Grid */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
      align-items: stretch;
    }

    /* Plan Card */
    .plan-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 40px 32px;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: var(--transition-smooth);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .plan-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
    }

    .plan-card.highlighted {
      border-color: var(--vibrattoo-orange);
      background-image: radial-gradient(circle at 100% 0%, hsla(25, 95%, 55%, 0.05) 0%, transparent 50%);
      box-shadow: 0 0 30px hsla(25, 95%, 55%, 0.05);
    }

    .plan-card.highlighted:hover {
      box-shadow: 0 20px 40px -15px var(--vibrattoo-orange-glow);
    }

    .plan-card.future-plan {
      border-color: var(--border-color);
      opacity: 0.9;
    }

    .plan-badge {
      position: absolute;
      top: 24px;
      right: 24px;
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .badge-pro {
      background: linear-gradient(90deg, var(--vibrattoo-orange), var(--vibrattoo-gold));
      color: #0b0908;
      box-shadow: 0 2px 10px rgba(239, 124, 44, 0.3);
    }

    .badge-future {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
    }

    .plan-header {
      margin-bottom: 28px;
    }

    .plan-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--vibrattoo-orange);
      margin-bottom: 20px;
    }

    .plan-card.highlighted .plan-icon-wrapper {
      background: var(--vibrattoo-orange-glow);
      border-color: hsla(25, 95%, 55%, 0.2);
    }

    .plan-name {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
    }

    .plan-description {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .plan-price-section {
      margin-bottom: 32px;
    }

    .price-monthly-block {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 4px;
    }

    .currency {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .price-val {
      font-family: var(--font-display);
      font-size: 2.6rem;
      font-weight: 800;
      color: white;
      line-height: 1;
      transition: var(--transition-smooth);
    }

    .period {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .billing-info {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .plan-features {
      list-style: none;
      flex-grow: 1;
      margin-bottom: 40px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .plan-features li {
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      line-height: 1.4;
    }

    .check-icon {
      color: var(--vibrattoo-orange);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .plan-actions {
      margin-top: auto;
    }

    .plan-btn {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition-smooth);
      border: 1px solid transparent;
    }

    .btn-primary {
      background: linear-gradient(90deg, var(--vibrattoo-orange), var(--vibrattoo-gold));
      color: #0b0908;
    }

    .btn-primary:hover {
      box-shadow: 0 4px 15px rgba(239, 124, 44, 0.4);
      transform: scale(1.02);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--border-color);
      color: white;
    }

    .btn-secondary:hover {
      border-color: var(--text-muted);
      background: rgba(255, 255, 255, 0.08);
    }

    .btn-disabled {
      background: rgba(255, 255, 255, 0.02);
      border-color: var(--border-color);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    /* Footer node info */
    footer {
      text-align: center;
      margin-top: 64px;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      padding-top: 24px;
    }
  </style>
</head>
<body>

<div class="container">
  <header>
    <div class="logo">Vibrattoo<span>.</span></div>
    <h1>Nossos Planos de Assinatura</h1>
    <p class="subtitle">Escolha o plano ideal para impulsionar suas vendas, regulagens ou aulas de música dentro da Vibrattoo.</p>
  </header>

  <!-- Billing Toggle -->
  <div class="billing-toggle-container">
    <span class="toggle-label active" id="label-monthly">Mensal</span>
    <label class="switch">
      <input type="checkbox" id="billing-switch" onchange="toggleBilling(this)">
      <span class="slider"></span>
    </label>
    <span class="toggle-label" id="label-yearly">Anual</span>
    <span class="save-badge">Desconto de R$ 5,00/mês</span>
  </div>

  <!-- Plans Grid -->
  <div class="plans-grid">
    ${planCardsHtml}
  </div>

  <footer>
    Documento atualizado automaticamente. Este arquivo HTML é gerado a partir do arquivo central de configuração <code>plans.json</code>.
  </footer>
</div>

<script>
  function toggleBilling(checkbox) {
    const isYearly = checkbox.checked;
    
    // Toggle active classes on labels
    document.getElementById('label-monthly').classList.toggle('active', !isYearly);
    document.getElementById('label-yearly').classList.toggle('active', isYearly);

    // Update prices
    const priceElements = document.querySelectorAll('.price-val');
    priceElements.forEach(el => {
      const monthlyPrice = el.getAttribute('data-monthly');
      const yearlyPrice = el.getAttribute('data-yearly');
      el.innerText = isYearly ? yearlyPrice : monthlyPrice;
    });

    // Update billing info description texts
    const billingInfos = document.querySelectorAll('.billing-info');
    billingInfos.forEach(el => {
      const monthlyText = el.getAttribute('data-text-monthly');
      const yearlyText = el.getAttribute('data-text-yearly');
      el.innerText = isYearly ? yearlyText : monthlyText;
    });
  }
</script>

</body>
</html>
`;

// Escreve o arquivo HTML compilado
fs.writeFileSync(htmlOutputPath, htmlTemplate, 'utf8');
console.log(`[SUCESSO] O arquivo HTML estático foi gerado com sucesso em: ${htmlOutputPath}`);
