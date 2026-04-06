import puppeteer from 'puppeteer'
import { MagazineIssue, MagazineSection, Highlight } from '@/lib/types'
import { formatNumber, formatCurrency } from '@/lib/utils'

function generateMagazineHTML(issue: MagazineIssue): string {
  const accentColors = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706', '#0891b2']
  
  const getAccent = (index: number) => accentColors[index % accentColors.length]
  
  const renderHighlights = (highlights: Highlight[], accent: string) => {
    return highlights.map(h => `
      <div class="highlight-card" style="border-left: 3px solid ${accent}">
        <div class="highlight-label">${h.label}</div>
        <div class="highlight-value">${h.value}</div>
        ${h.change ? `<div class="highlight-change ${h.trend || 'neutral'}">${h.change}</div>` : ''}
      </div>
    `).join('')
  }

  const renderSection = (section: MagazineSection, index: number) => {
    const accent = section.accent || getAccent(index)
    const widthClass = section.layout === 'full' ? 'section-full' : 
                       section.layout === 'half' ? 'section-half' : 'section-third'
    
    return `
      <div class="magazine-section ${widthClass}">
        <div class="section-header">
          <div class="section-accent" style="background: ${accent}"></div>
          <div>
            <h2 class="section-title">${section.title}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
          </div>
        </div>
        
        <div class="section-content">
          ${section.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
        
        ${section.highlights.length > 0 ? `
          <div class="highlights-grid">
            ${renderHighlights(section.highlights, accent)}
          </div>
        ` : ''}
      </div>
    `
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${issue.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
    }
    
    .magazine-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .magazine-header {
      text-align: center;
      padding: 60px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      margin-bottom: 40px;
      position: relative;
      overflow: hidden;
    }
    
    .magazine-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 60%;
      height: 200%;
      background: rgba(255,255,255,0.1);
      transform: rotate(15deg);
    }
    
    .magazine-badge {
      display: inline-block;
      padding: 8px 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }
    
    .magazine-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 56px;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 16px;
    }
    
    .magazine-subtitle {
      font-size: 22px;
      font-weight: 300;
      opacity: 0.9;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .magazine-meta {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-top: 32px;
      font-size: 14px;
      opacity: 0.8;
    }
    
    .magazine-meta span {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .sections-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 24px;
    }
    
    .magazine-section {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.08);
    }
    
    .section-full {
      grid-column: span 12;
    }
    
    .section-half {
      grid-column: span 6;
    }
    
    .section-third {
      grid-column: span 4;
    }
    
    @media (max-width: 1024px) {
      .section-half, .section-third {
        grid-column: span 6;
      }
    }
    
    @media (max-width: 768px) {
      .section-half, .section-third, .section-full {
        grid-column: span 12;
      }
    }
    
    .section-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .section-accent {
      width: 4px;
      height: 40px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.2;
    }
    
    .section-subtitle {
      font-size: 15px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .section-content {
      font-size: 15px;
      line-height: 1.7;
      color: #334155;
    }
    
    .section-content p {
      margin-bottom: 16px;
    }
    
    .section-content p:last-child {
      margin-bottom: 0;
    }
    
    .highlights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    
    .highlight-card {
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
    }
    
    .highlight-label {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    
    .highlight-value {
      font-size: 24px;
      font-weight: 600;
      color: #0f172a;
    }
    
    .highlight-change {
      font-size: 13px;
      margin-top: 4px;
      font-weight: 500;
    }
    
    .highlight-change.up {
      color: #059669;
    }
    
    .highlight-change.down {
      color: #dc2626;
    }
    
    .highlight-change.neutral {
      color: #64748b;
    }
    
    .insights-section {
      margin-top: 40px;
      background: #0f172a;
      color: white;
      padding: 40px;
      border-radius: 20px;
    }
    
    .insights-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      margin-bottom: 24px;
    }
    
    .insights-list {
      list-style: none;
    }
    
    .insights-list li {
      padding: 16px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 16px;
      line-height: 1.6;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .insights-list li:last-child {
      border-bottom: none;
    }
    
    .insights-list li::before {
      content: '→';
      color: #60a5fa;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .executive-summary {
      background: white;
      padding: 40px;
      border-radius: 20px;
      margin-bottom: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.08);
    }
    
    .executive-summary h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      margin-bottom: 20px;
      color: #0f172a;
    }
    
    .executive-summary p {
      font-size: 16px;
      line-height: 1.8;
      color: #334155;
      margin-bottom: 16px;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      .magazine-container {
        padding: 0;
      }
      
      .magazine-section {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="magazine-container">
    <header class="magazine-header">
      <div class="magazine-badge">${issue.edition}</div>
      <h1 class="magazine-title">${issue.title}</h1>
      <p class="magazine-subtitle">${issue.subtitle}</p>
      <div class="magazine-meta">
        <span>${issue.date}</span>
        <span>Data-Driven Insights</span>
        <span>${issue.sections.length} Sections</span>
      </div>
    </header>
    
    <div class="sections-grid">
      ${issue.sections.map((section, i) => renderSection(section, i)).join('')}
    </div>
    
    <div class="insights-section">
      <h2 class="insights-title">Key Takeaways</h2>
      <ul class="insights-list">
        ${issue.insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>
  `
}

export async function generatePDF(issue: MagazineIssue): Promise<Buffer> {
  let browser;
  
  try {
    // Detect if we're in a serverless environment (Netlify/AWS Lambda)
    const isServerless = !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    console.log(`Environment detected: ${isServerless ? 'Serverless' : 'Local'}`);

    if (isServerless) {
      // Netlify-specific browser launch
      const chromium = await import('@sparticuz/chromium-min') as any;
      const puppeteerCore = await import('puppeteer-core') as any;
      
      const chrom = chromium.default || chromium;
      const puppeteer = puppeteerCore.default || puppeteerCore;
      
      browser = await puppeteer.launch({
        args: chrom.args,
        defaultViewport: chrom.defaultViewport,
        executablePath: await chrom.executablePath(),
        headless: chrom.headless,
      });
    } else {
      // Standard local browser launch
      const puppeteerLocal = await import('puppeteer') as any;
      const puppeteer = puppeteerLocal.default || puppeteerLocal;
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
    }

    const page = await browser.newPage();
    const html = generateMagazineHTML(issue);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; color: #64748b; width: 100%; text-align: center; padding: 20px 40px;">
          <span>${issue.title}</span> | <span class="date"></span> | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      margin: { top: '0', right: '0', bottom: '60px', left: '0' }
    });
    
    return Buffer.from(pdf);
  } catch (error) {
    console.error('CRITICAL ERROR IN generatePDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function generatePreviewHTML(issue: MagazineIssue): string {
  return generateMagazineHTML(issue)
}
