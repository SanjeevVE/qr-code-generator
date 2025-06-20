'use client';
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import imageCompression from 'browser-image-compression';

const QRCodeGenerator: React.FC = () => {
  const [qrInputText, setQrInputText] = useState('');
  const [displayQrText, setDisplayQrText] = useState('');
  const [qrTitle, setQrTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [noExpiry, setNoExpiry] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState('/img/userimages/smile.svg');
  const qrSize = 256;

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await imageCompression(e.target.files[0], {
          maxSizeMB: 0.01,
          maxWidthOrHeight: 50,
          useWebWorker: true,
        });
        const reader = new FileReader();
        reader.onloadend = () => setLogoUrl(reader.result as string);
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  const handleQrClick = () => {
    if (showLogo) fileInputRef.current?.click();
  };

  const handleGenerateQr = () => {
    let finalText = qrInputText;
    if (!noExpiry && expiryDate) {
      finalText = JSON.stringify({ url: qrInputText, expires: new Date(expiryDate).toISOString() });
    }
    setDisplayQrText(finalText);
  };

  const handleDownload = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (!canvas) return;

    const paddedCanvas = document.createElement('canvas');
    const ctx = paddedCanvas.getContext('2d');
    const size = 400;
    paddedCanvas.width = size;
    paddedCanvas.height = size;

    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      const pos = (size - qrSize) / 2;
      ctx.drawImage(canvas, pos, pos);

      if (showLogo && logoUrl) {
        const img = new Image();
        img.src = logoUrl;
        img.onload = () => {
          const logoSize = 64;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          ctx.restore();
          downloadImage(paddedCanvas.toDataURL('image/png'));
        };
      } else {
        downloadImage(paddedCanvas.toDataURL('image/png'));
      }
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = qrTitle ? `${qrTitle}.png` : 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">QR Code Generator</h1>

        <label className="block mb-3 text-gray-900 font-medium text-sm">Text or URL:</label>
        <input
          type="text"
          value={qrInputText}
          onChange={(e) => setQrInputText(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg text-gray-900"
          placeholder="Paste your URL here"
        />

        <label className="block mb-3 text-gray-900 font-medium text-sm">QR Code Title:</label>
        <input
          type="text"
          value={qrTitle}
          onChange={(e) => setQrTitle(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg text-gray-900"
          placeholder="For filename"
        />

        <div className="mb-4">
          <label className="flex items-center text-gray-900">
            <input
              type="checkbox"
              checked={noExpiry}
              onChange={(e) => {
                setNoExpiry(e.target.checked);
                if (e.target.checked) setExpiryDate('');
              }}
              className="mr-2"
            />
            No Expiry
          </label>
          {!noExpiry && (
            <input
              type="date"
              value={expiryDate}
              min={today}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full mt-2 p-2 border rounded text-gray-900"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center text-gray-900">
            <input
              type="checkbox"
              checked={showLogo}
              onChange={(e) => setShowLogo(e.target.checked)}
              className="mr-2"
            />
            Add Center Logo
          </label>
        </div>

        <button
          onClick={handleGenerateQr}
          disabled={!qrInputText || (!noExpiry && !expiryDate)}
          className="w-full bg-green-600 text-white py-3 rounded-lg mb-6 hover:bg-green-700 disabled:bg-gray-400"
        >
          Generate QR Code
        </button>

        <div
          ref={qrCodeRef}
          onClick={handleQrClick}
          className={`relative flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-inner min-h-[200px] mb-6 ${
            showLogo ? 'cursor-pointer' : ''
          }`}
        >
          {displayQrText ? (
            <>
              {qrTitle && <p className="mb-2 font-medium text-gray-900">{qrTitle}</p>}
              <QRCodeCanvas value={displayQrText} size={qrSize} level="H" includeMargin={false} />
              {showLogo && (
                <img
                  src={logoUrl}
                  alt="QR Logo"
                  className="absolute w-16 h-16 rounded-full object-cover"
                />
              )}
              {!noExpiry && expiryDate && (
                <p className="mt-2 text-xs text-red-600">
                  Expires: {new Date(expiryDate).toLocaleDateString()}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-900 break-all text-center">{qrInputText}</p>
            </>
          ) : (
            <p className="text-gray-700 text-sm">Enter text and click "Generate" to preview</p>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          onClick={handleDownload}
          disabled={!displayQrText}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Download QR Code
        </button>
      </div>

      <p className="mt-8 text-gray-800 text-sm text-center">
        Developed with <span className="text-red-500">❤️</span> by{' '}
        <a
          href="https://knowaboutsanjeev.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Sanjeev
        </a>
      </p>
    </main>
  );
};

export default QRCodeGenerator;
