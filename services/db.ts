import { Product, CaseStudy, Lead, HeroConfig, FooterConfig } from '../types';
import { supabase } from './supabaseClient';

// --- Initial Fallback Data ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'KT 하이오더',
    summary: '테이블에서 바로 주문하는 스마트 오더 시스템',
    description: '인건비 절감과 주문 누락 방지를 위한 최고의 솔루션입니다. 등촌샤브칼국수 매장 환경에 최적화된 UI를 제공합니다.',
    image: 'https://picsum.photos/id/445/600/400',
    orderIndex: 0
  },
  {
    id: '2',
    name: 'KT 매장 인터넷',
    summary: '끊김 없는 안정적인 매장 전용 인터넷',
    description: 'POS, 키오스크, CCTV 등 다양한 매장 기기를 끊김 없이 연결하는 기가급 인터넷 서비스입니다.',
    image: 'https://picsum.photos/id/2/600/400',
    orderIndex: 1
  },
  {
    id: '3',
    name: 'KT 서빙로봇',
    summary: '무거운 냄비도 안전하게 서빙하는 AI 로봇',
    description: '뜨거운 육수와 무거운 식기를 안전하게 서빙합니다. 스마트 자율주행 기술로 매장 내 이동이 자유롭습니다.',
    image: 'https://picsum.photos/id/201/600/400',
    orderIndex: 2
  },
];

const INITIAL_CASES: CaseStudy[] = [
  {
    id: '1',
    storeName: '강서본점',
    region: '서울',
    productUsed: '하이오더 + 서빙로봇',
    image: 'https://picsum.photos/id/292/600/400',
    content: '피크타임 회전율이 150% 증가했습니다. 고객님들도 너무 좋아하십니다.',
    orderIndex: 0
  },
  {
    id: '2',
    storeName: '일산점',
    region: '경기',
    productUsed: '하이오더',
    image: 'https://picsum.photos/id/435/600/400',
    content: '주문 실수가 0건으로 줄어들었습니다. 직원들의 피로도도 확연히 낮아졌어요.',
    orderIndex: 1
  },
];

const INITIAL_HERO: HeroConfig = {
  headline: '등촌샤브칼국수 본사와 KT가\n공식 파트너십을 체결했습니다',
  imageUrl: 'https://picsum.photos/id/433/1200/600',
  badgeText: 'Official Partnership',
  showBadge: true,
  benefits: [
    '가맹점 전용 특별 혜택 제공',
    'KT 본사 전담팀의 1:1 케어',
    '안정적인 매장 운영 솔루션 지원'
  ]
};

const INITIAL_FOOTER: FooterConfig = {
  copyright: '© 2024 KT Corp. All rights reserved.',
  contactInfo: 'KT 기업서비스 공식 가입 센터 | 문의: 1551-8891'
};

const STORAGE_KEYS = {
  PRODUCTS: 'kt_dc_products',
  CASES: 'kt_dc_cases',
  LEADS: 'kt_dc_leads',
  HERO: 'kt_dc_hero',
  FOOTER: 'kt_dc_footer',
};

