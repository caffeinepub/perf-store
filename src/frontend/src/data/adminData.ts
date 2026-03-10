export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface PartnerSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  submittedAt: string;
  status: SubmissionStatus;
  notes?: string;
}

export interface StoreSubmission {
  id: number;
  storeName: string;
  partnerName: string;
  email: string;
  location: string;
  category: string;
  submittedAt: string;
  status: SubmissionStatus;
  notes?: string;
}

export interface ProductSubmission {
  id: number;
  productName: string;
  partnerName: string;
  price: number;
  category: string;
  submittedAt: string;
  status: SubmissionStatus;
  notes?: string;
}

export type TransactionType = "commission" | "withdrawal" | "deposit";

export interface EarningsTransaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  partner: string;
  date: string;
}

export const initialPartners: PartnerSubmission[] = [
  {
    id: 1,
    name: "James Mwangi",
    email: "james@shop.co.ke",
    phone: "0712345678",
    businessType: "Retail",
    submittedAt: "2026-02-14",
    status: "pending",
  },
  {
    id: 2,
    name: "Sarah Otieno",
    email: "sarah@boutique.ke",
    phone: "0723456789",
    businessType: "Fashion",
    submittedAt: "2026-02-10",
    status: "approved",
  },
  {
    id: 3,
    name: "Kevin Oduya",
    email: "kevin@techshop.ke",
    phone: "0734567890",
    businessType: "Electronics",
    submittedAt: "2026-02-18",
    status: "pending",
  },
];

export const initialStores: StoreSubmission[] = [
  {
    id: 1,
    storeName: "Mwangi Retail Hub",
    partnerName: "James Mwangi",
    email: "james@shop.co.ke",
    location: "Nairobi CBD",
    category: "General Retail",
    submittedAt: "2026-02-15",
    status: "pending",
  },
  {
    id: 2,
    storeName: "TechPoint Kenya",
    partnerName: "Kevin Oduya",
    email: "kevin@techshop.ke",
    location: "Westlands",
    category: "Electronics",
    submittedAt: "2026-02-19",
    status: "pending",
  },
];

export const initialProducts: ProductSubmission[] = [
  {
    id: 1,
    productName: "Nike Air Max 270",
    partnerName: "Sarah Otieno",
    price: 8500,
    category: "Footwear",
    submittedAt: "2026-02-11",
    status: "approved",
  },
  {
    id: 2,
    productName: "Samsung Galaxy Buds",
    partnerName: "Kevin Oduya",
    price: 12000,
    category: "Electronics",
    submittedAt: "2026-02-19",
    status: "pending",
  },
  {
    id: 3,
    productName: "Floral Summer Dress",
    partnerName: "Sarah Otieno",
    price: 3200,
    category: "Fashion",
    submittedAt: "2026-02-20",
    status: "pending",
  },
];

export const initialTransactions: EarningsTransaction[] = [
  {
    id: 1,
    type: "commission",
    amount: 1275,
    description: "Nike Air Max 270 sale commission (15%)",
    partner: "Sarah Otieno",
    date: "2026-02-12",
  },
  {
    id: 2,
    type: "commission",
    amount: 1800,
    description: "Samsung order commission",
    partner: "Kevin Oduya",
    date: "2026-02-20",
  },
  {
    id: 3,
    type: "withdrawal",
    amount: 500,
    description: "Admin operational costs",
    partner: "—",
    date: "2026-02-22",
  },
  {
    id: 4,
    type: "commission",
    amount: 480,
    description: "Floral Summer Dress sale commission",
    partner: "Sarah Otieno",
    date: "2026-02-23",
  },
  {
    id: 5,
    type: "deposit",
    amount: 2000,
    description: "Manual top-up",
    partner: "—",
    date: "2026-02-25",
  },
];
