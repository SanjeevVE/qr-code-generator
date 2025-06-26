'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const QRCodeGenerator: React.FC = () => {
  const [qrInputText, setQrInputText] = useState('');
  const [displayQrText, setDisplayQrText] = useState('');
  const [qrTitle, setQrTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [noExpiry, setNoExpiry] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState('/img/userimages/smile.svg');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (downloadSuccess) {
      const timer = setTimeout(() => setDownloadSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [downloadSuccess]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => setLogoUrl(reader.result as string);
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  const handleQrClick = () => {
    if (showLogo && displayQrText) fileInputRef.current?.click();
  };

  const generateQRCode = async (text: string): Promise<string> => {
    const size = 400;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text
    )}&format=png&ecc=H`;

    try {
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw error;
    }
  };

  const handleGenerateQr = async () => {
    if (!qrInputText) return;

    setIsGenerating(true);
    try {
      let finalText = qrInputText;
      if (!noExpiry && expiryDate) {
        finalText = JSON.stringify({
          url: qrInputText,
          expires: new Date(expiryDate).toISOString(),
        });
      }

      const qrDataUrl = await generateQRCode(finalText);
      setQrCodeDataUrl(qrDataUrl);
      setDisplayQrText(finalText);
    } catch (error) {
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!qrCodeDataUrl) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);

        const qrImg = document.createElement('img');
        qrImg.crossOrigin = 'anonymous';

        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          qrImg.src = qrCodeDataUrl;
        });

        ctx.drawImage(qrImg, 0, 0, size, size);

        if (showLogo && logoUrl) {
          const logoImg = document.createElement('img');
          logoImg.crossOrigin = 'anonymous';

          await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = resolve;
            logoImg.src = logoUrl;
          });

          const logoSize = 80;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = qrTitle ? `${qrTitle}.png` : 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
      }
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className='min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8'>
      <div className='bg-white w-full max-w-md p-6 sm:p-8 rounded-xl shadow-lg'>
        <h1 className='text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6'>
          QR Code Generator
        </h1>

        {downloadSuccess && (
          <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm'>
            ✅ QR Code downloaded successfully!
          </div>
        )}

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Text or URL:
            </label>
            <input
              type='text'
              value={qrInputText}
              onChange={(e) => setQrInputText(e.target.value)}
              className='mt-1 w-full p-2 border rounded-md text-black'
              placeholder='Enter your text or URL'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              QR Code Title:
            </label>
            <input
              type='text'
              value={qrTitle}
              onChange={(e) => setQrTitle(e.target.value)}
              className='mt-1 w-full p-2 border rounded-md text-black'
              placeholder='Filename for download'
            />
          </div>

          <div>
            <label className='flex items-center space-x-2 text-sm text-gray-700'>
              <input
                type='checkbox'
                checked={noExpiry}
                onChange={(e) => {
                  setNoExpiry(e.target.checked);
                  if (e.target.checked) setExpiryDate('');
                }}
              />
              <span>No Expiry</span>
            </label>
            {!noExpiry && (
              <input
                type='date'
                value={expiryDate}
                min={today}
                onChange={(e) => setExpiryDate(e.target.value)}
                className='mt-2 w-full p-2 border rounded-md text-black'
              />
            )}
          </div>

          <div>
            <label className='flex items-center space-x-2 text-sm text-gray-700'>
              <input
                type='checkbox'
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
              />
              <span>Add Center Logo</span>
            </label>
          </div>

          <button
            onClick={handleGenerateQr}
            disabled={
              !qrInputText || (!noExpiry && !expiryDate) || isGenerating
            }
            className='w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex justify-center items-center'
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>

        <div
          onClick={handleQrClick}
          className={`relative mt-6 w-full aspect-square max-w-[400px] mx-auto bg-white border-2 border-gray-200 rounded-lg shadow-inner flex items-center justify-center ${
            showLogo && displayQrText ? 'cursor-pointer' : ''
          }`}
        >
          {qrCodeDataUrl ? (
            <div className='text-center w-full'>
              {qrTitle && (
                <p className='mb-2 font-medium text-gray-900'>{qrTitle}</p>
              )}
              <div className='relative w-full flex justify-center'>
                <Image
                  src={qrCodeDataUrl}
                  alt='Generated QR Code'
                  width={256}
                  height={256}
                  className='w-full max-w-[256px] h-auto'
                />
                {showLogo && logoUrl && (
                  <Image
                    src={logoUrl}
                    alt='QR Logo'
                    width={64}
                    height={64}
                    className='absolute w-16 h-16 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full object-cover border-2 border-white'
                  />
                )}
              </div>
              {!noExpiry && expiryDate && (
                <p className='mt-2 text-xs text-red-600'>
                  Expires: {new Date(expiryDate).toLocaleDateString()}
                </p>
              )}
              <p className='mt-2 text-xs text-gray-600 break-words px-2'>
                {qrInputText}
              </p>
            </div>
          ) : (
            <div className='text-center text-sm text-gray-500'>
              <p>Enter text and click "Generate" to preview</p>
              {showLogo && (
                <p className='text-xs text-gray-400 mt-2'>
                  Click here to upload logo after generating
                </p>
              )}
            </div>
          )}
        </div>

        {showLogo && displayQrText && (
          <p className='text-xs text-center text-gray-500 mt-2'>
            Click on the QR code to upload your logo
          </p>
        )}

        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          onChange={handleImageUpload}
          className='hidden'
        />

        <button
          onClick={handleDownload}
          disabled={!qrCodeDataUrl}
          className='mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex justify-center items-center'
        >
          Download QR Code
        </button>
      </div>

      <p className='mt-6 text-gray-800 text-sm text-center'>
        Developed with <span className='text-red-500'>❤️</span> by{' '}
        <a
          href='https://knowaboutsanjeev.netlify.app/'
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:underline'
        >
          Sanjeev
        </a>
      </p>
    </main>
  );
};

export default QRCodeGenerator;