// Helper for local storage delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').order('orderIndex', { ascending: true });
      if (!error && data) return data;
    }
    // Fallback
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let products = data ? JSON.parse(data) : INITIAL_PRODUCTS;
    // Ensure sorting by orderIndex
    return products.sort((a: Product, b: Product) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return data;
      return undefined;
    }
    const products = await db.getProducts();
    return products.find(p => p.id === id);
  },
  
  saveProduct: async (product: Product): Promise<void> => {
    // If new product without orderIndex, put it at the end
    if (product.orderIndex === undefined) {
       const existing = await db.getProducts();
       const maxOrder = existing.reduce((max, p) => Math.max(max, p.orderIndex || 0), 0);
       product.orderIndex = maxOrder + 1;
    }

    if (supabase) {
        await supabase.from('products').upsert(product);
        return;
    }
    const products = await db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  updateProductOrder: async (products: Product[]): Promise<void> => {
    // Re-assign orderIndex based on array index
    const updatedProducts = products.map((p, idx) => ({ ...p, orderIndex: idx }));
    
    if (supabase) {
        await supabase.from('products').upsert(updatedProducts);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (supabase) {
        await supabase.from('products').delete().eq('id', id);
        return;
    }
    const products = await db.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  // --- Cases ---
  getCases: async (): Promise<CaseStudy[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('cases').select('*').order('orderIndex', { ascending: true });
        if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.CASES);
    let cases = data ? JSON.parse(data) : INITIAL_CASES;
    return cases.sort((a: CaseStudy, b: CaseStudy) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  getCaseById: async (id: string): Promise<CaseStudy | undefined> => {
    if (supabase) {
      const { data, error } = await supabase.from('cases').select('*').eq('id', id).single();
      if (!error && data) return data;
      return undefined;
    }
    const cases = await db.getCases();
    return cases.find(c => c.id === id);
  },

  saveCase: async (item: CaseStudy): Promise<void> => {
    if (item.orderIndex === undefined) {
        const existing = await db.getCases();
        const maxOrder = existing.reduce((max, c) => Math.max(max, c.orderIndex || 0), 0);
        item.orderIndex = maxOrder + 1;
    }

    if (supabase) {
        await supabase.from('cases').upsert(item);
        return;
    }
    const cases = await db.getCases();
    const index = cases.findIndex(c => c.id === item.id);
    if (index >= 0) cases[index] = item;
    else cases.push(item);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  },

  updateCaseOrder: async (cases: CaseStudy[]): Promise<void> => {
    const updatedCases = cases.map((c, idx) => ({ ...c, orderIndex: idx }));
    
    if (supabase) {
        await supabase.from('cases').upsert(updatedCases);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(updatedCases));
  },

  deleteCase: async (id: string): Promise<void> => {
    if (supabase) {
        await supabase.from('cases').delete().eq('id', id);
        return;
    }
    const cases = await db.getCases();
    const filtered = cases.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(filtered));
  },

  // --- Leads ---
  getLeads: async (): Promise<Lead[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.LEADS);
    return data ? JSON.parse(data) : [];
  },
  addLead: async (lead: Omit<Lead, 'id' | 'createdAt'>): Promise<void> => {
    if (supabase) {
        await supabase.from('leads').insert([{
            ...lead,
            created_at: new Date().toISOString() 
        }]);
        return;
    }
    await delay(500);
    const leads = await db.getLeads();
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  },

  // --- Hero Config ---
  getHeroConfig: async (): Promise<HeroConfig> => {
    if (supabase) {
        const { data } = await supabase.from('config').select('value').eq('key', 'hero').single();
        if (data) return data.value;
    }
    const data = localStorage.getItem(STORAGE_KEYS.HERO);
    return data ? JSON.parse(data) : INITIAL_HERO;
  },
  updateHeroConfig: async (config: HeroConfig): Promise<void> => {
    if (supabase) {
        await supabase.from('config').upsert({ key: 'hero', value: config });
        return;
    }
    localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(config));
  },

  // --- Footer Config ---
  getFooterConfig: async (): Promise<FooterConfig> => {
    if (supabase) {
        const { data } = await supabase.from('config').select('value').eq('key', 'footer').single();
        if (data) return data.value;
    }
    const data = localStorage.getItem(STORAGE_KEYS.FOOTER);
    return data ? JSON.parse(data) : INITIAL_FOOTER;
  },
  updateFooterConfig: async (config: FooterConfig): Promise<void> => {
    if (supabase) {
        await supabase.from('config').upsert({ key: 'footer', value: config });
        return;
    }
    localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(config));
  },

  // --- Image Upload (Supabase Storage) ---
  uploadImage: async (file: File): Promise<string> => {
    if (!supabase) {
        alert("Supabase가 설정되지 않았습니다.\n\n[설정 방법]\n1. .env 파일에 URL/Key 입력\n2. Storage Bucket 'images' 생성 및 Public 설정\n3. Policies 설정(INSERT/SELECT 허용)");
        // Fallback for local testing
        return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload Error Details:', uploadError);
        alert(`이미지 업로드 실패: ${uploadError.message}`);
        throw uploadError;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  initialize: () => {
    if (!supabase && !localStorage.getItem(STORAGE_KEYS.HERO)) {
        localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(INITIAL_HERO));
    }
    if (!supabase && !localStorage.getItem(STORAGE_KEYS.FOOTER)) {
        localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(INITIAL_FOOTER));
    }
  }
};