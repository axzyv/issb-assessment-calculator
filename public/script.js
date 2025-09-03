// Function to calculate row totals and grand totals
function updateTotals(gridNumber) {
    const rows = ['mc', 'perception', 'impact', 've'];
    let grandTotal = 0;
    let mcTotal = 0;
    
    rows.forEach(row => {
        const checkboxes = document.querySelectorAll(`input[data-row="${row}"][data-grid="${gridNumber}"]`);
        let rowTotal = 0;
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                rowTotal += parseInt(checkbox.dataset.points);
            }
        });
        
        // Update row total display
        document.getElementById(`${row}-total-${gridNumber}`).textContent = rowTotal;
        grandTotal += rowTotal;
        
        // Store MC total for result calculation
        if (row === 'mc') {
            mcTotal = rowTotal;
        }
    });
    
    // Update grand total display
    document.getElementById(`grand-total-${gridNumber}`).textContent = grandTotal;
    
    // Update result based on rules
    updateResult(gridNumber, mcTotal, grandTotal);
}

// Function to update result based on scoring rules
function updateResult(gridNumber, mcTotal, grandTotal) {
    // Check if all 4 rows have at least one checkbox checked
    const rows = ['mc', 'perception', 'impact', 've'];
    let allRowsChecked = true;
    
    rows.forEach(row => {
        const checkboxes = document.querySelectorAll(`input[data-row="${row}"][data-grid="${gridNumber}"]`);
        let rowHasChecked = false;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                rowHasChecked = true;
            }
        });
        if (!rowHasChecked) {
            allRowsChecked = false;
        }
    });
    
    let result;
    
    if (!allRowsChecked) {
        result = ''; // Empty if not all rows are checked
    } else {
        // Check MC = 1 rule first (NMC regardless of total)
        if (mcTotal === 1) {
            result = 'NMC';
        } else if (grandTotal <= 5) {
            result = 'NO';
        } else if (grandTotal >= 6 && grandTotal <= 10) {
            result = 'M';
        } else if (grandTotal >= 11) {
            result = 'Y';
        } else {
            result = 'NO'; // Default fallback
        }
    }
    
    document.getElementById(`result-${gridNumber}`).textContent = result;
    
    // Check final result when individual results change (with slight delay to ensure DOM updates)
    setTimeout(checkFinalResult, 10);
}

// Function to ensure only one checkbox per row is checked
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const row = checkbox.dataset.row;
    const grid = checkbox.dataset.grid;
    
    if (checkbox.checked) {
        // Uncheck all other checkboxes in the same row
        const rowCheckboxes = document.querySelectorAll(`input[data-row="${row}"][data-grid="${grid}"]`);
        rowCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
            }
        });
    }
    
    // Update totals after checkbox change
    updateTotals(grid);
    
    // Check final result when any grid changes (with slight delay to ensure all updates complete)
    setTimeout(checkFinalResult, 10);
}

// Add event listeners to all checkboxes
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    // Initialize all totals to 0
    for (let i = 1; i <= 3; i++) {
        updateTotals(i);
    }
    
    // Add event listener for IQ input
    const iqInput = document.getElementById('iq-input');
    iqInput.addEventListener('input', checkFinalResult);
});

