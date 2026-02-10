import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { AdminTab, HeroConfig, Product, CaseStudy, Lead, FooterConfig } from '../types';
import { IconSpinner, IconArrowUp, IconArrowDown } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.LEADS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Data States
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

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
      const [h, f, p, c, l] = await Promise.all([
        db.getHeroConfig(),
        db.getFooterConfig(),
        db.getProducts(),
        db.getCases(),
        db.getLeads(),
      ]);
      setHeroConfig(h);
      setFooterConfig(f);
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
        return null;
    } finally {
        setIsUploading(false);
        e.target.value = '';
    }
  };

  // --- Hero Handlers ---
  const saveHero = async () => {
    if (heroConfig) {
      await db.updateHeroConfig(heroConfig);
      alert('변경사항이 저장되었습니다.');
    }
  };

  // --- Footer Handlers ---
  const saveFooter = async () => {
    if (footerConfig) {
        await db.updateFooterConfig(footerConfig);
        alert('푸터 설정이 저장되었습니다.');
    }
  };

  // --- Product Handlers ---
  const openProductModal = (product?: Product) => {
    if (product) {
        setEditingProduct({ ...product });
    } else {
        setEditingProduct({
            id: '',
            name: '',
            summary: '',
            description: '',
            image: ''
        });
    }
    setIsProductModalOpen(true);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.image) {
        alert('상품명과 이미지는 필수입니다.');
        return;
    }
    const p = { ...editingProduct };
    if (!p.id) p.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    await db.saveProduct(p);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
        await db.deleteProduct(id);
        fetchData();
    }
  };

  const moveProduct = async (index: number, direction: 'up' | 'down') => {
    const newProducts = [...products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newProducts.length) return;

    // Swap
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    
    setProducts(newProducts); // Optimistic UI update
    await db.updateProductOrder(newProducts);
  };

  // --- Case Handlers ---
  const openCaseModal = (item?: CaseStudy) => {
    if (item) {
        setEditingCase({ ...item });
    } else {
        setEditingCase({
            id: '',
            storeName: '',
            region: '',
            productUsed: '',
            content: '',
            image: ''
        });
    }
    setIsCaseModalOpen(true);
  };

  const saveCase = async () => {
    if (!editingCase) return;
    if (!editingCase.storeName || !editingCase.image) {
        alert('매장명과 이미지는 필수입니다.');
        return;
    }
    const c = { ...editingCase };
    if (!c.id) c.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    await db.saveCase(c);
    setIsCaseModalOpen(false);
    setEditingCase(null);
    fetchData();
  };

  const deleteCase = async (id: string) => {
      if(window.confirm('정말 삭제하시겠습니까?')) {
          await db.deleteCase(id);
          fetchData();
      }
  };

  const moveCase = async (index: number, direction: 'up' | 'down') => {
    const newCases = [...cases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCases.length) return;

    // Swap
    [newCases[index], newCases[targetIndex]] = [newCases[targetIndex], newCases[index]];
    
    setCases(newCases);
    await db.updateCaseOrder(newCases);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><IconSpinner className="w-8 h-8 text-navy" /></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-navy text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h1 className="font-bold text-xl">등촌xKT 관리자</h1>
          </div>
          <button onClick={handleLogout} className="text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20">로그아웃</button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
          <nav className="space-y-2">
            {[
              { id: AdminTab.LEADS, label: '상담 신청 내역' },
              { id: AdminTab.HERO, label: '히어로 관리' },
              { id: AdminTab.PRODUCTS, label: '상품 관리' },
              { id: AdminTab.CASES, label: '도입사례 관리' },
              { id: AdminTab.FOOTER, label: '푸터 관리' },
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

        <main className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-hidden">
          
          {/* HERO TAB */}
          {activeTab === AdminTab.HERO && heroConfig && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-navy">히어로 섹션 관리</h2>
                  <button onClick={saveHero} className="bg-ktRed text-white px-6 py-2 rounded font-bold hover:bg-red-600 shadow-md">저장하기</button>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">헤드라인</label>
                <textarea className="w-full border rounded p-2" rows={3} value={heroConfig.headline} onChange={e => setHeroConfig({...heroConfig, headline: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">메인 이미지</label>
                <div className="flex items-center gap-4">
                    {heroConfig.imageUrl && <img src={heroConfig.imageUrl} alt="Preview" className="h-32 object-cover rounded border" />}
                    <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium h-fit flex items-center gap-2">
                        {isUploading ? <IconSpinner className="w-4 h-4" /> : null}
                        {isUploading ? '업로드 중' : '이미지 변경'}
                        <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={async (e) => {
                                const url = await handleImageUpload(e);
                                if (url) setHeroConfig({...heroConfig, imageUrl: url});
                            }}
                        />
                    </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">배지 문구</label>
                <input type="text" className="w-full border rounded p-2" value={heroConfig.badgeText} onChange={e => setHeroConfig({...heroConfig, badgeText: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">혜택 목록</label>
                {heroConfig.benefits.map((benefit, idx) => (
                  <input key={idx} type="text" className="w-full border rounded p-2 mb-2" value={benefit} onChange={e => {
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
                <button className="bg-skyTeal text-white px-4 py-2 rounded text-sm hover:bg-deepTeal font-bold" onClick={() => openProductModal()}>+ 상품 추가</button>
              </div>
              <div className="grid gap-4">
                {products.map((p, idx) => (
                  <div key={p.id} className="border p-4 rounded flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 mr-2">
                          <button onClick={() => moveProduct(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500">
                             <IconArrowUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveProduct(idx, 'down')} disabled={idx === products.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500">
                             <IconArrowDown className="w-4 h-4" />
                          </button>
                      </div>
                      <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded bg-gray-100 border border-gray-200" />
                      <div>
                        <h4 className="font-bold text-navy">{p.name}</h4>
                        <p className="text-sm text-gray-500 truncate w-64">{p.summary}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-navy px-3 py-1 border rounded text-sm hover:bg-white" onClick={() => openProductModal(p)}>수정</button>
                        <button className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded text-sm hover:bg-red-50" onClick={() => deleteProduct(p.id)}>삭제</button>
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
                <button className="bg-skyTeal text-white px-4 py-2 rounded text-sm hover:bg-deepTeal font-bold" onClick={() => openCaseModal()}>+ 사례 추가</button>
              </div>
              <div className="grid gap-4">
                {cases.map((c, idx) => (
                  <div key={c.id} className="border p-4 rounded flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1 mr-2">
                          <button onClick={() => moveCase(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500">
                             <IconArrowUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveCase(idx, 'down')} disabled={idx === cases.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500">
                             <IconArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                        <img src={c.image} alt={c.storeName} className="w-16 h-16 object-cover rounded bg-gray-100 border border-gray-200" />
                        <div>
                            <h4 className="font-bold text-navy">{c.storeName}</h4>
                            <p className="text-sm text-gray-500">{c.productUsed} / {c.region}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-navy px-3 py-1 border rounded text-sm hover:bg-white" onClick={() => openCaseModal(c)}>수정</button>
                        <button className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded text-sm hover:bg-red-50" onClick={() => deleteCase(c.id)}>삭제</button>
                    </div>
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
                  <button className="text-sm text-gray-500 underline hover:text-navy" onClick={fetchData}>새로고침</button>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">최근 상담 신청 추이</h3>
                  <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={leads.slice(0, 10).reverse().map(l => ({ name: l.date.slice(5), count: 1 }))}> 
                              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis hide />
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                              <Bar dataKey="count" fill="#296374" radius={[4, 4, 4, 4]} barSize={20} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                      <th className="p-4 font-medium">신청일</th>
                      <th className="p-4 font-medium">매장명</th>
                      <th className="p-4 font-medium">연락처</th>
                      <th className="p-4 font-medium">희망일시</th>
                      <th className="p-4 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">아직 상담 내역이 없습니다.</td></tr>
                    ) : (
                        leads.map(lead => (
                        <tr key={lead.id} className="border-b hover:bg-gray-50 text-sm last:border-0 transition-colors">
                            <td className="p-4 text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-navy">{lead.storeName}</td>
                            <td className="p-4 font-mono text-gray-600">{lead.phone}</td>
                            <td className="p-4 text-gray-600">{lead.date} {lead.time}</td>
                            <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">접수완료</span></td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FOOTER TAB */}
          {activeTab === AdminTab.FOOTER && footerConfig && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-navy">푸터 관리</h2>
                  <button onClick={saveFooter} className="bg-ktRed text-white px-6 py-2 rounded font-bold hover:bg-red-600 shadow-md">저장하기</button>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">저작권 문구 (Copyright)</label>
                <input type="text" className="w-full border rounded p-2 focus:ring-2 focus:ring-navy outline-none" value={footerConfig.copyright} onChange={e => setFooterConfig({...footerConfig, copyright: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">하단 연락처/안내 문구</label>
                <input type="text" className="w-full border rounded p-2 focus:ring-2 focus:ring-navy outline-none" value={footerConfig.contactInfo} onChange={e => setFooterConfig({...footerConfig, contactInfo: e.target.value})} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-navy">{editingProduct.id ? '상품 수정' : '새 상품 추가'}</h3>
                    <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">상품명</label>
                        <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">요약 설명</label>
                        <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none" value={editingProduct.summary} onChange={e => setEditingProduct({...editingProduct, summary: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">상세 설명</label>
                        <textarea className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none h-32" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">상품 이미지</label>
                        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg bg-gray-50">
                            {editingProduct.image ? (
                                <img src={editingProduct.image} alt="Preview" className="w-full sm:w-40 h-32 object-cover rounded-lg bg-white shadow-sm" />
                            ) : (
                                <div className="w-full sm:w-40 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">이미지 없음</div>
                            )}
                            <div className="flex-1">
                                <label className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isUploading ? 'bg-gray-400' : 'bg-navy hover:bg-navy-light'} cursor-pointer transition-colors w-full sm:w-auto`}>
                                    {isUploading ? <IconSpinner className="w-4 h-4 mr-2" /> : null}
                                    {isUploading ? '업로드 중' : '이미지 업로드'}
                                    <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                                        const url = await handleImageUpload(e);
                                        if (url) setEditingProduct({...editingProduct, image: url});
                                    }} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={() => setIsProductModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">취소</button>
                    <button onClick={saveProduct} className="px-5 py-2.5 bg-navy text-white rounded-lg font-bold hover:bg-navy-light shadow-md transition-all transform active:scale-95">저장하기</button>
                </div>
            </div>
        </div>
      )}

      {/* Case Modal */}
      {isCaseModalOpen && editingCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-navy">{editingCase.id ? '도입사례 수정' : '새 사례 추가'}</h3>
                    <button onClick={() => setIsCaseModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">매장명</label>
                            <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none" value={editingCase.storeName} onChange={e => setEditingCase({...editingCase, storeName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">지역</label>
                            <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none" value={editingCase.region} onChange={e => setEditingCase({...editingCase, region: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">도입 상품</label>
                        <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none" value={editingCase.productUsed} onChange={e => setEditingCase({...editingCase, productUsed: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">인터뷰/내용</label>
                        <textarea className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent outline-none h-32" value={editingCase.content} onChange={e => setEditingCase({...editingCase, content: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">사례 이미지</label>
                        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg bg-gray-50">
                            {editingCase.image ? (
                                <img src={editingCase.image} alt="Preview" className="w-full sm:w-40 h-32 object-cover rounded-lg bg-white shadow-sm" />
                            ) : (
                                <div className="w-full sm:w-40 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">이미지 없음</div>
                            )}
                            <div className="flex-1">
                                <label className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isUploading ? 'bg-gray-400' : 'bg-navy hover:bg-navy-light'} cursor-pointer transition-colors w-full sm:w-auto`}>
                                    {isUploading ? <IconSpinner className="w-4 h-4 mr-2" /> : null}
                                    {isUploading ? '업로드 중' : '이미지 업로드'}
                                    <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                                        const url = await handleImageUpload(e);
                                        if (url) setEditingCase({...editingCase, image: url});
                                    }} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={() => setIsCaseModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">취소</button>
                    <button onClick={saveCase} className="px-5 py-2.5 bg-navy text-white rounded-lg font-bold hover:bg-navy-light shadow-md transition-all transform active:scale-95">저장하기</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};