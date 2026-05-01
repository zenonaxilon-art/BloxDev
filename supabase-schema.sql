-- Run this in your Supabase SQL Editor

-- 1. Create users table
create table public.users (
  id uuid references auth.users not null primary key,
  roblox_id text unique,
  username text not null,
  avatar text default 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  verified boolean default false,
  role text default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  price integer not null,
  seller_id uuid references public.users(id) not null,
  category text not null,
  images text[] not null,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.users(id) not null,
  product_id uuid references public.products(id) not null,
  status text default 'pending' check (status in ('pending', 'delivered', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create verification_requests table
create table public.verification_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  proof_image_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.users(id) not null,
  receiver_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: Ensure Supabase Storage buckets "verification" and "products" are created and public!
