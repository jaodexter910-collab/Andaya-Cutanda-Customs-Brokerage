// Dashboard Functionality

// Activity Log System with Local Storage Persistence (7 days)
const ACTIVITY_STORAGE_KEY = 'acbrokerage_activities';
const ACTIVITY_RETENTION_DAYS = 7;

function getStoredActivities() {
    try {
        const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading activities from localStorage:', error);
        return [];
    }
}

function saveActivities(activities) {
    try {
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
        console.error('Error saving activities to localStorage:', error);
    }
}

function cleanupOldActivities(activities) {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate > cutoffDate;
    });
    
    if (filteredActivities.length !== activities.length) {
        saveActivities(filteredActivities);
    }
    
    return filteredActivities;
}

function logActivity(type, title, description) {
    const timestamp = new Date();
    const activity = {
        type: type, // 'calculator' or 'hs-code'
        title: title,
        description: description,
        timestamp: timestamp.toISOString(),
        timeString: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dateString: timestamp.toLocaleDateString('en-US')
    };
    
    // Get existing activities from localStorage
    let activities = getStoredActivities();
    
    // Add new activity to beginning
    activities.unshift(activity);
    
    // Save to localStorage (limit to last 100 activities to prevent overflow)
    if (activities.length > 100) {
        activities = activities.slice(0, 100);
    }
    
    saveActivities(activities);
    displayActivityLog();
}

function displayActivityLog() {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;
    
    // Get activities from localStorage
    let activities = getStoredActivities();
    
    // Clean up old activities (older than 7 days)
    activities = cleanupOldActivities(activities);
    
    if (activities.length === 0) {
        timeline.innerHTML = '<div class="activity-placeholder"><p style="text-align: center; color: #999;">Activities from Calculator and HS Code Finder will appear here</p></div>';
        return;
    }
    
    const iconMap = {
        'calculator': '🧮',
        'hs-code': '🔍'
    };
    
    timeline.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${iconMap[activity.type] || '📋'}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.dateString} at ${activity.timeString}</div>
            </div>
        </div>
    `).join('');
}

// Update date information
function updateDate() {
    const dateElement = document.getElementById('dateInfo');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    dateElement.textContent = `Today: ${today}`;
}

// Setup Sidebar Toggle
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar when a link is clicked on mobile
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// Setup sidebar link active state
function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const allSections = document.querySelectorAll('.section-content');
    
    // Function to show only one section
    function showSection(sectionId) {
        allSections.forEach(section => {
            // Hide all sections
            section.style.display = 'none';
            section.style.visibility = 'hidden';
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.style.visibility = 'visible';
            targetSection.classList.add('active');
            console.log('✓ Showing section:', sectionId);
        }
    }
    
    // Add click listeners to all sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all sidebar links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section ID
            const href = this.getAttribute('href');
            const sectionId = href.substring(1) + '-content'; // Remove # and add -content
            
            // Show target section
            showSection(sectionId);
        });
    });
    
    // Initialize: show dashboard by default
    showSection('dashboard-content');
    
    // Make sure Dashboard link is marked active  
    const dashboardLink = document.querySelector('.sidebar-link[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.classList.add('active');
    }
}

// Navigation link active state (old top nav - removed)
function setupNavigation() {
    // Navigation removed, using sidebar instead
}

// Animate metric values on page load
function animateMetrics() {
    const metrics = document.querySelectorAll('.metric-value');
    
    metrics.forEach(metric => {
        const finalValue = metric.textContent;
        let currentValue = 0;
        
        // Only animate numbers
        if (finalValue.includes(',')) {
            const numericValue = parseInt(finalValue.replace(/,/g, ''));
            const increment = Math.ceil(numericValue / 30);
            
            const interval = setInterval(() => {
                if (currentValue < numericValue) {
                    currentValue += increment;
                    metric.textContent = currentValue.toLocaleString();
                } else {
                    metric.textContent = numericValue.toLocaleString();
                    clearInterval(interval);
                }
            }, 30);
        }
    });
}

// Handle View All Buttons
function setupViewAllButton() {
    const viewAllBtn = document.querySelector('.view-all-btn');
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            alert('Shipments page would load here');
        });
    }
}

// Add hover effect to metric cards
function setupCardInteractions() {
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
        
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            console.log(`Clicked on: ${title}`);
        });
    });
}

// Setup table row interactions
function setupTableInteractions() {
    const tableRows = document.querySelectorAll('.shipment-table tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const shipmentId = this.querySelector('td').textContent;
            console.log(`View details for: ${shipmentId}`);
        });
        
        row.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.style.backgroundColor = '#ecf0f1';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
}

// Setup calculator card interactions
function setupCalculatorCards() {
    const calculatorCards = document.querySelectorAll('.calculator-card');
    
    calculatorCards.forEach(card => {
        const btn = card.querySelector('.calc-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const calculatorType = card.getAttribute('data-calculator');
                openCalculator(calculatorType);
            });
        }
    });
}

// Open specific calculator modal
function openCalculator(type) {
    const modalId = `${type}-calculator-modal`;
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modal.classList.add('active');
        setupModalClose(modal);
        return;
    }
}

// Setup modal close functionality
function setupModalClose(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ==========================================
// PASSENGER SERVICE CALCULATOR FUNCTIONS
// ==========================================

function calculatePassengerService() {
    // Get input values
    const currency = document.getElementById('ps-currency').value;
    const foreignValue = parseFloat(document.getElementById('ps-foreign-value').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('ps-exchange-rate').value) || 56.00;
    const dutyRate = parseFloat(document.getElementById('ps-duty-rate').value) || 0;
    const exciseAmount = parseFloat(document.getElementById('ps-excise-amount').value) || 0;
    const includeSurcharge = document.getElementById('ps-include-surcharge').checked;

    // Validate currency selection
    if (!currency) {
        alert('Please select a currency');
        return;
    }

    // Calculate Dutiable Value
    const dutiableValue = foreignValue * exchangeRate;

    // Calculate Customs Duties
    const customsDuties = dutiableValue * (dutyRate / 100);

    // Customs Documentary Stamp (Fixed)
    const docStamp = 130;

    // Calculate Import Processing Charge based on DV brackets
    const importProcessingCharge = calculateImportProcessingCharge(dutiableValue);

    // Calculate Landed Cost
    const landedCost = dutiableValue + customsDuties + docStamp + importProcessingCharge;

    // Excise Tax (from input)
    const exciseTax = exciseAmount;

    // Calculate VAT: (Landed Cost + Excise Tax) * 0.12
    const vat = (landedCost + exciseTax) * 0.12;

    // Calculate Surcharge: Landed Cost * 30% (only if enabled)
    const surcharge = includeSurcharge ? (landedCost * 0.30) : 0;

    // Total Amount Due
    const totalAmountDue = customsDuties + vat + docStamp + importProcessingCharge + exciseTax + surcharge;

    // Display results
    displayPassengerServiceResults({
        currency,
        foreignValue,
        exchangeRate,
        dutyRate,
        dutiableValue,
        customsDuties,
        docStamp,
        importProcessingCharge,
        landedCost,
        exciseTax,
        vat,
        surcharge,
        totalAmountDue,
        includeSurcharge
    });

    // Save to history
    const passengerName = document.getElementById('ps-passenger-name').value;
    const flightNo = document.getElementById('ps-flight-no').value;
    const commodity = document.getElementById('ps-commodity').value;

    addToActivityTimeline('passenger-service', {
        passengerName,
        flightNo,
        commodity,
        currency,
        foreignValue,
        exchangeRate,
        dutiableValue,
        customsDuties,
        docStamp,
        importProcessingCharge,
        landedCost,
        exciseTax,
        vat,
        surcharge,
        totalAmountDue,
        includeSurcharge
    });

    // Log to dashboard activity
    logActivity('calculator', 'Passenger Service Calculation', `Calculated for ${passengerName || 'N/A'} - Total: ₱${totalAmountDue.toFixed(2)}`);
}

function calculateImportProcessingCharge(dutiableValue) {
    if (dutiableValue > 750000) {
        return 2000;
    } else if (dutiableValue > 500000) {
        return 1500;
    } else if (dutiableValue > 250000) {
        return 1000;
    } else if (dutiableValue > 50000) {
        return 750;
    } else if (dutiableValue > 25000) {
        return 500;
    } else if (dutiableValue > 10000) {
        return 250;
    } else {
        return 0; // Below Php 10,000
    }
}

function displayPassengerServiceResults(results) {
    // Computation Breakdown
    document.getElementById('ps-dutiable-value').textContent = formatCurrency(results.dutiableValue);
    document.getElementById('ps-dutiable-value-formula').textContent = `= ${results.foreignValue.toFixed(2)} × ${results.exchangeRate.toFixed(2)}`;
    
    document.getElementById('ps-customs-duties').textContent = formatCurrency(results.customsDuties);
    document.getElementById('ps-customs-duties-formula').textContent = `= ${formatCurrency(results.dutiableValue)} × ${results.dutyRate}%`;
    
    document.getElementById('ps-doc-stamp').textContent = formatCurrency(results.docStamp);
    document.getElementById('ps-doc-stamp-formula').textContent = `= Fixed Amount`;
    
    document.getElementById('ps-processing-charge').textContent = formatCurrency(results.importProcessingCharge);
    document.getElementById('ps-processing-charge-formula').textContent = `= Based on DV Bracket (${formatCurrency(results.dutiableValue)})`;
    
    document.getElementById('ps-landed-cost').textContent = formatCurrency(results.landedCost);
    document.getElementById('ps-landed-cost-formula').textContent = `= ${formatCurrency(results.dutiableValue)} + ${formatCurrency(results.customsDuties)} + ${formatCurrency(results.docStamp)} + ${formatCurrency(results.importProcessingCharge)}`;
    
    document.getElementById('ps-excise-tax').textContent = formatCurrency(results.exciseTax);
    document.getElementById('ps-excise-tax-formula').textContent = `= From Excise Input`;
    
    document.getElementById('ps-vat').textContent = formatCurrency(results.vat);
    document.getElementById('ps-vat-formula').textContent = `= (${formatCurrency(results.landedCost)} + ${formatCurrency(results.exciseTax)}) × 12%`;
    
    document.getElementById('ps-surcharge').textContent = formatCurrency(results.surcharge);
    document.getElementById('ps-surcharge-formula').textContent = `= ${formatCurrency(results.landedCost)} × 30%`;

    // Update surcharge styling if not included
    const surchargeElement = document.getElementById('ps-surcharge').parentElement;
    if (!results.includeSurcharge) {
        surchargeElement.style.opacity = '0.5';
        surchargeElement.title = 'Surcharge is not included';
    } else {
        surchargeElement.style.opacity = '1';
        surchargeElement.title = '';
    }

    // Summary of Payment Breakdown
    document.getElementById('ps-summary-duties').textContent = formatCurrencyWholeNumber(results.customsDuties);
    document.getElementById('ps-summary-vat').textContent = formatCurrencyWholeNumber(results.vat);
    document.getElementById('ps-summary-stamp').textContent = formatCurrencyWholeNumber(results.docStamp);
    document.getElementById('ps-summary-charge').textContent = formatCurrencyWholeNumber(results.importProcessingCharge);
    document.getElementById('ps-summary-excise').textContent = formatCurrencyWholeNumber(results.exciseTax);
    document.getElementById('ps-summary-surcharge').textContent = formatCurrencyWholeNumber(results.surcharge);
    document.getElementById('ps-total-due').textContent = formatCurrencyWholeNumber(results.totalAmountDue);
}

function resetPassengerServiceCalculator() {
    document.getElementById('ps-passenger-name').value = '';
    document.getElementById('ps-flight-no').value = '';
    document.getElementById('ps-commodity').value = '';
    document.getElementById('ps-currency').value = '';
    document.getElementById('ps-foreign-value').value = '';
    document.getElementById('ps-exchange-rate').value = '56.00';
    document.getElementById('ps-duty-rate').value = '';
    document.getElementById('ps-excise-amount').value = '';
    document.getElementById('ps-include-surcharge').checked = true;

    // Reset results
    document.getElementById('ps-dutiable-value').textContent = '₱0.00';
    document.getElementById('ps-dutiable-value-formula').textContent = '= 0.00 × 56.00';
    
    document.getElementById('ps-customs-duties').textContent = '₱0.00';
    document.getElementById('ps-customs-duties-formula').textContent = '= ₱0.00 × 0%';
    
    document.getElementById('ps-doc-stamp').textContent = '₱130.00';
    document.getElementById('ps-doc-stamp-formula').textContent = '= Fixed Amount';
    
    document.getElementById('ps-processing-charge').textContent = '₱0.00';
    document.getElementById('ps-processing-charge-formula').textContent = '= Based on DV Bracket';
    
    document.getElementById('ps-landed-cost').textContent = '₱0.00';
    document.getElementById('ps-landed-cost-formula').textContent = '= DV + Duties + Stamp + IPC';
    
    document.getElementById('ps-excise-tax').textContent = '₱0.00';
    document.getElementById('ps-excise-tax-formula').textContent = '= From Excise Input';
    
    document.getElementById('ps-vat').textContent = '₱0.00';
    document.getElementById('ps-vat-formula').textContent = '= (LC + Excise) × 12%';
    
    document.getElementById('ps-surcharge').textContent = '₱0.00';
    document.getElementById('ps-surcharge-formula').textContent = '= LC × 30%';

    document.getElementById('ps-summary-duties').textContent = '₱0.00';
    document.getElementById('ps-summary-vat').textContent = '₱0.00';
    document.getElementById('ps-summary-stamp').textContent = '₱130.00';
    document.getElementById('ps-summary-charge').textContent = '₱0.00';
    document.getElementById('ps-summary-excise').textContent = '₱0.00';
    document.getElementById('ps-summary-surcharge').textContent = '₱0.00';
    document.getElementById('ps-total-due').textContent = '₱0.00';

    // Reset surcharge styling
    const surchargeElement = document.getElementById('ps-surcharge').parentElement;
    surchargeElement.style.opacity = '1';
    surchargeElement.title = '';
}

// Utility function to format currency
function formatCurrency(value) {
    return '₱' + parseFloat(value).toLocaleString('en-PH', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function formatCurrencyWholeNumber(value) {
    return '₱' + Math.round(parseFloat(value)).toLocaleString('en-PH', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    });
}

// ==========================================
// COMPUTATION HISTORY FUNCTIONS
// ==========================================

function addToActivityTimeline(activityType, data) {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;

    let activityContent = '';
    let activityTitle = '';

    if (activityType === 'passenger-service') {
        activityTitle = 'Passenger Service Calculation';
        activityContent = `Calculated service for ${data.passengerName || 'passenger'} - ${formatCurrency(data.totalAmountDue)}`;
    } else if (activityType && activityType.startsWith('excise-')) {
        const typeLabel = activityType.replace('excise-', '').replace(/-/g, ' ').toUpperCase();
        activityTitle = `Excise Tax - ${typeLabel}`;
        const totalValue = data.total !== undefined ? data.total : data.excise;
        activityContent = `Calculated excise tax: ${formatCurrencyWholeNumber(totalValue || 0)}`;
    } else if (activityType === 'hs-code-finder') {
        activityTitle = 'HS Code Lookup';
        activityContent = `Found HS code ${data.hsCode || 'Not found'} for ${data.description || 'commodity'}`;
    }

    if (activityContent) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-time">${new Date().toLocaleString('en-PH', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })}</div>
            <div class="activity-content">
                <strong>${activityTitle}:</strong> ${activityContent}
            </div>
        `;

        // Insert at the beginning of the timeline
        timeline.insertBefore(activityItem, timeline.firstChild);

        // Keep only the most recent 10 activities
        while (timeline.children.length > 10) {
            timeline.removeChild(timeline.lastChild);
        }
    }
}

