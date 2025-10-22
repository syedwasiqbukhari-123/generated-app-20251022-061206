import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { CustomerEntity, ProductEntity, OrderEntity, EmployeeEntity, TransactionEntity, SettingEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Order, Customer, BackupData } from "@shared/types";
import { ADMIN_SEED_DATA } from './seed';
// Schemas
const customerSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  contact: z.string().min(10),
  bottleBalance: z.number().int().min(0),
  paymentStatus: z.enum(['Paid', 'Unpaid', 'Partial']),
});
const customerUpdateSchema = customerSchema.partial();
const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  stock: z.object({
    full: z.number().int().min(0),
    empty: z.number().int().min(0),
    defective: z.number().int().min(0),
  }),
});
const productUpdateSchema = productSchema.partial();
const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});
const orderSchema = z.object({
  customerId: z.string(),
  items: z.array(orderItemSchema).min(1),
  deliveryDate: z.string().datetime(),
  status: z.enum(['Pending', 'Delivered', 'Cancelled']),
  paymentStatus: z.enum(['Paid', 'Unpaid']),
  assignedDriverId: z.string().optional(),
  notes: z.string().optional(),
});
const orderUpdateSchema = orderSchema.partial();
const employeeSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    role: z.enum(['Admin', 'Manager', 'Driver']),
    status: z.enum(['Active', 'Inactive']),
    password: z.string().min(6).optional().or(z.literal('')),
});
const employeeUpdateSchema = employeeSchema.partial();
const transactionSchema = z.object({
    description: z.string().min(2),
    amount: z.number().positive(),
    date: z.string().datetime(),
    type: z.enum(['Revenue', 'Expense']),
    category: z.enum(['Sales', 'Fuel', 'Rent', 'Salaries', 'Maintenance', 'Other']),
    orderId: z.string().optional(),
});
const transactionUpdateSchema = transactionSchema.partial();
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
const settingSchema = z.object({
    value: z.any(),
});
// Helper to ensure the admin user exists
async function ensureAdminExists(env: Env) {
  const { items } = await EmployeeEntity.list(env);
  if (items.length === 0) {
    console.log('No employees found. Seeding admin user...');
    await EmployeeEntity.create(env, ADMIN_SEED_DATA);
    console.log('Admin user seeded successfully.');
  }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Auth Route
  app.post('/api/auth/login', zValidator('json', loginSchema), async (c) => {
    await ensureAdminExists(c.env); // Ensure admin exists on first login attempt
    const { email, password } = c.req.valid('json');
    const { items: employees } = await EmployeeEntity.list(c.env);
    const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (!employee || employee.password !== password) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const { password: _, ...userToReturn } = employee;
    return ok(c, userToReturn);
  });
  // Customer Routes
  app.get('/api/customers', async (c) => {
    const { items, next } = await CustomerEntity.list(c.env);
    return ok(c, { items, next });
  });
  app.post('/api/customers', zValidator('json', customerSchema), async (c) => {
    const customerData = c.req.valid('json');
    const newCustomer = await CustomerEntity.create(c.env, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...customerData });
    return c.json({ success: true, data: newCustomer }, 201);
  });
  app.put('/api/customers/:id', zValidator('json', customerUpdateSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const customer = new CustomerEntity(c.env, id);
    if (!(await customer.exists())) return notFound(c);
    await customer.patch(c.req.valid('json'));
    return ok(c, await customer.getState());
  });
  app.delete('/api/customers/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    if (!(await CustomerEntity.delete(c.env, id))) return notFound(c);
    return ok(c, { id });
  });
  // Product Routes
  app.get('/api/products', async (c) => {
    const { items, next } = await ProductEntity.list(c.env);
    return ok(c, { items, next });
  });
  app.post('/api/products', zValidator('json', productSchema), async (c) => {
    const productData = c.req.valid('json');
    const newProduct = await ProductEntity.create(c.env, { id: crypto.randomUUID(), ...productData });
    return c.json({ success: true, data: newProduct }, 201);
  });
  app.put('/api/products/:id', zValidator('json', productUpdateSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const product = new ProductEntity(c.env, id);
    if (!(await product.exists())) return notFound(c);
    await product.patch(c.req.valid('json'));
    return ok(c, await product.getState());
  });
  // Order Routes
  app.get('/api/orders', async (c) => {
    const { items: orders, next } = await OrderEntity.list(c.env);
    const customerIds = [...new Set(orders.map(o => o.customerId))];
    const customers = await Promise.all(customerIds.map(id => new CustomerEntity(c.env, id).getState().catch(() => null)));
    const customerMap = new Map(customers.filter(Boolean).map(c => [c!.id, c!.name]));
    const itemsWithDetails = orders.map(order => ({
      ...order,
      customerName: customerMap.get(order.customerId) || 'Unknown Customer',
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
    return ok(c, { items: itemsWithDetails, next });
  });
  app.post('/api/orders', zValidator('json', orderSchema), async (c) => {
    const orderData = c.req.valid('json');
    const newOrder = await OrderEntity.create(c.env, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...orderData });
    return c.json({ success: true, data: newOrder }, 201);
  });
  app.put('/api/orders/:id', zValidator('json', orderUpdateSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const order = new OrderEntity(c.env, id);
    if (!(await order.exists())) return notFound(c);
    await order.patch(c.req.valid('json'));
    return ok(c, await order.getState());
  });
  app.delete('/api/orders/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    if (!(await OrderEntity.delete(c.env, id))) return notFound(c);
    return ok(c, { id });
  });
  // Delivery Routes
  app.get('/api/deliveries', async (c) => {
    const { items: allOrders } = await OrderEntity.list(c.env);
    const pendingDeliveries = allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    const customerIds = [...new Set(pendingDeliveries.map(o => o.customerId))];
    const customers = await Promise.all(customerIds.map(id => new CustomerEntity(c.env, id).getState().catch(() => null)));
    const customerMap = new Map(customers.filter(Boolean).map(c => [c!.id, c!.name]));
    const itemsWithDetails = pendingDeliveries.map(order => ({
      ...order,
      customerName: customerMap.get(order.customerId) || 'Unknown Customer',
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
    return ok(c, { items: itemsWithDetails, next: null });
  });
  // Employee Routes
  app.get('/api/employees', async (c) => {
    await ensureAdminExists(c.env);
    const { items, next } = await EmployeeEntity.list(c.env);
    const employeesWithoutPasswords = items.map(({ password, ...rest }) => rest);
    return ok(c, { items: employeesWithoutPasswords, next });
  });
  app.post('/api/employees', zValidator('json', employeeSchema), async (c) => {
    const employeeData = c.req.valid('json');
    if (!employeeData.password) return bad(c, 'Password is required for new employees');
    const newEmployee = await EmployeeEntity.create(c.env, { id: crypto.randomUUID(), joinDate: new Date().toISOString(), ...employeeData });
    const { password, ...rest } = newEmployee;
    return c.json({ success: true, data: rest }, 201);
  });
  app.put('/api/employees/:id', zValidator('json', employeeUpdateSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const employee = new EmployeeEntity(c.env, id);
    if (!(await employee.exists())) return notFound(c);
    const updateData = c.req.valid('json');
    if (updateData.password === '' || updateData.password === null) {
        delete updateData.password;
    }
    await employee.patch(updateData);
    const updatedState = await employee.getState();
    const { password, ...rest } = updatedState;
    return ok(c, rest);
  });
  app.put('/api/employees/profile/:id', zValidator('json', employeeUpdateSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const employee = new EmployeeEntity(c.env, id);
    if (!(await employee.exists())) return notFound(c);
    const updateData = c.req.valid('json');
    if (updateData.password === '' || updateData.password === null) {
        delete updateData.password;
    }
    await employee.patch(updateData);
    const updatedState = await employee.getState();
    const { password, ...rest } = updatedState;
    return ok(c, rest);
  });
  app.delete('/api/employees/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    if (!(await EmployeeEntity.delete(c.env, id))) return notFound(c);
    return ok(c, { id });
  });
  // Transaction Routes
  app.get('/api/transactions', async (c) => {
    const { items, next } = await TransactionEntity.list(c.env);
    return ok(c, { items, next });
  });
  app.post('/api/transactions', zValidator('json', transactionSchema), async (c) => {
    const txData = c.req.valid('json');
    const newTx = await TransactionEntity.create(c.env, { id: crypto.randomUUID(), ...txData });
    return c.json({ success: true, data: newTx }, 201);
  });
  app.put('/api/transactions/:id', zValidator('json', transactionUpdateSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const tx = new TransactionEntity(c.env, id);
    if (!(await tx.exists())) return notFound(c);
    await tx.patch(c.req.valid('json'));
    return ok(c, await tx.getState());
  });
  app.delete('/api/transactions/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    if (!(await TransactionEntity.delete(c.env, id))) return notFound(c);
    return ok(c, { id });
  });
  // Settings Routes
  app.get('/api/settings/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const setting = new SettingEntity(c.env, id);
    if (!(await setting.exists())) return notFound(c, `Setting '${id}' not found`);
    return ok(c, await setting.getState());
  });
  app.put('/api/settings/:id', zValidator('json', settingSchema), async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const { value } = c.req.valid('json');
    const setting = new SettingEntity(c.env, id);
    if (!(await setting.exists())) {
        await SettingEntity.create(c.env, { id, value });
    } else {
        await setting.patch({ value });
    }
    return ok(c, await setting.getState());
  });
  // Finance Summary Route
  app.get('/api/finance', async (c) => {
    const [{ items: orders }, { items: transactions }, { items: products }] = await Promise.all([
      OrderEntity.list(c.env),
      TransactionEntity.list(c.env),
      ProductEntity.list(c.env)
    ]);
    const productPriceMap = new Map(products.map(p => [p.id, p.price]));
    let totalRevenue = 0;
    let outstandingPayments = 0;
    orders.forEach(order => {
        if (order.status === 'Delivered') {
            const orderValue = order.items.reduce((sum, item) => {
                const price = productPriceMap.get(item.productId) || 0;
                return sum + (item.quantity * price);
            }, 0);
            totalRevenue += orderValue;
            if (order.paymentStatus === 'Unpaid') {
                outstandingPayments += orderValue;
            }
        }
    });
    const totalExpenses = transactions
      .filter(tx => tx.type === 'Expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const summary = {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      outstandingPayments: outstandingPayments,
    };
    return ok(c, { summary, transactions });
  });
  // Dashboard Route
  app.get('/api/dashboard', async (c) => {
    const [{ items: orders }, { items: customers }, { items: products }] = await Promise.all([
        OrderEntity.list(c.env),
        CustomerEntity.list(c.env),
        ProductEntity.list(c.env)
    ]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = (dateStr: string) => {
        const date = new Date(dateStr);
        return date >= today;
    };
    const bottlesInStock = products.reduce((sum, p) => sum + p.stock.full, 0);
    const ordersToday = orders.filter(o => isToday(o.deliveryDate)).length;
    const totalCustomers = customers.length;
    const deliveriesToday = orders.filter(o => isToday(o.deliveryDate) && o.status !== 'Cancelled').length;
    const productPriceMap = new Map(products.map(p => [p.id, p.price]));
    const outstandingPayments = orders
        .filter(o => o.paymentStatus === 'Unpaid' && o.status === 'Delivered')
        .reduce((sum, order) => {
            const orderValue = order.items.reduce((orderSum, item) => {
                const price = productPriceMap.get(item.productId) || 0;
                return orderSum + (item.quantity * price);
            }, 0);
            return sum + orderValue;
        }, 0);
    const kpis = {
        bottlesInStock,
        ordersToday,
        totalCustomers,
        pendingPayments: outstandingPayments,
        deliveriesToday,
    };
    // Sales data for the last 7 days
    const salesDataMap = new Map<string, { sales: number, revenue: number }>();
    const dayLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        dayLabels.push(day);
        salesDataMap.set(day, { sales: 0, revenue: 0 });
    }
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt || order.deliveryDate);
        const day = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (salesDataMap.has(day)) {
            const dayData = salesDataMap.get(day)!;
            dayData.sales += order.items.reduce((sum, item) => sum + item.quantity, 0);
            if (order.status === 'Delivered') {
                dayData.revenue += order.items.reduce((sum, item) => {
                    const price = productPriceMap.get(item.productId) || 0;
                    return sum + (item.quantity * price);
                }, 0);
            }
        }
    });
    const salesData = dayLabels.map(day => ({
        name: day,
        ...salesDataMap.get(day)!
    }));
    // Recent Activity
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 2)
      .map(o => ({ ...o, type: 'order', timestamp: o.createdAt! }));
    const recentCustomers = customers
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 2)
      .map(c => ({ ...c, type: 'customer', timestamp: c.createdAt! }));
    const recentActivity = [...recentOrders, ...recentCustomers]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4);
    return ok(c, { kpis, salesData, recentActivity });
  });
  // Backup & Restore Routes
  app.get('/api/backup', async (c) => {
    const [customers, products, orders, transactions, employees] = await Promise.all([
      CustomerEntity.list(c.env).then(res => res.items),
      ProductEntity.list(c.env).then(res => res.items),
      OrderEntity.list(c.env).then(res => res.items),
      TransactionEntity.list(c.env).then(res => res.items),
      EmployeeEntity.list(c.env).then(res => res.items),
    ]);
    const backupData: BackupData = {
      customers,
      products,
      orders,
      transactions,
      employees: employees.filter(e => e.id !== ADMIN_SEED_DATA.id), // Exclude admin
    };
    return ok(c, backupData);
  });
  app.post('/api/restore', async (c) => {
    const backupData = await c.req.json<BackupData>();
    // Clear existing data (except admin)
    const entities = [CustomerEntity, ProductEntity, OrderEntity, TransactionEntity];
    for (const entity of entities) {
      const { items } = await entity.list(c.env);
      const ids = items.map(item => item.id);
      if (ids.length > 0) {
        await entity.deleteMany(c.env, ids);
      }
    }
    const { items: allEmployees } = await EmployeeEntity.list(c.env);
    const nonAdminEmployeeIds = allEmployees.filter(e => e.id !== ADMIN_SEED_DATA.id).map(e => e.id);
    if (nonAdminEmployeeIds.length > 0) {
      await EmployeeEntity.deleteMany(c.env, nonAdminEmployeeIds);
    }
    // Restore from backup
    for (const customer of backupData.customers) await CustomerEntity.create(c.env, customer);
    for (const product of backupData.products) await ProductEntity.create(c.env, product);
    for (const order of backupData.orders) await OrderEntity.create(c.env, order);
    for (const transaction of backupData.transactions) await TransactionEntity.create(c.env, transaction);
    for (const employee of backupData.employees) await EmployeeEntity.create(c.env, employee);
    return ok(c, { message: 'Restore successful' });
  });
}