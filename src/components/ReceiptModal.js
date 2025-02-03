import React, { useState } from 'react';
import { FaClipboard } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Alert from './Alert';
import '../styles/ReceiptModal.css'; // Ensure this CSS file exists

const ReceiptModal = ({ receiptData, onClose }) => {
  const [copiedFieldIndex, setCopiedFieldIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFieldIndex(index);
      setAlertMessage(`Copied: ${text}`);

      setTimeout(() => {
        setCopiedFieldIndex(null);
        setAlertMessage('');
      }, 2000);
    });
  };

const handleShareAsImage = async () => {
    const receiptElement = document.getElementById("receipt-content");
    const buttonsToHide = document.querySelectorAll(".hide-on-share");

    if (!receiptElement) {
        console.error("Receipt element not found");
        return;
    }

    // Hide buttons before capture
    buttonsToHide.forEach(button => button.style.display = "none");

    try {
        // Expand receipt for full capture
        receiptElement.style.maxHeight = "none";
        receiptElement.style.overflow = "visible";

        // Allow DOM reflow before capture
        await new Promise(resolve => setTimeout(resolve, 200));

        // Capture image
        const canvas = await html2canvas(receiptElement, {
            scale: 2,
            useCORS: true,
            windowHeight: receiptElement.scrollHeight
        });

        // Restore buttons
        buttonsToHide.forEach(button => button.style.display = "");

        // Convert to image
        const image = canvas.toDataURL("image/png");

        // Automatically download receipt
        downloadImage(image);
        setAlertMessage("Receipt downloaded successfully.");

        // Attempt Web Share API if supported
        if (navigator.canShare) {
            try {
                const response = await fetch(image);
                const blob = await response.blob();
                const file = new File([blob], "receipt.png", { type: "image/png" });

                await navigator.share({
                    files: [file],
                    title: "Transaction Receipt",
                    text: "Here is your transaction receipt."
                });

                setAlertMessage("Receipt shared successfully.");
            } catch (error) {
                console.warn("Sharing failed, but receipt downloaded.", error);
                setAlertMessage("Sharing failed, but the receipt was downloaded.");
            }
        }
    } catch (error) {
        console.error("Error capturing receipt:", error);
        setAlertMessage("An error occurred while processing the receipt.");
    }
};

// Function to download image automatically
const downloadImage = (imageData) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "receipt.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  return (
    <div className="receipt-modal-overlay">
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage('')} />}

      <div className="receipt-modal">
        <div className="receipt-modal-content" id="receipt-content">
          <div className="receipt-header">
            <img src={require('../assets/images/Exodollarium-01.png')} alt="Exdollarium Logo" className="company-logo" />
            <h2>Exdollarium</h2>
            <p>Official Transaction Receipt</p>
          </div>

          <div className="receipt-content">
            {receiptData.fields.map(({ label, value, copyable }, index) => (
              <div key={index} className="receipt-row">
                <p className="label">{label}:</p>
                <div className="value">
                  <span>{value}</span>
                  {copyable && (
                    <span className="clipboard-icon" onClick={() => handleCopyText(value, index)}>
                      {copiedFieldIndex === index ? "✅" : <FaClipboard />}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-footer">
            <p>Thank you for choosing <strong>Exdollarium</strong>. We appreciate your trust.</p>
            <div className="footer-buttons">
              <button className="share-btn hide-on-share" onClick={handleShareAsImage}>📷 Share as Image</button>
              <button className="close-bt hide-on-share" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