function printPassengerServiceCalculation() {
    const passengerName = document.getElementById('ps-passenger-name').value || 'N/A';
    const flightNo = document.getElementById('ps-flight-no').value || 'N/A';
    const commodity = document.getElementById('ps-commodity').value || 'N/A';
    const currency = document.getElementById('ps-currency').value || 'N/A';
    const foreignValue = parseFloat(document.getElementById('ps-foreign-value').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('ps-exchange-rate').value) || 56.00;
    const dutyRate = parseFloat(document.getElementById('ps-duty-rate').value) || 0;
    
    // Get current calculated values
    const dutiableValue = parseFloat(document.getElementById('ps-dutiable-value').textContent.replace(/[₱,]/g, '')) || 0;
    const customsDuties = parseFloat(document.getElementById('ps-customs-duties').textContent.replace(/[₱,]/g, '')) || 0;
    const docStamp = parseFloat(document.getElementById('ps-doc-stamp').textContent.replace(/[₱,]/g, '')) || 0;
    const importProcessingCharge = parseFloat(document.getElementById('ps-processing-charge').textContent.replace(/[₱,]/g, '')) || 0;
    const landedCost = parseFloat(document.getElementById('ps-landed-cost').textContent.replace(/[₱,]/g, '')) || 0;
    const exciseTax = parseFloat(document.getElementById('ps-excise-tax').textContent.replace(/[₱,]/g, '')) || 0;
    const vat = parseFloat(document.getElementById('ps-vat').textContent.replace(/[₱,]/g, '')) || 0;
    const surcharge = parseFloat(document.getElementById('ps-surcharge').textContent.replace(/[₱,]/g, '')) || 0;
    const totalAmountDue = parseFloat(document.getElementById('ps-total-due').textContent.replace(/[₱,]/g, '')) || 0;
    const includeSurcharge = document.getElementById('ps-include-surcharge').checked;
    
    const printWindow = window.open('', '', 'width=1000,height=800');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Computation Receipt - ${passengerName}</title>
            <style>
                * { box-sizing: border-box; }
                html, body { 
                    margin: 0; 
                    padding: 0; 
                    font-family: Arial, sans-serif; 
                }
                body { 
                    margin: 10px; 
                    padding: 10px;
                    background-color: #fff;
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 10px; 
                }
                .logo-section { 
                    text-align: center; 
                    margin-bottom: 5px; 
                }
                .logo-image { 
                    height: 70px; 
                    width: auto; 
                    margin-bottom: 2px;
                    max-width: 100%;
                }
                .header h1 { 
                    margin: 5px 0 2px 0; 
                    color: #2c3e50; 
                    font-size: clamp(16px, 5vw, 24px);
                }
                .header p { 
                    margin: 3px 0; 
                    color: #666; 
                    font-size: clamp(12px, 3vw, 14px);
                }
                .section { 
                    margin: 15px 0; 
                    padding: 0 10px;
                }
                .section-title { 
                    font-weight: bold; 
                    font-size: clamp(12px, 4vw, 15px);
                    border-bottom: 1px solid #ddd; 
                    padding-bottom: 5px; 
                    margin-bottom: 8px; 
                }
                .row { 
                    display: flex; 
                    justify-content: space-between; 
                    flex-wrap: wrap;
                    padding: 6px 0; 
                    border-bottom: 1px solid #eee; 
                    font-size: clamp(11px, 3vw, 13px);
                }
                .label { 
                    font-weight: 500;
                    flex: 1;
                    word-break: break-word;
                }
                .value { 
                    text-align: right;
                    margin-left: 10px;
                    white-space: nowrap;
                }
                .highlight-row { 
                    background-color: #f0f8ff; 
                    padding: 8px; 
                    margin: 10px 0; 
                    border-left: 3px solid #3498db;
                }
                .total-row { 
                    background-color: #f0f0f0; 
                    padding: 8px; 
                    font-weight: bold; 
                    font-size: clamp(13px, 4vw, 16px);
                    margin-top: 10px;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 20px; 
                    color: #666; 
                    font-size: clamp(10px, 2vw, 12px);
                }
                
                @media print {
                    body { margin: 0; padding: 0; }
                    .container { max-width: 100%; }
                    .header { page-break-after: avoid; }
                    .section { page-break-inside: avoid; }
                }
                
                @media screen and (max-width: 768px) {
                    body { margin: 5px; padding: 5px; }
                    .section { padding: 0 5px; }
                    .row { padding: 4px 0; }
                    .value { margin-left: 5px; }
                }
                
                @media screen and (max-width: 480px) {
                    body { margin: 3px; padding: 3px; }
                    .header { margin-bottom: 15px; }
                    .section { padding: 0 3px; margin: 10px 0; }
                    .row { flex-direction: column; padding: 3px 0; }
                    .value { text-align: left; margin-left: 0; margin-top: 3px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-section">
                        <img src="${window.location.origin}${window.location.pathname.replace('index.html', '')}images/logo only.png" alt="Logo" class="logo-image" onerror="this.style.display='none'">
                    </div>
                    <h1>Andaya-Cutanda Customs Brokerage</h1>
                    <p>Passenger Service Calculator Receipt</p>
                    <p>Date: ${new Date().toLocaleString('en-PH')}</p>
                </div>
            
                <div class="section">
                    <div class="section-title">Passenger Information</div>
                    <div class="row">
                        <span class="label">Passenger Name:</span>
                        <span class="value">${passengerName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Flight No:</span>
                        <span class="value">${flightNo}</span>
                    </div>
                    <div class="row">
                        <span class="label">Commodity:</span>
                        <span class="value">${commodity}</span>
                    </div>
                    <div class="row">
                        <span class="label">Currency:</span>
                        <span class="value">${currency}</span>
                    </div>
                    <div class="row">
                        <span class="label">Foreign Currency Value:</span>
                        <span class="value">${formatCurrency(foreignValue)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Bureau of Customs ROE:</span>
                        <span class="value">${exchangeRate.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Computation Breakdown</div>
                    <div class="row">
                        <span class="label">Dutiable Value:</span>
                        <span class="value">${formatCurrency(dutiableValue)}</span>
                    </div>
                    <div style="color: #999; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #eee;">= ${foreignValue.toFixed(2)} × ${exchangeRate.toFixed(2)}</div>
                    <div class="row">
                        <span class="label">Customs Duties:</span>
                        <span class="value">${formatCurrency(customsDuties)}</span>
                    </div>
                    <div style="color: #999; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #eee;">= ${formatCurrency(dutiableValue)} × ${dutyRate}%</div>
                    <div class="row">
                        <span class="label">Customs Documentary Stamp:</span>
                        <span class="value">${formatCurrency(docStamp)}</span>
                    </div>
                    <div style="color: #999; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #eee;">= Fixed Amount</div>
                    <div class="row">
                        <span class="label">Import Processing Charge:</span>
                        <span class="value">${formatCurrency(importProcessingCharge)}</span>
                    </div>
                    <div style="color: #999; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #eee;">= Based on DV Bracket (${formatCurrency(dutiableValue)})</div>
                    <div class="highlight-row">
                        <div class="row">
                            <span class="label">Landed Cost:</span>
                            <span class="value">${formatCurrency(landedCost)}</span>
                        </div>
                        <div style="color: #999; font-size: 12px; padding: 4px 0; margin-top: 4px;">= ${formatCurrency(dutiableValue)} + ${formatCurrency(customsDuties)} + ${formatCurrency(docStamp)} + ${formatCurrency(importProcessingCharge)}</div>
                    </div>
                    <div class="row">
                        <span class="label">Excise Tax:</span>
                        <span class="value">${formatCurrency(exciseTax)}</span>
                    </div>
                    <div style="color: #999; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #eee;">= From Excise Input</div>
                    <div class="highlight-row">
                        <div class="row">
                            <span class="label">Value Added Tax (12%):</span>
                            <span class="value">${formatCurrency(vat)}</span>
                        </div>
                        <div style="color: #999; font-size: 12px; padding: 4px 0; margin-top: 4px;">= (${formatCurrency(landedCost)} + ${formatCurrency(exciseTax)}) × 12%</div>
                    </div>
                    <div class="row">
                        <span class="label">Surcharge (30%):</span>
                        <span class="value">${includeSurcharge ? formatCurrency(surcharge) : '₱0.00 (Not Included)'}</span>
                    </div>
                    <div style="color: #999; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #eee;">= ${formatCurrency(landedCost)} × 30%</div>
                </div>
                
                <div class="section">
                    <div class="section-title">Summary of Payment</div>
                    <div class="row">
                        <span class="label">Customs Duties:</span>
                        <span class="value">${formatCurrency(customsDuties)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Value Added Tax:</span>
                        <span class="value">${formatCurrency(vat)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Customs Documentary Stamp:</span>
                        <span class="value">${formatCurrency(docStamp)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Import Processing Charge:</span>
                        <span class="value">${formatCurrency(importProcessingCharge)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Excise Tax:</span>
                        <span class="value">${formatCurrency(exciseTax)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Surcharge:</span>
                        <span class="value">${formatCurrency(surcharge)}</span>
                    </div>
                    <div class="total-row">
                        <div class="row">
                            <span>Total Duties, Taxes & Other Charges:</span>
                            <span>${formatCurrency(totalAmountDue)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is a computer-generated receipt. For official documents, please contact our office.</p>
                </div>
            </div>
            
            <script>
                window.addEventListener('load', function() {
                    window.print();
                    window.close();
                });
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// HS Code Finder helper functions
async function calculateHSCodeFinder() {
    const description = document.getElementById('hscf-description').value.trim();
    const resultWrapper = document.getElementById('hscf-result');
    const resultCommodity = document.getElementById('hscf-result-commodity');
    const resultHs = document.getElementById('hscf-result-hs');
    const button = document.getElementById('hscf-button');
    const loading = document.getElementById('hscf-loading');

    if (!description) {
        alert('Please enter a commodity description.');
        return;
    }

    // Show loading state
    button.disabled = true;
    button.textContent = 'Searching...';
    loading.style.display = 'block';
    resultWrapper.style.display = 'none';

    try {
        // Simulate internet lookup with delay
        const hsCode = await getHSCodeByDescription(description);
        
        resultCommodity.textContent = description;
        resultHs.textContent = hsCode || 'Not found';
        resultWrapper.style.display = 'block';
        
        addToActivityTimeline('hs-code-finder', {
            description,
            hsCode,
            computedAt: new Date().toLocaleString('en-PH')
        });

        logActivity('hs-code', 'HS Code Search', `Searched for "${description}" - Found: ${hsCode || 'Not found'}`);
    } catch (error) {
        resultCommodity.textContent = description;
        resultHs.textContent = 'Error: Unable to fetch data';
        resultWrapper.style.display = 'block';
        console.error('HS Code lookup error:', error);
    } finally {
        // Reset loading state
        button.disabled = false;
        button.textContent = 'Find HS Code';
        loading.style.display = 'none';
    }
}

async function getHSCodeByDescription(description) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Philippine AHTN 2022 HS codes database (based on tariffcommission.gov.ph/tariff-book-2022)
    const descriptions = {
        // Chapter 1: Live animals
        'live horses': '0101.21',
        'live cattle': '0102.21',
        'live swine': '0103.10',
        'live sheep': '0104.10',
        'live poultry': '0105.11',
        
        // Chapter 2: Meat and edible meat offal
        'fresh beef': '0201.10',
        'frozen beef': '0202.10',
        'fresh pork': '0203.11',
        'frozen pork': '0203.21',
        'fresh chicken': '0207.11',
        'frozen chicken': '0207.14',
        
        // Chapter 3: Fish and crustaceans
        'fresh salmon': '0302.11',
        'frozen salmon': '0303.11',
        'fresh tuna': '0302.31',
        'frozen tuna': '0303.41',
        'shrimps': '0306.17',
        'crabs': '0306.14',
        
        // Chapter 4: Dairy produce
        'milk powder': '0402.21',
        'cheese': '0406.10',
        'butter': '0405.10',
        'yogurt': '0403.10',
        
        // Chapter 5: Products of animal origin
        'eggs': '0407.00',
        'honey': '0409.00',
        
        // Chapter 6-8: Vegetables and fruits
        'potatoes': '0701.90',
        'tomatoes': '0702.00',
        'onions': '0703.10',
        'garlic': '0703.20',
        'carrots': '0706.10',
        'bananas': '0803.00',
        'pineapples': '0804.30',
        'mangoes': '0804.50',
        'coconuts': '0801.11',
        'apples': '0808.10',
        'oranges': '0805.10',
        
        // Chapter 9: Coffee, tea, spices
        'coffee beans': '0901.11',
        'coffee roasted': '0901.21',
        'tea': '0902.10',
        'black pepper': '0904.11',
        'cinnamon': '0906.10',
        
        // Chapter 10: Cereals
        'wheat': '1001.11',
        'rice': '1006.20',
        'maize': '1005.10',
        'barley': '1003.00',
        'oats': '1004.00',
        
        // Chapter 11: Milling products
        'wheat flour': '1101.00',
        'rice flour': '1102.90',
        'corn flour': '1102.20',
        
        // Chapter 12: Oil seeds
        'soybeans': '1201.00',
        'peanuts': '1202.41',
        'sunflower seeds': '1206.00',
        'coconut oil': '1513.11',
        'palm oil': '1511.10',
        
        // Chapter 15: Animal/vegetable fats and oils
        'olive oil': '1509.10',
        'soybean oil': '1507.10',
        'corn oil': '1515.21',
        
        // Chapter 16-18: Prepared foodstuffs
        'sausages': '1601.00',
        'canned tuna': '1604.14',
        'chocolate': '1806.32',
        'cocoa powder': '1805.00',
        
        // Chapter 17: Sugars
        'white sugar': '1701.11',
        'brown sugar': '1701.13',
        
        // Chapter 19: Cereal preparations
        'pasta': '1902.11',
        'bread': '1905.10',
        'biscuits': '1905.31',
        'cakes': '1905.90',
        
        // Chapter 20: Vegetable preparations
        'tomato paste': '2002.90',
        'fruit juices': '2009.11',
        'vegetable pickles': '2001.90',
        
        // Chapter 21: Miscellaneous edible preparations
        'soups': '2104.10',
        'sauces': '2103.10',
        'mayonnaise': '2103.90',
        
        // Chapter 22: Beverages
        'mineral water': '2201.10',
        'beer': '2203.00',
        'wine': '2204.21',
        'spirits': '2208.20',
        
        // Chapter 23: Food industry residues
        'animal feed': '2309.90',
        
        // Chapter 24: Tobacco
        'cigarettes': '2402.20',
        'cigars': '2402.10',
        
        // Chapter 25: Salt and minerals
        'salt': '2501.00',
        'cement': '2523.29',
        'gypsum': '2520.20',
        
        // Chapter 26: Ores
        'iron ore': '2601.11',
        'copper ore': '2603.00',
        'gold ore': '2616.90',
        
        // Chapter 27: Mineral fuels
        'crude oil': '2709.00',
        'diesel': '2710.19',
        'gasoline': '2710.12',
        'coal': '2701.11',
        
        // Chapter 28-29: Chemicals
        'sodium hydroxide': '2815.11',
        'ammonia': '2814.10',
        'fertilizers': '3102.10',
        'pesticides': '3808.91',
        
        // Chapter 30: Pharmaceutical products
        'medicines': '3004.10',
        'vaccines': '3002.20',
        
        // Chapter 31: Fertilizers
        'urea': '3102.10',
        'phosphate fertilizers': '3103.10',
        
        // Chapter 32-38: Chemical products
        'paints': '3208.10',
        'inks': '3215.11',
        'cosmetics': '3304.10',
        'soaps': '3401.11',
        'detergents': '3402.20',
        
        // Chapter 39: Plastics
        'plastic sheets': '3920.10',
        'plastic bottles': '3923.30',
        'plastic pipes': '3917.23',
        
        // Chapter 40: Rubber
        'tires': '4011.10',
        'rubber gloves': '4015.11',
        
        // Chapter 41-43: Leather and furs
        'leather': '4104.11',
        'handbags': '4202.21',
        'belts': '4203.30',
        
        // Chapter 44: Wood
        'lumber': '4407.11',
        'plywood': '4412.31',
        'wood furniture': '9403.30',
        
        // Chapter 47-49: Paper products
        'newsprint': '4801.00',
        'printing paper': '4802.55',
        'books': '4901.10',
        'newspapers': '4902.10',
        
        // Chapter 50-63: Textiles
        'cotton yarn': '5205.11',
        'cotton fabric': '5208.11',
        'wool fabric': '5111.11',
        'synthetic yarn': '5402.33',
        'carpets': '5702.42',
        't-shirts': '6109.10',
        'trousers': '6203.42',
        'bed linen': '6302.21',
        
        // Chapter 64: Footwear
        'shoes': '6403.19',
        'sandals': '6402.20',
        'boots': '6402.91',
        
        // Chapter 69-70: Ceramics and glass
        'ceramic tiles': '6907.21',
        'glass bottles': '7010.90',
        'glassware': '7013.28',
        
        // Chapter 71: Precious stones and metals
        'gold': '7108.11',
        'diamonds': '7102.31',
        'jewelry': '7113.19',
        
        // Chapter 72-83: Metals and metal products
        'steel bars': '7214.20',
        'steel sheets': '7209.15',
        'aluminum foil': '7607.11',
        'copper wire': '7408.11',
        'nails': '7317.00',
        'screws': '7318.15',
        'tools': '8205.59',
        'cutlery': '8211.91',
        
        // Chapter 84-85: Machinery and electronics
        'pumps': '8413.11',
        'engines': '8407.34',
        'generators': '8501.31',
        'computers': '8471.30',
        'printers': '8443.32',
        'telephones': '8517.12',
        'televisions': '8528.72',
        'refrigerators': '8418.10',
        'washing machines': '8450.20',
        'air conditioners': '8415.10',
        
        // Chapter 86-89: Vehicles and vessels
        'cars': '8703.21',
        'motorcycles': '8711.10',
        'bicycles': '8712.00',
        'aircraft': '8802.40',
        'ships': '8901.10',
        
        // Chapter 90-92: Instruments and equipment
        'cameras': '9006.10',
        'microscopes': '9011.10',
        'watches': '9102.11',
        'musical instruments': '9207.10',
        
        // Chapter 94-96: Furniture and miscellaneous
        'seats': '9401.61',
        'tables': '9403.30',
        'lamps': '9405.21',
        'toys': '9503.00',
        'sports equipment': '9506.91',
        'buttons': '9606.21',
        'brushes': '9603.21'
    };

    const normalized = description.toLowerCase().trim();
    
    // Exact match first
    if (descriptions[normalized]) {
        return descriptions[normalized];
    }
    
    // Partial match
    for (const [desc, code] of Object.entries(descriptions)) {
        if (desc.includes(normalized) || normalized.includes(desc)) {
            return code;
        }
    }
    
    // Fuzzy match - check if words match
    const words = normalized.split(' ');
    for (const [desc, code] of Object.entries(descriptions)) {
        const descWords = desc.split(' ');
        if (words.some(word => descWords.some(dword => dword.includes(word) || word.includes(dword)))) {
            return code;
        }
    }
    
    return null;
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    setupSidebarToggle();
    setupSidebarNavigation();
    setupViewAllButton();
    setupCardInteractions();
    setupTableInteractions();
    setupCalculatorCards();
    setupProfileMenu();
    initializeLogin();
    initializeChangePassword();
    displayActivityLog();
    // Do not show login overlay here, it's always visible until login
    // showLoginOverlay();
    
    // Animate metrics with a slight delay
    setTimeout(animateMetrics, 300);
});

// Update date every minute
setInterval(updateDate, 60000);

// User login records
const users = [
    { username: 'Jasper Villaceran', firstName: 'Jasper', gender: 'Boy', password: 'Jasper' },
    { username: 'Violeta Labaclado', firstName: 'Violeta', gender: 'Girl', password: 'Violeta' },
    { username: 'Benjie Arreglo', firstName: 'Benjie', gender: 'Boy', password: 'Benjie' },
    { username: 'Divina Arreglo', firstName: 'Divina', gender: 'Girl', password: 'Divina' },
    { username: 'Juanito Matulac', firstName: 'Juanito', gender: 'Boy', password: 'Juanito' },
    { username: 'Chienna Rell Langutan', firstName: 'Chienna', gender: 'Girl', password: 'Chienna' },
    { username: 'John Benedict Andaya', firstName: 'John', gender: 'Boy', password: 'John' },
    { username: 'Dreijao.234', firstName: 'Dreijao', gender: 'Boy', password: 'Dextercutandaja345', displayName: 'Admin' }
];

let currentUser = null;

function showLoginOverlay() {
    if (currentUser) return; // already logged in
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'flex';
    }
}

function hideLoginOverlay() {
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'none';
    }
}

function setupProfileMenu() {
    const loginBtn = document.getElementById('profile-login-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');
    const changePasswordBtn = document.getElementById('profile-change-password-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showLoginOverlay();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutUser();
        });
    }

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            showChangePasswordModal();
        });
    }

    updateProfileUI();
}

function updateProfileUI() {
    const display = document.getElementById('profile-display');
    const loginBtn = document.getElementById('profile-login-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');
    const changePasswordBtn = document.getElementById('profile-change-password-btn');

    if (!display || !loginBtn || !logoutBtn || !changePasswordBtn) return;

    if (!currentUser) {
        display.textContent = 'Not logged in';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        changePasswordBtn.style.display = 'none';
    } else {
        const title = currentUser.displayName || (currentUser.gender === 'Girl' ? 'Maam' : 'Sir');
        display.textContent = `${title} ${currentUser.firstName}`;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        changePasswordBtn.style.display = 'inline-block';
    }
}

function setCurrentUser(user) {
    currentUser = user;
    updateProfileUI();
    hideLoginOverlay();
    showDashboard();
}

function logoutUser() {
    currentUser = null;
    updateProfileUI();
    hideDashboard();
    showLoginOverlay();
}

function showDashboard() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'block';
    }
}

function hideDashboard() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'none';
    }
}

function showChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.classList.add('active');
        setupModalClose(modal);
    }
}

function initializeChangePassword() {
    const form = document.getElementById('change-password-form');
    const error = document.getElementById('change-password-error');

    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (!currentUser) {
            error.textContent = 'No user logged in.';
            error.style.display = 'block';
            return;
        }

        if (currentPassword !== currentUser.password) {
            error.textContent = 'Current password is incorrect.';
            error.style.display = 'block';
            return;
        }

        if (newPassword !== confirmPassword) {
            error.textContent = 'New passwords do not match.';
            error.style.display = 'block';
            return;
        }

        if (newPassword.length < 4) {
            error.textContent = 'New password must be at least 4 characters.';
            error.style.display = 'block';
            return;
        }

        // Update password
        currentUser.password = newPassword;
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
        }

        // Log for admin (you can check console or store elsewhere)
        console.log(`Password changed for ${currentUser.username}: new password is "${newPassword}"`);

        error.style.display = 'none';
        alert('Password changed successfully!');
        document.getElementById('change-password-modal').classList.remove('active');
        form.reset();
    });
}

function initializeLogin() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (!loginForm) return;

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const usernameInput = document.getElementById('login-username').value.trim();
        const passwordInput = document.getElementById('login-password').value.trim();

        const user = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());

        if (user && passwordInput === user.password) {
            setCurrentUser(user);
            if (loginError) loginError.style.display = 'none';
        } else {
            if (loginError) loginError.style.display = 'block';
        }
    });
}

