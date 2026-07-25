document.addEventListener('DOMContentLoaded', () => {
  const itemTableBody = document.getElementById('itemTableBody');
  const addRowBtn = document.getElementById('addRowBtn');
  const rowTemplate = document.getElementById('rowTemplate');
  const grandTotal = document.getElementById('grandTotal');
  const amountInWords = document.getElementById('amountInWords');
  const quotationDateDisplay = document.getElementById('quotationDateDisplay');
  const toggleModeBtn = document.getElementById('toggleModeBtn');

  // آٹو ڈیٹ سیٹنگ (Format: Dated: Month, DD, YYYY)
  const now = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedDateString = `Dated: ${monthNames[now.getMonth()]}, ${now.getDate()}, ${now.getFullYear()}`;
  
  if (quotationDateDisplay) {
    quotationDateDisplay.textContent = formattedDateString;
  }

  // میٹ اور فوڈ آئٹمز کے لیے ڈیفالٹ ڈیٹا
  const defaultItems = [
    { desc: 'Fresh Boneless Beef (A-Grade Quality Export Standard)', qty: 50, rate: 1250 },
    { desc: 'Frozen Mutton Leg Cuts (Premium Hygienic Packaging)', qty: 30, rate: 2100 }
  ];

  defaultItems.forEach(item => createRow(item.desc, item.qty, item.rate));

  if (addRowBtn) {
    addRowBtn.addEventListener('click', () => {
      createRow();
      recalculate();
    });
  }

  // Toggle Preview Mode Button logic
  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      const isPreview = document.body.classList.toggle('preview-active');
      
      if (isPreview) {
        toggleModeBtn.textContent = 'Edit Mode';
        toggleModeBtn.classList.remove('btn-secondary');
        toggleModeBtn.classList.add('btn-active-mode');
      } else {
        toggleModeBtn.textContent = 'Preview Mode';
        toggleModeBtn.classList.remove('btn-active-mode');
        toggleModeBtn.classList.add('btn-secondary');
      }
    });
  }

  // Textarea Auto Resize Function
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  function createRow(desc = '', qty = 1, rate = 0) {
    if (!rowTemplate || !itemTableBody) return;

    const clone = rowTemplate.content.cloneNode(true);
    const row = clone.querySelector('tr');

    const nameInput = row.querySelector('.item-name');
    const qtyInput = row.querySelector('.item-qty');
    const rateInput = row.querySelector('.item-rate');
    const deleteBtn = row.querySelector('.btn-delete');

    if (nameInput) {
      nameInput.value = desc;
      nameInput.addEventListener('input', () => autoResizeTextarea(nameInput));
    }
    if (qtyInput) qtyInput.value = qty;
    if (rateInput) rateInput.value = rate || '';

    if (qtyInput) qtyInput.addEventListener('input', recalculate);
    if (rateInput) rateInput.addEventListener('input', recalculate);

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        row.remove();
        recalculate();
      });
    }

    itemTableBody.appendChild(row);
    
    if (nameInput) autoResizeTextarea(nameInput);
    
    recalculate();
  }

  function recalculate() {
    let total = 0;
    const rows = itemTableBody.querySelectorAll('.item-row');

    rows.forEach(row => {
      const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
      const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
      const amount = qty * rate;

      const amountSpan = row.querySelector('.item-amount');
      if (amountSpan) amountSpan.textContent = `Rs. ${amount.toLocaleString()}`;
      total += amount;
    });

    if (grandTotal) grandTotal.textContent = `Rs. ${total.toLocaleString()}`;
    if (amountInWords) amountInWords.textContent = numberToEnglishWords(total) + ' Rupees Only';
  }

  function numberToEnglishWords(num) {
    if (num === 0) return 'Zero';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    }

    return inWords(Math.floor(num));
  }
});