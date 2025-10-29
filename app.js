// Global state
let parsedFiles = [];
let mergedData = null;
let conflicts = [];
let csvData = null;
let csvHeaders = [];
let fieldMappings = {};
let odooTemplate = 'standard';

// Removed AI functionality - conflicts are resolved by field type

// Unified schema - maps source fields to canonical names
const UNIFIED_SCHEMA = {
    sku: {
        shopify: 'Variant SKU',
        cin7: 'ProductCode',
        zoho: 'SKU'
    },
    name: {
        shopify: 'Title',
        cin7: 'Name',
        zoho: 'Item Name'
    },
    description: {
        shopify: 'Body (HTML)',
        cin7: 'Description',
        zoho: 'Sales Description'
    },
    list_price: {
        shopify: 'Variant Price',
        cin7: 'PriceTier1',
        zoho: 'Selling Price'
    },
    standard_price: {
        shopify: 'Cost per item',
        cin7: 'AverageCost',
        zoho: 'Purchase Price'
    },
    qty_available: {
        shopify: 'Variant Inventory Qty',
        cin7: null, // Cin7 doesn't export stock this way
        zoho: 'Stock On Hand'
    },
    barcode: {
        shopify: 'Variant Barcode',
        cin7: 'Barcode',
        zoho: null
    },
    weight: {
        shopify: 'Variant Grams',
        cin7: 'Weight',
        zoho: 'Package Weight'
    },
    category: {
        shopify: 'Product Category',
        cin7: 'Category',
        zoho: null
    },
    image_url: {
        shopify: 'Image Src',
        cin7: null,
        zoho: null
    },
    hs_code: {
        shopify: null,
        cin7: 'HSCode',
        zoho: null
    },
    country_of_origin: {
        shopify: null,
        cin7: 'CountryOfOrigin',
        zoho: null
    },
    seo_title: {
        shopify: 'SEO Title',
        cin7: null,
        zoho: null
    },
    seo_description: {
        shopify: 'SEO Description',
        cin7: null,
        zoho: null
    }
};

// Field priority rules (which source to prefer for each field type)
const FIELD_PRIORITY = {
    sku: ['cin7', 'shopify', 'zoho'],
    name: ['cin7', 'shopify', 'zoho'],
    description: ['cin7', 'shopify', 'zoho'],
    list_price: ['shopify', 'cin7', 'zoho'],
    standard_price: ['cin7', 'zoho', 'shopify'],
    qty_available: ['zoho', 'cin7', 'shopify'],
    barcode: ['cin7', 'shopify', 'zoho'],
    weight: ['cin7', 'shopify', 'zoho'],
    category: ['cin7', 'shopify', 'zoho'],
    image_url: ['shopify', 'cin7', 'zoho'],
    hs_code: ['cin7', 'zoho', 'shopify'],
    country_of_origin: ['cin7', 'zoho', 'shopify'],
    seo_title: ['shopify', 'cin7', 'zoho'],
    seo_description: ['shopify', 'cin7', 'zoho']
};

// Odoo templates
const ODOO_TEMPLATES = {
    minimal: [
        'name', 'default_code', 'type', 'categ_id', 'list_price',
        'standard_price', 'barcode', 'qty_available', 'uom_id', 'description_sale'
    ],
    standard: [
        'name', 'default_code', 'type', 'categ_id', 'list_price', 'standard_price',
        'barcode', 'qty_available', 'uom_id', 'description_sale',
        'weight', 'active', 'sale_ok', 'purchase_ok', 'tracking',
        'image_1920', 'hs_code', 'country_of_origin'
    ],
    ecommerce: [
        'name', 'default_code', 'type', 'categ_id', 'list_price', 'standard_price',
        'compare_list_price', 'barcode', 'qty_available', 'uom_id', 'description_sale',
        'description_ecommerce', 'weight', 'volume', 'active', 'sale_ok', 'purchase_ok',
        'tracking', 'image_1920', 'is_published', 'website_meta_title',
        'website_meta_description', 'hs_code', 'country_of_origin', 'public_categ_ids', 'website_ribbon_id'
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupFileUpload();
    setupEventListeners();
});

function setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');

    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

