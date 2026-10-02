export interface Supplier {
  id: string;
  cnpj: string;
  companyName: string;
  tradeName: string;
  leadTimeDays: number;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