// ==========================================
// EXCISE TAX CALCULATOR FUNCTIONS
// ==========================================

function calculateDistilledSpirits() {
    const totalLiters = parseFloat(document.getElementById('ds-total-liters').value) || 0;
    const proof = parseFloat(document.getElementById('ds-proof').value) || 0;
    const totalBottles = parseFloat(document.getElementById('ds-total-bottles').value) || 0;
    const nrpBottle = parseFloat(document.getElementById('ds-nrp-bottle').value) || 0;

    // ST = Total Liters × Proof% × ₱74.16
    const st = totalLiters * (proof / 100) * 74.16;

    // AVT = Total Bottles × NRP/Bottle × Proof% × 22%
    const avt = totalBottles * nrpBottle * (proof / 100) * 0.22;

    // Total Excise = ST + AVT
    const total = st + avt;

    // Display results
    document.getElementById('ds-st').textContent = formatCurrencyWholeNumber(st);
    document.getElementById('ds-st-formula').textContent = `= ${totalLiters.toFixed(2)} × ${proof.toFixed(2)}% × ₱74.16`;
    document.getElementById('ds-avt').textContent = formatCurrencyWholeNumber(avt);
    document.getElementById('ds-avt-formula').textContent = `= ${totalBottles} × ${formatCurrency(nrpBottle)} × ${proof.toFixed(2)}% × 22%`;
    document.getElementById('ds-total').textContent = formatCurrencyWholeNumber(total);
    document.getElementById('ds-total-formula').textContent = `= ${formatCurrencyWholeNumber(st)} + ${formatCurrencyWholeNumber(avt)}`;
    document.getElementById('ds-total-display').textContent = formatCurrencyWholeNumber(total);

    document.getElementById('ds-results').style.display = 'block';

    addToActivityTimeline('excise-distilled-spirits', {
        totalLiters,
        proof,
        totalBottles,
        nrpBottle,
        st,
        avt,
        total
    });

    logActivity('calculator', 'Excise Tax - Distilled Spirits', `Calculated Total: ₱${total.toFixed(2)}`);
}

function calculateWines() {
    const totalLiters = parseFloat(document.getElementById('wines-total-liters').value) || 0;

    // Excise = Total Liters × ₱70.92
    const excise = totalLiters * 70.92;

    // Display results
    document.getElementById('wines-total').textContent = formatCurrencyWholeNumber(excise);
    document.getElementById('wines-formula').textContent = `= ${totalLiters.toFixed(2)} × ₱70.92`;
    document.getElementById('wines-total-display').textContent = formatCurrencyWholeNumber(excise);

    document.getElementById('wines-results').style.display = 'block';

    addToActivityTimeline('excise-wines', {
        totalLiters,
        excise
    });

    logActivity('calculator', 'Excise Tax - Wines', `Calculated Total: ₱${excise.toFixed(2)}`);
}

function calculateFermentedLiquor() {
    const totalLiters = parseFloat(document.getElementById('fl-total-liters').value) || 0;

    // Excise = Total Liters × ₱48.31
    const excise = totalLiters * 48.31;

    // Display results
    document.getElementById('fl-total').textContent = formatCurrencyWholeNumber(excise);
    document.getElementById('fl-formula').textContent = `= ${totalLiters.toFixed(2)} × ₱48.31`;
    document.getElementById('fl-total-display').textContent = formatCurrencyWholeNumber(excise);

    document.getElementById('fl-results').style.display = 'block';

    addToActivityTimeline('excise-fermented-liquor', {
        totalLiters,
        excise
    });

    logActivity('calculator', 'Excise Tax - Fermented Liquor', `Calculated Total: ₱${excise.toFixed(2)}`);
}

function calculateEthylAlcohol() {
    const totalLiters = parseFloat(document.getElementById('ea-total-liters').value) || 0;
    const proof = parseFloat(document.getElementById('ea-proof').value) || 0;
    const dv = parseFloat(document.getElementById('ea-dv').value) || 0;

    // ST = Total Liters × Proof% × ₱74.16
    const st = totalLiters * (proof / 100) * 74.16;

    // AVT = DV × Proof% × 22%
    const avt = dv * (proof / 100) * 0.22;

    // Total Excise = ST + AVT
    const total = st + avt;

    // Display results
    document.getElementById('ea-st').textContent = formatCurrencyWholeNumber(st);
    document.getElementById('ea-st-formula').textContent = `= ${totalLiters.toFixed(2)} × ${proof.toFixed(2)}% × ₱74.16`;
    document.getElementById('ea-avt').textContent = formatCurrencyWholeNumber(avt);
    document.getElementById('ea-avt-formula').textContent = `= ${formatCurrency(dv)} × ${proof.toFixed(2)}% × 22%`;
    document.getElementById('ea-total').textContent = formatCurrencyWholeNumber(total);
    document.getElementById('ea-total-formula').textContent = `= ${formatCurrencyWholeNumber(st)} + ${formatCurrencyWholeNumber(avt)}`;
    document.getElementById('ea-total-display').textContent = formatCurrencyWholeNumber(total);

    document.getElementById('ea-results').style.display = 'block';

    addToActivityTimeline('excise-ethyl-alcohol', {
        totalLiters,
        proof,
        dv,
        st,
        avt,
        total
    });

    logActivity('calculator', 'Excise Tax - Ethyl Alcohol', `Calculated Total: ₱${total.toFixed(2)}`);
}

function calculateMetallicMinerals() {
    const dv = parseFloat(document.getElementById('mm-dv').value) || 0;

    // Excise = DV × 4%
    const excise = dv * 0.04;

    // Display results
    document.getElementById('mm-total').textContent = formatCurrencyWholeNumber(excise);
    document.getElementById('mm-formula').textContent = `= ${formatCurrency(dv)} × 4%`;
    document.getElementById('mm-total-display').textContent = formatCurrencyWholeNumber(excise);

    document.getElementById('mm-results').style.display = 'block';

    addToActivityTimeline('excise-metallic-minerals', {
        dv,
        excise
    });

    logActivity('calculator', 'Excise Tax - Metallic Minerals', `Calculated Total: ₱${excise.toFixed(2)}`);
}

function calculateNonEssentials() {
    const dv = parseFloat(document.getElementById('ne-dv').value) || 0;

    // Excise = DV × 20%
    const excise = dv * 0.20;

    // Display results
    document.getElementById('ne-total').textContent = formatCurrencyWholeNumber(excise);
    document.getElementById('ne-formula').textContent = `= ${formatCurrency(dv)} × 20%`;
    document.getElementById('ne-total-display').textContent = formatCurrencyWholeNumber(excise);

    document.getElementById('ne-results').style.display = 'block';

    addToActivityTimeline('excise-non-essentials', {
        dv,
        excise
    });

    logActivity('calculator', 'Excise Tax - Non-essentials', `Calculated Total: ₱${excise.toFixed(2)}`);
}

function calculateCigarettes() {
    const totalPacks = parseFloat(document.getElementById('cig-total-packs').value) || 0;

    // Excise = Total Packs × ₱72.9303
    const excise = totalPacks * 72.9303;

    // Display results
    document.getElementById('cig-total').textContent = formatCurrencyWholeNumber(excise);
    document.getElementById('cig-formula').textContent = `= ${totalPacks} × ₱72.9303`;
    document.getElementById('cig-total-display').textContent = formatCurrencyWholeNumber(excise);

    document.getElementById('cig-results').style.display = 'block';

    addToActivityTimeline('excise-cigarettes', {
        totalPacks,
        excise
    });

    logActivity('calculator', 'Excise Tax - Cigarettes', `Calculated Total: ₱${excise.toFixed(2)}`);
}

function calculateCigars() {
    const totalCigars = parseFloat(document.getElementById('cigars-total').value) || 0;
    const nrpCigar = parseFloat(document.getElementById('cigars-nrp').value) || 0;

    // AVT = Total Cigars × NRP/Cigar × 0.20
    const avt = totalCigars * nrpCigar * 0.20;

    // ST = Total Cigars × ₱8.9716
    const st = totalCigars * 8.9716;

    // Total Excise = AVT + ST
    const total = avt + st;

    // Display results
    document.getElementById('cigars-avt').textContent = formatCurrencyWholeNumber(avt);
    document.getElementById('cigars-avt-formula').textContent = `= ${totalCigars} × ${formatCurrencyWholeNumber(nrpCigar)} × 0.20`;
    document.getElementById('cigars-st').textContent = formatCurrencyWholeNumber(st);
    document.getElementById('cigars-st-formula').textContent = `= ${totalCigars} × ₱8.9716`;
    document.getElementById('cigars-total').textContent = formatCurrencyWholeNumber(total);
    document.getElementById('cigars-total-formula').textContent = `= ${formatCurrencyWholeNumber(avt)} + ${formatCurrencyWholeNumber(st)}`;
    document.getElementById('cigars-total-display').textContent = formatCurrencyWholeNumber(total);

    document.getElementById('cigars-results').style.display = 'block';

    addToActivityTimeline('excise-cigars', {
        totalCigars,
        nrpCigar,
        avt,
        st,
        total
    });

    logActivity('calculator', 'Excise Tax - Cigars', `Calculated Total: ₱${total.toFixed(2)}`);
}

function resetAllExciseCalculators() {
    // Reset all input fields
    const inputs = document.querySelectorAll('#excise-calculator-modal input');
    inputs.forEach(input => input.value = '');

    // Hide all results sections
    const results = document.querySelectorAll('#excise-calculator-modal .results-section');
    results.forEach(result => result.style.display = 'none');
}

function getFormalSeaInsurance(fob, type, manualValue) {
    if (type === 'manual') {
        return parseFloat(manualValue) || 0;
    }
    const rate = parseFloat(type) || 0;
    return fob * rate;
}

function getFormalSeaBrokerage(dv) {
    if (dv > 200000) return dv * 0.00125 + 5050;
    if (dv > 100000) return 5300;
    if (dv > 60000) return 4700;
    if (dv > 50000) return 4000;
    if (dv > 40000) return 3600;
    if (dv > 30000) return 3300;
    if (dv > 20000) return 2700;
    if (dv > 10000) return 2000;
    return 0;
}

function getFormalSeaImportProcessingCharge(dv) {
    if (dv > 750000) return 2000;
    if (dv > 500000) return 1500;
    if (dv > 250000) return 1000;
    if (dv > 50000) return 750;
    if (dv > 25000) return 500;
    if (dv >= 1) return 250;
    return 0;
}

function getContainerSecurityFee(type, count, roe) {
    const rateUSD = type === '40' ? 10 : 5;
    return count * rateUSD * roe;
}

function getFormalAirInsurance(foreignValue, type, manualValue) {
    if (type === 'manual') {
        return parseFloat(manualValue) || 0;
    }
    const rate = parseFloat(type) || 0;
    return foreignValue * rate;
}