function setupEventListeners() {
    document.getElementById('template-select').addEventListener('change', handleTemplateChange);
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
    if (files.length > 0) {
        const fileInput = document.getElementById('file-input');
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: { files: files } });
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length < 2) {
        alert('Please upload at least 2 CSV files to merge. This tool is designed for merging multiple sources.');
        return;
    }

    parseMultipleFiles(files);
}

function parseMultipleFiles(files) {
    parsedFiles = [];
    let completed = 0;

    document.getElementById('upload-area').style.display = 'none';
    const filesList = document.getElementById('files-list');
    filesList.innerHTML = '<div class="spinner"></div><p>Parsing files...</p>';
    document.getElementById('files-info').classList.remove('hidden');

    files.forEach((file, index) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const system = detectSourceSystem(results.meta.fields);
                parsedFiles.push({
                    name: file.name,
                    size: file.size,
                    system: system,
                    data: results.data,
                    headers: results.meta.fields
                });

                completed++;
                if (completed === files.length) {
                    displayMultipleFiles();
                    showSystemsDetected();
                }
            },
            error: (error) => {
                alert('Error parsing CSV: ' + error.message);
            }
        });
    });
}

function detectSourceSystem(headers) {
    const headerStr = headers.join(',').toLowerCase();

    if (headerStr.includes('handle') && headerStr.includes('variant sku')) {
        return 'shopify';
    } else if (headerStr.includes('productcode') || headerStr.includes('averagecost')) {
        return 'cin7';
    } else if (headerStr.includes('item id') || (headerStr.includes('stock on hand') && headerStr.includes('item name'))) {
        return 'zoho';
    }

    return 'unknown';
}

function displayMultipleFiles() {
    const filesList = document.getElementById('files-list');
    let html = '';

    parsedFiles.forEach(file => {
        const badgeClass = file.system === 'unknown' ? 'unknown' : file.system;
        const systemName = file.system === 'shopify' ? 'Shopify' :
                          file.system === 'cin7' ? 'Cin7 Core' :
                          file.system === 'zoho' ? 'Zoho Inventory' : 'Unknown';

        html += `
            <div class="file-item">
                <div class="file-item-info">
                    <div>
                        <span class="file-name">${escapeHtml(file.name)}</span>
                        <span class="file-system-badge ${badgeClass}">${systemName}</span>
                    </div>
                    <span class="file-size">${formatFileSize(file.size)} • ${file.data.length} products</span>
                </div>
            </div>
        `;
    });

    filesList.innerHTML = html;
}

function showSystemsDetected() {
    const section = document.getElementById('detection-section');
    section.classList.remove('hidden');

    const systemsList = document.getElementById('systems-detected-list');
    let html = '';

    parsedFiles.forEach(file => {
        const systemName = file.system === 'shopify' ? 'Shopify' :
                          file.system === 'cin7' ? 'Cin7 Core' :
                          file.system === 'zoho' ? 'Zoho Inventory' : 'Unknown';

        html += `
            <div class="system-detected-card">
                <h4><span class="system-badge ${file.system}">${systemName}</span></h4>
                <p>${file.data.length} products</p>
                <p style="font-size: 0.85rem; color: var(--secondary);">${file.headers.length} columns</p>
            </div>
        `;
    });

    systemsList.innerHTML = html;
    showMultiFilePreview();
}

