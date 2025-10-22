import {
  LayoutDashboard,
  Droplets,
  Users,
  ShoppingCart,
  Truck,
  Banknote,
  UserCog,
  LucideIcon,
  Settings,
} from 'lucide-react';
import { Role } from '@shared/types';
export const APP_NAME = 'WATERX WEB';
export const APP_DESCRIPTION = 'Waterx Management System';
export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};
export const NAV_LINKS: NavLink[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Manager', 'Driver'],
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Droplets,
    roles: ['Admin', 'Manager'],
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: Users,
    roles: ['Admin', 'Manager'],
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: ShoppingCart,
    roles: ['Admin', 'Manager'],
  },
  {
    href: '/deliveries',
    label: 'Deliveries',
    icon: Truck,
    roles: ['Admin', 'Manager', 'Driver'],
  },
  {
    href: '/finance',
    label: 'Finance',
    icon: Banknote,
    roles: ['Admin', 'Manager'],
  },
  {
    href: '/employees',
    label: 'Employees',
    icon: UserCog,
    roles: ['Admin'],
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['Admin'],
  },
];