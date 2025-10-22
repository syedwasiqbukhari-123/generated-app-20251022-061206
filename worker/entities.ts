import { IndexedEntity } from "./core-utils";
import type { Employee, Customer, Product, Order, Transaction, Setting } from "@shared/types";
// EMPLOYEE ENTITY
export class EmployeeEntity extends IndexedEntity<Employee> {
  static readonly entityName = "employee";
  static readonly indexName = "employees";
  static readonly initialState: Employee = {
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "Driver",
    joinDate: new Date().toISOString(),
    status: "Active",
    password: ""
  };
}
// CUSTOMER ENTITY
export class CustomerEntity extends IndexedEntity<Customer> {
  static readonly entityName = "customer";
  static readonly indexName = "customers";
  static readonly initialState: Customer = {
    id: "",
    name: "",
    address: "",
    contact: "",
    bottleBalance: 0,
    paymentStatus: "Unpaid",
    createdAt: new Date().toISOString(),
  };
}
// PRODUCT ENTITY
export class ProductEntity extends IndexedEntity<Product> {
  static readonly entityName = "product";
  static readonly indexName = "products";
  static readonly initialState: Product = {
    id: "",
    name: "",
    price: 0,
    stock: { full: 0, empty: 0, defective: 0 },
  };
}
// ORDER ENTITY
export class OrderEntity extends IndexedEntity<Order> {
  static readonly entityName = "order";
  static readonly indexName = "orders";
  static readonly initialState: Order = {
    id: "",
    customerId: "",
    items: [],
    deliveryDate: new Date().toISOString(),
    status: "Pending",
    paymentStatus: "Unpaid",
    createdAt: new Date().toISOString(),
  };
}
// TRANSACTION ENTITY
export class TransactionEntity extends IndexedEntity<Transaction> {
  static readonly entityName = "transaction";
  static readonly indexName = "transactions";
  static readonly initialState: Transaction = {
    id: "",
    type: "Expense",
    amount: 0,
    date: new Date().toISOString(),
    description: "",
    category: "Other",
  };
}
// SETTING ENTITY
export class SettingEntity extends IndexedEntity<Setting> {
  static readonly entityName = "setting";
  static readonly indexName = "settings";
  static readonly initialState: Setting = {
    id: "",
    value: null,
  };
}