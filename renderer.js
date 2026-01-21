// Mortgage Calculator - Renderer Process

// Store comparison mortgages
let comparisonMortgages = [];

/**
 * Calculate monthly mortgage payment using the amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * 
 * @param {number} principal - Loan amount (P)
 * @param {number} annualRate - Annual interest rate as percentage (e.g., 6.5 for 6.5%)
 * @param {number} years - Loan duration in years
 * @returns {object} - Monthly payment, total interest, and total amount
 */
function calculateMortgage(principal, annualRate, years) {
  // Convert annual rate to monthly rate (divide by 100 for percentage, then by 12 for monthly)
  const monthlyRate = annualRate / 100 / 12;
  
  // Total number of payments
  const numberOfPayments = years * 12;
  
  let monthlyPayment;
  
  if (monthlyRate === 0) {
    // Handle 0% interest rate case
    monthlyPayment = principal / numberOfPayments;
  } else {
    // Standard amortization formula
    const compoundFactor = Math.pow(1 + monthlyRate, numberOfPayments);
    monthlyPayment = principal * (monthlyRate * compoundFactor) / (compoundFactor - 1);
  }
  
  // Calculate totals
  const totalAmount = monthlyPayment * numberOfPayments;
  const totalInterest = totalAmount - principal;
  
  return {
    monthlyPayment,
    totalInterest,
    totalAmount
  };
}

/**
 * Format a number as USD currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate inputs and return error message if invalid
 * @param {number} interestRate 
 * @param {number} loanAmount 
 * @param {number} loanDuration 
 * @param {number} lotFees 
 * @returns {string|null} - Error message or null if valid
 */
function validateInputs(interestRate, loanAmount, loanDuration, lotFees) {
  if (isNaN(interestRate) || interestRate < 0) {
    return 'Please enter a valid interest rate (0 or greater)';
  }
  if (isNaN(loanAmount) || loanAmount <= 0) {
    return 'Please enter a valid loan amount (greater than 0)';
  }
  if (isNaN(loanDuration) || loanDuration <= 0 || !Number.isInteger(loanDuration)) {
    return 'Please enter a valid loan duration (whole number of years, greater than 0)';
  }
  if (interestRate > 100) {
    return 'Interest rate seems too high. Please enter a rate between 0 and 100%';
  }
  if (isNaN(lotFees) || lotFees < 0) {
    return 'Please enter a valid lot fees amount (0 or greater)';
  }
  return null;
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  const resultsElement = document.getElementById('results');
  
  errorElement.textContent = message;
  errorElement.classList.add('visible');
  resultsElement.classList.remove('visible');
}

/**
 * Hide error message
 */
function hideError() {
  const errorElement = document.getElementById('errorMessage');
  errorElement.classList.remove('visible');
}

/**
 * Display calculation results
 * @param {object} results - Calculation results object
 * @param {object} inputs - Input values used for calculation
 */
function displayResults(results, inputs = null) {
  const resultsElement = document.getElementById('results');
  const addToComparisonBtn = document.getElementById('addToComparisonBtn');
  const lotFeesNote = document.getElementById('lotFeesNote');
  
  document.getElementById('monthlyPayment').textContent = formatCurrency(results.monthlyPayment);
  document.getElementById('totalInterest').textContent = formatCurrency(results.totalInterest);
  document.getElementById('totalAmount').textContent = formatCurrency(results.totalAmount);
  
  // Show lot fees note if lot fees are included
  if (inputs && inputs.lotFees > 0) {
    lotFeesNote.textContent = '(includes fees)';
  } else {
    lotFeesNote.textContent = '';
  }
  
  resultsElement.classList.add('visible');
  
  // Store inputs with results for comparison
  if (inputs) {
    resultsElement.dataset.inputs = JSON.stringify(inputs);
    addToComparisonBtn.style.display = 'block';
  }
}

/**
 * Handle calculate button click
 */
function handleCalculate() {
  hideError();
  
  // Get input values
  const interestRate = parseFloat(document.getElementById('interestRate').value);
  const loanAmount = parseFormattedNumber(document.getElementById('loanAmount').value);
  const loanDuration = parseInt(document.getElementById('loanDuration').value, 10);
  const lotFeesInput = document.getElementById('lotFees').value.trim();
  const lotFees = lotFeesInput === '' ? 0 : parseFormattedNumber(lotFeesInput);
  
  // Validate inputs
  const error = validateInputs(interestRate, loanAmount, loanDuration, lotFees);
  if (error) {
    showError(error);
    return;
  }
  
  // Calculate mortgage (base monthly payment)
  const mortgageResults = calculateMortgage(loanAmount, interestRate, loanDuration);
  
  // Add lot fees to monthly payment (for display)
  const monthlyPaymentWithLotFees = mortgageResults.monthlyPayment + lotFees;
  
  // Calculate totals
  const numberOfPayments = loanDuration * 12;
  // Total interest is based on mortgage payments only (excluding lot fees)
  const totalInterest = mortgageResults.totalInterest;
  // Total amount includes lot fees
  const totalAmount = monthlyPaymentWithLotFees * numberOfPayments;
  
  const results = {
    monthlyPayment: monthlyPaymentWithLotFees,
    totalInterest,
    totalAmount
  };
  
  const inputs = { interestRate, loanAmount, loanDuration, lotFees };
  displayResults(results, inputs);
}

