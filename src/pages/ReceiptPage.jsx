import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
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
    acc[item.location].push({...item, id})
    return acc;
  }, {});
  const cartItemEntries = Object.entries(groupedEntries);
  const total = Object.values(cart).reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  // Helper function to generate receipt text
  // ! DEPRECATED
  // const generateReceiptText = () => {
  //   let receiptText = "🧾 Receipt\n\n";
  //   if (Object.keys(cart).length === 0) {
  //     receiptText += "Your receipt is empty.\n";
  //   } else {
  //     Object.entries(cart).forEach(([productId, item]) => {
  //       receiptText += `${item.name} x${item.quantity} ₱${(item.price * item.quantity).toFixed(2)}\n`;
  //     });
  //     receiptText += `\nTotal: ₱${total.toFixed(2)}\n`;
  //   }
  //   return receiptText;
  // };
  const generateReceiptText = () => {
    let receiptText = "🧾 Receipt\n\n";
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

  // Function to download receipt as text
  const downloadReceiptAsText = () => {
    const receiptText = generateReceiptText();
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to download receipt as image
  const downloadReceiptAsImage = () => {
    if (receiptRef.current) {
      html2canvas(receiptRef.current, { scale: 2 }).then(canvas => { // Increased scale for better resolution
        const imgData = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgData;
        a.download = 'receipt.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }
  };

  return (
    <div className="receipt-container" ref={receiptRef}>
      <h2>🧾 Receipt</h2>
      {cartItemQuantity === 0 ? (
        <div className="empty-receipt">
          <p>Your receipt is empty.</p>
          <Link to="/locations" className="start-shopping-btn">Start Adding Items</Link>
        </div>
      ) : (
        <>
          <div className="receipt-items">
            {/* {Object.entries(cart).map(([productId, item]) => (
              <div key={productId} className="receipt-item">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">x{item.quantity}</span>
                <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))} */}

            {cartItemEntries.map(([category, items]) => {
              return (
                <div key={category} className='receipt-category-group'>
                  <p className='receipt-category'>{category}</p>
                  <div>
                    {items.map((item) => {
                      // console.log(item)
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
          <div className="receipt-actions">
            <button onClick={copyReceiptAsText} className="download-btn">
              Text
              <img src="/UI/copy-01-stroke-rounded.svg" alt="Copy as Text" />
            </button>
            <button onClick={downloadReceiptAsText} className="download-btn">
              File
              <img src="/UI/file-download-stroke-rounded.svg" alt="Download as Text" />
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