import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeroConfig, Product, CaseStudy } from '../types';
import { db } from '../services/db';
import { IconCheck, IconArrowRight, IconSpinner } from '../components/Icons';

export const Home: React.FC = () => {
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  
  // Form State
  const [form, setForm] = useState({ storeName: '', phone: '', date: '', time: '10:00' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const location = useLocation();

  useEffect(() => {
    db.initialize();
    db.getHeroConfig().then(setHeroConfig);
    db.getProducts().then(setProducts);
    db.getCases().then(setCases);
  }, []);

  // Handle Scroll to Section based on Hash or Path
  useEffect(() => {
    const handleScroll = () => {
        let targetId = '';
        if (location.hash) {
            targetId = location.hash.replace('#', '');
        } else if (location.pathname === '/products') {
            targetId = 'products';
        } else if (location.pathname === '/cases') {
            targetId = 'cases';
        }

        if (targetId) {
            const elem = document.getElementById(targetId);
            if (elem) {
                // Add a small delay to ensure DOM is ready/layout settled
                setTimeout(() => {
                    const headerOffset = 80; // height of sticky header
                    const elementPosition = elem.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
            
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }, 100);
            }
        }
    };

    handleScroll();
  }, [location, heroConfig, products]); // Re-run when location changes or data loads

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await db.addLead(form);
    setIsSubmitting(false);
    setShowSuccessModal(true);
    setForm({ storeName: '', phone: '', date: '', time: '10:00' });
  };

  if (!heroConfig) return <div className="min-h-screen flex items-center justify-center"><IconSpinner className="w-12 h-12 text-navy" /></div>;

  return (
    <div className="flex flex-col gap-0">
      
      {/* 1. Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <img src={heroConfig.imageUrl} alt="Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-2xl">
            {heroConfig.showBadge && (
              <div className="inline-block bg-accentRed/90 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider shadow-lg">
                {heroConfig.badgeText}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-8 whitespace-pre-line">
              {heroConfig.headline}
            </h1>
            
            <ul className="space-y-4 mb-10">
              {heroConfig.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center text-cream md:text-lg font-medium">
                  <div className="w-6 h-6 rounded-full bg-skyTeal flex items-center justify-center mr-3 text-navy">
                    <IconCheck className="w-4 h-4" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-ktRed text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-red-900/20 hover:bg-red-600 transition-all transform hover:-translate-y-1"
            >
              무료 상담 신청하기
            </button>
          </div>
        </div>
      </section>

      {/* 2. Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-deepTeal font-bold tracking-widest text-sm uppercase mb-2 block">Our Solutions</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">가맹점 전용 KT 패키지</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map(product => (
              <Link to={`/products/${product.id}`} key={product.id} className="group block bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="h-64 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-navy mb-3 group-hover:text-ktRed transition-colors">{product.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{product.summary}</p>
                  <div className="flex items-center text-skyTeal font-bold">
                    상세보기 <IconArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Case Studies Section (Infinite Loop) */}
      <section id="cases" className="py-20 bg-cream overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">성공적인 도입 사례</h2>
          <p className="text-slate-600 mt-4">이미 많은 점주님들이 경험하고 계십니다.</p>
        </div>

        <div className="relative w-full">
            <div className="flex w-[200%] animate-infinite-scroll">
              {/* Ensure we have enough items to scroll smoothly. If empty, show nothing or placeholder */}
              {cases.length > 0 && [...cases, ...cases, ...cases, ...cases].map((item, idx) => (
                <Link to={`/cases/${item.id}`} key={`${item.id}-${idx}`} className="flex-shrink-0 w-[300px] md:w-[400px] mx-4 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48">
                    <img src={item.image} alt={item.storeName} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-xl text-navy">{item.storeName}</h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{item.region}</span>
                    </div>
                    <p className="text-sm text-ktRed font-medium mb-3">{item.productUsed}</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.content}</p>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </section>

      {/* 4. Consultation Form */}
      <section id="consultation-form" className="py-24 bg-navy relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy mb-4">공식 파트너십 상담 신청</h2>
              <p className="text-gray-600">등촌샤브칼국수 가맹점주님을 위한 전담팀이 배정됩니다.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">매장명</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-ktRed focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="예: 강서본점"
                    value={form.storeName}
                    onChange={e => setForm({...form, storeName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">연락처</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-ktRed focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">상담 희망일</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-ktRed focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">통화 희망 시간</label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-ktRed focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                  >
                    <option>09:00 - 11:00</option>
                    <option>11:00 - 13:00</option>
                    <option>13:00 - 15:00</option>
                    <option>15:00 - 18:00</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-ktRed text-white font-bold text-xl py-4 rounded-xl hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isSubmitting ? <IconSpinner className="w-6 h-6 mr-2" /> : '상담 신청하기'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                수집된 정보는 상담 목적으로만 사용되며, 일정 기간 후 파기됩니다.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IconCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-2">신청 완료</h3>
            <p className="text-gray-600 mb-8">상담 신청이 완료되었습니다.<br/>담당자가 빠르게 연락드리겠습니다.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-navy text-white font-bold py-3 rounded-xl hover:bg-navy-light"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};