import React from 'react';
import './WhatsAppButton.css';

export const WhatsAppButton = () => {
  // Cambia este número por tu número de WhatsApp (incluye código de país sin +)
  // Ejemplo: para Colombia 57 + número: "573001234567"
  const phoneNumber = "573226269216"; // CAMBIA ESTE NÚMERO
  
  // Mensaje predeterminado (opcional)
  const message = "Hola, estoy interesado en Simplia";
  
  // URL de WhatsApp
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  const handleClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="whatsapp-button-container" onClick={handleClick}>
      <svg 
        className="whatsapp-icon" 
        viewBox="0 0 32 32" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill="currentColor" 
          d="M16 0C7.164 0 0 7.163 0 16c0 2.826.736 5.48 2.014 7.79L.07 31.906l8.347-2.19A15.936 15.936 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.256 22.817c-.343.962-2.01 1.764-3.286 1.997-.875.156-2.02.282-5.873-1.262-4.932-1.977-8.112-6.97-8.357-7.293-.243-.323-1.992-2.65-1.992-5.057 0-2.405 1.26-3.588 1.706-4.078.447-.49 1.12-.735 1.782-.735.213 0 .407.01.583.02.525.027.788.063 1.134.88.447 1.05 1.528 3.726 1.66 3.994.134.27.224.583.045.906-.178.323-.268.524-.536.807-.267.284-.561.633-.803.85-.267.242-.546.504-.234.99.312.485 1.387 2.286 2.98 3.704 2.053 1.826 3.783 2.396 4.317 2.665.536.27.848.224 1.16-.134.312-.357 1.34-1.56 1.698-2.096.358-.535.715-.446 1.205-.268.49.18 3.11 1.467 3.645 1.736.536.27.893.402 1.027.625.134.224.134 1.29-.208 2.252z"
        />
      </svg>
      <span className="whatsapp-tooltip">¿Necesitas ayuda?</span>
    </div>
  );
};