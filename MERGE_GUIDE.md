# AI-Powered CSV Merge Guide

## Overview

The merge feature uses **Gemini AI** to intelligently combine product data from multiple e-commerce systems into a single unified dataset, perfect for importing into Odoo.

## Why Use Merge Mode?

Instead of importing products from each system separately and dealing with duplicates, merge mode:

✅ **Combines best data from each source**
- Shopify has better SEO/marketing data
- Cin7 has better cost/inventory data
- Zoho has better accounting data

✅ **Eliminates duplicates automatically**
- Matches products by SKU across systems
- Creates single master record per product

✅ **Saves massive time**
- One import instead of three
- No manual deduplication
- No conflicting product records

## How It Works

### Step 1: Select Merge Mode

1. Open the webapp
2. Select **"Merge Multiple - Combine Shopify + Cin7 + Zoho first"**
3. Upload button changes to "Choose Multiple Files"

### Step 2: Upload Your Files

Upload 2-3 CSV files:
- `shopify_export.csv`
- `cin7_export.csv`
- `zoho_export.csv`

**The app will:**
- Parse each file
- Auto-detect the source system
- Display file info with color-coded badges
- Show product counts per file

### Step 3: Choose Merge Strategy

**Option A: Combine All Data** (Recommended)
- Takes all available fields from all sources
- Uses most complete/recent data for each field
- Best for comprehensive product data

**Option B: Prioritize by Source**
- Set specific priorities for different field types
- Example:
  - **Pricing**: Prefer Cin7 (wholesale costs)
  - **Inventory**: Prefer Cin7 or Zoho (live stock)
  - **E-commerce/SEO**: Prefer Shopify (optimized descriptions)
  - **Product Info**: Prefer Cin7 (detailed specs)

### Step 4: Review Merge Statistics

Before processing, you'll see:
- **Total Products**: Combined unique product count
- **Matched**: Products found in multiple systems (will be merged)
- **Unique**: Products only in one system (kept as-is)

### Step 5: Process with AI

Click **"✓ Process Merge"**

**What the AI does:**
1. Analyzes data structure from each system
2. Identifies matching products by SKU
3. Intelligently merges fields based on your strategy
4. Creates unified field structure for Odoo
5. Returns clean, deduplicated dataset

**Processing time:** ~10-30 seconds depending on product count

### Step 6: Review & Convert

After merge:
- Review merged data preview
- Proceed to field mapping
- Convert to Odoo format
- Download unified CSV

## AI Merge Logic

### SKU Matching

The AI matches products using these identifiers:
- **Shopify**: "Variant SKU"
- **Cin7**: "ProductCode"
- **Zoho**: "SKU"

Products with matching codes are merged into single records.

### Field Priority (Combine All Strategy)

When the same product exists in multiple systems, AI prioritizes:

| Field Type | Preferred Source | Reason |
|------------|-----------------|--------|
| Product Name | Cin7 | Most complete |
| Description | Cin7 → Shopify | Detailed specs + marketing |
| Selling Price | Shopify | Current retail price |
| Cost Price | Cin7 → Zoho | Wholesale/actual cost |
| Stock Quantity | Cin7 → Zoho | Real-time inventory |
| Barcode | Any available | First valid barcode |
| Weight | Cin7 → Shopify | Most accurate |
| Category | Cin7 → Shopify | Better categorization |
| Images | Shopify | Optimized for web |
| SEO Title | Shopify | Optimized metadata |
| SEO Description | Shopify | Marketing optimized |
| HS Code | Cin7 → Zoho | International shipping |
| Country of Origin | Cin7 → Zoho | Compliance data |

### Unified Output Fields

The merged CSV contains these Odoo-ready fields:
- `sku` - Unified SKU/product code
- `name` - Product name
- `description` - Combined description
- `list_price` - Selling price
- `standard_price` - Cost price
- `qty_available` - Stock quantity
- `barcode` - Product barcode
- `weight` - Product weight
- `category` - Product category
- `image_url` - Main product image
- `_sources` - Array showing which systems contributed data (e.g., `["shopify", "cin7"]`)

## Example Merge Scenario

### Input Files

**Shopify Export** (3 products):
- Product A: Great SEO, images, $99.99 price
- Product B: Good description, $149.99 price
- Product C: Basic info only

**Cin7 Export** (2 products):
- Product A: Cost $50, detailed specs, stock: 100
- Product B: Cost $75, HS code, stock: 50

**Zoho Export** (2 products):
- Product A: Tax codes, accounting category
- Product D: New product, $79.99 price

### AI Merged Output (4 products):