// Function to check if all 3 grids are completed and calculate final result
function checkFinalResult() {
    // Get results from all 3 grids
    const result1 = document.getElementById('result-1').textContent;
    const result2 = document.getElementById('result-2').textContent;
    const result3 = document.getElementById('result-3').textContent;
    
    // Check if all 3 grids have results
    if (result1 === '' || result2 === '' || result3 === '') {
        document.getElementById('final-result-container').style.display = 'none';
        return;
    }
    
    // Show final result container
    document.getElementById('final-result-container').style.display = 'block';
    
    // Get IQ marks
    const iqInput = document.getElementById('iq-input').value;
    const iqMarks = parseInt(iqInput) || 0;
    
    // Check if IQ marks is at least 2 digits (minimum 10)
    if (!iqInput || iqMarks < 10) {
        document.getElementById('final-result-container').style.display = 'none';
        return;
    }
    
    // Count results
    const results = [result1, result2, result3];
    const countN = results.filter(r => r === 'NO').length;
    const countM = results.filter(r => r === 'M').length;
    const countY = results.filter(r => r === 'Y').length;
    const countNMC = results.filter(r => r === 'NMC').length;
    
    // Debug logging
    console.log('Results:', results);
    console.log('IQ:', iqMarks);
    console.log('Counts - N:', countN, 'M:', countM, 'Y:', countY, 'NMC:', countNMC);
    
    let finalResult = '';
    let resultClass = '';
    
    // S/Out cases (2 cases) - Check these first
    if (countNMC === 3) {                                 // 3xN(MC)
        finalResult = 'S/Out';
        resultClass = 's-out';
    }
    else if (countN === 3 && iqMarks <= 85) {            // 3xN & 85 and below
        finalResult = 'S/Out';
        resultClass = 's-out';
    }
    // TO BE FULLY BOARDED cases (5 cases)
    else if (countY === 3 || countM === 3) {             // 3xY/M
        finalResult = 'TO BE FULLY BOARDED';
        resultClass = 'fully-boarded';
    }
    else if (countN === 1 && countM === 1 && countY === 1) { // 1xN, 1xM, 1xY
        finalResult = 'TO BE FULLY BOARDED';
        resultClass = 'fully-boarded';
    }
    else if (countN === 2 && countM === 1 && iqMarks >= 91) { // 2xN, 1xM & 91 & Above
        finalResult = 'TO BE FULLY BOARDED';
        resultClass = 'fully-boarded';
    }
    else if (countN === 2 && countY === 1 && iqMarks >= 86) { // 2xN, 1xY & 86 Above
        finalResult = 'TO BE FULLY BOARDED';
        resultClass = 'fully-boarded';
    }
    else if (countN === 1 && countM === 2 && iqMarks >= 83) { // 1xN, 2xM & 83 Above
        finalResult = 'TO BE FULLY BOARDED';
        resultClass = 'fully-boarded';
    }
    else if (countY === 2 && iqMarks >= 86) { // 2xY & 86 and Above
        finalResult = 'TO BE FULLY BOARDED';
        resultClass = 'fully-boarded';
    }
    // REF CASES (4 cases)
    else if (countN === 3 && iqMarks >= 86) {            // 3xN & 86 and Above
        finalResult = 'REF CASES';
        resultClass = 'ref-cases';
    }
    else if (countN === 2 && countM === 1 && iqMarks <= 90) { // 2xN, 1xM & 90 and Below
        finalResult = 'REF CASES';
        resultClass = 'ref-cases';
    }
    else if (countN === 2 && countY === 1 && iqMarks <= 85) { // 2xN, 1xY & 85 and Below
        finalResult = 'REF CASES';
        resultClass = 'ref-cases';
    }
    else if (countN === 1 && countM === 2 && iqMarks <= 82) { // 1xN, 2xM & 82 and Below
        finalResult = 'REF CASES';
        resultClass = 'ref-cases';
    }
    else {
        finalResult = 'UNDETERMINED';
        resultClass = '';
    }
    
    console.log('Final Result:', finalResult);
    
    const finalResultDisplay = document.getElementById('final-result');
    finalResultDisplay.textContent = finalResult;
    finalResultDisplay.className = 'final-result-display ' + resultClass;
}

// Function to clear all inputs and checkboxes
function clearAll() {
    // Clear IQ input
    document.getElementById('iq-input').value = 0;
    
    // Clear all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset all totals
    for (let i = 1; i <= 3; i++) {
        updateTotals(i);
    }
    
    // Hide final result container
    document.getElementById('final-result-container').style.display = 'none';
}
