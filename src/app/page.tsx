'use client';
import React, { useState, useRef, useEffect } from 'react';

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
      const timer = setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
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
      console.error('Failed to generate QR code:', error);
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

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrCodeDataUrl;
        });

        ctx.drawImage(qrImg, 0, 0, size, size);

        if (showLogo && logoUrl) {
          try {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
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
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();
          } catch (logoError) {
            console.log('Logo loading failed, continuing without logo');
          }
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
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className='min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8'>
      <div className='bg-white w-full max-w-md p-8 rounded-xl shadow-lg'>
        <h1 className='text-3xl font-bold text-center text-gray-900 mb-6'>
          QR Code Generator
        </h1>

        {downloadSuccess && (
          <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center'>
            <svg
              className='w-5 h-5 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            QR Code downloaded successfully!
          </div>
        )}

        <label className='block mb-3 text-gray-900 font-medium text-sm'>
          Text or URL:
        </label>
        <input
          type='text'
          value={qrInputText}
          onChange={(e) => setQrInputText(e.target.value)}
          className='w-full mb-4 p-3 border border-gray-300 rounded-lg text-gray-900'
          placeholder='Paste your URL here'
        />

        <label className='block mb-3 text-gray-900 font-medium text-sm'>
          QR Code Title:
        </label>
        <input
          type='text'
          value={qrTitle}
          onChange={(e) => setQrTitle(e.target.value)}
          className='w-full mb-4 p-3 border border-gray-300 rounded-lg text-gray-900'
          placeholder='For filename'
        />

        <div className='mb-4'>
          <label className='flex items-center text-gray-900'>
            <input
              type='checkbox'
              checked={noExpiry}
              onChange={(e) => {
                setNoExpiry(e.target.checked);
                if (e.target.checked) setExpiryDate('');
              }}
              className='mr-2'
            />
            No Expiry
          </label>
          {!noExpiry && (
            <input
              type='date'
              value={expiryDate}
              min={today}
              onChange={(e) => setExpiryDate(e.target.value)}
              className='w-full mt-2 p-2 border rounded text-gray-900'
            />
          )}
        </div>

        <div className='mb-4'>
          <label className='flex items-center text-gray-900'>
            <input
              type='checkbox'
              checked={showLogo}
              onChange={(e) => setShowLogo(e.target.checked)}
              className='mr-2'
            />
            Add Center Logo
          </label>
        </div>

        <button
          onClick={handleGenerateQr}
          disabled={!qrInputText || (!noExpiry && !expiryDate) || isGenerating}
          className='w-full bg-green-600 text-white py-3 rounded-lg mb-6 hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center'
        >
          {isGenerating ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate QR Code'
          )}
        </button>

        <div
          onClick={handleQrClick}
          className={`relative flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-200 rounded-lg shadow-inner min-h-[320px] mb-6 ${
            showLogo && displayQrText ? 'cursor-pointer' : ''
          }`}
          style={{ width: '400px', height: '400px', margin: '0 auto' }}
        >
          {qrCodeDataUrl ? (
            <div className='flex flex-col items-center justify-center w-full h-full'>
              {qrTitle && (
                <p className='mb-4 font-medium text-gray-900 text-center'>
                  {qrTitle}
                </p>
              )}
              <div className='relative'>
                <img
                  src={qrCodeDataUrl}
                  alt='Generated QR Code'
                  className='w-64 h-64 block'
                  style={{ width: '256px', height: '256px' }}
                />
                {showLogo && logoUrl && (
                  <img
                    src={logoUrl}
                    alt='QR Logo'
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full object-cover border-2 border-white'
                  />
                )}
              </div>
              {!noExpiry && expiryDate && (
                <p className='mt-4 text-xs text-red-600 text-center'>
                  Expires: {new Date(expiryDate).toLocaleDateString()}
                </p>
              )}
              <p className='mt-2 text-xs text-gray-600 break-all text-center max-w-full px-2'>
                {qrInputText}
              </p>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center text-center'>
              <svg
                className='w-16 h-16 text-gray-300 mb-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z'
                />
              </svg>
              <p className='text-gray-500 text-sm'>
                Enter text and click "Generate" to preview
              </p>
              {showLogo && (
                <p className='text-gray-400 text-xs mt-2'>
                  Click here to upload logo after generating
                </p>
              )}
            </div>
          )}
        </div>

        {showLogo && displayQrText && (
          <p className='text-xs text-center text-gray-500 mb-4'>
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
          className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          Download QR Code
        </button>
      </div>

      <p className='mt-8 text-gray-800 text-sm text-center'>
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
