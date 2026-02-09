import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { AdminTab, HeroConfig, Product, CaseStudy, Lead } from '../types';
import { IconSpinner } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.LEADS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Data States
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Auth Check
  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [h, p, c, l] = await Promise.all([
        db.getHeroConfig(),
        db.getProducts(),
        db.getCases(),
        db.getLeads(),
      ]);
      setHeroConfig(h);
      setProducts(p);
      setCases(c);
      setLeads(l);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;

    setIsUploading(true);
    try {
        const url = await db.uploadImage(file);
        return url;
    } catch (error) {
        alert('이미지 업로드 실패: ' + error);
        return null;
    } finally {
        setIsUploading(false);
    }
  };

  // --- Handlers ---
  const saveHero = async () => {
    if (heroConfig) {
      await db.updateHeroConfig(heroConfig);
      alert('변경사항이 저장/동기화 되었습니다.');
    }
  };

  const deleteProduct = async (id: string) => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
        await db.deleteProduct(id);
        fetchData();
    }
  };

  const deleteCase = async (id: string) => {
      if(window.confirm('정말 삭제하시겠습니까?')) {
          await db.deleteCase(id);
          fetchData();
      }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><IconSpinner className="w-8 h-8 text-navy" /></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h1 className="font-bold text-xl">등촌xKT 관리자</h1>
          </div>
          <button onClick={handleLogout} className="text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20">로그아웃</button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
          <nav className="space-y-2">
            {[
              { id: AdminTab.HERO, label: '히어로 관리' },
              { id: AdminTab.PRODUCTS, label: '상품 관리' },
              { id: AdminTab.CASES, label: '도입사례 관리' },
              { id: AdminTab.LEADS, label: '상담 신청 내역' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-hidden">
          
          {/* HERO TAB */}
          {activeTab === AdminTab.HERO && heroConfig && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-navy">히어로 섹션 관리</h2>
                  <button onClick={saveHero} className="bg-ktRed text-white px-6 py-2 rounded font-bold hover:bg-red-600 shadow-md">
                    변경사항 저장하기 (동기화)
                  </button>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">헤드라인</label>
                <textarea 
                  className="w-full border rounded p-2" 
                  rows={3}
                  value={heroConfig.headline}
                  onChange={e => setHeroConfig({...heroConfig, headline: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">메인 이미지 (URL 또는 업로드)</label>
                <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      className="w-full border rounded p-2 bg-gray-50" 
                      value={heroConfig.imageUrl}
                      readOnly
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium">
                        이미지 업로드
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                                const url = await handleImageUpload(e);
                                if (url) setHeroConfig({...heroConfig, imageUrl: url});
                            }}
                        />
                    </label>
                    {isUploading && <span className="text-sm text-blue-500 animate-pulse">업로드 중...</span>}
                </div>
                {heroConfig.imageUrl && <img src={heroConfig.imageUrl} alt="Preview" className="h-40 object-cover rounded mt-2 border" />}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">배지 문구</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2" 
                  value={heroConfig.badgeText}
                  onChange={e => setHeroConfig({...heroConfig, badgeText: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">혜택 목록 (3개)</label>
                {heroConfig.benefits.map((benefit, idx) => (
                  <input 
                    key={idx}
                    type="text" 
                    className="w-full border rounded p-2 mb-2" 
                    value={benefit}
                    onChange={e => {
                        const newBenefits = [...heroConfig.benefits];
                        newBenefits[idx] = e.target.value;
                        setHeroConfig({...heroConfig, benefits: newBenefits});
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === AdminTab.PRODUCTS && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-navy">상품 관리</h2>
                <button className="bg-skyTeal text-white px-4 py-2 rounded text-sm hover:bg-deepTeal" onClick={() => alert("데모 버전: 수정/삭제 기능만 테스트 가능합니다.")}>+ 상품 추가</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">* 상품 수정 시 자동 저장 기능은 구현되어 있지 않으므로, 데모에서는 삭제 기능만 활성화됩니다.</p>
              <div className="grid gap-4">
                {products.map(p => (
                  <div key={p.id} className="border p-4 rounded flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h4 className="font-bold">{p.name}</h4>
                        <p className="text-sm text-gray-500 truncate w-64">{p.summary}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-navy" onClick={() => alert('이미지 교체 기능을 포함한 편집창이 열립니다.')}>수정</button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteProduct(p.id)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CASES TAB */}
          {activeTab === AdminTab.CASES && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-navy">도입 사례 관리</h2>
                <button className="bg-skyTeal text-white px-4 py-2 rounded text-sm hover:bg-deepTeal" onClick={() => alert("데모 버전: 수정/삭제 기능만 테스트 가능합니다.")}>+ 사례 추가</button>
              </div>
              <div className="grid gap-4">
                {cases.map(c => (
                  <div key={c.id} className="border p-4 rounded flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={c.image} alt={c.storeName} className="w-16 h-16 object-cover rounded" />
                        <div>
                            <h4 className="font-bold">{c.storeName}</h4>
                            <p className="text-sm text-gray-500">{c.productUsed} / {c.region}</p>
                        </div>
                    </div>
                    <button className="text-red-500 hover:text-red-700" onClick={() => deleteCase(c.id)}>삭제</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === AdminTab.LEADS && (
            <div>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-navy">상담 신청 내역</h2>
                  <button className="text-sm text-gray-500 underline" onClick={fetchData}>새로고침</button>
              </div>
              
              {/* Analytics Chart */}
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">최근 상담 신청 추이</h3>
                  <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={leads.slice(0, 7).map(l => ({ name: l.date, count: 1 }))}> 
                              <XAxis dataKey="name" fontSize={12} />
                              <YAxis hide />
                              <Tooltip />
                              <Bar dataKey="count" fill="#296374" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm">
                      <th className="p-3">신청일</th>
                      <th className="p-3">매장명</th>
                      <th className="p-3">연락처</th>
                      <th className="p-3">희망일시</th>
                      <th className="p-3">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">아직 상담 내역이 없습니다.</td></tr>
                    ) : (
                        leads.map(lead => (
                        <tr key={lead.id} className="border-b hover:bg-gray-50 text-sm">
                            <td className="p-3 text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-navy">{lead.storeName}</td>
                            <td className="p-3">{lead.phone}</td>
                            <td className="p-3">{lead.date} {lead.time}</td>
                            <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">접수완료</span></td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};