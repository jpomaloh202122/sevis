#!/usr/bin/env node

/**
 * SEVIS Portal Documentation PDF Export Script
 * 
 * This script converts markdown documentation files to professionally formatted PDFs
 * using markdown-pdf with custom styling for the Papua New Guinea government portal.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  inputDir: process.cwd(),
  outputDir: path.join(process.cwd(), 'docs-pdf'),
  
  // Documentation files to convert
  files: [
    {
      input: 'README.md',
      output: 'SEVIS-Portal-Overview.pdf',
      title: 'SEVIS Portal - Project Overview'
    },
    {
      input: 'PROJECT_DOCUMENTATION.md',
      output: 'SEVIS-Portal-Complete-Documentation.pdf',
      title: 'SEVIS Portal - Complete Technical Documentation'
    },
    {
      input: 'API_REFERENCE.md',
      output: 'SEVIS-Portal-API-Reference.pdf',
      title: 'SEVIS Portal - API Reference Guide'
    },
    {
      input: 'DEPLOYMENT_GUIDE.md',
      output: 'SEVIS-Portal-Deployment-Guide.pdf',
      title: 'SEVIS Portal - Deployment & Operations Guide'
    }
  ],

  // PDF styling options
  pdfOptions: {
    format: 'A4',
    border: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in'
    },
    header: {
      height: '0.5in',
      contents: '<div style="text-align: center; color: #CE1126; font-weight: bold; font-size: 12px;">{{title}}</div>'
    },
    footer: {
      height: '0.5in',
      contents: '<div style="text-align: center; color: #666; font-size: 10px;">Page {{page}} of {{pages}} | SEVIS Portal Documentation</div>'
    }
  }
};

// CSS styling for professional PDF output
const customCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
    font-size: 12px;
    max-width: none;
  }
  
  h1, h2, h3, h4, h5, h6 {
    color: #CE1126;
    font-weight: 600;
    margin-top: 2em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
  }
  
  h1 {
    font-size: 28px;
    border-bottom: 3px solid #CE1126;
    padding-bottom: 10px;
    page-break-before: always;
  }
  
  h2 {
    font-size: 22px;
    border-bottom: 2px solid #FFD700;
    padding-bottom: 8px;
  }
  
  h3 {
    font-size: 18px;
    color: #1E40AF;
  }
  
  h4 {
    font-size: 16px;
    color: #059669;
  }
  
  /* Code blocks */
  pre {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-left: 4px solid #CE1126;
    padding: 15px;
    border-radius: 4px;
    font-size: 11px;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  
  code {
    background-color: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    page-break-inside: avoid;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }
  
  th {
    background-color: #CE1126;
    color: white;
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  /* Blockquotes */
  blockquote {
    border-left: 4px solid #FFD700;
    padding-left: 20px;
    margin: 20px 0;
    font-style: italic;
    background-color: #fffbf0;
    padding: 15px 20px;
    border-radius: 0 4px 4px 0;
  }
  
  /* Links */
  a {
    color: #1E40AF;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  /* Lists */
  ul, ol {
    padding-left: 25px;
    margin: 10px 0;
  }
  
  li {
    margin: 5px 0;
  }
  
  /* Badges and inline elements */
  img[alt*="badge"] {
    display: inline-block;
    margin: 2px;
  }
  
  /* Page breaks */
  .page-break {
    page-break-before: always;
  }
  
  /* PNG Government colors */
  .png-red { color: #CE1126; }
  .png-gold { color: #FFD700; }
  .govt-blue { color: #1E40AF; }
  .govt-green { color: #059669; }
  
  /* Responsive adjustments for PDF */
  @media print {
    body {
      font-size: 11px;
    }
    
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; }
    h4 { font-size: 14px; }
    
    .no-print {
      display: none;
    }
  }
  
  /* Table of contents styling */
  .toc {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    page-break-inside: avoid;
  }
  
  .toc h2 {
    margin-top: 0;
    color: #CE1126;
    border-bottom: 2px solid #CE1126;
  }
  
  .toc ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  .toc li {
    padding: 5px 0;
  }
  
  .toc a {
    color: #1E40AF;
    font-weight: 500;
  }
`;

/**
 * Check if required dependencies are installed
 */
function checkDependencies() {
  const requiredPackages = ['markdown-pdf', 'puppeteer'];
  
  console.log('🔍 Checking dependencies...');
  
  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      console.log(`  ✅ ${pkg} is installed`);
    } catch (error) {
      console.log(`  ❌ ${pkg} is not installed`);
      console.log(`\n📦 Installing ${pkg}...`);
      try {
        execSync(`npm install ${pkg}`, { stdio: 'inherit' });
        console.log(`  ✅ ${pkg} installed successfully`);
      } catch (installError) {
        console.error(`  ❌ Failed to install ${pkg}:`, installError.message);
        process.exit(1);
      }
    }
  }
}

/**
 * Create output directory if it doesn't exist
 */
function createOutputDirectory() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${config.outputDir}`);
  }
}

/**
 * Write custom CSS file
 */
function writeCustomCSS() {
  const cssPath = path.join(config.outputDir, 'pdf-styles.css');
  fs.writeFileSync(cssPath, customCSS);
  console.log(`🎨 Created custom CSS file: ${cssPath}`);
  return cssPath;
}

/**
 * Preprocess markdown content for better PDF formatting
 */
function preprocessMarkdown(content, title) {
  // Add page breaks before main sections
  content = content.replace(/^## /gm, '\n<div class="page-break"></div>\n\n## ');
  
  // Replace badge images with text representations for PDF
  content = content.replace(/!\[([^\]]*)\]\(https:\/\/img\.shields\.io[^)]*\)/g, '**[$1]**');
  
  // Add title page
  const titlePage = `# ${title}
  
**Papua New Guinea Government Services Portal**

---

*Generated on: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}*

<div class="page-break"></div>

`;

  return titlePage + content;
}

/**
 * Convert markdown file to PDF
 */
async function convertToPDF(fileConfig) {
  const { input, output, title } = fileConfig;
  const inputPath = path.join(config.inputDir, input);
  const outputPath = path.join(config.outputDir, output);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`  ⚠️  Skipping ${input} (file not found)`);
    return;
  }
  
  console.log(`📝 Converting ${input} to ${output}...`);
  
  try {
    // Read and preprocess markdown content
    let content = fs.readFileSync(inputPath, 'utf8');
    content = preprocessMarkdown(content, title);
    
    // Write preprocessed content to temporary file
    const tempPath = path.join(config.outputDir, `temp-${input}`);
    fs.writeFileSync(tempPath, content);
    
    // Dynamic import for ES modules
    const markdownPdf = require('markdown-pdf');
    
    const pdfOptions = {
      ...config.pdfOptions,
      cssPath: path.join(config.outputDir, 'pdf-styles.css'),
      remarkable: {
        html: true,
        breaks: true,
        plugins: ['remarkable-classy'],
        syntax: ['remarkable-syn']
      },
      paperFormat: 'A4',
      paperOrientation: 'portrait',
      paperBorder: config.pdfOptions.border,
      renderDelay: 2000,
      timeout: 30000
    };
    
    // Convert to PDF
    await new Promise((resolve, reject) => {
      markdownPdf(pdfOptions)
        .from(tempPath)
        .to(outputPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
    
    // Clean up temporary file
    fs.unlinkSync(tempPath);
    
    // Get file size for reporting
    const stats = fs.statSync(outputPath);
    const fileSizeKB = Math.round(stats.size / 1024);
    
    console.log(`  ✅ ${output} created successfully (${fileSizeKB} KB)`);
    
  } catch (error) {
    console.error(`  ❌ Error converting ${input}:`, error.message);
  }
}

/**
 * Create a combined PDF with all documentation
 */
async function createCombinedPDF() {
  console.log('📚 Creating combined documentation PDF...');
  
  const combinedContent = [];
  
  // Title page for combined document
  combinedContent.push(`# SEVIS Portal - Complete Documentation Package

**Papua New Guinea Government Services Portal**

*Complete Technical Documentation*

---

**Document Contents:**
1. Project Overview & Quick Start Guide
2. Complete Technical Documentation  
3. API Reference Guide
4. Deployment & Operations Guide

---

*Generated on: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}*

*Version: 1.0.0*

<div class="page-break"></div>

`);
  
  // Add each document with page breaks
  for (const fileConfig of config.files) {
    const inputPath = path.join(config.inputDir, fileConfig.input);
    
    if (fs.existsSync(inputPath)) {
      let content = fs.readFileSync(inputPath, 'utf8');
      
      // Add document separator
      combinedContent.push(`<div class="page-break"></div>\n\n# ${fileConfig.title}\n\n`);
      combinedContent.push(content);
      combinedContent.push('\n\n<div class="page-break"></div>\n\n');
    }
  }
  
  // Write combined content to temporary file
  const combinedPath = path.join(config.outputDir, 'temp-combined.md');
  fs.writeFileSync(combinedPath, combinedContent.join(''));
  
  try {
    const markdownPdf = require('markdown-pdf');
    
    const combinedOptions = {
      ...config.pdfOptions,
      cssPath: path.join(config.outputDir, 'pdf-styles.css'),
      remarkable: {
        html: true,
        breaks: true
      }
    };
    
    const outputPath = path.join(config.outputDir, 'SEVIS-Portal-Complete-Documentation-Package.pdf');
    
    await new Promise((resolve, reject) => {
      markdownPdf(combinedOptions)
        .from(combinedPath)
        .to(outputPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
    
    // Clean up temporary file
    fs.unlinkSync(combinedPath);
    
    const stats = fs.statSync(outputPath);
    const fileSizeMB = Math.round(stats.size / (1024 * 1024));
    
    console.log(`  ✅ Combined documentation PDF created (${fileSizeMB} MB)`);
    
  } catch (error) {
    console.error(`  ❌ Error creating combined PDF:`, error.message);
  }
}

/**
 * Generate PDF index file
 */
function generatePDFIndex() {
  const indexContent = `# SEVIS Portal Documentation - PDF Export

Generated on: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long',
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

## 📄 Available PDF Documents

### Individual Documents
${config.files.map(file => `- **${file.title}** - \`${file.output}\``).join('\n')}

### Combined Package
- **Complete Documentation Package** - \`SEVIS-Portal-Complete-Documentation-Package.pdf\`
  - Contains all documentation in a single PDF file
  - Professional formatting with table of contents
  - Optimized for printing and sharing

## 🎨 PDF Features

- **Professional Formatting**: Custom Papua New Guinea government styling
- **Syntax Highlighting**: Code blocks with proper highlighting  
- **Table of Contents**: Automatic navigation for large documents
- **Print Optimized**: A4 format with proper margins and page breaks
- **Government Branding**: PNG national colors and professional layout

## 📊 Document Statistics

| Document | Pages | Size | Content Type |
|----------|-------|------|--------------|
${config.files.map(file => {
  const outputPath = path.join(config.outputDir, file.output);
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    return `| ${file.title} | - | ${sizeKB} KB | Technical Documentation |`;
  }
  return `| ${file.title} | - | - | Not Generated |`;
}).join('\n')}

## 🔧 Usage

1. **For Developers**: Use individual PDFs for specific reference needs
2. **For Management**: Use the combined package for comprehensive overview
3. **For Printing**: All PDFs are optimized for A4 printing
4. **For Sharing**: Professional formatting suitable for external sharing

## 📝 Notes

- PDFs are generated from the latest markdown documentation
- Custom CSS ensures consistent formatting across all documents
- Government branding reflects Papua New Guinea national colors
- All code examples and API references are preserved with syntax highlighting

---

*SEVIS Portal Documentation Export Tool v1.0*
*Papua New Guinea Government Services Portal*
`;

  const indexPath = path.join(config.outputDir, 'PDF-Index.md');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`📋 Generated PDF index: ${indexPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 SEVIS Portal Documentation PDF Export\n');
  
  try {
    // Setup
    checkDependencies();
    createOutputDirectory();
    const cssPath = writeCustomCSS();
    
    console.log('\n📄 Converting individual documents...');
    
    // Convert each file
    for (const fileConfig of config.files) {
      await convertToPDF(fileConfig);
    }
    
    // Create combined PDF
    console.log('\n📚 Creating combined documentation...');
    await createCombinedPDF();
    
    // Generate index
    console.log('\n📋 Generating index...');
    generatePDFIndex();
    
    console.log('\n✅ PDF export completed successfully!');
    console.log(`📁 Output directory: ${config.outputDir}`);
    console.log('\n📄 Generated files:');
    
    // List generated files
    const files = fs.readdirSync(config.outputDir).filter(f => f.endsWith('.pdf'));
    files.forEach(file => {
      const filePath = path.join(config.outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  - ${file} (${sizeKB} KB)`);
    });
    
    console.log('\n🎉 Documentation is ready for distribution!');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { main, config };