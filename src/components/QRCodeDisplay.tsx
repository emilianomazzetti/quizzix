import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-white/10 rounded-xl animate-pulse text-xs text-slate-400"
      >
        Caricamento QR...
      </div>
    );
  }

  return (
    <div className={`p-3 bg-white rounded-2xl shadow-xl inline-block ${className}`}>
      <img
        src={dataUrl}
        alt={`QR Code per ${value}`}
        width={size}
        height={size}
        className="rounded-lg block"
      />
    </div>
  );
};
