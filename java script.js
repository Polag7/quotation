document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const companyNameInput = document.getElementById('company-name');
    const companyAddressInput = document.getElementById('company-address');
    const quoteDateInput = document.getElementById('quote-date');
    const tableBody = document.getElementById('table-body');
    const grandTotalEl = document.getElementById('grand-total');
    const amountInWordsEl = document.getElementById('amount-in-words');
    const btnAddRow = document.getElementById('btn-add-row');
    const btnPreview = document.getElementById('btn-preview');
    const btnSavePdf = document.getElementById('btn-save-pdf');
    const previewBtnText = document.getElementById('preview-btn-text');
    const quotationPaper = document.getElementById('quotation-paper');

    let isPreviewMode = false;

    // Set Default Today Date and Initial Rows
    function init() {
        const today = new Date().toISOString().split('T')[0];
        quoteDateInput.value = today;

        // Default initial rows
        addRow('Item Sample 1', 1, 2000);
        addRow('Item Sample 2', 1, 1000);
    }

    // Number to Words Converter (Pakistani / English Rupees)
    function numberToWords(num) {
        if (num === 0) return 'Zero Rupees Only';
        if (num < 0) return 'Negative Amount';

        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function inWords(n) {
            if ((n = n.toString()).length > 9) return 'Overflow';
            let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n_array) return ''; 
            let str = '';
            str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
            str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
            str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
            str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
            str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
            return str.trim();
        }

        const integerPart = Math.floor(num);
        const decimalPart = Math.round((num - integerPart) * 100);

        let words = inWords(integerPart) + ' Rupees';
        
        if (decimalPart > 0) {
            words += ' and ' + inWords(decimalPart) + ' Paisa';
        }

        return words + ' Only';
    }

    // Currency Formatting Function
    function formatCurrency(amount) {
        return 'Rs. ' + amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
        });
    }

    // Add New Row
    function addRow(itemText = '', qtyValue = 1, rateValue = 0) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="col-item">
                <input type="text" class="input-editable item-name" placeholder="Item Name / Description" value="${itemText}">
            </td>
            <td class="col-qty">
                <input type="number" class="input-editable item-qty" min="0" step="1" value="${qtyValue}" placeholder="0">
            </td>
            <td class="col-rate">
                <input type="number" class="input-editable item-rate" min="0" step="any" value="${rateValue}" placeholder="0">
            </td>
            <td class="col-amount row-amount">
                Rs. 0
            </td>
            <td class="col-action print-hide">
                <button type="button" class="btn-delete-row" title="Delete Row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
        attachRowEvents(row);
        calculateTotals();
    }

    // Attach Dynamic Input Events to Row
    function attachRowEvents(row) {
        const qtyInput = row.querySelector('.item-qty');
        const rateInput = row.querySelector('.item-rate');
        const nameInput = row.querySelector('.item-name');
        const deleteBtn = row.querySelector('.btn-delete-row');

        const updateRowCalculation = () => {
            // Negative number safety validation
            if (qtyInput.value < 0) qtyInput.value = 0;
            if (rateInput.value < 0) rateInput.value = 0;

            const qty = parseFloat(qtyInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            const amount = qty * rate;

            row.querySelector('.row-amount').textContent = formatCurrency(amount);
            calculateTotals();
        };

        qtyInput.addEventListener('input', updateRowCalculation);
        rateInput.addEventListener('input', updateRowCalculation);
        
        nameInput.addEventListener('input', () => {
            if (nameInput.value.trim()) nameInput.classList.remove('input-error');
        });

        deleteBtn.addEventListener('click', () => {
            if (tableBody.children.length > 1) {
                row.remove();
                calculateTotals();
            } else {
                alert("Quotation must have at least one item row.");
            }
        });
    }

    // Calculate Grand Total & Words
    function calculateTotals() {
        let grandTotal = 0;
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const qtyInput = row.querySelector('.item-qty');
            const rateInput = row.querySelector('.item-rate');

            const qty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;
            const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
            const amount = qty * rate;

            const amountTd = row.querySelector('.row-amount');
            if (amountTd) amountTd.textContent = formatCurrency(amount);

            grandTotal += amount;
        });

        grandTotalEl.textContent = formatCurrency(grandTotal);
        amountInWordsEl.textContent = numberToWords(grandTotal);
    }

    // Form Validation Check
    function validateForm() {
        let isValid = true;

        if (!companyNameInput.value.trim()) {
            companyNameInput.classList.add('input-error');
            isValid = false;
        } else {
            companyNameInput.classList.remove('input-error');
        }

        const itemInputs = tableBody.querySelectorAll('.item-name');
        itemInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('input-error');
                isValid = false;
            } else {
                input.classList.remove('input-error');
            }
        });

        return isValid;
    }

    // Event Listeners for Toolbar Buttons
    btnAddRow.addEventListener('click', () => {
        addRow();
    });

    companyNameInput.addEventListener('input', () => {
        if (companyNameInput.value.trim()) companyNameInput.classList.remove('input-error');
    });

    btnPreview.addEventListener('click', () => {
        isPreviewMode = !isPreviewMode;
        document.body.classList.toggle('preview-mode', isPreviewMode);
        
        if (isPreviewMode) {
            previewBtnText.textContent = 'Edit Mode';
            btnPreview.classList.remove('btn-outline');
            btnPreview.classList.add('btn-primary');
        } else {
            previewBtnText.textContent = 'Preview';
            btnPreview.classList.remove('btn-primary');
            btnPreview.classList.add('btn-outline');
        }
    });

    btnSavePdf.addEventListener('click', () => {
        if (!validateForm()) {
            alert("Please fill all required fields (Company Name & Item Descriptions).");
            return;
        }

        document.body.classList.add('preview-mode');

        const opt = {
            margin:       [5, 5, 5, 5],
            filename:     `Quotation_${companyNameInput.value.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${quoteDateInput.value}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(quotationPaper).save().then(() => {
            if (!isPreviewMode) {
                document.body.classList.remove('preview-mode');
            }
        });
    });

    // Run Initialization
    init();
});