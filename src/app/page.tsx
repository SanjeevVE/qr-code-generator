'use client';
import React, { useState, useRef, FC } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const App: FC = () => {
  const [qrInputText, setQrInputText] = useState<string>('');
  const [displayQrText, setDisplayQrText] = useState<string>('');
  const [qrTitle, setQrTitle] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [noExpiry, setNoExpiry] = useState<boolean>(true);
  const qrSize: number = 256;
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setQrInputText(event.target.value);
  };

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setQrTitle(event.target.value);
  };

  const handleExpiryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setExpiryDate(event.target.value);
  };

  const handleNoExpiryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNoExpiry(event.target.checked);
    if (event.target.checked) {
      setExpiryDate('');
    }
  };

  const handleGenerateQr = (): void => {
    let finalText = qrInputText;
    
    // Add expiry information if set and not "no expiry"
    if (!noExpiry && expiryDate) {
      const expiry = new Date(expiryDate).toISOString();
      finalText = JSON.stringify({
        url: qrInputText,
        expires: expiry
      });
    }
    
    setDisplayQrText(finalText);
  };

  const handleDownload = (): void => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        // Create a new canvas with padding
        const paddedCanvas = document.createElement('canvas');
        const mediumSize = 400; // Medium size for the final image
        
        // Set the canvas size to include padding
        paddedCanvas.width = mediumSize;
        paddedCanvas.height = mediumSize;
        
        // Get the context and fill with white background
        const ctx = paddedCanvas.getContext('2d');
        if (ctx) {
          // Fill with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
          
          // Calculate position to center the QR code
          const position = (mediumSize - qrSize) / 2;
          
          // Draw the QR code onto the new canvas
          ctx.drawImage(canvas, position, position);
          
          // Convert to image and download
          const imageDataUrl = paddedCanvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = imageDataUrl;
          downloadLink.download = qrTitle ? `${qrTitle}.png` : 'qrcode.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      }
    }
  };

  // Calculate minimum date (today) for the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans antialiased'>
      <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center text-gray-800 mb-6'>
          QR Code Generator
        </h1>

        <div className='mb-4'>
          <label
            htmlFor='qrInput'
            className='block text-gray-700 text-sm font-semibold mb-2'
          >
            Enter Text or URL:
          </label>
          <input
            id='qrInput'
            type='text'
            className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
            value={qrInputText}
            onChange={handleInputChange}
            placeholder='Paste your URL here...'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='qrTitle'
            className='block text-gray-700 text-sm font-semibold mb-2'
          >
            QR Code Title (for download):
          </label>
          <input
            id='qrTitle'
            type='text'
            className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
            value={qrTitle}
            onChange={handleTitleChange}
            placeholder='Enter a title for your QR code'
          />
        </div>

        <div className='mb-6'>
          <div className='flex items-center mb-2'>
            <input
              id='noExpiry'
              type='checkbox'
              className='mr-2 h-4 w-4'
              checked={noExpiry}
              onChange={handleNoExpiryChange}
            />
            <label
              htmlFor='noExpiry'
              className='text-gray-700 text-sm font-semibold'
            >
              No Expiry
            </label>
          </div>
          
          {!noExpiry && (
            <div>
              <label
                htmlFor='expiryDate'
                className='block text-gray-700 text-sm font-semibold mb-2'
              >
                Expiry Date:
              </label>
              <input
                id='expiryDate'
                type='date'
                className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                value={expiryDate}
                onChange={handleExpiryChange}
                min={today}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleGenerateQr}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 mb-6
            ${
              qrInputText.trim() && (noExpiry || expiryDate)
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          disabled={!qrInputText.trim() || (!noExpiry && !expiryDate)}
        >
          Generate QR Code
        </button>

        <div
          ref={qrCodeRef}
          className='flex flex-col justify-center items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner min-h-[200px] mb-6'
        >
          {displayQrText ? (
            <>
              {qrTitle && <p className='mb-3 font-medium text-gray-700'>{qrTitle}</p>}
              <QRCodeCanvas
                value={displayQrText}
                size={qrSize}
                level='H'
                includeMargin={false}
              />
              {!noExpiry && expiryDate && (
                <p className='mt-2 text-xs text-red-500'>
                  Expires: {new Date(expiryDate).toLocaleDateString()}
                </p>
              )}
              <p className='mt-2 text-xs text-gray-500 break-all max-w-full overflow-hidden'>
                {qrInputText}
              </p>
            </>
          ) : (
            <p className='text-gray-500'>
              Enter text and click &quot;Generate&quot; to create a QR code.
            </p>
          )}
        </div>

        <button
          onClick={handleDownload}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300
            ${
              displayQrText
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          disabled={!displayQrText}
        >
          Download QR Code
        </button>
      </div>

      <p className='mt-8 text-gray-600 text-sm text-center'>
        Developed with <span className='text-red-500'>❤️</span> by{' '}
        <a
          href='https://knowaboutsanjeev.netlify.app/' 
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:underline hover:text-blue-800 transition'
        >
          Sanjeev
        </a>
      </p>
    </div>
  );
};

export default App;