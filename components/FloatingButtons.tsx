import React, { useEffect, useState } from 'react';
import { IconKakao, IconPhone } from './Icons';
import { useLocation } from 'react-router-dom';

export const FloatingButtons: React.FC = () => {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const scrollToForm = () => {
    const form = document.getElementById('consultation-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };

  const kakaoLink = "https://pf.kakao.com/_xlWgqG";

  return (
    <>
      {/* Desktop/Mobile Floating Kakao */}
      <a
        href={kakaoLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-[56px] h-[56px] bg-[#FEE500] rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        aria-label="카카오톡 상담"
      >
        <IconKakao className="w-8 h-8 text-[#3c1e1e]" />
      </a>

      {/* Mobile Sticky CTA Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 flex md:hidden h-16 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <a 
          href={kakaoLink}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center bg-[#FEE500] text-[#3c1e1e] font-bold text-lg"
        >
          <IconKakao className="w-6 h-6 mr-2" />
          카톡 상담
        </a>
        <button 
          onClick={scrollToForm}
          className="flex-1 flex items-center justify-center bg-ktRed text-white font-bold text-lg"
        >
          <IconPhone className="w-6 h-6 mr-2" />
          상담 신청
        </button>
      </div>
    </>
  );
};
