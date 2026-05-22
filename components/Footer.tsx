import React from 'react';
import { Globe, Mail, Phone, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-red-500 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Parte Testuale */}
        <p className="text-sm md:text-base mb-6">
          <span className="font-bold text-vinciguerra-gold">SuPeR HO.RE.CA. edition</span> 
          <br className="md:hidden" /> 
          {" "}per{" "}
          <a 
            href="https://www.vinciguerrabeverage.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-vinciguerra-gold transition-colors"
          >
            Vinciguerra Beverage Srl
          </a>
        </p>

        {/* Parte Icone e Contatti */}
        <div className="flex flex-wrap justify-center gap-6 text-gray-300">
          {/* Sito Web */}
          <a 
            href="https://www.superstart.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-vinciguerra-gold transition-colors"
          >
            <Globe size={20} />
            <span className="text-sm">superstart.it</span>
          </a>

          {/* Email */}
          <a 
            href="mailto:info@superstart.it" 
            className="flex items-center gap-2 hover:text-vinciguerra-gold transition-colors"
          >
            <Mail size={20} />
            <span className="text-sm">info@superstart.it</span>
          </a>

          {/* Telefono */}
          <a 
            href="tel:+393934533500" 
            className="flex items-center gap-2 hover:text-vinciguerra-gold transition-colors"
          >
            <Phone size={20} />
            <span className="text-sm">+39 393 453 3500</span>
          </a>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/393934533500" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-vinciguerra-gold transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm">WhatsApp</span>
          </a>
        </div>

        {/* Copyright minimo */}
        <div className="mt-8 pt-4 border-t border-gray-700 w-full text-[10px] text-gray-500">
          © {new Date().getFullYear()} SuPeR HO.RE.CA. - Tutti i diritti riservati
        </div>
      </div>
    </footer>
  );
};

export default Footer;