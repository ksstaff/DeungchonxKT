import React from 'react';
import { Link } from 'react-router-dom';
import { IconAdmin } from './Icons';
import { FloatingButtons } from './FloatingButtons';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black text-navy tracking-tighter">
              등촌샤브칼국수 X KT
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/products" className="hidden md:block text-gray-600 hover:text-navy font-medium">상품안내</Link>
            <Link to="/cases" className="hidden md:block text-gray-600 hover:text-navy font-medium">도입사례</Link>
            <button 
              onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-navy text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-navy-light transition-colors"
            >
              상담신청
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">등촌샤브칼국수 x KT 공식 파트너십</h3>
              <p className="mb-2">본 프로모션 사이트는 등촌샤브칼국수 가맹점주님을 위한 공식 안내 페이지입니다.</p>
              <p>KT 기업서비스 공식 가입 센터</p>
            </div>
            <div className="flex flex-col md:items-end">
              <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-4">
                <IconAdmin className="w-4 h-4" />
                관리자 로그인
              </Link>
              <p className="text-xs">© 2024 KT Corp. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      <FloatingButtons />
    </div>
  );
};

export default Layout;