**Product A** (from Shopify + Cin7 + Zoho):
```json
{
  "sku": "PROD-A",
  "name": "Product A Name",
  "description": "Detailed Cin7 specs + Shopify marketing",
  "list_price": "99.99",      // From Shopify
  "standard_price": "50.00",  // From Cin7
  "qty_available": "100",     // From Cin7
  "category": "Category from Cin7",
  "image_url": "https://shopify-cdn.com/...",  // From Shopify
  "barcode": "123456789",
  "weight": "2.5",
  "_sources": ["shopify", "cin7", "zoho"]
}
```

**Product B** (from Shopify + Cin7):
```json
{
  "sku": "PROD-B",
  "list_price": "149.99",     // From Shopify
  "standard_price": "75.00",  // From Cin7
  "qty_available": "50",      // From Cin7
  "_sources": ["shopify", "cin7"]
}
```

**Product C** (from Shopify only):
```json
{
  "sku": "PROD-C",
  "list_price": "...",
  "_sources": ["shopify"]
}
```

**Product D** (from Zoho only):
```json
{
  "sku": "PROD-D",
  "list_price": "79.99",
  "_sources": ["zoho"]
}
```

**Result:** 4 unique products instead of 7 duplicate entries!

## Handling Variants

Products with variants (Size, Color, etc.) are handled intelligently:

- Each variant kept as separate row (Odoo requirement)
- Variants matched by complete SKU (parent + variant)
- Example:
  - Shopify: "SHIRT-001-BLUE-L"
  - Cin7: "SHIRT-001-BLUE-L"
  - → Merged into one "SHIRT-001-BLUE-L" row

## Tips for Best Results

### Before Uploading

1. **Export full data** from each system
2. **Include all products** even if some overlap
3. **Use consistent SKUs** across systems (if possible)
4. **Check data quality** - fix obvious errors first

### During Merge

1. **Review file detection** - ensure systems detected correctly
2. **Choose appropriate strategy**:
   - Use "Combine All" for most cases
   - Use "Prioritize" if you have specific preferences
3. **Check merge stats** - verify matched count looks right

### After Merge

1. **Review preview** before converting
2. **Spot check** a few merged products
3. **Verify prices** look correct
4. **Check stock quantities** make sense
5. **Confirm variant handling** worked properly

## Troubleshooting

### "No products matched"
- **Cause**: SKUs don't match across systems
- **Solution**: Check SKU formats, may need to standardize first

### "Too many unique products"
- **Cause**: SKU mismatch or products not in all systems
- **Solution**: Normal if different product sets per system

### "AI merge failed"
- **Cause**: API error or data format issue
- **Solution**:
  1. Check internet connection
  2. Try with smaller dataset first
  3. Check browser console for errors

### "Merged data looks wrong"
- **Cause**: AI misunderstood data structure
- **Solution**:
  1. Review field mapping in next step
  2. Manually adjust incorrect mappings
  3. Try single-file mode for problematic source

## Advanced: Custom Field Priority

If using "Prioritize by Source" strategy:

```
Product Info (Name, Description):
└─ Best: Cin7 (detailed specs)
└─ Good: Shopify (marketing copy)
└─ Okay: Zoho (basic info)

Pricing:
└─ Best: Cin7 (wholesale/actual costs)
└─ Good: Zoho (accounting data)
└─ Okay: Shopify (retail only)

Inventory/Stock:
└─ Best: Cin7 (real-time inventory)
└─ Good: Zoho (accurate counts)
└─ Avoid: Shopify (may be cached)

E-commerce/SEO:
└─ Best: Shopify (optimized for web)
└─ Okay: Cin7 (basic data)
└─ Avoid: Zoho (accounting focused)
```

## Security Note

⚠️ **API Key Security**: The Gemini API key is currently embedded in client-side JavaScript. For production use:
- Move API calls to a backend server
- Use environment variables for API keys
- Implement proper authentication

For personal use, the current setup is fine as:
- Processing happens in your browser
- Your CSV data never touches a server
- API calls go directly to Google

## FAQ

**Q: How many files can I merge?**
A: 2-3 files recommended. More files = longer processing time.

**Q: What if my SKUs don't match?**
A: Products won't merge but will all be included. You'll see higher "Unique" count.

**Q: Does this work offline?**
A: No, merge requires internet for Gemini API. Single-file mode works offline.

**Q: How much does Gemini API cost?**
A: Gemini 2.0 Flash has a generous free tier. For typical merges (100-500 products), cost is negligible.

**Q: Can I see what AI decided?**
A: Yes! Check the `_sources` field in merged data to see which systems contributed.

**Q: What if merge takes too long?**
A: Process smaller batches. Try 100 products at a time, then combine results.

## Next Steps

After successful merge:
1. Proceed to **Field Mapping** step
2. Select appropriate Odoo template
3. Review mapped fields
4. **Convert to Odoo Format**
5. **Download** unified CSV
6. **Import to Odoo**

You now have a single, deduplicated product dataset combining the best data from all your e-commerce systems! 🎉
