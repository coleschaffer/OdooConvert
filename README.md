# OdooConvert

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS3](https://img.shields.io/badge/CSS3-blue)

A web-based tool that converts and merges product data from Shopify, Cin7 Core, and Zoho Inventory into Odoo-compatible CSV format.

## Overview

OdooConvert simplifies the process of migrating product data to Odoo. It intelligently merges 2-3 CSV files from different e-commerce platforms, automatically detects the source system, resolves field conflicts, and exports a properly formatted CSV ready for Odoo import.

All processing happens locally in your browser - your data never leaves your computer.

## Features

- **Intelligent Multi-File Merging** - Merge 2-3 CSVs from different platforms simultaneously
- **Automatic System Detection** - Auto-detects Shopify, Cin7, or Zoho format
- **Field-Based Conflict Resolution** - Resolve once per field, applies to all SKUs
- **Smart Field Mapping** - Pre-configured mappings with manual override options
- **Multiple Templates** - Minimal (10 fields), Standard (20), E-Commerce (26)
- **Data Cleaning** - HTML stripping, price normalization, boolean formatting
- **Live Preview** - See data before and after conversion
- **Privacy-First** - Runs entirely in browser

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Vanilla JavaScript (ES6+) |
| Parsing | PapaParse (CSV library) |
| Styling | CSS3 |
| Server | Optional Node.js for local hosting |

## Getting Started

### Option 1: Browser-Only

Simply open `index.html` in any modern browser - no installation required.

### Option 2: Local Server

```bash
# Clone the repository
git clone https://github.com/coleschaffer/OdooConvert.git
cd OdooConvert

# Start the server (no npm install needed)
npm start
# or
node server.js

# Open http://localhost:3000
```

## How to Use

1. **Upload** - Drag & drop 2-3 CSV files from Shopify, Cin7, or Zoho
2. **Review** - Check automatic system detection and preview data
3. **Merge** - Click "Start Intelligent Merge"
4. **Resolve Conflicts** - Choose preferred source for conflicting fields
5. **Configure** - Set conversion options (HTML cleaning, normalization)
6. **Download** - Export Odoo-ready CSV

## Project Structure

```
OdooConvert/
├── index.html          # Main application UI
├── app.js              # Core conversion logic
├── styles.css          # Styling
├── server.js           # Optional Node.js server
├── package.json        # Project metadata
├── README.md           # Documentation
└── Sample CSV Files/   # Example data
    ├── Shopify to Odoo Item List 1690.csv
    ├── Cin7 Core to Odoo Item List 1690.csv
    └── Zoho to Odoo Item List 1690.csv
```

## Field Mappings

### Shopify → Odoo

| Shopify | Odoo |
|---------|------|
| Variant SKU | default_code |
| Title | name |
| Body (HTML) | description_sale |
| Variant Price | list_price |
| Cost per item | standard_price |
| Variant Grams | weight (→ lbs) |
| Image Src | image_1920 |

### Cin7 Core → Odoo

| Cin7 | Odoo |
|------|------|
| ProductCode | default_code |
| Name | name |
| Barcode | barcode |
| PriceTier1 | list_price |
| AverageCost | standard_price |
| Category | categ_id |

### Zoho Inventory → Odoo

| Zoho | Odoo |
|------|------|
| SKU | default_code |
| Item Name | name |
| Selling Price | list_price |
| Purchase Price | standard_price |
| Stock On Hand | qty_available |

## Odoo Templates

### Minimal (10 fields)
Basic product info: name, SKU, type, category, prices, barcode, quantity, UoM, description

### Standard (20 fields) - Recommended
Adds: weight, active status, sale/purchase flags, tracking, compare price, image, HS code, country of origin

### E-Commerce (26 fields)
Adds: volume, published status, SEO meta tags, public categories, website ribbon

## Configuration

### Port Configuration

```bash
# Default port: 3000
PORT=8080 npm start
```

### Merge Priority Rules

The tool uses intelligent priority rules when merging:
- **Prices**: Shopify > Cin7 > Zoho (prefer retail pricing)
- **Stock**: Zoho > Cin7 > Shopify (prefer real-time inventory)
- **SEO**: Shopify > Cin7 > Zoho (prefer marketing data)

## Before Importing to Odoo

1. Create product categories in Odoo first
2. Set up tax rules
3. Verify units of measure exist
4. Backup your Odoo database
5. Test with 5-10 products first

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License