/**
 * Format a number with commas for display in input
 * @param {string} value - The raw input value
 * @returns {string} - Formatted value with commas
 */
function formatNumberWithCommas(value) {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = cleaned.split('.');
  
  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Rejoin with decimal if present
  return parts.join('.');
}

/**
 * Parse a comma-formatted number string to a float
 * @param {string} value - The formatted value with commas
 * @returns {number} - Parsed number
 */
function parseFormattedNumber(value) {
  return parseFloat(value.replace(/,/g, ''));
}

/**
 * Handle loan amount input formatting
 * @param {Event} e - Input event
 */
function handleLoanAmountInput(e) {
  const input = e.target;
  const cursorPosition = input.selectionStart;
  const oldValue = input.value;
  const oldLength = oldValue.length;
  
  // Format the value
  const formatted = formatNumberWithCommas(input.value);
  input.value = formatted;
  
  // Adjust cursor position based on added/removed commas
  const newLength = formatted.length;
  const diff = newLength - oldLength;
  const newPosition = cursorPosition + diff;
  
  // Set cursor position
  input.setSelectionRange(newPosition, newPosition);
}

/**
 * Add current calculation to comparison
 */
function addToComparison() {
  const resultsElement = document.getElementById('results');
  const inputsJson = resultsElement.dataset.inputs;
  
  if (!inputsJson) {
    showError('Please calculate a mortgage first before adding to comparison');
    return;
  }
  
  const inputs = JSON.parse(inputsJson);
  const interestRate = inputs.interestRate;
  const loanAmount = inputs.loanAmount;
  const loanDuration = inputs.loanDuration;
  const lotFees = inputs.lotFees || 0;
  
  // Calculate mortgage (base monthly payment)
  const mortgageResults = calculateMortgage(loanAmount, interestRate, loanDuration);
  
  // Add lot fees to monthly payment (for display)
  const monthlyPaymentWithLotFees = mortgageResults.monthlyPayment + lotFees;
  
  // Calculate totals
  const numberOfPayments = loanDuration * 12;
  // Total interest is based on mortgage payments only (excluding lot fees)
  const totalInterest = mortgageResults.totalInterest;
  // Total amount includes lot fees
  const totalAmount = monthlyPaymentWithLotFees * numberOfPayments;
  
  // Create comparison entry
  const entry = {
    id: Date.now(),
    interestRate,
    loanAmount,
    loanDuration,
    lotFees,
    monthlyPayment: monthlyPaymentWithLotFees,
    totalInterest,
    totalAmount
  };
  
  // Add to comparison array
  comparisonMortgages.push(entry);
  
  // Update comparison display
  updateComparisonDisplay();
  
  // Show success feedback
  hideError();
}

/**
 * Remove mortgage from comparison
 * @param {number} id - Entry ID to remove
 */
function removeFromComparison(id) {
  comparisonMortgages = comparisonMortgages.filter(entry => entry.id !== id);
  updateComparisonDisplay();
}

/**
 * Update the comparison table display
 */
function updateComparisonDisplay() {
  const comparisonSection = document.getElementById('comparisonSection');
  const comparisonTableBody = document.getElementById('comparisonTableBody');
  const comparisonCount = document.getElementById('comparisonCount');
  
  if (comparisonMortgages.length === 0) {
    comparisonSection.classList.remove('visible');
    return;
  }
  
  comparisonSection.classList.add('visible');
  comparisonCount.textContent = `${comparisonMortgages.length} mortgage${comparisonMortgages.length !== 1 ? 's' : ''}`;
  
  // Clear existing rows
  comparisonTableBody.innerHTML = '';
  
  // Add rows for each comparison
  comparisonMortgages.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.interestRate.toFixed(2)}%</td>
      <td>${formatCurrency(entry.loanAmount)}</td>
      <td>${entry.loanDuration} ${entry.loanDuration === 1 ? 'year' : 'years'}</td>
      <td class="highlight">${formatCurrency(entry.monthlyPayment)}</td>
      <td class="highlight">${formatCurrency(entry.totalInterest)}</td>
      <td class="total">${formatCurrency(entry.totalAmount)}</td>
      <td style="text-align: center;">
        <button class="remove-btn" data-id="${entry.id}">Remove</button>
      </td>
    `;
    comparisonTableBody.appendChild(row);
  });
  
  // Add event listeners to remove buttons
  comparisonTableBody.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      removeFromComparison(id);
    });
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculateBtn');
  calculateBtn.addEventListener('click', handleCalculate);
  
  const addToComparisonBtn = document.getElementById('addToComparisonBtn');
  addToComparisonBtn.addEventListener('click', addToComparison);
  
  // Add formatting to loan amount input
  const loanAmountInput = document.getElementById('loanAmount');
  loanAmountInput.addEventListener('input', handleLoanAmountInput);
  
  // Allow Enter key to trigger calculation
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCalculate();
      }
    });
  });
});
