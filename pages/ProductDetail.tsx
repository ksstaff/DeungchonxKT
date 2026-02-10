import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { db } from '../services/db';
import { IconSpinner, IconArrowRight } from '../components/Icons';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      db.getProductById(id).then(data => {
        setProduct(data);
        setLoading(false);
      });
    }
  }, [id]);

  const goToConsultation = () => {
    navigate('/#consultation-form');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><IconSpinner className="w-10 h-10 text-navy" /></div>;
  if (!product) return <div className="p-20 text-center">Product not found</div>;

  return (
    <div className="bg-white">
      <div className="bg-navy py-20 text-white">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-white/60 hover:text-white mb-4 inline-block">&larr; 돌아가기</Link>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl text-white/80">{product.summary}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <img src={product.image} alt={product.name} className="w-full rounded-2xl shadow-xl" />
          <div>
            <h3 className="text-2xl font-bold text-navy mb-6">상품 상세 정보</h3>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
            
            <div className="mt-12 p-8 bg-cream rounded-xl">
              <h4 className="font-bold text-navy mb-2">등촌샤브칼국수 제휴 혜택</h4>
              <p className="text-gray-700">지금 상담 신청하시면 가맹점 전용 특별 요금과 설치비 지원 혜택을 안내해 드립니다.</p>
              <button 
                onClick={goToConsultation}
                className="mt-6 flex items-center font-bold text-ktRed hover:text-red-700 transition-colors"
              >
                혜택 상담받기 <IconArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Re-use Lead Form Section (Redirect to home form) */}
      <div className="bg-gray-50 py-12 text-center">
        <p className="text-lg font-bold text-navy mb-6">더 자세한 내용이 궁금하신가요?</p>
        <button 
            onClick={goToConsultation}
            className="bg-navy text-white px-8 py-3 rounded-full font-bold hover:bg-navy-light transition-colors"
        >
            상담 신청하러 가기
        </button>
      </div>
    </div>
  );
};