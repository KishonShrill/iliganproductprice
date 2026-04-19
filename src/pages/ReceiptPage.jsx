import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import '../styles/receipt.scss';

function ReceiptPage() {
    const [cart, setCart] = useState({});
    const receiptRef = useRef(null); // Create a ref for the receipt container

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    const cartItemQuantity = Object.keys(cart).length;
    const groupedEntries = Object.entries(cart).reduce((acc, [id, item]) => {
        // console.log(id)
        if (!acc[item.location]) acc[item.location] = []
        acc[item.location].push({ ...item, id })
        return acc;
    }, {});
    const cartItemEntries = Object.entries(groupedEntries);
    const total = Object.values(cart).reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    );

    const generateReceiptText = () => {
        let receiptText = "🧾 Budget Buddy - Receipt\n\n";
        if (Object.keys(cart).length === 0) {
            receiptText += "Your receipt is empty.\n";
        } else {
            cartItemEntries.forEach(([location, items]) => {
                receiptText += `📍 ${location}\n`;
                items.forEach((item) => {
                    receiptText += `  - ${item.name} x${item.quantity} ₱${(item.price * item.quantity).toFixed(2)}\n`;
                });
                receiptText += `\n`;
            });
            receiptText += `Total: ₱${total.toFixed(2)}\n`;
        }
        return receiptText;
    };


    // Function to copy receipt as text
    const copyReceiptAsText = async () => {
        const receiptText = generateReceiptText();
        try {
            await navigator.clipboard.writeText(receiptText);
            alert('Receipt copied to clipboard!'); // Provide user feedback
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy receipt. Please try again.');
        }
    };

    // Function to download receipt as CSV
    const downloadReceiptAsCSV = () => {
        // 1. Setup the CSV Headers
        let csvContent = "Location,Product Name,Quantity,Price\n";

        // 2. Loop through the grouped cart items
        cartItemEntries.forEach(([location, items]) => {
            items.forEach((item) => {
                // Escape quotes and wrap strings in quotes to prevent commas from breaking columns
                const safeLocation = `"${location.replace(/"/g, '""')}"`;
                const safeName = `"${item.name.replace(/"/g, '""')}"`;
                const totalPrice = (item.price * item.quantity).toFixed(2);

                // Add the row to our CSV string
                csvContent += `${safeLocation},${safeName},${item.quantity},${totalPrice}\n`;
            });
        });

        // 3. Add a final row for the Total
        csvContent += `,,Total,${total.toFixed(2)}\n`;

        // 4. Create the file and trigger the download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'budget-buddy-receipt.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Function to download receipt as image
    const downloadReceiptAsImage = async () => {
        if (!receiptRef.current) return;

        try {
            // Wait for fonts to ensure perfect text rendering
            await document.fonts.ready;

            // Filter function to hide the action buttons from the image
            const filter = (node) => {
                return !node.classList?.contains('receipt-actions');
            };

            const node = receiptRef.current;

            const dataUrl = await toPng(node, {
                cacheBust: true,
                pixelRatio: 2,
                filter: filter,
                // --- THE FIX: Force explicit dimensions and reset positioning ---
                width: node.offsetWidth,
                height: node.offsetHeight,
                style: {
                    margin: '0',       // Prevents 'margin: auto' from shifting the canvas
                    transform: 'none', // Prevents any CSS transforms from skewing it
                    position: 'static' // Ensures the box is drawn exactly at 0,0
                }
            });

            const link = document.createElement('a');
            link.download = 'budget-buddy-receipt.png';
            link.href = dataUrl;
            link.click();

        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Failed to download image. Please try again.');
        }
    };

    return (
        <div className="receipt-container max-md:mb-[72px] max-md:mt-0 m-8 mx-auto" ref={receiptRef}>
            <h2 className='text-center inter-bold'>🧾 Budget Buddy - Receipt</h2>
            {cartItemQuantity === 0 ? (
                <div className="empty-receipt">
                    <p>Your receipt is empty.</p>
                    <Link to="/locations" className="start-shopping-btn">Start Adding Items</Link>
                </div>
            ) : (
                <>
                    <div className="receipt-items">
                        {cartItemEntries.map(([category, items]) => {
                            return (
                                <div key={category} className='receipt-category-group'>
                                    <p className='receipt-category'>{category}</p>
                                    <div>
                                        {items.map((item) => {
                                            return (
                                                <div key={item.id} className="receipt-item">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-qty">x{item.quantity}</span>
                                                    <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="receipt-total">Total: ₱{total.toFixed(2)}</div>

                    {/* The filter function above will automatically hide this whole div in the screenshot! */}
                    <div className="receipt-actions">
                        <button onClick={copyReceiptAsText} className="download-btn">
                            Text
                            <img src="/UI/copy-01-stroke-rounded.svg" alt="Copy as Text" />
                        </button>
                        <button onClick={downloadReceiptAsCSV} className="download-btn">
                            CSV
                            <img src="/UI/file-download-stroke-rounded.svg" alt="Download as CSV" />
                        </button>
                        <button onClick={downloadReceiptAsImage} className="download-btn">
                            Image
                            <img src="/UI/image-download-02-stroke-rounded-white.svg" alt="Download as Image" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
export default React.memo(ReceiptPage)