function showMultiFilePreview() {
    if (parsedFiles.length === 0) return;

    const container = document.getElementById('preview-container');
    let html = '';

    // Show first 5 rows from each file
    parsedFiles.forEach(file => {
        const systemName = file.system === 'shopify' ? 'Shopify' :
                          file.system === 'cin7' ? 'Cin7' :
                          file.system === 'zoho' ? 'Zoho' : 'Unknown';

        html += `<h4>${systemName} (${file.data.length} products)</h4>`;
        html += '<table class="preview-table"><thead><tr>';

        file.headers.slice(0, 5).forEach(header => {
            html += `<th>${escapeHtml(header)}</th>`;
        });
        html += '</tr></thead><tbody>';

        file.data.slice(0, 3).forEach(row => {
            html += '<tr>';
            file.headers.slice(0, 5).forEach(header => {
                const value = row[header] || '';
                const truncated = value.length > 30 ? value.substring(0, 30) + '...' : value;
                html += `<td>${escapeHtml(truncated)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table><br>';
    });

    container.innerHTML = html;

    const totalProducts = parsedFiles.reduce((sum, f) => sum + f.data.length, 0);
    document.getElementById('row-count').textContent = `${totalProducts} total products`;
    document.getElementById('column-count').textContent = `${parsedFiles.length} files uploaded`;
}

// ======================================
// CORE MERGE ENGINE
// ======================================

function startMerge() {
    console.log('Starting merge...');

    // Step 1: Normalize each file to unified schema
    const normalizedFiles = parsedFiles.map(file => normalizeFile(file));

    // Step 2: Merge by SKU
    const merged = mergeBySKU(normalizedFiles);

    // Step 3: Detect conflicts
    const { data, conflicts: detectedConflicts } = detectConflicts(merged);

    mergedData = data;
    conflicts = detectedConflicts;

    // Step 4: Calculate statistics
    const stats = calculateMergeStats(data, detectedConflicts);

    // Step 5: Validate
    const validationIssues = validateData(data);

    // Step 6: Show results
    showMergeResults(stats, validationIssues);
}

function normalizeFile(file) {
    const normalized = [];

    file.data.forEach(row => {
        const normalizedRow = {
            _source: file.system,
            _original: row
        };

        // Map each field from source to canonical name
        for (const [canonicalField, sourceMapping] of Object.entries(UNIFIED_SCHEMA)) {
            const sourceField = sourceMapping[file.system];
            if (sourceField && row[sourceField]) {
                normalizedRow[canonicalField] = row[sourceField];
            }
        }

        normalized.push(normalizedRow);
    });

    return {
        system: file.system,
        data: normalized
    };
}

function mergeBySKU(normalizedFiles) {
    const skuMap = new Map();

    // Group all products by SKU
    normalizedFiles.forEach(file => {
        file.data.forEach(product => {
            const sku = product.sku;
            if (!sku) return; // Skip products without SKU

            if (!skuMap.has(sku)) {
                skuMap.set(sku, []);
            }
            skuMap.get(sku).push(product);
        });
    });

    // Merge products with same SKU
    const merged = [];

    skuMap.forEach((products, sku) => {
        if (products.length === 1) {
            // Single source - no merging needed
            merged.push(products[0]);
        } else {
            // Multiple sources - merge using priority rules
            const mergedProduct = mergeProducts(products);
            merged.push(mergedProduct);
        }
    });

    return merged;
}

function mergeProducts(products) {
    const merged = {
        _sources: products.map(p => p._source),
        _originalRecords: products
    };

    // For each canonical field, apply priority rules
    for (const field of Object.keys(UNIFIED_SCHEMA)) {
        const priority = FIELD_PRIORITY[field] || [];

        // Try each source in priority order
        for (const source of priority) {
            const product = products.find(p => p._source === source);
            if (product && product[field]) {
                merged[field] = product[field];
                merged[`_${field}_source`] = source;
                break;
            }
        }

        // If not found in priority sources, take first non-empty
        if (!merged[field]) {
            for (const product of products) {
                if (product[field]) {
                    merged[field] = product[field];
                    merged[`_${field}_source`] = product._source;
                    break;
                }
            }
        }
    }

    return merged;
}

function detectConflicts(mergedData) {
    const conflictsFound = [];

    mergedData.forEach(product => {
        if (!product._originalRecords || product._originalRecords.length < 2) {
            return; // No conflict if only one source
        }

        const productConflicts = [];

        // Check each field for conflicts
        for (const field of Object.keys(UNIFIED_SCHEMA)) {
            const values = product._originalRecords
                .map(p => p[field])
                .filter(v => v && String(v).trim() !== '');

            // If we have multiple different values for same field = conflict
            const uniqueValues = [...new Set(values.map(v => String(v).trim()))];
            if (uniqueValues.length > 1) {
                productConflicts.push({
                    field: field,
                    values: product._originalRecords.map(p => ({
                        source: p._source,
                        value: p[field] || ''
                    })).filter(v => v.value !== '' && String(v.value).trim() !== ''),
                    selected: product[field], // Currently selected value (from priority rules)
                    resolved: false // Mark as unresolved by default
                });
            }
        }

        if (productConflicts.length > 0) {
            conflictsFound.push({
                sku: product.sku,
                conflicts: productConflicts
            });
        }
    });

    return {
        data: mergedData,
        conflicts: conflictsFound
    };
}

function calculateMergeStats(data, conflicts) {
    const matchedProducts = data.filter(p => p._sources && p._sources.length > 1).length;
    const uniqueProducts = data.filter(p => !p._sources || p._sources.length === 1).length;

    // Calculate completeness
    const requiredFields = ['sku', 'name', 'list_price'];
    const optionalFields = Object.keys(UNIFIED_SCHEMA).filter(f => !requiredFields.includes(f));

    let totalCompleteness = 0;
    data.forEach(product => {
        let filledFields = 0;
        const totalFields = requiredFields.length + optionalFields.length;

        requiredFields.forEach(f => {
            if (product[f]) filledFields++;
        });
        optionalFields.forEach(f => {
            if (product[f]) filledFields++;
        });

        totalCompleteness += (filledFields / totalFields) * 100;
    });

    const avgCompleteness = data.length > 0 ? Math.round(totalCompleteness / data.length) : 0;

    return {
        total: data.length,
        matched: matchedProducts,
        unique: uniqueProducts,
        conflicts: conflicts.length,
        completeness: avgCompleteness
    };
}

function validateData(data) {
    const issues = [];

    data.forEach(product => {
        // Check required fields
        if (!product.sku) {
            issues.push({ type: 'error', message: `Product missing SKU` });
        }
        if (!product.name) {
            issues.push({ type: 'error', message: `Product ${product.sku || 'Unknown'} missing name` });
        }
        if (!product.list_price) {
            issues.push({ type: 'warning', message: `Product ${product.sku || 'Unknown'} missing price` });
        }

        // Check numeric fields
        if (product.list_price && isNaN(parseFloat(product.list_price))) {
            issues.push({ type: 'error', message: `Product ${product.sku} has invalid price: ${product.list_price}` });
        }
    });

    return issues;
}

function showMergeResults(stats, validationIssues) {
    // Update stats
    document.getElementById('merge-total').textContent = stats.total;
    document.getElementById('merge-matched').textContent = stats.matched;
    document.getElementById('merge-conflicts').textContent = stats.conflicts;
    document.getElementById('merge-completeness').textContent = stats.completeness + '%';

    // Show validation issues
    const validationContainer = document.getElementById('validation-issues');
    if (validationIssues.length === 0) {
        validationContainer.innerHTML = '<div class="validation-issue success">✓ No issues found. All products are valid.</div>';
    } else {
        let html = '';
        validationIssues.forEach(issue => {
            html += `<div class="validation-issue ${issue.type}">${issue.message}</div>`;
        });
        validationContainer.innerHTML = html;
    }

    // Show conflicts section if needed
    if (conflicts.length > 0) {
        document.getElementById('conflicts-section').classList.remove('hidden');
        showConflictsTable();
    }

    // Show merge section
    document.getElementById('merge-section').classList.remove('hidden');

    // Scroll to results
    document.getElementById('merge-section').scrollIntoView({ behavior: 'smooth' });
}

// Group conflicts by field type instead of by SKU
function groupConflictsByField() {
    const fieldGroups = new Map();

    conflicts.forEach(conflict => {
        conflict.conflicts.forEach(fieldConflict => {
            const field = fieldConflict.field;

            if (!fieldGroups.has(field)) {
                fieldGroups.set(field, {
                    field: field,
                    skus: [],
                    sources: new Set(),
                    sampleValues: fieldConflict.values,
                    resolved: true, // Start as resolved, will be set to false if we find any unresolved
                    selectedSource: null,
                    totalConflicts: 0,
                    resolvedConflicts: 0
                });
            }

            const group = fieldGroups.get(field);
            group.skus.push(conflict.sku);
            group.totalConflicts++;
            fieldConflict.values.forEach(v => group.sources.add(v.source));

            // Track resolution status - group is only resolved if ALL conflicts for this field are resolved
            if (fieldConflict.resolved && fieldConflict.selectedSource) {
                group.resolvedConflicts++;
                group.selectedSource = fieldConflict.selectedSource;
            } else {
                group.resolved = false; // If ANY conflict is unresolved, the group is unresolved
            }
        });
    });

    // Final pass: mark as resolved only if all conflicts are resolved
    fieldGroups.forEach(group => {
        group.resolved = group.totalConflicts === group.resolvedConflicts && group.resolvedConflicts > 0;
    });

    return Array.from(fieldGroups.values());
}

function showConflictsTable() {
    const container = document.getElementById('conflicts-table-container');
    const fieldGroups = groupConflictsByField();
    let html = '';

    html += `
        <div class="field-conflict-info">
            <p><strong>Resolve conflicts by field:</strong> Select which source to use for each field. Your choice will apply to all ${conflicts.length} SKUs with that field conflict.</p>
        </div>
    `;

    fieldGroups.forEach((group, groupIdx) => {
        const statusClass = group.resolved ? 'resolved' : 'pending';

        html += `
            <div class="conflict-field-section ${statusClass}">
                <div class="conflict-field-header" onclick="toggleConflictField(${groupIdx})">
                    <span class="conflict-status-icon">${group.resolved ? '✓' : '⚠️'}</span>
                    <strong>Field: ${escapeHtml(group.field)}</strong>
                    <span class="conflict-count">${group.skus.length} SKUs affected</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="conflict-fields" id="conflict-field-${groupIdx}" style="display: none;">
                    <div class="field-resolution-container">
                        <div class="source-options">
                            <h4>Sample values from different sources:</h4>
                            <table class="preview-table">
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Sample Value</th>
                                    </tr>
                                </thead>
                                <tbody>
        `;

        group.sampleValues.forEach(v => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(v.source)}</strong></td>
                    <td>${escapeHtml(String(v.value).substring(0, 200))}${String(v.value).length > 200 ? '...' : ''}</td>
                </tr>
            `;
        });

        html += `
                                </tbody>
                            </table>
                        </div>
                        <div class="resolution-selector">
                            <label for="field-select-${groupIdx}"><strong>Select which source to use for all SKUs:</strong></label>
                            <select id="field-select-${groupIdx}" class="conflict-select" onchange="resolveFieldConflict('${escapeHtml(group.field)}', this.value)">
                                <option value="">-- Select Source --</option>
        `;

        Array.from(group.sources).forEach(source => {
            // Only pre-select if the field is actually resolved (user has explicitly selected it)
            const selected = (group.resolved && group.selectedSource === source) ? 'selected' : '';
            html += `<option value="${escapeHtml(source)}" ${selected}>${source}</option>`;
        });

        html += `
                            </select>
                            ${group.resolved ? '<div class="resolution-applied">✓ Resolution applied to all affected SKUs</div>' : ''}
                        </div>
                        <div class="affected-skus">
                            <details>
                                <summary>View affected SKUs (${group.skus.length})</summary>
                                <div class="sku-list">${group.skus.map(sku => escapeHtml(sku)).join(', ')}</div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleConflictField(idx) {
    const fieldsDiv = document.getElementById(`conflict-field-${idx}`);
    const header = fieldsDiv.previousElementSibling;
    const icon = header.querySelector('.collapse-icon');

    if (fieldsDiv.style.display === 'none') {
        fieldsDiv.style.display = 'block';
        icon.textContent = '▲';
    } else {
        fieldsDiv.style.display = 'none';
        icon.textContent = '▼';
    }
}

function resolveFieldConflict(field, sourceSelected) {
    if (!sourceSelected) return;

    // Apply the selected source to ALL SKUs that have this field conflict
    conflicts.forEach(conflict => {
        const fieldConflict = conflict.conflicts.find(fc => fc.field === field);
        if (!fieldConflict) return;

        // Find the value from the selected source for this SKU
        let selectedValueObj = fieldConflict.values.find(v => v.source === sourceSelected);

        // If the selected source doesn't have a value for this SKU, use the best available alternative
        if (!selectedValueObj && fieldConflict.values.length > 0) {
            // Use the first available value as fallback
            selectedValueObj = fieldConflict.values[0];
            console.log(`SKU ${conflict.sku}: ${field} - ${sourceSelected} not available, using ${selectedValueObj.source} instead`);
        }

        if (!selectedValueObj) return;

        // Update the field conflict
        fieldConflict.selected = selectedValueObj.value;
        fieldConflict.resolved = true;
        fieldConflict.selectedSource = sourceSelected; // Keep the user's selected source even if we used a fallback

        // Update the merged data
        const product = mergedData.find(p => p.sku === conflict.sku);
        if (product) {
            product[field] = selectedValueObj.value;
            product[`_${field}_source`] = selectedValueObj.source; // Use the actual source we got the value from
        }
    });

    // Update UI
    showConflictsTable();
    updateConflictCount();
}

function updateConflictCount() {
    const unresolvedCount = conflicts.reduce((sum, c) => {
        return sum + c.conflicts.filter(fc => !fc.resolved).length;
    }, 0);

    document.getElementById('merge-conflicts').textContent = unresolvedCount;
}

function proceedToConversion() {
    // Check if all conflicts are resolved
    const unresolvedCount = conflicts.reduce((sum, c) => {
        return sum + c.conflicts.filter(fc => !fc.resolved).length;
    }, 0);

    if (unresolvedCount > 0) {
        alert(`Please resolve all ${unresolvedCount} remaining conflicts before proceeding.`);
        return;
    }

    // Set csvData to merged data
    csvData = mergedData;
    csvHeaders = Object.keys(UNIFIED_SCHEMA);

    // Initialize field mappings for merged data
    fieldMappings = {
        'name': 'name',
        'default_code': 'sku',
        'barcode': 'barcode',
        'list_price': 'list_price',
        'standard_price': 'standard_price',
        'description_sale': 'description',
        'qty_available': 'qty_available',
        'weight': 'weight',
        'categ_id': 'category',
        'image_1920': 'image_url',
        'hs_code': 'hs_code',
        'country_of_origin': 'country_of_origin',
        'website_meta_title': 'seo_title',
        'website_meta_description': 'seo_description'
    };

    // Skip mapping section, go directly to conversion options
    document.getElementById('options-section').classList.remove('hidden');
    document.getElementById('convert-section').classList.remove('hidden');

    updateConversionSummary();

    document.getElementById('options-section').scrollIntoView({ behavior: 'smooth' });
}

function updateMappingTable() {
    const tbody = document.getElementById('mapping-table-body');
    const template = ODOO_TEMPLATES[odooTemplate];

    let html = '';

    template.forEach(odooField => {
        const sourceField = fieldMappings[odooField];
        const sampleValue = sourceField && csvData[0] ? csvData[0][sourceField] || '' : '';
        const truncated = sampleValue.length > 100 ? sampleValue.substring(0, 100) + '...' : sampleValue;

        html += `
            <tr>
                <td><strong>${odooField}</strong></td>
                <td>
                    <select class="form-select" onchange="updateMapping('${odooField}', this.value)">
                        <option value="">-- Default/None --</option>
                        ${csvHeaders.map(h =>
                            `<option value="${escapeHtml(h)}" ${h === sourceField ? 'selected' : ''}>${escapeHtml(h)}</option>`
                        ).join('')}
                    </select>
                </td>
                <td class="sample-value">${escapeHtml(truncated)}</td>
                <td>
                    <input type="checkbox" checked onchange="toggleField('${odooField}', this.checked)">
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function handleTemplateChange(e) {
    odooTemplate = e.target.value;
    updateMappingTable();
    updateConversionSummary();
}

function updateMapping(odooField, sourceField) {
    fieldMappings[odooField] = sourceField || null;
}

function toggleField(odooField, enabled) {
    if (!enabled) {
        delete fieldMappings[odooField];
    }
    updateConversionSummary();
}

function updateConversionSummary() {
    const enabledFields = Object.keys(fieldMappings).length;
    document.getElementById('product-count').textContent = csvData ? csvData.length : 0;
    document.getElementById('field-count').textContent = enabledFields;
}

function convertToOdoo() {
    if (!csvData || !csvData.length) {
        alert('No data to convert');
        return;
    }

    const btn = document.getElementById('convert-btn');
    btn.disabled = true;
    btn.textContent = 'Converting...';

    setTimeout(() => {
        try {
            const odooData = transformData();
            displayResult(odooData);
            setupDownload(odooData);

            btn.textContent = '✓ Converted!';
            document.getElementById('conversion-result').classList.remove('hidden');
        } catch (error) {
            alert('Error converting data: ' + error.message);
            btn.disabled = false;
            btn.textContent = '🚀 Convert to Odoo Format';
        }
    }, 500);
}

function transformData() {
    const cleanHTML = document.getElementById('clean-html').checked;
    const normalizePrices = document.getElementById('normalize-prices').checked;
    const defaultType = document.getElementById('default-type').value;
    const defaultCategory = document.getElementById('default-category').value;

    const odooRows = [];
    const template = ODOO_TEMPLATES[odooTemplate];

    csvData.forEach(sourceRow => {
        const odooRow = {};

        template.forEach(odooField => {
            const sourceField = fieldMappings[odooField];
            let value = '';

            if (sourceField && sourceRow[sourceField]) {
                value = sourceRow[sourceField];
            } else if (odooField === 'type') {
                value = defaultType;
            } else if (odooField === 'categ_id' && defaultCategory) {
                value = defaultCategory;
            } else if (odooField === 'uom_id') {
                value = 'Units';
            } else if (odooField === 'sale_ok' || odooField === 'purchase_ok') {
                value = 'TRUE';
            } else if (odooField === 'active') {
                value = 'TRUE';
            } else if (odooField === 'tracking') {
                value = 'none';
            }

            // Clean data
            if (value) {
                if (cleanHTML && (odooField.includes('description') || odooField.includes('ecommerce'))) {
                    value = cleanHtmlContent(value);
                }

                if (normalizePrices && (odooField.includes('price') || odooField.includes('cost'))) {
                    value = normalizePrice(value);
                }

                if (odooField.includes('_ok') || odooField === 'active' || odooField === 'is_published') {
                    value = normalizeBooleanValue(value);
                }

                // Convert weight from grams to pounds if needed
                if (odooField === 'weight' && sourceRow._sources && sourceRow._sources.includes('shopify')) {
                    const grams = parseFloat(value);
                    if (!isNaN(grams)) {
                        value = (grams / 453.592).toFixed(2);
                    }
                }
            }

            odooRow[odooField] = value;
        });

        odooRows.push(odooRow);
    });

    return odooRows;
}

function cleanHtmlContent(html) {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizePrice(price) {
    if (typeof price === 'number') return price.toString();
    if (typeof price !== 'string') return '0';
    return price.replace(/[^0-9.-]/g, '').trim() || '0';
}

function normalizeBooleanValue(value) {
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value !== 'string') return 'FALSE';
    const v = value.toLowerCase().trim();
    return (v === 'true' || v === '1' || v === 'yes' || v === 'active') ? 'TRUE' : 'FALSE';
}

function displayResult(odooData) {
    const container = document.getElementById('result-preview-container');
    const previewData = odooData.slice(0, 3);
    const fields = Object.keys(odooData[0] || {});

    let html = '<table class="preview-table"><thead><tr>';
    fields.forEach(field => {
        html += `<th>${escapeHtml(field)}</th>`;
    });
    html += '</tr></thead><tbody>';

    previewData.forEach(row => {
        html += '<tr>';
        fields.forEach(field => {
            const value = row[field] || '';
            const truncated = value.length > 50 ? value.substring(0, 50) + '...' : value;
            html += `<td>${escapeHtml(truncated)}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function setupDownload(odooData) {
    const btn = document.getElementById('download-btn');

    btn.onclick = () => {
        const csv = Papa.unparse(odooData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `odoo_products_merged_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

function clearFile() {
    document.getElementById('file-input').value = '';
    document.getElementById('files-info').classList.add('hidden');
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('detection-section').classList.add('hidden');
    document.getElementById('merge-section').classList.add('hidden');
    document.getElementById('mapping-section').classList.add('hidden');
    document.getElementById('options-section').classList.add('hidden');
    document.getElementById('convert-section').classList.add('hidden');

    parsedFiles = [];
    mergedData = null;
    conflicts = [];
    csvData = null;
    csvHeaders = [];
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
