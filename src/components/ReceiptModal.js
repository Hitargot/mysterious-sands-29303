// src/components/ReceiptModal.js

import React, { useState } from 'react';
import { FaClipboard } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Alert from './Alert';

const ReceiptModal = ({ receipt, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleCopyTransactionId = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShareReceipt = async () => {
    try {
      const receiptElement = document.querySelector('.receipt-modal');
      const canvas = await html2canvas(receiptElement);
      const imgData = canvas.toDataURL('image/png');

      if (navigator.canShare && navigator.canShare({ files: [new File([imgData], 'receipt.png')] })) {
        await navigator.share({
          files: [new File([imgData], 'receipt.png')],
          title: 'Transaction Receipt',
        });
        console.log('Receipt shared successfully');
      } else {
        setAlertMessage('Sharing not supported on this device or permission denied');
      }
    } catch (error) {
      console.error('Error sharing receipt as image:', error);
      setAlertMessage('Error sharing receipt. Please try again.');
    }
  };

  return (
    <div className="receipt-modal">
      {alertMessage && (
        <Alert
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
      <div className="receipt-header">
        <img src={require('../assets/images/Exodollarium-01.png')} alt="Exdollarium Logo" className="company-logo" />
        <h2>Exdollarium</h2>
        <p>Official Transaction Receipt</p>
      </div>

      <div className="receipt-content">
        <div className="receipt-row">
          <p className="label">Date:</p>
          <p className="value">{new Date(receipt.date).toLocaleDateString()}</p>
        </div>
        <div className="receipt-row">
          <p className="label">Time:</p>
          <p className="value">{new Date(receipt.date).toLocaleTimeString()}</p>
        </div>
        <div className="receipt-row">
          <p className="label">Transaction ID:</p>
          <div className="value">
            <span>{receipt.transactionId}</span>
            <span
              className="clipboard-icon"
              onClick={() => handleCopyTransactionId(receipt.transactionId)}
            >
              <FaClipboard />
            </span>
            {isCopied && copiedText === receipt.transactionId && (
              <span className="copied-text">Copied!</span>
            )}
          </div>
        </div>
        <div className="receipt-row">
          <p className="label">Amount:</p>
          <p className="value">{receipt.amount} {receipt.currency || 'NGN'}</p>
        </div>
        <div className="receipt-row">
          <p className="label">Status:</p>
          <p className="value">{receipt.status}</p>
        </div>
        <div className="receipt-row">
          <p className="label">Type:</p>
          <p className="value">{receipt.type}</p>
        </div>

        {receipt.type === 'withdrawal' && receipt.bankId ? (
          <div className="receipt-row">
            <p className="label">Bank ID:</p>
            <p className="value">{receipt.bankId}</p>
          </div>
        ) : receipt.type === 'withdrawal' ? (
          <div className="receipt-row">
            <p className="label">Bank Details:</p>
            <p className="value">No bank details available</p>
          </div>
        ) : null}

        {receipt.confirmationDetails ? (
          <>
            <div className="receipt-row">
              <p className="label">Service Name:</p>
              <p className="value">{receipt.confirmationDetails.serviceName}</p>
            </div>
            <div className="receipt-row">
              <p className="label">User Name:</p>
              <p className="value">{receipt.confirmationDetails.userName}</p>
            </div>
            <div className="receipt-row">
              <p className="label">Note:</p>
              <p className="value">{receipt.confirmationDetails.note}</p>
            </div>
            {receipt.confirmationDetails.fileUrl && (
              <div className="receipt-row">
                <p className="label">File URL:</p>
                <p className="value">
                  <a href={receipt.confirmationDetails.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>
                </p>
              </div>
            )}
            <div className="receipt-row">
              <p className="label">Confirmation Status:</p>
              <p className="value">{receipt.confirmationDetails.confirmationStatus}</p>
            </div>
            <div className="receipt-row">
              <p className="label">Confirmation Date:</p>
              <p className="value">{new Date(receipt.confirmationDetails.confirmationDate).toLocaleDateString()}</p>
            </div>
          </>
        ) : (
          <div className="receipt-row">
            <p className="label">Confirmation:</p>
            <p className="value">No confirmation available for this transaction.</p>
          </div>
        )}
      </div>

      <div className="receipt-footer">
        <button onClick={handleShareReceipt}>Share Receipt</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ReceiptModal;
