import React from 'react';
import { Globe, Mail, Phone, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 py-10 mt-auto border-t-4 border-vinciguerra-gold">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Logo o Titolo Principale */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-bold tracking-wide mb-2">
            Vinciguerra <span className="text-vinciguerra-gold">Beverage</span>
          </h2>
          <div className="h-1 w-12 bg-vinciguerra-gold mx-auto rounded-full"></div>
        </div>

        {/* Parte Testuale - Design più pulito */}
        <p className="text-sm md:text-base mb-8 max-w-md leading-relaxed">
          Sviluppato con cura da <br />
          <span className="text-white font-bold text-lg italic">SuPeR HO.RE.CA. edition</span> 
          <br /> 
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-vinciguerra-gold hover:text-white transition-colors duration-300 underline underline-offset-4 decoration-vinciguerra-gold/50"
          >
            Gloria Natangelo
          </a>
        </p>

        {/* Parte Icone e Contatti - Layout a griglia per mobile */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-6 md:gap-10 mb-10">
          {/* Sito Web */}
          <a 
            href="https://www.superstart.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 hover:text-vinciguerra-gold transition-all duration-300 group"
          >
            <Globe size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-medium">superstart.it</span>
          </a>

          {/* Email */}
          <a 
            href="mailto:info@superstart.it" 
            className="flex items-center justify-center gap-3 hover:text-vinciguerra-gold transition-all duration-300 group"
          >
            <Mail size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">info@superstart.it</span>
          </a>

          {/* Telefono */}
          <a 
            href="tel:+393934533500" 
            className="flex items-center justify-center gap-3 hover:text-vinciguerra-gold transition-all duration-300 group"
          >
            <Phone size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-medium">+39 393 453 3500</span>
          </a>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/393934533500" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 hover:text-vinciguerra-gold transition-all duration-300 group"
          >
            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
        </div>

        {/* Copyright minimo e discreto */}
        <div className="mt-4 pt-6 border-t border-gray-800 w-full text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} SuPeR HO.RE.CA. - Professional B2B Solution
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;