// utils/generateQRCode.js

// src/utils/generateQRCode.jsx
import { QRCodeCanvas } from 'qrcode.react';

export const QRCode = ({ value }) => (
  <QRCodeCanvas
    value={value}
    size={128}
    bgColor="#ffffff"
    fgColor="#000000"
    level="H"
    includeMargin
  />
  
);




/* import { QRCodeCanvas } from 'qrcode.react';

export const QRCode = ({ value }) => (
  <QRCodeCanvas value={value} size={128} includeMargin />
);
 */