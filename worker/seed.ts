import { Employee } from "@shared/types";
export const ADMIN_SEED_DATA: Employee = {
  id: 'admin-01', // Using a predictable ID for the seed admin
  name: 'Alyan Ahmed',
  email: 'alyan@waterx.pk',
  password: 'Waterx@123',
  phone: '03001234567',
  role: 'Admin',
  joinDate: new Date().toISOString(),
  status: 'Active',
};