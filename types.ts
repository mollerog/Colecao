
export interface Can {
  id: string;
  photo: string;
  group: string;
  acronym: string;
  brand: string;
  name?: string;
  description?: string;
  year?: string;
  size: string;
  imageDesc: string;
  createdAt: any;
  updatedAt: any;
}

export interface CreditCard {
  id: string;
  photo: string;
  cardName: string;
  issuer: string;
  network: string;
  category: string;
  year?: string;
  imageDesc: string;
  lastFourDigits?: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CarMiniature {
  id: string;
  photo: string;
  minatureName: string;
  miniatureBrand: string; // Ex: Hot Wheels
  line: string; // Ex: Mainline, STH, Premium
  year: string;
  scale: string; // Ex: 1:64
  condition: string; // Ex: Loose, Mint, Carded
  mainColor: string;
  material: string;
  origin: 'real' | 'fantasia' | 'conceito';
  realCarBrand: string;
  realCarModel: string;
  segment: string; // Ex: SUV, Muscle, Supercar
  imageDesc: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export type AuthMode = 'login' | 'register';

export interface BulkMatch {
  photo: {
    fileName: string;
    fullName: string;
    data: string;
  };
  can?: Can;
  card?: CreditCard;
  car?: CarMiniature;
  status: 'matched' | 'unmatched';
}
