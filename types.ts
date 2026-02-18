
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

export type AuthMode = 'login' | 'register';

export interface BulkMatch {
  photo: {
    fileName: string;
    fullName: string;
    data: string;
  };
  can: Can;
  status: 'matched' | 'unmatched';
}
