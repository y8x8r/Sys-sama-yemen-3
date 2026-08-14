"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Customer,
  Employee,
  User,
  Agent,
  TransportCompany,
  ServiceRecord,
  Invoice,
  Payment,
  Expense,
  AuditLog,
  VisaExpiryRecord,
  Lang,
  Theme,
  NavPage,
  Notification,
  PermissionLevel,
  UserPermission,
} from "./types";
import {
  customers as seedCustomers,
  employees as seedEmployees,
  users as seedUsers,
  agents as seedAgents,
  transportCompanies as seedCompanies,
  services as seedServices,
  invoices as seedInvoices,
  payments as seedPayments,
  expenses as seedExpenses,
  auditLogs as seedAuditLogs,
  visaExpiryRecords as seedVisaExpiry,
  notifications as seedNotifications,
  computeVisaExpiry,
} from "./mock-data";

interface AppState {
  // Auth
  isAuthed: boolean;
  currentUser: User | null;
  // i18n & theme
  lang: Lang;
  theme: Theme;
  // Navigation
  currentPage: NavPage;
  expandedSections: Record<string, boolean>;
  // Data
  customers: Customer[];
  employees: Employee[];
  users: User[];
  userPermissions: UserPermission[];
  agents: Agent[];
  transportCompanies: TransportCompany[];
  services: ServiceRecord[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  visaExpiry: VisaExpiryRecord[];
  notifications: Notification[];
  // Counters
  seqService: number;
  seqInvoice: number;
  seqCustomer: number;
  seqEmployee: number;
  seqPayment: number;
  seqExpense: number;
  // Actions — Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (oldPwd: string, newPwd: string) => boolean;
  // Actions — Settings
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setPage: (p: NavPage) => void;
  toggleSection: (s: string) => void;
  // Actions — Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Actions — Customers
  addCustomer: (c: Omit<Customer, "id" | "customerNumber" | "createdAt" | "isActive">) => Customer;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // Actions — Employees & Users
  addEmployee: (e: { fullName: string; username: string; role: User["role"]; password: string }) => { ok: boolean; error?: string };
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  setUserPermission: (userId: string, moduleKey: string, level: PermissionLevel) => void;
  toggleUserActive: (userId: string) => void;
  // Actions — Agents & Companies
  addAgent: (a: Omit<Agent, "id" | "createdAt" | "isActive">) => Agent;
  updateAgent: (id: string, a: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  addTransportCompany: (c: Omit<TransportCompany, "id" | "createdAt" | "isActive">) => TransportCompany;
  updateTransportCompany: (id: string, c: Partial<TransportCompany>) => void;
  deleteTransportCompany: (id: string) => void;
  // Actions — Services
  addService: (s: Omit<ServiceRecord, "id" | "serviceNumber" | "createdAt" | "remaining">) => ServiceRecord;
  updateService: (id: string, s: Partial<ServiceRecord>) => void;
  deleteService: (id: string) => void;
  // Actions — Invoices
  updateInvoice: (id: string, i: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  // Actions — Expenses
  addExpense: (e: { purpose: string; paidAt: string; amount: number; currency: Expense["currency"] }) => Expense;
  // Audit
  logAudit: (action: string, moduleKey: string, summary: string, entityType?: string, entityId?: string) => void;
}

function internalLogAudit(
  state: AppState,
  action: string,
  moduleKey: string,
  summary: string,
  entityType: string = "",
  entityId?: string
): AuditLog[] {
  const u = state.currentUser;
  if (!u) return state.auditLogs;
  return [
    {
      id: `al_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      occurredAt: new Date().toISOString(),
      actorUsername: u.username,
      actorRole: u.role,
      action,
      moduleKey,
      entityType,
      entityId,
      summary,
    },
    ...state.auditLogs,
  ];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthed: false,
      currentUser: null,
      lang: "ar",
      theme: "light",
      currentPage: "dashboard",
      expandedSections: { services: false, management: false, finance: false, monitoring: false, settings: false },
      customers: seedCustomers,
      employees: seedEmployees,
      users: seedUsers,
      userPermissions: [],
      agents: seedAgents,
      transportCompanies: seedCompanies,
      services: seedServices,
      invoices: seedInvoices,
      payments: seedPayments,
      expenses: seedExpenses,
      auditLogs: seedAuditLogs,
      visaExpiry: seedVisaExpiry,
      notifications: seedNotifications,
      seqService: 1,
      seqInvoice: 1,
      seqCustomer: 1,
      seqEmployee: 1,
      seqPayment: 1,
      seqExpense: 1,

      login: (username, password) => {
        const u = get().users.find(
          (x) => x.username.toLowerCase() === username.trim().toLowerCase() && x.isActive
        );
        // التحقق من كلمة المرور (في الإنتاج: Argon2 verify)
        if (u && u.passwordHash === password && password.length >= 3) {
          const updatedUser = { ...u, lastLoginAt: new Date().toISOString() };
          set({
            isAuthed: true,
            currentUser: updatedUser,
            currentPage: "dashboard",
            users: get().users.map((x) => (x.id === u.id ? updatedUser : x)),
            auditLogs: internalLogAudit(
              get(),
              "تسجيل دخول",
              "auth",
              "تسجيل دخول ناجح",
              "user",
              u.id
            ),
          });
          return true;
        }
        return false;
      },

      logout: () => {
        const u = get().currentUser;
        if (u) {
          set({
            auditLogs: internalLogAudit(
              get(),
              "تسجيل خروج",
              "auth",
              "تسجيل خروج",
              "user",
              u.id
            ),
          });
        }
        set({ isAuthed: false, currentUser: null, currentPage: "dashboard" });
      },

      changePassword: (oldPwd, newPwd) => {
        const u = get().currentUser;
        if (!u) return false;
        if (u.passwordHash !== oldPwd) return false;
        if (newPwd.length < 4) return false;
        const updated = { ...u, passwordHash: newPwd, mustChangePassword: false };
        set((s) => ({
          currentUser: updated,
          users: s.users.map((x) => (x.id === u.id ? updated : x)),
          auditLogs: internalLogAudit(
            { ...s, currentUser: updated },
            "تغيير كلمة المرور",
            "auth",
            "تغيير كلمة المرور",
            "user",
            u.id
          ),
        }));
        return true;
      },

      setLang: (l) => set({ lang: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setPage: (p) => set({ currentPage: p }),
      toggleSection: (s) =>
        set((st) => ({
          expandedSections: { ...st.expandedSections, [s]: !st.expandedSections[s] },
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      addCustomer: (c) => {
        const seq = get().seqCustomer;
        const newC: Customer = {
          id: `c_${Date.now()}`,
          customerNumber: `CUST-${String(seq).padStart(5, "0")}`,
          joinedOn: new Date().toISOString().split("T")[0],
          isActive: true,
          createdAt: new Date().toISOString(),
          ...c,
        };
        set((s) => ({
          customers: [newC, ...s.customers],
          seqCustomer: seq + 1,
          auditLogs: internalLogAudit(
            { ...s, customers: [newC, ...s.customers] },
            "إضافة عميل",
            "customers",
            `إضافة عميل جديد: ${newC.fullName} (${newC.customerNumber})`,
            "customer",
            newC.id
          ),
        }));
        return newC;
      },

      updateCustomer: (id, patch) =>
        set((s) => {
          const updated = s.customers.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          );
          const target = s.customers.find((c) => c.id === id);
          return {
            customers: updated,
            auditLogs: internalLogAudit(
              { ...s, customers: updated },
              "تعديل عميل",
              "customers",
              `تعديل بيانات العميل: ${target?.fullName ?? id}`,
              "customer",
              id
            ),
          };
        }),

      deleteCustomer: (id) =>
        set((s) => {
          const target = s.customers.find((c) => c.id === id);
          return {
            customers: s.customers.filter((c) => c.id !== id),
            auditLogs: internalLogAudit(
              { ...s },
              "حذف عميل",
              "customers",
              `حذف العميل: ${target?.fullName ?? id} (مع الحفاظ على السجل التاريخي للمعاملات)`,
              "customer",
              id
            ),
          };
        }),

      addEmployee: ({ fullName, username, role, password }) => {
        // التحقق من عدم تكرار اسم المستخدم
        const exists = get().users.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        if (exists) {
          return { ok: false, error: "اسم المستخدم موجود مسبقاً" };
        }
        if (password.length < 4) {
          return { ok: false, error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" };
        }
        const seqEmp = get().seqEmployee;
        const newEmp: Employee = {
          id: `e_${Date.now()}`,
          employeeNumber: `EMP-${String(seqEmp).padStart(4, "0")}`,
          fullName,
          hiredOn: new Date().toISOString().split("T")[0],
          jobTitle:
            role === "manager"
              ? "مدير عام"
              : role === "accountant"
              ? "محاسب"
              : "مسؤول حجوزات",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        const newUser: User = {
          id: `u_${Date.now()}`,
          username: username.trim(),
          passwordHash: password,
          role,
          employeeId: newEmp.id,
          isActive: true,
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          employees: [newEmp, ...s.employees],
          users: [newUser, ...s.users],
          seqEmployee: seqEmp + 1,
          auditLogs: internalLogAudit(
            { ...s, employees: [newEmp, ...s.employees], users: [newUser, ...s.users] },
            "إنشاء حساب موظف",
            "users",
            `إنشاء حساب للموظف ${fullName} (${newEmp.employeeNumber}) بدور: ${newEmp.jobTitle}`,
            "user",
            newUser.id
          ),
        }));
        return { ok: true };
      },

      updateEmployee: (id, patch) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
          auditLogs: internalLogAudit(
            s,
            "تعديل موظف",
            "users",
            `تعديل بيانات الموظف: ${s.employees.find((e) => e.id === id)?.fullName ?? id}`,
            "employee",
            id
          ),
        })),

      deleteEmployee: (id) =>
        set((s) => {
          const emp = s.employees.find((e) => e.id === id);
          const linkedUser = s.users.find((u) => u.employeeId === id);
          return {
            employees: s.employees.filter((e) => e.id !== id),
            users: s.users.filter((u) => u.employeeId !== id),
            auditLogs: internalLogAudit(
              s,
              "حذف موظف",
              "users",
              `حذف الموظف: ${emp?.fullName ?? id} (مع الحفاظ على السجل التاريخي)`,
              "employee",
              id
            ),
          };
        }),

      setUserPermission: (userId, moduleKey, level) =>
        set((s) => {
          const existing = s.userPermissions.findIndex(
            (p) => p.userId === userId && p.moduleKey === moduleKey
          );
          let perms = [...s.userPermissions];
          if (existing >= 0) {
            perms[existing] = { userId, moduleKey, level };
          } else {
            perms.push({ userId, moduleKey, level });
          }
          const target = s.users.find((u) => u.id === userId);
          return {
            userPermissions: perms,
            auditLogs: internalLogAudit(
              { ...s, userPermissions: perms },
              "تعديل صلاحية",
              "permissions",
              `تعديل صلاحية المستخدم ${target?.username ?? userId} على وحدة ${moduleKey} → ${level}`,
              "permission",
              userId
            ),
          };
        }),

      toggleUserActive: (userId) =>
        set((s) => {
          const target = s.users.find((u) => u.id === userId);
          if (!target) return s;
          const updated = { ...target, isActive: !target.isActive };
          return {
            users: s.users.map((u) => (u.id === userId ? updated : u)),
            auditLogs: internalLogAudit(
              s,
              updated.isActive ? "تفعيل حساب" : "تعطيل حساب",
              "users",
              `${updated.isActive ? "تفعيل" : "تعطيل"} حساب ${updated.username}`,
              "user",
              userId
            ),
          };
        }),

      addAgent: (a) => {
        const newA: Agent = {
          id: `a_${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          ...a,
        };
        set((s) => ({
          agents: [newA, ...s.agents],
          auditLogs: internalLogAudit(
            { ...s, agents: [newA, ...s.agents] },
            "إضافة وكيل",
            "agents",
            `إضافة وكيل: ${newA.officeName}`,
            "agent",
            newA.id
          ),
        }));
        return newA;
      },

      updateAgent: (id, patch) =>
        set((s) => ({
          agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          auditLogs: internalLogAudit(
            s,
            "تعديل وكيل",
            "agents",
            `تعديل الوكيل: ${s.agents.find((a) => a.id === id)?.officeName ?? id}`,
            "agent",
            id
          ),
        })),

      deleteAgent: (id) =>
        set((s) => ({
          agents: s.agents.filter((a) => a.id !== id),
          auditLogs: internalLogAudit(
            s,
            "حذف وكيل",
            "agents",
            `حذف الوكيل: ${s.agents.find((a) => a.id === id)?.officeName ?? id}`,
            "agent",
            id
          ),
        })),

      addTransportCompany: (c) => {
        const newC: TransportCompany = {
          id: `tc_${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          ...c,
        };
        set((s) => ({
          transportCompanies: [newC, ...s.transportCompanies],
          auditLogs: internalLogAudit(
            { ...s, transportCompanies: [newC, ...s.transportCompanies] },
            "إضافة شركة نقل",
            "companies",
            `إضافة شركة نقل: ${newC.companyName}`,
            "company",
            newC.id
          ),
        }));
        return newC;
      },

      updateTransportCompany: (id, patch) =>
        set((s) => ({
          transportCompanies: s.transportCompanies.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
          auditLogs: internalLogAudit(
            s,
            "تعديل شركة نقل",
            "companies",
            `تعديل شركة النقل: ${s.transportCompanies.find((c) => c.id === id)?.companyName ?? id}`,
            "company",
            id
          ),
        })),

      deleteTransportCompany: (id) =>
        set((s) => ({
          transportCompanies: s.transportCompanies.filter((c) => c.id !== id),
          auditLogs: internalLogAudit(
            s,
            "حذف شركة نقل",
            "companies",
            `حذف شركة النقل: ${s.transportCompanies.find((c) => c.id === id)?.companyName ?? id}`,
            "company",
            id
          ),
        })),

      addService: (s) => {
        const seq = get().seqService;
        const newS: ServiceRecord = {
          ...s,
          id: `s_${Date.now()}`,
          serviceNumber: `SRV-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`,
          remaining: s.price - s.paid,
          createdAt: new Date().toISOString(),
        };
        // إنشاء فاتورة مرتبطة بالخدمة
        const seqInv = get().seqInvoice;
        const newInv: Invoice = {
          id: `inv_${Date.now()}`,
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(seqInv).padStart(5, "0")}`,
          customerId: s.customerId,
          customerName: s.customerName,
          serviceId: newS.id,
          serviceType: s.serviceType,
          serviceNumber: newS.serviceNumber,
          totalAmount: s.price,
          paidAmount: s.paid,
          remainingAmount: s.price - s.paid,
          currency: s.currency,
          status: s.price - s.paid === 0 ? "paid" : s.paid > 0 ? "partial" : "issued",
          issuedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        // إنشاء إشعار جديد
        const newNotif: Notification = {
          id: `n_${Date.now()}`,
          title: "معاملة جديدة",
          body: `تم إنشاء معاملة ${newS.serviceNumber} للعميل ${s.customerName}`,
          type: "success",
          moduleKey: "services",
          relatedEntityId: newS.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        const u = get().currentUser;
        set((st) => {
          const newServices = [newS, ...st.services];
          return {
            services: newServices,
            invoices: [newInv, ...st.invoices],
            notifications: [newNotif, ...st.notifications],
            seqService: seq + 1,
            seqInvoice: seqInv + 1,
            visaExpiry: computeVisaExpiry(newServices),
            auditLogs: internalLogAudit(
              { ...st, services: newServices },
              "إنشاء معاملة",
              "services",
              `إنشاء معاملة جديدة ${newS.serviceNumber} للعميل ${s.customerName}`,
              "service",
              newS.id
            ),
          };
        });
        return newS;
      },

      updateService: (id, patch) =>
        set((s) => {
          const updated = s.services.map((srv) =>
            srv.id === id ? { ...srv, ...patch } : srv
          );
          return {
            services: updated,
            visaExpiry: computeVisaExpiry(updated),
            auditLogs: internalLogAudit(
              { ...s, services: updated },
              "تعديل معاملة",
              "services",
              `تعديل المعاملة: ${s.services.find((srv) => srv.id === id)?.serviceNumber ?? id}`,
              "service",
              id
            ),
          };
        }),

      deleteService: (id) =>
        set((s) => {
          const newServices = s.services.filter((srv) => srv.id !== id);
          return {
            services: newServices,
            visaExpiry: computeVisaExpiry(newServices),
            auditLogs: internalLogAudit(
              s,
              "حذف معاملة",
              "services",
              `حذف المعاملة: ${s.services.find((srv) => srv.id === id)?.serviceNumber ?? id}`,
              "service",
              id
            ),
          };
        }),

      updateInvoice: (id, patch) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...patch } : inv
          ),
          auditLogs: internalLogAudit(
            s,
            "تعديل فاتورة",
            "invoices",
            `تعديل الفاتورة: ${s.invoices.find((inv) => inv.id === id)?.invoiceNumber ?? id}`,
            "invoice",
            id
          ),
        })),

      deleteInvoice: (id) =>
        set((s) => ({
          invoices: s.invoices.filter((inv) => inv.id !== id),
          auditLogs: internalLogAudit(
            s,
            "حذف فاتورة",
            "invoices",
            `حذف الفاتورة: ${s.invoices.find((inv) => inv.id === id)?.invoiceNumber ?? id}`,
            "invoice",
            id
          ),
        })),

      addExpense: ({ purpose, paidAt, amount, currency }) => {
        const seq = get().seqExpense;
        const newE: Expense = {
          id: `ex_${Date.now()}`,
          expenseNumber: `EXP-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`,
          category: purpose, // غرض الصرف
          description: purpose,
          beneficiary: "—",
          amount,
          currency,
          method: "cash",
          status: "approved",
          paidAt,
          createdAt: new Date().toISOString(),
          createdBy: get().currentUser?.username ?? "—",
        };
        set((s) => ({
          expenses: [newE, ...s.expenses],
          seqExpense: seq + 1,
          auditLogs: internalLogAudit(
            { ...s, expenses: [newE, ...s.expenses] },
            "إضافة مصروف",
            "expenses",
            `إضافة مصروف ${newE.expenseNumber} — ${purpose} (${amount} ${currency})`,
            "expense",
            newE.id
          ),
        }));
        return newE;
      },

      logAudit: (action, moduleKey, summary, entityType, entityId) =>
        set((s) => ({
          auditLogs: internalLogAudit(s, action, moduleKey, summary, entityType, entityId),
        })),
    }),
    {
      name: "sama-yemen-store",
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        // لا يتم حفظ بيانات الـ Auth — يلزم تسجيل الدخول كل جلسة
      }),
    }
  )
);
