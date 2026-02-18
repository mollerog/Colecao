
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

export type AuthMode = 'login' | 'register';

export interface BulkMatch {
  photo: {
    fileName: string;
    fullName: string;
    data: string;
  };
  can?: Can;
  card?: CreditCard;
  status: 'matched' | 'unmatched';
}
