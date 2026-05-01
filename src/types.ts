export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string; // Supabase auth UUID
  roblox_id: string; // From Roblox OAuth
  username: string;
  avatar: string;
  verified: boolean;
  role: UserRole;
  created_at: string;
  bio?: string;
  skills?: string[];
}

export type ProductCategory = 'UI Kits' | 'Scripts' | 'Maps' | 'Models' | 'Full Systems';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // in Robux or USD? Assuming Robux representation
  seller_id: string;
  category: ProductCategory;
  images: string[];
  tags: string[];
  created_at: string;
}

export type OrderStatus = 'pending' | 'delivered' | 'completed';

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  status: OrderStatus;
  created_at: string;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: string;
  user_id: string;
  proof_image_url: string;
  status: VerificationStatus;
  admin_notes?: string;
  created_at: string;
}
