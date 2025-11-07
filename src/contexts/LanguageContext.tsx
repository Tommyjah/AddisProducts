import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.government': 'Government',
    'nav.submit': 'Submit',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    
    // Home page
    'home.hero.title': 'Discover Amazing Ethiopian Products',
    'home.hero.subtitle': 'The platform where Ethiopian developers and startups showcase their innovations',
    'home.featured': 'Featured Products',
    'home.trending': 'Trending Today',
    
    // Product
    'product.votes': 'votes',
    'product.vote': 'Vote',
    'product.collaborate': 'Collaborate',
    'product.comments': 'Comments',
    'product.funding': 'Funding',
    'product.goal': 'Goal',
    'product.raised': 'Raised',
    
    // Categories
    'category.all': 'All',
    'category.mobile': 'Mobile',
    'category.web': 'Web',
    'category.ai': 'AI/ML',
    'category.blockchain': 'Blockchain',
    'category.fintech': 'FinTech',
    'category.healthtech': 'HealthTech',
    'category.edtech': 'EdTech',
    'category.agtech': 'AgTech',
    
    // Government
    'gov.title': 'Government Proposals',
    'gov.subtitle': 'Submit proposals for government technology needs',
    'gov.submit': 'Submit Proposal',
    'gov.status.submitted': 'Submitted',
    'gov.status.under_review': 'Under Review',
    'gov.status.accepted': 'Accepted',
    'gov.status.declined': 'Declined',
    
    // Forms
    'form.title': 'Title',
    'form.description': 'Description',
    'form.category': 'Category',
    'form.tags': 'Tags',
    'form.website': 'Website',
    'form.github': 'GitHub',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    
    // Common
    'common.search': 'Search products...',
    'common.loading': 'Loading...',
    'common.readMore': 'Read More',
    'common.showLess': 'Show Less',
  },
  am: {
    // Navigation
    'nav.home': 'መነሻ',
    'nav.products': 'ምርቶች',
    'nav.government': 'መንግስት',
    'nav.submit': 'አስገባ',
    'nav.login': 'ግባ',
    'nav.logout': 'ውጣ',
    'nav.profile': 'መገለጫ',
    
    // Home page
    'home.hero.title': 'አስደናቂ የኢትዮጵያ ምርቶችን ያግኙ',
    'home.hero.subtitle': 'የኢትዮጵያ ደቨሎፐሮች እና ስታርት አፖች ፈጠራቸውን የሚያሳዩበት መድረክ',
    'home.featured': 'ተለዩ ምርቶች',
    'home.trending': 'ዛሬ ትሬንድ',
    
    // Product
    'product.votes': 'ድምጾች',
    'product.vote': 'ድምጽ',
    'product.collaborate': 'ተባበር',
    'product.comments': 'አስተያየቶች',
    'product.funding': 'የገንዘብ ድጋፍ',
    'product.goal': 'ግብ',
    'product.raised': 'የተሰበሰበ',
    
    // Categories
    'category.all': 'ሁሉም',
    'category.mobile': 'ሞባይል',
    'category.web': 'ድር',
    'category.ai': 'AI/ML',
    'category.blockchain': 'ብሎክቼይን',
    'category.fintech': 'ፊንቴክ',
    'category.healthtech': 'ጤና ቴክኖሎጂ',
    'category.edtech': 'የትምህርት ቴክኖሎጂ',
    'category.agtech': 'የግብርና ቴክኖሎጂ',
    
    // Government
    'gov.title': 'የመንግስት ፕሮፖዛሎች',
    'gov.subtitle': 'ለመንግስት ቴክኖሎጂ ፍላጎ቎ች ፕሮፖዛል አስገቡ',
    'gov.submit': 'ፕሮፖዛል አስገባ',
    'gov.status.submitted': 'ቀርቧል',
    'gov.status.under_review': 'በሂደት ላይ',
    'gov.status.accepted': 'ተቀባይነት አግኝቷል',
    'gov.status.declined': 'ተቀባይነት አላገኘም',
    
    // Forms
    'form.title': 'አርዕስት',
    'form.description': 'መግለጫ',
    'form.category': 'ምድብ',
    'form.tags': 'መለያዎች',
    'form.website': 'ድህረ ገጽ',
    'form.github': 'GitHub',
    'form.submit': 'አስገባ',
    'form.cancel': 'ሰርዝ',
    
    // Common
    'common.search': 'ምርቶችን ፈልግ...',
    'common.loading': 'በመጫን ላይ...',
    'common.readMore': 'ተጨማሪ ያንብቡ',
    'common.showLess': 'አጠር አድርግ',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}