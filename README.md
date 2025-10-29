# CSV to Odoo Product Converter

A web-based tool to convert product exports from Shopify, Cin7 Core, and Zoho Inventory into Odoo-compatible CSV import files.

## Features

- **Intelligent Multi-File Merging**: Merge 2-3 CSV files from different e-commerce systems
- **Field-Based Conflict Resolution**: Resolve conflicts once per field type, applies to all SKUs
- **Automatic System Detection**: Automatically detects whether your CSV is from Shopify, Cin7, or Zoho
- **Smart Field Mapping**: Pre-configured field mappings for each platform with manual override options
- **Multiple Templates**: Choose from Minimal, Standard, or E-Commerce templates
- **Data Cleaning**: Options to clean HTML, normalize prices, and format data properly for Odoo
- **Live Preview**: See your data before and after conversion
- **Browser-Based**: Runs entirely in your browser - your data stays private

## How to Use

### 1. Open the Application

Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

### 2. Upload Your CSV Files

- Upload 2-3 CSV files from different systems (Shopify, Cin7, Zoho)
- Drag and drop multiple files into the upload area, or
- Click "Choose Multiple Files" to browse

Supported formats:
- Shopify product export
- Cin7 Core product export
- Zoho Inventory item export

### 3. Review Source Files

- Files are automatically detected and labeled by system
- Review the preview of your data
- Click "Start Intelligent Merge"

### 4. Review Merge Results & Resolve Conflicts

- View merge statistics showing matched products and conflicts
- Resolve conflicts using field-based resolution:
  - Select your preferred source once per field (e.g., "shopify for list_price")
  - Your choice automatically applies to all SKUs with that field conflict
  - Much faster than resolving each SKU individually
- Review validation results

### 5. Set Conversion Options

Configure:
- **Variant Handling**: How to handle product variants
- **Data Cleaning**: Clean HTML descriptions, normalize prices
- **Default Values**: Set default product type and category

### 6. Convert & Download

- Click "Convert to Odoo Format"
- Preview the converted data
- Download the Odoo-ready CSV file

## Odoo Templates

### Minimal Template (10 fields)
Basic product information suitable for simple imports:
- name, default_code, type, categ_id, list_price, standard_price, barcode, qty_available, uom_id, description_sale

### Standard Template (20 fields) - Recommended
Includes all essential fields for most use cases:
- All minimal fields plus: description_ecommerce, weight, active, sale_ok, purchase_ok, tracking, compare_list_price, image_1920, hs_code, country_of_origin

### E-Commerce Template (26 fields)
Full-featured template with website/SEO fields:
- All standard fields plus: volume, is_published, website_meta_title, website_meta_description, public_categ_ids, website_ribbon_id

## Field Mappings

### Shopify → Odoo

| Odoo Field | Shopify Field |
|------------|---------------|
| name | Title |
| default_code | Variant SKU |
| barcode | Variant Barcode |
| list_price | Variant Price |
| standard_price | Cost per item |
| compare_list_price | Variant Compare At Price |
| weight | Variant Grams (converted to lbs) |
| description_sale | Body (HTML) |
| qty_available | Variant Inventory Qty |
| image_1920 | Image Src |
| website_meta_title | SEO Title |
| website_meta_description | SEO Description |

### Cin7 Core → Odoo

| Odoo Field | Cin7 Field |
|------------|------------|
| name | Name |
| default_code | ProductCode |
| barcode | Barcode |
| list_price | PriceTier1 |
| standard_price | AverageCost |
| categ_id | Category |
| description_sale | Description |
| weight | Weight |
| volume | CartonVolume |
| hs_code | HSCode |
| country_of_origin | CountryOfOrigin |

### Zoho Inventory → Odoo

| Odoo Field | Zoho Field |
|------------|------------|
| name | Item Name |
| default_code | SKU |
| list_price | Selling Price |
| standard_price | Purchase Price |
| description_sale | Sales Description |
| qty_available | Stock On Hand |
| weight | Package Weight |
| uom_id | Unit |

## Before Importing to Odoo

1. **Prepare Master Data**: Ensure categories, taxes, and units of measure exist in your Odoo instance
2. **Test Import**: Import 5-10 products first to validate the mapping
3. **Check Data**: Review the converted CSV in a text editor or spreadsheet before importing
4. **Backup**: Always backup your Odoo database before bulk imports

## Importing to Odoo

1. Go to **Inventory > Products > Products** (or **Sales > Products > Products**)
2. Click the **⋮** menu button (top right)
3. Select **Import records**
4. Upload your converted CSV file
5. Map any remaining fields if prompted
6. Review the import preview
7. Click **Import** to complete

## Tips

- **Product Variants**: For products with variants (size, color, etc.), Shopify exports each variant as a separate row. The converter handles this automatically.
- **Images**: Image URLs are preserved but images must be accessible online for Odoo to import them
- **Categories**: Use the exact category path from Odoo (e.g., "All/Clothing/Pants")
- **Prices**: Make sure your prices don't include currency symbols in the source CSV
- **Stock Quantities**: Verify stock quantities are accurate before importing

## Troubleshooting

### Import Fails in Odoo
- Check that all required fields are present (name, default_code, type)
- Verify category names match exactly with Odoo categories
- Ensure price fields contain only numbers

### Wrong System Detected
- Manually select the correct system from the dropdown in Step 2

### Missing Fields
- Switch to a different template or use "Custom" template
- Manually map additional fields in the mapping table

### Data Looks Wrong
- Adjust conversion options (HTML cleaning, price normalization)
- Check the preview before downloading

## Technical Details

- **No Installation Required**: Pure HTML/CSS/JavaScript
- **Libraries Used**: PapaParse for CSV parsing
- **Browser Compatibility**: Works in all modern browsers
- **Privacy**: All processing happens locally in your browser

## File Structure

```
ImportOdoo/
├── index.html              # Main application page
├── styles.css              # Styling
├── app.js                  # Application logic
├── README.md               # This file
├── Fields.txt              # Odoo field reference
└── Sample CSVs/
    ├── Shopify to Odoo Item List 1690.csv
    ├── Cin7 Core to Odoo Item List 1690.csv
    └── Zoho to Odoo Item List 1690.csv
```

## Version

Current Version: 2.0.0 - Intelligent merging with conflict resolution

## Support

For issues or questions:
1. Check this README first
2. Review the sample CSV files for examples
3. Test with a small subset of data first

## License

Free to use for product data conversion.
