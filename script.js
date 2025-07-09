document.addEventListener('DOMContentLoaded', () => {
    const ebookUploadForm = document.getElementById('ebook-upload-form');
    const ebookList = document.getElementById('ebook-list');
    const UPI_ID = 'saso84035@okhdfcbank'; // User's UPI ID

    let ebooks = JSON.parse(localStorage.getItem('ebooks')) || [];

    function renderEbooks() {
        ebookList.innerHTML = '';
        if (ebooks.length === 0) {
            ebookList.innerHTML = '<p>No ebooks available yet. Upload one!</p>';
            return;
        }

        ebooks.forEach((ebook, index) => {
            const ebookItem = document.createElement('div');
            ebookItem.classList.add('ebook-item');

            const coverImage = document.createElement('img');
            coverImage.src = ebook.coverPage;
            coverImage.alt = ebook.title + ' Cover';
            ebookItem.appendChild(coverImage);

            const ebookDetails = document.createElement('div');
            ebookDetails.classList.add('ebook-details');

            const title = document.createElement('h3');
            title.textContent = ebook.title;
            ebookDetails.appendChild(title);

            const author = document.createElement('p');
            author.textContent = `Author: ${ebook.author}`;
            ebookDetails.appendChild(author);

            const price = document.createElement('p');
            price.classList.add('price');
            price.textContent = `Price: ₹${ebook.price.toFixed(2)}`;
            if (ebook.discountedPrice) {
                const originalPrice = document.createElement('span');
                originalPrice.classList.add('original-price');
                originalPrice.textContent = `₹${ebook.originalPrice.toFixed(2)}`;
                price.prepend(originalPrice);
                price.innerHTML = `Price: <span class="original-price">₹${ebook.originalPrice.toFixed(2)}</span> ₹${ebook.price.toFixed(2)}`;
            } else {
                price.textContent = `Price: ₹${ebook.price.toFixed(2)}`;
            }
            ebookDetails.appendChild(price);

            const buyButton = document.createElement('button');
            buyButton.classList.add('buy-button');
            buyButton.textContent = 'Buy Now';
            buyButton.addEventListener('click', () => showPaymentOptions(ebook));
            ebookDetails.appendChild(buyButton);

            ebookItem.appendChild(ebookDetails);
            ebookList.appendChild(ebookItem);
        });
    }

    function showPaymentOptions(ebook) {
        const paymentOptionsDiv = document.createElement('div');
        paymentOptionsDiv.classList.add('payment-options');
        paymentOptionsDiv.innerHTML = `
            <h4>Choose Payment Method for ${ebook.title}:</h4>
            <button class="payment-btn" data-app="gpay">Google Pay</button>
            <button class="payment-btn" data-app="phonepe">PhonePe</button>
            <button class="payment-btn" data-app="paytm">Paytm</button>
        `;
        
        // Remove any existing payment options for other ebooks
        document.querySelectorAll('.payment-options').forEach(el => el.remove());
        
        // Append payment options below the ebook item
        const ebookItem = ebookList.querySelector(`.ebook-item:nth-child(${ebooks.indexOf(ebook) + 1})`);
        if (ebookItem) {
            ebookItem.appendChild(paymentOptionsDiv);
        }

        paymentOptionsDiv.querySelectorAll('.payment-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const app = event.target.dataset.app;
                initiatePayment(ebook, app);
            });
        });
    }

    function initiatePayment(ebook, app) {
        const amount = ebook.price.toFixed(2);
        let url = '';

        switch (app) {
            case 'gpay':
                url = `upi://pay?pa=${UPI_ID}&pn=Ebook%20Store&am=${amount}&cu=INR&aid=uGICAgICAgICAgOA==`;
                break;
            case 'phonepe':
                url = `phonepe://pay?pa=${UPI_ID}&pn=Ebook%20Store&am=${amount}&cu=INR`;
                break;
            case 'paytm':
                url = `paytmmp://pay?pa=${UPI_ID}&pn=Ebook%20Store&am=${amount}&cu=INR`;
                break;
            default:
                alert('Invalid payment app selected.');
                return;
        }

        window.location.href = url;
    }

    ebookUploadForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const price = parseFloat(document.getElementById('price').value);
        const discountedPriceInput = document.getElementById('discounted-price');
        const discountedPrice = discountedPriceInput.value ? parseFloat(discountedPriceInput.value) : null;
        const coverPageFile = document.getElementById('cover-page').files[0];
        const pdfFile = document.getElementById('pdf-file').files[0];

        if (pdfFile.size > 100 * 1024 * 1024) { // 100 MB limit
            alert('PDF file size exceeds 100 MB limit.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const coverPageBase64 = e.target.result;

            const newEbook = {
                title,
                author,
                originalPrice: price,
                price: discountedPrice || price,
                coverPage: coverPageBase64,
                pdfFile: URL.createObjectURL(pdfFile) // Store as object URL for demonstration
            };

            ebooks.push(newEbook);
            localStorage.setItem('ebooks', JSON.stringify(ebooks));
            renderEbooks();
            ebookUploadForm.reset();
            alert('Ebook uploaded successfully!');
        };
        reader.readAsDataURL(coverPageFile);
    });

    renderEbooks();
});