export interface StoreConfig {
  // Basic Store Info
  storeName: string;
  storeTagline: string;
  storeEmail: string;
  storePhone: string;
  whatsappNumber: string;
  storeAddress: string;

  // Currency
  currencyCode: string;
  currencySymbol: string;

  // Tax & Shipping
  taxRate: number;
  enableTax: boolean;
  shippingEnabled: boolean;

  // Branding
  primaryColor: string;
  secondaryColor: string;
  logoPath: string;
  faviconPath: string;

  // Homepage
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCtaText: string;
  bannerCtaLink: string;

  // Features
  enableSearch: boolean;
  enableFilters: boolean;
  enableWishlist: boolean;
  productsPerPage: number;
  orderNotificationMethod: string;

  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;

  // Content
  aboutUs: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsConditions: string;
  footerText: string;

  // Newsletter
  enableNewsletter: boolean;
  newsletterText: string;

  // Analytics
  googleAnalyticsId?: string;

  // Maintenance
  maintenanceMode: boolean;

  // Font & Styling (new fields)
  storeNameFont?: string;
  storeNameFontSize?: string;
  logoSize?: string;
  navbarBgColor?: string;
  navbarAlpha?: string;
  enableAnimations?: string;
}

export interface Category {
  categoryId: string;
  categoryName: string;
  parentCategoryId?: string;
  categorySlug: string;
  description: string;
  imagePath: string;
  iconClass: string;
  displayOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

export interface Discount {
  discountId: string;
  discountCode: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
  description: string;
  applicableCategories: string[];
  applicableProducts: string[];
}

export interface Tax {
  taxId: string;
  regionCode: string;
  taxName: string;
  taxRate: number;
  isInclusive: boolean;
  appliesToShipping: boolean;
  isActive: boolean;
}

export interface SEO {
  pagePath: string;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  structuredDataType: string;
}

export interface ShippingRule {
  shippingId: string;
  shippingName: string;
  shippingType: string;
  minOrderValue: number;
  maxOrderValue: number;
  shippingCost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  regions: string[];
  description: string;
}
