import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CaseStudy } from '../types';
import { db } from '../services/db';
import { IconSpinner } from '../components/Icons';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseItem, setCaseItem] = useState<CaseStudy | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      db.getCaseById(id).then(data => {
        setCaseItem(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><IconSpinner className="w-10 h-10 text-navy" /></div>;
  if (!caseItem) return <div className="p-20 text-center">Case not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-deepTeal py-20 text-white">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-white/60 hover:text-white mb-4 inline-block">&larr; 돌아가기</Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 px-3 py-1 rounded text-sm">{caseItem.region}</span>
            <span className="bg-ktRed px-3 py-1 rounded text-sm font-bold">{caseItem.productUsed}</span>
          </div>
          <h1 className="text-4xl font-bold">{caseItem.storeName} 도입 사례</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <img src={caseItem.image} alt={caseItem.storeName} className="w-full h-80 md:h-[500px] object-cover rounded-2xl shadow-xl mb-12" />
        
        <div className="prose prose-lg max-w-none">
          <h3 className="text-2xl font-bold text-navy mb-6">점주님 인터뷰</h3>
          <div className="relative p-8 bg-gray-50 rounded-2xl border-l-4 border-ktRed">
             <p className="text-xl text-gray-700 italic font-medium">"{caseItem.content}"</p>
          </div>
          
          <div className="mt-12">
            <h4 className="text-xl font-bold text-navy mb-4">도입 효과</h4>
            <p className="text-gray-600 leading-relaxed">
              해당 매장은 {caseItem.productUsed} 도입 이후 매장 운영 효율성이 크게 증대되었습니다. 
              특히 피크타임 시 고객 응대 시간이 단축되었으며, 직원들의 업무 만족도 또한 상승하였습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};