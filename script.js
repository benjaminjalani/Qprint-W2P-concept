document.addEventListener('DOMContentLoaded', () => {
    const filesContainer = document.getElementById('filesContainer');
    const addFileBtn = document.getElementById('addFileBtn');
    const printOrderForm = document.getElementById('printOrderForm');
    const liveSummaryContent = document.getElementById('liveSummaryContent');

    const reminderModal = document.getElementById('reminderModal');
    const modalFileList = document.getElementById('modalFileList');
    const confirmCheckbox = document.getElementById('confirmCheckbox');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalContinueBtn = document.getElementById('modalContinueBtn');
    const collectionTimeInput = document.getElementById('collectionTime');

    let fileCount = 1;

    // Initialize collection time minimum (15 minutes from now)
    setMinCollectionTime();
    updateLiveSummary();

    function setMinCollectionTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        collectionTimeInput.min = minDateTime;
        collectionTimeInput.value = minDateTime;
    }

    // Event Delegation for Form Interactions & Live Updates
    filesContainer.addEventListener('click', handleCardClicks);
    filesContainer.addEventListener('input', updateLiveSummary);
    filesContainer.addEventListener('change', updateLiveSummary);

    function handleCardClicks(e) {
        // Segmented control button activation
        if (e.target.classList.contains('segment-btn')) {
            const group = e.target.closest('.segmented-control');
            group.querySelectorAll('.segment-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateLiveSummary();
        }

        // Counter control buttons (Plus / Minus)
        if (e.target.classList.contains('counter-btn')) {
            const counterControl = e.target.closest('.counter-control');
            const input = counterControl.querySelector('.copies-input');
            let currentValue = parseInt(input.value) || 1;

            if (e.target.classList.contains('plus-btn')) {
                currentValue++;
            } else if (e.target.classList.contains('minus-btn')) {
                if (currentValue > 1) currentValue--;
            }
            input.value = currentValue;
            updateLiveSummary();
        }

        // Remove File Button
        if (e.target.classList.contains('remove-file-btn')) {
            const card = e.target.closest('.file-card');
            card.remove();
            reindexFiles();
            updateLiveSummary();
        }
    }

    // Add Another File Card
    addFileBtn.addEventListener('click', () => {
        fileCount++;
        const cardIndex = filesContainer.querySelectorAll('.file-card').length;

        const newCard = document.createElement('div');
        newCard.className = 'file-card';
        newCard.setAttribute('data-index', cardIndex);

        newCard.innerHTML = `
        <div class="file-card-header">
        <span class="file-card-title">File ${fileCount}</span>
        <button type="button" class="remove-file-btn">Remove</button>
        </div>

        <div class="form-group">
        <label for="fileName_${cardIndex}">File Name *</label>
        <input type="text" id="fileName_${cardIndex}" class="file-name-input" placeholder="e.g. Document.pdf" required>
        </div>

        <div class="form-row">
        <div class="form-group half">
        <label>Print Type</label>
        <div class="segmented-control print-type-group">
        <button type="button" class="segment-btn active" data-value="Colour">Colour</button>
        <button type="button" class="segment-btn" data-value="Black & White">Black & White</button>
        </div>
        </div>

        <div class="form-group half">
        <label for="copies_${cardIndex}">Number of Copies</label>
        <div class="counter-control">
        <button type="button" class="counter-btn minus-btn" aria-label="Decrease copies">-</button>
        <input type="number" id="copies_${cardIndex}" class="copies-input" value="1" min="1" max="999">
        <button type="button" class="counter-btn plus-btn" aria-label="Increase copies">+</button>
        </div>
        </div>
        </div>

        <div class="form-row">
        <div class="form-group half">
        <label for="paperSize_${cardIndex}">Paper Size</label>
        <select id="paperSize_${cardIndex}" class="paper-size-select">
        <option value="A4" selected>A4</option>
        <option value="A3">A3</option>
        <option value="A5">A5</option>
        <option value="Other">Other</option>
        </select>
        </div>

        <div class="form-group half">
        <label>Orientation</label>
        <div class="segmented-control orientation-group">
        <button type="button" class="segment-btn active" data-value="Portrait">Portrait</button>
        <button type="button" class="segment-btn" data-value="Landscape">Landscape</button>
        </div>
        </div>
        </div>

        <div class="form-row">
        <div class="form-group half">
        <label>Printing Side</label>
        <div class="segmented-control side-group">
        <button type="button" class="segment-btn active" data-value="Single-sided">Single-sided</button>
        <button type="button" class="segment-btn" data-value="Double-sided">Double-sided</button>
        </div>
        </div>

        <div class="form-group half">
        <label for="binding_${cardIndex}">Binding</label>
        <select id="binding_${cardIndex}" class="binding-select">
        <option value="No Binding" selected>No Binding</option>
        <option value="Spiral Binding">Spiral Binding</option>
        <option value="Comb Binding">Comb Binding</option>
        <option value="Staple Binding">Staple Binding</option>
        <option value="Other">Other</option>
        </select>
        </div>
        </div>

        <div class="form-group">
        <label for="fileNotes_${cardIndex}">Instructions / Notes (Optional)</label>
        <textarea id="fileNotes_${cardIndex}" class="file-notes-input" placeholder="e.g. Print only specific pages..." rows="2"></textarea>
        </div>
        `;

        filesContainer.appendChild(newCard);
        newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        updateLiveSummary();
    });

    // Re-index file card headers
    function reindexFiles() {
        const cards = filesContainer.querySelectorAll('.file-card');
        cards.forEach((card, idx) => {
            const titleEl = card.querySelector('.file-card-title');
            titleEl.textContent = `File ${idx + 1}`;
        });
    }

    // Live Order Summary Engine
    function updateLiveSummary() {
        const fileCards = filesContainer.querySelectorAll('.file-card');
        let summaryHTML = '';
        let hasValidFiles = false;

        fileCards.forEach((card, idx) => {
            const fileNameInput = card.querySelector('.file-name-input');
            const fileName = fileNameInput.value.trim() || `(File ${idx + 1} - unnamed)`;
            const printType = card.querySelector('.print-type-group .segment-btn.active').getAttribute('data-value');
            const copies = card.querySelector('.copies-input').value || 1;
            const paperSize = card.querySelector('.paper-size-select').value;
            const binding = card.querySelector('.binding-select').value;

            if (fileNameInput.value.trim()) {
                hasValidFiles = true;
            }

            summaryHTML += `
            <div class="summary-item">
            <div class="summary-filename">${idx + 1}. ${escapeHTML(fileName)}</div>
            <div class="summary-specs">${copies}x ${paperSize} | ${printType} | ${binding}</div>
            </div>
            `;
        });

        if (!hasValidFiles && fileCards.length === 1 && !fileCards[0].querySelector('.file-name-input').value.trim()) {
            liveSummaryContent.innerHTML = `<p class="summary-placeholder">Configure your print files to preview order details.</p>`;
        } else {
            liveSummaryContent.innerHTML = summaryHTML;
        }
    }

    // Form Submission Interception & Validation
    printOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fileCards = filesContainer.querySelectorAll('.file-card');
        let isValid = true;
        let firstInvalidInput = null;

        // Validate collection time (at least 15 mins ahead)
        const selectedTime = new Date(collectionTimeInput.value);
        const minAllowedTime = new Date(collectionTimeInput.min);
        if (isNaN(selectedTime.getTime()) || selectedTime < minAllowedTime) {
            alert('Please select a collection time at least 15 minutes from now.');
            collectionTimeInput.focus();
            return;
        }

        // Validate file names
        fileCards.forEach(card => {
            const nameInput = card.querySelector('.file-name-input');
            if (!nameInput.value.trim()) {
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = nameInput;
            }
        });

        // Validate customer details
        const customerName = document.getElementById('customerName');
        const customerPhone = document.getElementById('customerPhone');

        if (!customerName.value.trim()) {
            isValid = false;
            if (!firstInvalidInput) firstInvalidInput = customerName;
        }
        if (!customerPhone.value.trim()) {
            isValid = false;
            if (!firstInvalidInput) firstInvalidInput = customerPhone;
        }

        if (!isValid) {
            alert('Please fill in all required file names and customer details.');
            if (firstInvalidInput) firstInvalidInput.focus();
            return;
        }

        // Populate Modal File List
        modalFileList.innerHTML = '';
        fileCards.forEach((card, idx) => {
            const fileName = card.querySelector('.file-name-input').value.trim();
            const item = document.createElement('div');
            item.className = 'modal-file-item';
            item.textContent = `${idx + 1}. ${fileName}`;
            modalFileList.appendChild(item);
        });

        // Reset Modal Checkbox and Open
        confirmCheckbox.checked = false;
        modalContinueBtn.disabled = true;
        reminderModal.classList.add('active');
    });

    // Modal Checkbox Logic
    confirmCheckbox.addEventListener('change', () => {
        modalContinueBtn.disabled = !confirmCheckbox.checked;
    });

    // Close Modal on Cancel
    modalCancelBtn.addEventListener('click', () => {
        reminderModal.classList.remove('active');
    });

    // Continue to Gmail & Generate Mailto Link
    modalContinueBtn.addEventListener('click', () => {
        const fileCards = filesContainer.querySelectorAll('.file-card');
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const rawCollectionTime = collectionTimeInput.value;

        const formattedCollectionTime = new Date(rawCollectionTime).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        let fileDetailsText = '';
        let fileNamesListText = '';

        fileCards.forEach((card, idx) => {
            const fileNum = idx + 1;
            const fileName = card.querySelector('.file-name-input').value.trim();
            const printType = card.querySelector('.print-type-group .segment-btn.active').getAttribute('data-value');
            const copies = card.querySelector('.copies-input').value || 1;
            const paperSize = card.querySelector('.paper-size-select').value;
            const orientation = card.querySelector('.orientation-group .segment-btn.active').getAttribute('data-value');
            const printingSide = card.querySelector('.side-group .segment-btn.active').getAttribute('data-value');
            const binding = card.querySelector('.binding-select').value;
            const fileNotes = card.querySelector('.file-notes-input').value.trim();

            fileDetailsText += `FILE ${fileNum}\n`;
            fileDetailsText += `File Name: ${fileName}\n`;
            fileDetailsText += `Print Type: ${printType}\n`;
            fileDetailsText += `Copies: ${copies}\n`;
            fileDetailsText += `Paper Size: ${paperSize}\n`;
            fileDetailsText += `Orientation: ${orientation}\n`;
            fileDetailsText += `Printing: ${printingSide}\n`;
            fileDetailsText += `Binding: ${binding}\n`;
            if (fileNotes) {
                fileDetailsText += `Notes: ${fileNotes}\n`;
            }
            fileDetailsText += `\n`;

            fileNamesListText += `${fileNum}. ${fileName}\n`;
        });

        const emailBody =
        `Hello QuickPrint Team,

        I would like to place the following print order.

        CUSTOMER DETAILS:
        Name: ${customerName}
        Phone: ${customerPhone}
        Collection Time: ${formattedCollectionTime}

        ----------------------------------------

        ${fileDetailsText.trim()}

        ----------------------------------------

        FILES TO ATTACH:
        ${fileNamesListText.trim()}

        Please attach all the above files before sending this email.

        Thank you.`;

        const shopEmail = "orders@quickprint.local";
        const emailSubject = "New Print Order - " + customerName;

        const mailtoLink = `mailto:${encodeURIComponent(shopEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        reminderModal.classList.remove('active');
        window.location.href = mailtoLink;
    });

    // Utility: Simple HTML Escape to prevent injection in live preview
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
                           tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
