# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Open the App
Double-click `index.html` or drag it into your browser.

### Step 2: Upload Your CSV
Drag your Shopify/Cin7/Zoho CSV file into the upload area.

### Step 3: Download
Click "Convert to Odoo Format" and download your file.

That's it! You now have an Odoo-ready CSV file.

---

## 📋 Pre-Import Checklist

Before importing to Odoo, make sure you have:

- [ ] Created product categories in Odoo that match your CSV
- [ ] Set up tax rules in Odoo
- [ ] Verified units of measure exist (Units, kg, m, etc.)
- [ ] Backed up your Odoo database
- [ ] Tested with 5-10 products first

---

## 🎯 Recommended Settings

For most users, we recommend:

**Template:** Standard (20 fields)
- Includes all essential product data
- Works for both inventory and e-commerce
- Not too minimal, not too complex

**Options:**
- ✅ Merge variants into product template rows
- ✅ Clean HTML in descriptions
- ✅ Remove currency symbols from prices

**Default Values:**
- **Product Type:** Storable Product
- **Default Category:** Your main category (e.g., "All/Products")

---

## 📊 What Gets Converted?

### Essential Fields (Always Included)
- Product name
- SKU/Internal reference
- Selling price
- Cost price
- Barcode
- Description

### Standard Template Adds
- Stock quantity
- Weight
- Product status
- Sales/purchase flags
- Tracking settings
- Compare-at price
- Images
- HS code
- Country of origin

### E-Commerce Template Adds
- Website published status
- SEO title
- SEO description
- Website categories
- Product ribbons

---

## 💡 Common Scenarios

### Scenario 1: Simple Inventory Import
"I just need basic product data in Odoo"

→ Use **Minimal Template**

### Scenario 2: Full Store Migration
"I'm moving my entire store from Shopify to Odoo"

→ Use **E-Commerce Template**

### Scenario 3: Inventory + Sales
"I need inventory tracking and ability to sell products"

→ Use **Standard Template** (recommended)

---

## 🔧 Customization Tips

### Need Extra Fields?
1. Select "Custom" template
2. Check the fields you want in the mapping table
3. Map source fields manually

### Data Looks Wrong?
- Toggle "Clean HTML" if descriptions are messy
- Toggle "Normalize prices" if prices have currency symbols
- Check the preview before downloading

### Wrong System Detected?
- Manually select the correct system in Step 2

---

## ⚠️ Important Notes

### About Variants
- Shopify: Each variant is a separate row → Converter groups them
- Cin7: Products with options → Handled automatically
- Zoho: Variants as separate items → Treated as individual products

### About Images
- Image URLs must be publicly accessible
- Odoo will download images during import
- Large images may slow down import

### About Stock Quantities
- Stock quantities are imported as initial stock
- Verify accuracy before importing
- Consider starting with 0 and adjusting manually

---

## 🎓 Import Process (In Odoo)

1. **Navigate to Products**
   - Inventory > Products > Products
   - Or Sales > Products > Products

2. **Start Import**
   - Click ⋮ (menu) button
   - Select "Import records"

3. **Upload File**
   - Upload your converted CSV
   - Odoo will analyze the file

4. **Map Fields** (if needed)
   - Most fields should auto-map
   - Confirm any manual mappings

5. **Test Import**
   - Click "Test" first
   - Review any errors

6. **Execute Import**
   - If test passes, click "Import"
   - Wait for completion

---

## 🆘 Troubleshooting

### "Import failed - missing required field"
→ Make sure you included at least: name, default_code, type

### "Category not found"
→ Create the category in Odoo first, or use "Default Category" option

### "Invalid price value"
→ Enable "Normalize prices" option

### "Some rows were not imported"
→ Check the error log in Odoo, usually it's missing master data

---

## 📞 Need Help?

1. Check the full README.md
2. Review your source CSV format
3. Test with a small sample first
4. Check Odoo's import logs for specific errors

---

## ✨ Pro Tips

- **Always backup** before bulk imports
- **Test small** before importing 1000s of products
- **Clean data first** in source system if possible
- **Use External IDs** for updates (advanced)
- **Import in stages**: Basic data → Images → SEO → Variants

---

Happy importing! 🎉
