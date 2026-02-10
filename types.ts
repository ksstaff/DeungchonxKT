export interface Product {
  id: string;
  name: string;
  summary: string;
  description: string; // Full content
  image: string;
  orderIndex?: number;
}

export interface CaseStudy {
  id: string;
  storeName: string;
  region: string;
  productUsed: string;
  image: string;
  content: string;
  orderIndex?: number;
}

export interface Lead {
  id: string;
  storeName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string;
  createdAt: string;
}

export interface HeroConfig {
  headline: string;
  imageUrl: string;
  badgeText: string;
  showBadge: boolean;
  benefits: string[];
}

export interface FooterConfig {
  copyright: string;
  contactInfo: string;
}

export enum AdminTab {
  HERO = 'HERO',
  PRODUCTS = 'PRODUCTS',
  CASES = 'CASES',
  LEADS = 'LEADS',
  FOOTER = 'FOOTER',
}