function getFormalAirBrokerage(dv) {
    if (dv > 200000) return dv * 0.00125 + 5050;
    if (dv > 100000) return 5300;
    if (dv > 60000) return 4700;
    if (dv > 50000) return 4000;
    if (dv > 40000) return 3600;
    if (dv > 30000) return 3300;
    if (dv > 20000) return 2700;
    if (dv > 10000) return 2000;
    return 0;
}

function getFormalAirImportProcessingCharge(dv) {
    if (dv > 750000) return 2000;
    if (dv > 500000) return 1500;
    if (dv > 250000) return 1000;
    if (dv > 50000) return 750;
    if (dv > 25000) return 500;
    if (dv >= 1) return 250;
    return 0;
}

function calculateFormalSea() {
    const rateDuty = parseFloat(document.getElementById('fs-rate-duty').value) || 0;
    const isLc = document.getElementById('fs-is-lc').value === 'yes';
    const fob = parseFloat(document.getElementById('fs-fob').value) || 0;
    const insuranceType = document.getElementById('fs-insurance-type').value;
    const insuranceManual = parseFloat(document.getElementById('fs-insurance-manual').value) || 0;
    const freight = parseFloat(document.getElementById('fs-freight').value) || 0;
    const roe = parseFloat(document.getElementById('fs-roe').value) || 1;
    const containerType = document.getElementById('fs-container-type').value;
    const containerCount = parseInt(document.getElementById('fs-container-count').value) || 0;
    const arrastre = parseFloat(document.getElementById('fs-arrastre').value) || 0;
    const wharfage = parseFloat(document.getElementById('fs-wharfage').value) || 0;
    const exciseTax = parseFloat(document.getElementById('fs-excise-tax').value) || 0;
    const advanceDeposit = parseFloat(document.getElementById('fs-advance-deposit').value) || 0;

    const insurance = getFormalSeaInsurance(fob, insuranceType, insuranceManual);
    const cifForeign = fob + insurance + freight;
    const dutiableValue = cifForeign * roe;
    const customsDuty = dutiableValue * (rateDuty / 100);
    const bankCharge = isLc ? dutiableValue * 0.00125 : 0;
    const brokerageFee = getFormalSeaBrokerage(dutiableValue);
    const ipc = getFormalSeaImportProcessingCharge(dutiableValue);
    const docStamp = 130;
    const totalLanded = dutiableValue + customsDuty + bankCharge + brokerageFee + arrastre + wharfage + ipc + docStamp;
    const vatBase = totalLanded + exciseTax;
    const vat = vatBase * 0.12;
    const containerSecurity = getContainerSecurityFee(containerType, containerCount, roe);
    const totalCharges = customsDuty + vat + exciseTax + ipc + docStamp + containerSecurity;
    const netPayable = totalCharges - (isLc ? advanceDeposit : 0);

    document.getElementById('fs-cif').textContent = formatCurrency(cifForeign * roe);
    document.getElementById('fs-dv').textContent = formatCurrency(dutiableValue);
    document.getElementById('fs-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('fs-bank-charge').textContent = formatCurrency(bankCharge);
    document.getElementById('fs-brokerage').textContent = formatCurrency(brokerageFee);
    document.getElementById('fs-arrastre-out').textContent = formatCurrency(arrastre);
    document.getElementById('fs-wharfage-out').textContent = formatCurrency(wharfage);
    document.getElementById('fs-import-processing').textContent = formatCurrency(ipc);
    document.getElementById('fs-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('fs-total-landed').textContent = formatCurrency(totalLanded);
    document.getElementById('fs-vat-base').textContent = formatCurrency(vatBase);
    document.getElementById('fs-vat').textContent = formatCurrency(vat);
    document.getElementById('fs-summary-csfe').textContent = formatCurrency(containerSecurity);
    document.getElementById('fs-total-charges').textContent = formatCurrency(totalCharges);
    document.getElementById('fs-summary-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('fs-summary-vat').textContent = formatCurrency(vat);
    document.getElementById('fs-summary-excise').textContent = formatCurrency(exciseTax);
    document.getElementById('fs-summary-ipc').textContent = formatCurrency(ipc);
    document.getElementById('fs-summary-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('fs-summary-csfe').textContent = formatCurrency(containerSecurity);
    document.getElementById('fs-advance-deposit-out').textContent = formatCurrency(advanceDeposit);
    document.getElementById('fs-net-payable').textContent = formatCurrency(netPayable);

    addToActivityTimeline('formal-sea', {
        consignee: document.getElementById('fs-consignee').value,
        commodity: document.getElementById('fs-commodity').value,
        incoterm: document.getElementById('fs-incoterm').value,
        currency: document.getElementById('fs-currency').value,
        fob,
        insurance,
        freight,
        roe,
        dutiableValue,
        customsDuty,
        bankCharge,
        brokerageFee,
        arrastre,
        wharfage,
        ipc,
        docStamp,
        totalLanded,
        exciseTax,
        vat,
        containerSecurity,
        totalCharges,
        advanceDeposit,
        netPayable
    });

    logActivity('calculator', 'Formal Entry - Sea', `Calculated Total: ₱${totalCharges.toFixed(2)}`);
}

function calculateFormalAir() {
    const rateDuty = parseFloat(document.getElementById('fa-rate-duty').value) || 0;
    const isLc = document.getElementById('fa-is-lc').value === 'yes';
    const foreignValue = parseFloat(document.getElementById('fa-foreign-value').value) || 0;
    const insuranceType = document.getElementById('fa-insurance-type').value;
    const insuranceManual = parseFloat(document.getElementById('fa-insurance-manual').value) || 0;
    const freight = parseFloat(document.getElementById('fa-freight').value) || 0;
    const roe = parseFloat(document.getElementById('fa-roe').value) || 1;
    const exciseTax = parseFloat(document.getElementById('fa-excise-tax').value) || 0;
    const advanceDeposit = parseFloat(document.getElementById('fa-advance-deposit-lc').value) || 0;

    const insurance = getFormalAirInsurance(foreignValue, insuranceType, insuranceManual);
    const cif = foreignValue + insurance + freight;
    const dutiableValue = cif * roe;
    const customsDuty = dutiableValue * (rateDuty / 100);
    const bankCharge = isLc ? dutiableValue * 0.00125 : 0;
    const brokerageFee = getFormalAirBrokerage(dutiableValue);
    const ipc = getFormalAirImportProcessingCharge(dutiableValue);
    const docStamp = 130;
    const totalLanded = dutiableValue + customsDuty + bankCharge + brokerageFee + ipc + docStamp;
    const vatBase = totalLanded + exciseTax;
    const vat = vatBase * 0.12;
    const totalCharges = customsDuty + vat + exciseTax + ipc + docStamp;
    const netPayable = totalCharges - (isLc ? advanceDeposit : 0);

    document.getElementById('fa-cif').textContent = '$' + (cif).toFixed(2);
    document.getElementById('fa-dv').textContent = formatCurrency(dutiableValue);
    document.getElementById('fa-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('fa-bank-charge').textContent = formatCurrency(bankCharge);
    document.getElementById('fa-brokerage').textContent = formatCurrency(brokerageFee);
    document.getElementById('fa-import-processing').textContent = formatCurrency(ipc);
    document.getElementById('fa-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('fa-total-landed').textContent = formatCurrency(totalLanded);
    document.getElementById('fa-excise-tax-out').textContent = formatCurrency(exciseTax);
    document.getElementById('fa-vat-base').textContent = formatCurrency(vatBase);
    document.getElementById('fa-vat').textContent = formatCurrency(vat);
    document.getElementById('fa-total-charges').textContent = formatCurrency(totalCharges);
    document.getElementById('fa-summary-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('fa-summary-vat').textContent = formatCurrency(vat);
    document.getElementById('fa-summary-excise').textContent = formatCurrency(exciseTax);
    document.getElementById('fa-summary-ipc').textContent = formatCurrency(ipc);
    document.getElementById('fa-summary-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('fa-advance-deposit-out').textContent = formatCurrency(advanceDeposit);
    document.getElementById('fa-net-payable').textContent = formatCurrency(netPayable);

    addToActivityTimeline('formal-air', {
        consignee: document.getElementById('fa-consignee').value,
        commodity: document.getElementById('fa-commodity').value,
        incoterm: document.getElementById('fa-incoterm').value,
        currency: document.getElementById('fa-currency').value,
        foreignValue,
        insurance,
        freight,
        roe,
        dutiableValue,
        customsDuty,
        bankCharge,
        brokerageFee,
        ipc,
        docStamp,
        totalLanded,
        exciseTax,
        vat,
        totalCharges,
        advanceDeposit,
        netPayable
    });

    logActivity('calculator', 'Formal Entry - Air', `Calculated Total: ₱${totalCharges.toFixed(2)}`);
}

// INFORMAL ENTRY AIR CALCULATOR FUNCTIONS
function getInformalAirInsurance(fobValue, insuranceType, insuranceManual) {
    if (insuranceType === 'manual') return insuranceManual;
    if (insuranceType === '0') return 0;
    return fobValue * parseFloat(insuranceType);
}

function getInformalAirBrokerage(dv) {
    if (dv > 200000) return dv * 0.00125 + 5050;
    if (dv > 100000) return 5300;
    if (dv > 60000) return 4700;
    if (dv > 50000) return 4000;
    if (dv > 40000) return 3600;
    if (dv > 30000) return 3300;
    if (dv > 20000) return 2700;
    if (dv > 10000) return 2000;
    return 0;
}

function calculateInformalAir() {
    const rateDuty = parseFloat(document.getElementById('ia-rate-duty').value) || 0;
    const foreignValue = parseFloat(document.getElementById('ia-foreign-value').value) || 0;
    const insuranceType = document.getElementById('ia-insurance-type').value;
    const insuranceManual = parseFloat(document.getElementById('ia-insurance-manual').value) || 0;
    const freight = parseFloat(document.getElementById('ia-freight').value) || 0;
    const roe = parseFloat(document.getElementById('ia-roe').value) || 1;
    const exciseTax = parseFloat(document.getElementById('ia-excise-tax').value) || 0;

    const insurance = getInformalAirInsurance(foreignValue, insuranceType, insuranceManual);
    const cif = foreignValue + insurance + freight;
    const dutiableValue = cif * roe;
    const customsDuty = dutiableValue * (rateDuty / 100);
    const brokerageFee = getInformalAirBrokerage(dutiableValue);
    const docStamp = 130;
    const totalLanded = dutiableValue + customsDuty + brokerageFee + docStamp;
    const vatBase = totalLanded + exciseTax;
    const vat = vatBase * 0.12;
    const totalCharges = customsDuty + vat + exciseTax + docStamp;

    document.getElementById('ia-cif').textContent = formatCurrency(cif);
    document.getElementById('ia-dv').textContent = formatCurrency(dutiableValue);
    document.getElementById('ia-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('ia-brokerage').textContent = formatCurrency(brokerageFee);
    document.getElementById('ia-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('ia-total-landed').textContent = formatCurrency(totalLanded);
    document.getElementById('ia-vat-base').textContent = formatCurrency(vatBase);
    document.getElementById('ia-vat').textContent = formatCurrency(vat);
    document.getElementById('ia-summary-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('ia-summary-vat').textContent = formatCurrency(vat);
    document.getElementById('ia-summary-excise').textContent = formatCurrency(exciseTax);
    document.getElementById('ia-summary-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('ia-total-payable').textContent = formatCurrency(totalCharges);

    addToActivityTimeline('informal-air', {
        consignee: document.getElementById('ia-consignee').value,
        commodity: document.getElementById('ia-commodity').value,
        incoterm: document.getElementById('ia-incoterm').value,
        currency: document.getElementById('ia-currency').value,
        foreignValue,
        insurance,
        freight,
        roe,
        dutiableValue,
        customsDuty,
        brokerageFee,
        docStamp,
        totalLanded,
        exciseTax,
        vat,
        totalCharges
    });

    logActivity('calculator', 'Informal Entry - Air', `Calculated Total: ₱${totalCharges.toFixed(2)}`);
}

function resetInformalAirCalculator() {
    document.getElementById('ia-consignee').value = '';
    document.getElementById('ia-commodity').value = '';
    document.getElementById('ia-rate-duty').value = '0';
    document.getElementById('ia-incoterm').value = 'EXW';
    document.getElementById('ia-is-lc').value = 'no';
    document.getElementById('ia-currency').value = 'PHP';
    document.getElementById('ia-foreign-value').value = '0';
    document.getElementById('ia-roe').value = '56.00';
    document.getElementById('ia-insurance-type').value = '0';
    document.getElementById('ia-insurance-manual').value = '0';
    document.getElementById('ia-freight').value = '0';
    document.getElementById('ia-excise-tax').value = '0';

    document.getElementById('ia-cif').textContent = '₱0.00';
    document.getElementById('ia-dv').textContent = '₱0.00';
    document.getElementById('ia-customs-duty').textContent = '₱0.00';
    document.getElementById('ia-brokerage').textContent = '₱0.00';
    document.getElementById('ia-doc-stamp').textContent = '₱130.00';
    document.getElementById('ia-total-landed').textContent = '₱0.00';
    document.getElementById('ia-vat-base').textContent = '₱0.00';
    document.getElementById('ia-vat').textContent = '₱0.00';
    document.getElementById('ia-summary-customs-duty').textContent = '₱0.00';
    document.getElementById('ia-summary-vat').textContent = '₱0.00';
    document.getElementById('ia-summary-excise').textContent = '₱0.00';
    document.getElementById('ia-summary-doc-stamp').textContent = '₱130.00';
    document.getElementById('ia-total-payable').textContent = '₱0.00';
}

function printInformalAirCalculation() {
    const fields = {
        consignee: document.getElementById('ia-consignee').value || 'N/A',
        commodity: document.getElementById('ia-commodity').value || 'N/A',
        incoterm: document.getElementById('ia-incoterm').value || 'N/A',
        currency: document.getElementById('ia-currency').value || 'N/A',
        foreignValue: document.getElementById('ia-foreign-value').value || '0',
        freight: document.getElementById('ia-freight').value || '0',
        insuranceType: document.getElementById('ia-insurance-type').value,
        insuranceManual: document.getElementById('ia-insurance-manual').value || '0',
        roe: document.getElementById('ia-roe').value || '1',
        isLc: document.getElementById('ia-is-lc').value,
        dutiableValue: document.getElementById('ia-dv').textContent || '₱0.00',
        customsDuty: document.getElementById('ia-customs-duty').textContent || '₱0.00',
        brokerage: document.getElementById('ia-brokerage').textContent || '₱0.00',
        docStamp: document.getElementById('ia-doc-stamp').textContent || '₱130.00',
        totalLanded: document.getElementById('ia-total-landed').textContent || '₱0.00',
        exciseTax: document.getElementById('ia-excise-tax').value || '0',
        vat: document.getElementById('ia-vat').textContent || '₱0.00',
        totalCharges: document.getElementById('ia-total-payable').textContent || '₱0.00'
    };

    const insurance = fields.insuranceType === 'manual' ? fields.insuranceManual : fields.insuranceType;

    const printWindow = window.open('', '_blank', 'width=1000,height=850');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Informal Entry Air Receipt</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; background: #f6f6f6; }
                .print-container { width: 850px; margin: 20px auto; background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e3e3e3; padding-bottom: 15px; margin-bottom: 20px; }
                .logo { width: 130px; height: 130px; overflow: hidden; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .logo img { max-width: 100%; max-height: 100%; width: auto; height: auto; border-radius: 50%; object-fit: contain; }
                .company-info { text-align: right; }
                .company-info h2 { margin: 0; font-size: 1.5rem; color: #1f3f5b; }
                .company-info p { margin: 2px 0; font-size: 0.88rem; color: #555; }
                .section { margin: 18px 0; }
                .section-title { font-size: 1.1rem; font-weight: 400; text-transform: uppercase; color: #1f3f5b; border-bottom: 1px solid #d6d6d6; padding-bottom: 8px; margin-bottom: 10px; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .label { color: #333; font-weight: 400; }
                .value { color: #0e315f; font-weight: 400; }
                .divider { margin: 15px 0; border-top: 1px dashed #ccc; }
                .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-top: 12px; color: #0b2d5f; }
                .footer { margin-top: 25px; text-align: center; color: #777; font-size: 0.85rem; }
                .btn-print { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #1f3f5b; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-weight: 700; }
                @media print { body { background: #fff; } .print-container { border: none; box-shadow: none; } .btn-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <div class="logo"><img src="images/logo only.png" alt="ACB Logo"></div>
                    <div class="company-info">
                        <h2>Andaya-Cutanda Customs Brokerage</h2>
                        <p>Customs & Freight Forwarding Specialist</p>
                        <p>Telephone: +63 09619043375 | info@andaya-cutanda.com</p>
                        <p>Date: ${new Date().toLocaleString('en-PH')}</p>
                    </div>
                </div>
                <h3 style="margin:7px 0 4px; text-transform:uppercase; letter-spacing: 0.8px;">Informal Entry Air Receipt</h3>
                <div class="section">
                    <div class="section-title">Consignee / Shipment Details</div>
                    <div class="row"><span class="label">Consignee</span><span class="value">${fields.consignee}</span></div>
                    <div class="row"><span class="label">Commodity</span><span class="value">${fields.commodity}</span></div>
                    <div class="row"><span class="label">Incoterm</span><span class="value">${fields.incoterm}</span></div>
                    <div class="row"><span class="label">Currency</span><span class="value">${fields.currency}</span></div>
                    <div class="row"><span class="label">Foreign Value</span><span class="value">${fields.foreignValue}</span></div>
                    <div class="row"><span class="label">Insurance</span><span class="value">${insurance}</span></div>
                    <div class="row"><span class="label">Freight</span><span class="value">${fields.freight}</span></div>
                    <div class="row"><span class="label">ROE</span><span class="value">${fields.roe}</span></div>
                    <div class="row"><span class="label">Under L/C</span><span class="value">${fields.isLc}</span></div>
                </div>

                <div class="section">
                    <div class="section-title">Computation Breakdown</div>
                    <div class="row"><span class="label">Dutiable Value</span><span class="value">${fields.dutiableValue}</span></div>
                    <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                    <div class="row"><span class="label">Brokerage Fee</span><span class="value">${fields.brokerage}</span></div>
                    <div class="row"><span class="label">Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>
                    <div class="row"><span class="label">Total Landed Cost</span><span class="value">${fields.totalLanded}</span></div>
                    <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                    <div class="row"><span class="label">VAT (12%)</span><span class="value">${fields.vat}</span></div>
                </div>

                <div class="section">
                    <div class="section-title">Summary of Payment</div>
                    <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                    <div class="row"><span class="label">Value Added Tax</span><span class="value">${fields.vat}</span></div>
                    <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                    <div class="row"><span class="label">Customs Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>

                    <div class="divider"></div>
                    <div class="total-row"><span>Total Duties, Taxes & Other Charges</span><span>${fields.totalCharges}</span></div>
                </div>

                <div class="footer">This receipt is generated by the Informal Entry Air calculator.</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// INFORMAL ENTRY SEA CALCULATOR FUNCTIONS
function getInformalSeaInsurance(fobValue, insuranceType, insuranceManual) {
    if (insuranceType === 'manual') return insuranceManual;
    if (insuranceType === '0') return 0;
    return fobValue * parseFloat(insuranceType);
}

function getInformalSeaBrokerage(dv) {
    if (dv > 200000) return dv * 0.00125 + 5050;
    if (dv > 100000) return 5300;
    if (dv > 60000) return 4700;
    if (dv > 50000) return 4000;
    if (dv > 40000) return 3600;
    if (dv > 30000) return 3300;
    if (dv > 20000) return 2700;
    if (dv > 10000) return 2000;
    return 0;
}

function calculateInformalSea() {
    const rateDuty = parseFloat(document.getElementById('is-rate-duty').value) || 0;
    const fob = parseFloat(document.getElementById('is-fob').value) || 0;
    const insuranceType = document.getElementById('is-insurance-type').value;
    const insuranceManual = parseFloat(document.getElementById('is-insurance-manual').value) || 0;
    const freight = parseFloat(document.getElementById('is-freight').value) || 0;
    const roe = parseFloat(document.getElementById('is-roe').value) || 1;
    const exciseTax = parseFloat(document.getElementById('is-excise-tax').value) || 0;

    const insurance = getInformalSeaInsurance(fob, insuranceType, insuranceManual);
    const cif = fob + insurance + freight;
    const dutiableValue = cif * roe;
    const customsDuty = dutiableValue * (rateDuty / 100);
    const brokerageFee = getInformalSeaBrokerage(dutiableValue);
    const docStamp = 130;
    const totalLanded = dutiableValue + customsDuty + brokerageFee + docStamp;
    const vatBase = totalLanded + exciseTax;
    const vat = vatBase * 0.12;
    const totalCharges = customsDuty + vat + exciseTax + docStamp;

    document.getElementById('is-cif').textContent = formatCurrency(cif);
    document.getElementById('is-dv').textContent = formatCurrency(dutiableValue);
    document.getElementById('is-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('is-brokerage').textContent = formatCurrency(brokerageFee);
    document.getElementById('is-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('is-total-landed').textContent = formatCurrency(totalLanded);
    document.getElementById('is-vat-base').textContent = formatCurrency(vatBase);
    document.getElementById('is-vat').textContent = formatCurrency(vat);
    document.getElementById('is-summary-customs-duty').textContent = formatCurrency(customsDuty);
    document.getElementById('is-summary-vat').textContent = formatCurrency(vat);
    document.getElementById('is-summary-excise').textContent = formatCurrency(exciseTax);
    document.getElementById('is-summary-doc-stamp').textContent = formatCurrency(docStamp);
    document.getElementById('is-total-payable').textContent = formatCurrency(totalCharges);

    addToActivityTimeline('informal-sea', {
        consignee: document.getElementById('is-consignee').value,
        commodity: document.getElementById('is-commodity').value,
        incoterm: document.getElementById('is-incoterm').value,
        currency: document.getElementById('is-currency').value,
        fob,
        insurance,
        freight,
        roe,
        dutiableValue,
        customsDuty,
        brokerageFee,
        docStamp,
        totalLanded,
        exciseTax,
        vat,
        totalCharges
    });

    logActivity('calculator', 'Informal Entry - Sea', `Calculated Total: ₱${totalCharges.toFixed(2)}`);
}

function resetInformalSeaCalculator() {
    document.getElementById('is-consignee').value = '';
    document.getElementById('is-commodity').value = '';
    document.getElementById('is-rate-duty').value = '0';
    document.getElementById('is-incoterm').value = 'EXW';
    document.getElementById('is-is-lc').value = 'no';
    document.getElementById('is-currency').value = 'PHP';
    document.getElementById('is-fob').value = '0';
    document.getElementById('is-roe').value = '56.00';
    document.getElementById('is-insurance-type').value = '0';
    document.getElementById('is-insurance-manual').value = '0';
    document.getElementById('is-freight').value = '0';
    document.getElementById('is-excise-tax').value = '0';

    document.getElementById('is-cif').textContent = '₱0.00';
    document.getElementById('is-dv').textContent = '₱0.00';
    document.getElementById('is-customs-duty').textContent = '₱0.00';
    document.getElementById('is-brokerage').textContent = '₱0.00';
    document.getElementById('is-doc-stamp').textContent = '₱130.00';
    document.getElementById('is-total-landed').textContent = '₱0.00';
    document.getElementById('is-vat-base').textContent = '₱0.00';
    document.getElementById('is-vat').textContent = '₱0.00';
    document.getElementById('is-summary-customs-duty').textContent = '₱0.00';
    document.getElementById('is-summary-vat').textContent = '₱0.00';
    document.getElementById('is-summary-excise').textContent = '₱0.00';
    document.getElementById('is-summary-doc-stamp').textContent = '₱130.00';
    document.getElementById('is-total-payable').textContent = '₱0.00';
}

function printInformalSeaCalculation() {
    const fields = {
        consignee: document.getElementById('is-consignee').value || 'N/A',
        commodity: document.getElementById('is-commodity').value || 'N/A',
        incoterm: document.getElementById('is-incoterm').value || 'N/A',
        currency: document.getElementById('is-currency').value || 'N/A',
        fob: document.getElementById('is-fob').value || '0',
        freight: document.getElementById('is-freight').value || '0',
        insuranceType: document.getElementById('is-insurance-type').value,
        insuranceManual: document.getElementById('is-insurance-manual').value || '0',
        roe: document.getElementById('is-roe').value || '1',
        isLc: document.getElementById('is-is-lc').value,
        dutiableValue: document.getElementById('is-dv').textContent || '₱0.00',
        customsDuty: document.getElementById('is-customs-duty').textContent || '₱0.00',
        brokerage: document.getElementById('is-brokerage').textContent || '₱0.00',
        docStamp: document.getElementById('is-doc-stamp').textContent || '₱130.00',
        totalLanded: document.getElementById('is-total-landed').textContent || '₱0.00',
        exciseTax: document.getElementById('is-excise-tax').value || '0',
        vat: document.getElementById('is-vat').textContent || '₱0.00',
        totalCharges: document.getElementById('is-total-payable').textContent || '₱0.00'
    };

    const insurance = fields.insuranceType === 'manual' ? fields.insuranceManual : fields.insuranceType;

    const printWindow = window.open('', '_blank', 'width=1000,height=850');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Informal Entry Sea Receipt</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; background: #f6f6f6; }
                .print-container { width: 850px; margin: 20px auto; background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e3e3e3; padding-bottom: 15px; margin-bottom: 20px; }
                .logo { width: 130px; height: 130px; overflow: hidden; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .logo img { max-width: 100%; max-height: 100%; width: auto; height: auto; border-radius: 50%; object-fit: contain; }
                .company-info { text-align: right; }
                .company-info h2 { margin: 0; font-size: 1.5rem; color: #1f3f5b; }
                .company-info p { margin: 2px 0; font-size: 0.88rem; color: #555; }
                .section { margin: 18px 0; }
                .section-title { font-size: 1.1rem; font-weight: 400; text-transform: uppercase; color: #1f3f5b; border-bottom: 1px solid #d6d6d6; padding-bottom: 8px; margin-bottom: 10px; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .label { color: #333; font-weight: 400; }
                .value { color: #0e315f; font-weight: 400; }
                .divider { margin: 15px 0; border-top: 1px dashed #ccc; }
                .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-top: 12px; color: #0b2d5f; }
                .footer { margin-top: 25px; text-align: center; color: #777; font-size: 0.85rem; }
                .btn-print { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #1f3f5b; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-weight: 700; }
                @media print { body { background: #fff; } .print-container { border: none; box-shadow: none; } .btn-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <div class="logo"><img src="images/logo only.png" alt="ACB Logo"></div>
                    <div class="company-info">
                        <h2>Andaya-Cutanda Customs Brokerage</h2>
                        <p>Customs & Freight Forwarding Specialist</p>
                        <p>Telephone: +63 09619043375 | info@andaya-cutanda.com</p>
                        <p>Date: ${new Date().toLocaleString('en-PH')}</p>
                    </div>
                </div>
                <h3 style="margin:7px 0 4px; text-transform:uppercase; letter-spacing: 0.8px;">Informal Entry Sea Receipt</h3>
                <div class="section">
                    <div class="section-title">Consignee / Shipment Details</div>
                    <div class="row"><span class="label">Consignee</span><span class="value">${fields.consignee}</span></div>
                    <div class="row"><span class="label">Commodity</span><span class="value">${fields.commodity}</span></div>
                    <div class="row"><span class="label">Incoterm</span><span class="value">${fields.incoterm}</span></div>
                    <div class="row"><span class="label">Currency</span><span class="value">${fields.currency}</span></div>
                    <div class="row"><span class="label">FOB</span><span class="value">${fields.fob}</span></div>
                    <div class="row"><span class="label">Insurance</span><span class="value">${insurance}</span></div>
                    <div class="row"><span class="label">Freight</span><span class="value">${fields.freight}</span></div>
                    <div class="row"><span class="label">ROE</span><span class="value">${fields.roe}</span></div>
                    <div class="row"><span class="label">Under L/C</span><span class="value">${fields.isLc}</span></div>
                </div>

                <div class="section">
                    <div class="section-title">Computation Breakdown</div>
                    <div class="row"><span class="label">Dutiable Value</span><span class="value">${fields.dutiableValue}</span></div>
                    <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                    <div class="row"><span class="label">Brokerage Fee</span><span class="value">${fields.brokerage}</span></div>
                    <div class="row"><span class="label">Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>
                    <div class="row"><span class="label">Total Landed Cost</span><span class="value">${fields.totalLanded}</span></div>
                    <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                    <div class="row"><span class="label">VAT (12%)</span><span class="value">${fields.vat}</span></div>
                </div>

                <div class="section">
                    <div class="section-title">Summary of Payment</div>
                    <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                    <div class="row"><span class="label">Value Added Tax</span><span class="value">${fields.vat}</span></div>
                    <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                    <div class="row"><span class="label">Customs Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>

                    <div class="divider"></div>
                    <div class="total-row"><span>Total Duties, Taxes & Other Charges</span><span>${fields.totalCharges}</span></div>
                </div>

                <div class="footer">This receipt is generated by the Informal Entry Sea calculator.</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function printFormalSeaCalculation() {
    const fields = {
        consignee: document.getElementById('fs-consignee').value || 'N/A',
        commodity: document.getElementById('fs-commodity').value || 'N/A',
        incoterm: document.getElementById('fs-incoterm').value || 'N/A',
        currency: document.getElementById('fs-currency').value || 'N/A',
        fob: document.getElementById('fs-fob').value || '0',
        freight: document.getElementById('fs-freight').value || '0',
        insuranceType: document.getElementById('fs-insurance-type').value,
        insuranceManual: document.getElementById('fs-insurance-manual').value || '0',
        roe: document.getElementById('fs-roe').value || '1',
        isLc: document.getElementById('fs-is-lc').value,
        containerType: document.getElementById('fs-container-type').value,
        containerCount: document.getElementById('fs-container-count').value || '0',
        dutiableValue: document.getElementById('fs-dv').textContent || '₱0.00',
        customsDuty: document.getElementById('fs-customs-duty').textContent || '₱0.00',
        bankCharge: document.getElementById('fs-bank-charge').textContent || '₱0.00',
        brokerage: document.getElementById('fs-brokerage').textContent || '₱0.00',
        arrastre: document.getElementById('fs-arrastre-out').textContent || '₱0.00',
        wharfage: document.getElementById('fs-wharfage-out').textContent || '₱0.00',
        ipc: document.getElementById('fs-import-processing').textContent || '₱0.00',
        docStamp: document.getElementById('fs-doc-stamp').textContent || '₱130.00',
        totalLanded: document.getElementById('fs-total-landed').textContent || '₱0.00',
        exciseTax: document.getElementById('fs-excise-tax').value || '0',
        vat: document.getElementById('fs-vat').textContent || '₱0.00',
        containerSecurity: document.getElementById('fs-summary-csfe').textContent || '₱0.00',
        totalCharges: document.getElementById('fs-total-charges').textContent || '₱0.00',
        advanceDeposit: document.getElementById('fs-advance-deposit-out').textContent || '₱0.00',
        netPayable: document.getElementById('fs-net-payable').textContent || '₱0.00'
    };

    const insurance = fields.insuranceType === 'manual' ? fields.insuranceManual : fields.insuranceType;

    const printWindow = window.open('', '_blank', 'width=1000,height=850');
    if (!printWindow) {
        alert('Unable to open print window. Please check if popups are blocked.');
        return;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Formal Entry Sea Receipt</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; background: #f6f6f6; }
                .print-container { width: 850px; margin: 20px auto; background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e3e3e3; padding-bottom: 15px; margin-bottom: 20px; }
                .logo { width: 130px; height: 130px; overflow: hidden; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .logo img { max-width: 100%; max-height: 100%; width: auto; height: auto; border-radius: 50%; object-fit: contain; }
                .company-info { text-align: right; }
                .company-info h2 { margin: 0; font-size: 1.5rem; color: #1f3f5b; }
                .company-info p { margin: 2px 0; font-size: 0.88rem; color: #555; }
                .section { margin: 18px 0; }
                .section-title { font-size: 1.1rem; font-weight: 400; text-transform: uppercase; color: #1f3f5b; border-bottom: 1px solid #d6d6d6; padding-bottom: 8px; margin-bottom: 10px; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .label { color: #333; font-weight: 400; }
                .value { color: #0e315f; font-weight: 400; }
                .divider { margin: 15px 0; border-top: 1px dashed #ccc; }
                .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-top: 12px; color: #0b2d5f; }
                .footer { margin-top: 25px; text-align: center; color: #777; font-size: 0.85rem; }
                .btn-print { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #1f3f5b; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-weight: 700; }
                @media print { body { background: #fff; } .print-container { border: none; box-shadow: none; } .btn-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <div class="logo"><img src="images/logo only.png" alt="ACB Logo"></div>
                    <div class="company-info">
                        <h2>Andaya-Cutanda Customs Brokerage</h2>
                        <p>Customs & Freight Forwarding Specialist</p>
                        <p>Telephone: +63 09619043375 | info@andaya-cutanda.com</p>
                        <p>Date: ${new Date().toLocaleString('en-PH')}</p>
                    </div>
                </div>
                <h3 style="margin:7px 0 4px; text-transform:uppercase; letter-spacing: 0.8px;">Formal Entry Sea Receipt</h3>
                <div class="section">
                    <div class="section-title">Consignee / Shipment Details</div>
                <div class="row"><span class="label">Consignee</span><span class="value">${fields.consignee}</span></div>
                <div class="row"><span class="label">Commodity</span><span class="value">${fields.commodity}</span></div>
                <div class="row"><span class="label">Incoterm</span><span class="value">${fields.incoterm}</span></div>
                <div class="row"><span class="label">Currency</span><span class="value">${fields.currency}</span></div>
                <div class="row"><span class="label">FOB</span><span class="value">${fields.fob}</span></div>
                <div class="row"><span class="label">Insurance</span><span class="value">${insurance}</span></div>
                <div class="row"><span class="label">Freight</span><span class="value">${fields.freight}</span></div>
                <div class="row"><span class="label">ROE</span><span class="value">${fields.roe}</span></div>
                <div class="row"><span class="label">Container</span><span class="value">${fields.containerType} ft × ${fields.containerCount}</span></div>
                <div class="row"><span class="label">Under L/C</span><span class="value">${fields.isLc}</span></div>
            </div>

            <div class="section">
                <div class="section-title">Computation Breakdown</div>
                <div class="row"><span class="label">Dutiable Value</span><span class="value">${fields.dutiableValue}</span></div>
                <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                <div class="row"><span class="label">Bank Charge</span><span class="value">${fields.bankCharge}</span></div>
                <div class="row"><span class="label">Brokerage Fee</span><span class="value">${fields.brokerage}</span></div>
                <div class="row"><span class="label">Arrastre Charge</span><span class="value">${fields.arrastre}</span></div>
                <div class="row"><span class="label">Wharfage Due</span><span class="value">${fields.wharfage}</span></div>
                <div class="row"><span class="label">Import Processing Charge</span><span class="value">${fields.ipc}</span></div>
                <div class="row"><span class="label">Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>
                <div class="row"><span class="label">Total Landed Cost</span><span class="value">${fields.totalLanded}</span></div>
                <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                <div class="total-row"><span class="label">VAT (12%)</span><span class="value">${fields.vat}</span></div>
            </div>

            <div class="section">
                <div class="section-title">Summary of Payment</div>
                <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                <div class="row"><span class="label">Import Processing Charge</span><span class="value">${fields.ipc}</span></div>
                <div class="row"><span class="label">Customs Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>
                <div class="row"><span class="label">Container Security Fee</span><span class="value">${fields.containerSecurity}</span></div>
                <div class="total-row"><span>Total Duties, Taxes & Other Charges</span><span>${fields.totalCharges}</span></div>
                <div class="row"><span class="label">Less Advance Deposit</span><span class="value">${fields.advanceDeposit}</span></div>
                <div class="total-row"><span>Net Amount Payable</span><span>${fields.netPayable}</span></div>
            </div>

            <div class="footer">This receipt is generated by the Formal Entry Sea calculator.</div>
        </body>
        </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 300);
}

function printFormalAirCalculation() {
    const fields = {
        consignee: document.getElementById('fa-consignee').value || 'N/A',
        commodity: document.getElementById('fa-commodity').value || 'N/A',
        incoterm: document.getElementById('fa-incoterm').value || 'N/A',
        currency: document.getElementById('fa-currency').value || 'N/A',
        foreignValue: document.getElementById('fa-foreign-value').value || '0',
        freight: document.getElementById('fa-freight').value || '0',
        insuranceType: document.getElementById('fa-insurance-type').value,
        insuranceManual: document.getElementById('fa-insurance-manual').value || '0',
        roe: document.getElementById('fa-roe').value || '1',
        isLc: document.getElementById('fa-is-lc').value,
        cifValue: document.getElementById('fa-cif').textContent || '$0.00',
        dutiableValue: document.getElementById('fa-dv').textContent || '₱0.00',
        customsDuty: document.getElementById('fa-customs-duty').textContent || '₱0.00',
        bankCharge: document.getElementById('fa-bank-charge').textContent || '₱0.00',
        brokerage: document.getElementById('fa-brokerage').textContent || '₱0.00',
        ipc: document.getElementById('fa-import-processing').textContent || '₱0.00',
        docStamp: document.getElementById('fa-doc-stamp').textContent || '₱130.00',
        totalLanded: document.getElementById('fa-total-landed').textContent || '₱0.00',
        exciseTax: document.getElementById('fa-excise-tax').value || '0',
        vat: document.getElementById('fa-vat').textContent || '₱0.00',
        totalCharges: document.getElementById('fa-total-charges').textContent || '₱0.00',
        advanceDeposit: document.getElementById('fa-advance-deposit-out').textContent || '₱0.00',
        netPayable: document.getElementById('fa-net-payable').textContent || '₱0.00'
    };

    const insurance = fields.insuranceType === 'manual' ? fields.insuranceManual : fields.insuranceType;

    const printWindow = window.open('', '_blank', 'width=1000,height=850');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Formal Entry Air Receipt</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; background: #f6f6f6; }
                .print-container { width: 850px; margin: 20px auto; background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e3e3e3; padding-bottom: 15px; margin-bottom: 20px; }
                .logo { width: 130px; height: 130px; overflow: hidden; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .logo img { max-width: 100%; max-height: 100%; width: auto; height: auto; border-radius: 50%; object-fit: contain; }
                .company-info { text-align: right; }
                .company-info h2 { margin: 0; font-size: 1.5rem; color: #1f3f5b; }
                .company-info p { margin: 2px 0; font-size: 0.88rem; color: #555; }
                .section { margin: 18px 0; }
                .section-title { font-size: 1.1rem; font-weight: 400; text-transform: uppercase; color: #1f3f5b; border-bottom: 1px solid #d6d6d6; padding-bottom: 8px; margin-bottom: 10px; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .label { color: #333; font-weight: 400; }
                .value { color: #0e315f; font-weight: 400; }
                .divider { margin: 15px 0; border-top: 1px dashed #ccc; }
                .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-top: 12px; color: #0b2d5f; }
                .footer { margin-top: 25px; text-align: center; color: #777; font-size: 0.85rem; }
                .btn-print { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #1f3f5b; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-weight: 700; }
                @media print { body { background: #fff; } .print-container { border: none; box-shadow: none; } .btn-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <div class="logo"><img src="images/logo only.png" alt="ACB Logo"></div>
                    <div class="company-info">
                        <h2>Andaya-Cutanda Customs Brokerage</h2>
                        <p>Customs & Freight Forwarding Specialist</p>
                        <p>Telephone: +63 09619043375 | info@andaya-cutanda.com</p>
                        <p>Date: ${new Date().toLocaleString('en-PH')}</p>
                    </div>
                </div>
                <h3 style="margin:7px 0 4px; text-transform:uppercase; letter-spacing: 0.8px;">Formal Entry Air Receipt</h3>
                <div class="section">
                    <div class="section-title">Consignee / Shipment Details</div>
                    <div class="row"><span class="label">Consignee</span><span class="value">${fields.consignee}</span></div>
                    <div class="row"><span class="label">Commodity</span><span class="value">${fields.commodity}</span></div>
                    <div class="row"><span class="label">Incoterm</span><span class="value">${fields.incoterm}</span></div>
                    <div class="row"><span class="label">Currency</span><span class="value">${fields.currency}</span></div>
                    <div class="row"><span class="label">FCA Value</span><span class="value">${fields.foreignValue}</span></div>
                    <div class="row"><span class="label">Insurance</span><span class="value">${insurance}</span></div>
                    <div class="row"><span class="label">Freight</span><span class="value">${fields.freight}</span></div>
                    <div class="row"><span class="label">ROE</span><span class="value">${fields.roe}</span></div>
                    <div class="row"><span class="label">Under L/C</span><span class="value">${fields.isLc}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Computation Breakdown</div>
                    <div class="row"><span class="label">CIF Value</span><span class="value">${fields.cifValue}</span></div>
                    <div class="row"><span class="label">Dutiable Value</span><span class="value">${fields.dutiableValue}</span></div>
                    <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                    <div class="row"><span class="label">Bank Charge</span><span class="value">${fields.bankCharge}</span></div>
                    <div class="row"><span class="label">Brokerage Fee</span><span class="value">${fields.brokerage}</span></div>
                    <div class="row"><span class="label">Import Processing Charge</span><span class="value">${fields.ipc}</span></div>
                    <div class="row"><span class="label">Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>
                    <div class="row"><span class="label">Total Landed Cost</span><span class="value">${fields.totalLanded}</span></div>
                    <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                    <div class="total-row"><span class="label">VAT (12%)</span><span class="value">${fields.vat}</span></div>
                </div>

                <div class="section">
                    <div class="section-title">Summary of Payment</div>
                    <div class="row"><span class="label">Customs Duty</span><span class="value">${fields.customsDuty}</span></div>
                    <div class="row"><span class="label">Value Added Tax</span><span class="value">${fields.vat}</span></div>
                    <div class="row"><span class="label">Excise Tax</span><span class="value">₱${fields.exciseTax}</span></div>
                    <div class="row"><span class="label">Import Processing Charge</span><span class="value">${fields.ipc}</span></div>
                    <div class="row"><span class="label">Customs Documentary Stamp</span><span class="value">${fields.docStamp}</span></div>
                    <div class="total-row"><span>Total Duties, Taxes & Other Charges</span><span>${fields.totalCharges}</span></div>
                    <div class="row"><span class="label">Less Advance Deposit</span><span class="value">${fields.advanceDeposit}</span></div>
                    <div class="total-row"><span>Net Amount Payable</span><span>${fields.netPayable}</span></div>
                </div>
                <div class="footer">This receipt is generated by the Formal Entry Air calculator.</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function resetFormalSeaCalculator() {
    document.getElementById('fs-consignee').value = '';
    document.getElementById('fs-commodity').value = '';
    document.getElementById('fs-rate-duty').value = 0;
    document.getElementById('fs-incoterm').value = 'EXW';
    document.getElementById('fs-is-lc').value = 'no';
    document.getElementById('fs-lc-value').value = 0;
    document.getElementById('fs-currency').value = 'PHP';
    document.getElementById('fs-roe').value = 56.00;
    document.getElementById('fs-fob').value = 0;
    document.getElementById('fs-insurance-type').value = '0';
    document.getElementById('fs-insurance-manual').value = 0;
    document.getElementById('fs-freight').value = 0;
    document.getElementById('fs-container-type').value = '20';
    document.getElementById('fs-container-count').value = 0;
    document.getElementById('fs-arrastre').value = 0;
    document.getElementById('fs-wharfage').value = 0;
    document.getElementById('fs-excise-tax').value = 0;
    document.getElementById('fs-advance-deposit').value = 0;

    document.getElementById('fs-cif').textContent = '₱0.00';
    document.getElementById('fs-dv').textContent = '₱0.00';
    document.getElementById('fs-customs-duty').textContent = '₱0.00';
    document.getElementById('fs-bank-charge').textContent = '₱0.00';
    document.getElementById('fs-brokerage').textContent = '₱0.00';
    document.getElementById('fs-arrastre-out').textContent = '₱0.00';
    document.getElementById('fs-wharfage-out').textContent = '₱0.00';
    document.getElementById('fs-import-processing').textContent = '₱0.00';
    document.getElementById('fs-doc-stamp').textContent = '₱130.00';
    document.getElementById('fs-total-landed').textContent = '₱0.00';
    document.getElementById('fs-vat-base').textContent = '₱0.00';
    document.getElementById('fs-vat').textContent = '₱0.00';
    document.getElementById('fs-summary-csfe').textContent = '₱0.00';
    document.getElementById('fs-total-charges').textContent = '₱0.00';
    document.getElementById('fs-advance-deposit-out').textContent = '₱0.00';
    document.getElementById('fs-net-payable').textContent = '₱0.00';
}

function resetFormalAirCalculator() {
    document.getElementById('fa-consignee').value = '';
    document.getElementById('fa-commodity').value = '';
    document.getElementById('fa-rate-duty').value = 0;
    document.getElementById('fa-incoterm').value = 'EXW';
    document.getElementById('fa-is-lc').value = 'no';
    document.getElementById('fa-advance-deposit-lc').value = 0;
    document.getElementById('fa-currency').value = 'PHP';
    document.getElementById('fa-roe').value = 56.00;
    document.getElementById('fa-foreign-value').value = 0;
    document.getElementById('fa-insurance-type').value = '0';
    document.getElementById('fa-insurance-manual').value = 0;
    document.getElementById('fa-freight').value = 0;
    document.getElementById('fa-excise-tax').value = 0;

    document.getElementById('fa-cif').textContent = '$0.00';
    document.getElementById('fa-dv').textContent = '₱0.00';
    document.getElementById('fa-customs-duty').textContent = '₱0.00';
    document.getElementById('fa-bank-charge').textContent = '₱0.00';
    document.getElementById('fa-brokerage').textContent = '₱0.00';
    document.getElementById('fa-import-processing').textContent = '₱0.00';
    document.getElementById('fa-doc-stamp').textContent = '₱130.00';
    document.getElementById('fa-total-landed').textContent = '₱0.00';
    document.getElementById('fa-excise-tax-out').textContent = '₱0.00';
    document.getElementById('fa-vat-base').textContent = '₱0.00';
    document.getElementById('fa-vat').textContent = '₱0.00';
    document.getElementById('fa-total-charges').textContent = '₱0.00';
    document.getElementById('fa-summary-customs-duty').textContent = '₱0.00';
    document.getElementById('fa-summary-vat').textContent = '₱0.00';
    document.getElementById('fa-summary-excise').textContent = '₱0.00';
    document.getElementById('fa-summary-ipc').textContent = '₱0.00';
    document.getElementById('fa-summary-doc-stamp').textContent = '₱130.00';
    document.getElementById('fa-advance-deposit-out').textContent = '₱0.00';
    document.getElementById('fa-net-payable').textContent = '₱0.00';
}

// Manage field visibility
const fsLcField = document.getElementById('fs-is-lc');
const fsLcValueGroup = document.getElementById('fs-lc-value-group');
if (fsLcField) {
    fsLcField.addEventListener('change', function() {
        fsLcValueGroup.style.display = this.value === 'yes' ? 'block' : 'none';
    });
}

const fsInsuranceField = document.getElementById('fs-insurance-type');
const fsInsuranceManualGroup = document.getElementById('fs-insurance-manual-group');
if (fsInsuranceField) {
    fsInsuranceField.addEventListener('change', function() {
        fsInsuranceManualGroup.style.display = this.value === 'manual' ? 'block' : 'none';
    });
}

const faLcField = document.getElementById('fa-is-lc');
const faAdvanceDepositLcGroup = document.getElementById('fa-advance-deposit-lc-group');
if (faLcField) {
    faLcField.addEventListener('change', function() {
        faAdvanceDepositLcGroup.style.display = this.value === 'yes' ? 'block' : 'none';
    });
}

const faInsuranceField = document.getElementById('fa-insurance-type');
const faInsuranceManualGroup = document.getElementById('fa-insurance-manual-group');
if (faInsuranceField) {
    faInsuranceField.addEventListener('change', function() {
        faInsuranceManualGroup.style.display = this.value === 'manual' ? 'block' : 'none';
    });
}

const iaLcField = document.getElementById('ia-is-lc');
const iaLcValueGroup = document.getElementById('ia-lc-value-group');
if (iaLcField) {
    iaLcField.addEventListener('change', function() {
        iaLcValueGroup.style.display = this.value === 'yes' ? 'block' : 'none';
    });
}

const iaInsuranceField = document.getElementById('ia-insurance-type');
const iaInsuranceManualGroup = document.getElementById('ia-insurance-manual-group');
if (iaInsuranceField) {
    iaInsuranceField.addEventListener('change', function() {
        iaInsuranceManualGroup.style.display = this.value === 'manual' ? 'block' : 'none';
    });
}

const isLcField = document.getElementById('is-is-lc');
const isLcValueGroup = document.getElementById('is-lc-value-group');
if (isLcField) {
    isLcField.addEventListener('change', function() {
        isLcValueGroup.style.display = this.value === 'yes' ? 'block' : 'none';
    });
}

const isInsuranceField = document.getElementById('is-insurance-type');
const isInsuranceManualGroup = document.getElementById('is-insurance-manual-group');
if (isInsuranceField) {
    isInsuranceField.addEventListener('change', function() {
        isInsuranceManualGroup.style.display = this.value === 'manual' ? 'block' : 'none';
    });
}
