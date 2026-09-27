-- ==============================================================================
-- YaungMal-PyinMal (ရောင်းမယ်-ပြင်မယ်)
-- Supabase Database Seed & Profile Trigger
-- ==============================================================================

-- Trigger to automatically create a profile row when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'staff'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed Brands
insert into public.brands (name, description) values
('Dell', 'Dell Technologies laptops and accessories'),
('HP', 'Hewlett-Packard consumer and enterprise laptops'),
('Lenovo', 'Lenovo ThinkPad, Legion, and IdeaPad series'),
('Asus', 'Asus ROG, TUF Gaming, and ZenBook series'),
('Apple', 'Apple MacBook Air and MacBook Pro'),
('Acer', 'Acer Predator, Nitro, and Swift series')
on conflict (name) do nothing;

-- Seed Categories
insert into public.categories (name, description) values
('Business', 'Reliable laptops for corporate and productivity use'),
('Gaming', 'High performance gaming laptops with dedicated GPUs'),
('Ultrabook', 'Thin, lightweight, and long battery life laptops'),
('Student / Budget', 'Affordable laptops for general study and everyday tasks'),
('Workstation', 'Heavy-duty processing and 3D modeling machines')
on conflict (name) do nothing;
