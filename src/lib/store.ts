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
  Role,
  NavPage,
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
  agents: Agent[];
  transportCompanies: TransportCompany[];
  services: ServiceRecord[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  visaExpiry: VisaExpiryRecord[];
  // Counters
  seqService: number;
  seqInvoice: number;
  seqCustomer: number;
  seqPayment: number;
  seqExpense: number;
  // Actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setPage: (p: NavPage) => void;
  toggleSection: (s: string) => void;
  addCustomer: (c: Omit<Customer, "id" | "customerNumber" | "createdAt" | "isActive">) => Customer;
  addService: (s: Omit<ServiceRecord, "id" | "serviceNumber" | "createdAt" | "remaining">) => ServiceRecord;
  // Demo reset
  resetDemo: () => void;
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
      agents: seedAgents,
      transportCompanies: seedCompanies,
      services: seedServices,
      invoices: seedInvoices,
      payments: seedPayments,
      expenses: seedExpenses,
      auditLogs: seedAuditLogs,
      visaExpiry: seedVisaExpiry,
      seqService: seedServices.length + 1,
      seqInvoice: seedInvoices.length + 1,
      seqCustomer: seedCustomers.length + 1,
      seqPayment: seedPayments.length + 1,
      seqExpense: seedExpenses.length + 1,

      login: (username, password) => {
        const u = get().users.find(
          (x) => x.username === username && x.isActive
        );
        if (u && password.length >= 3) {
          const updatedUser = { ...u, lastLoginAt: new Date().toISOString() };
          set({
            isAuthed: true,
            currentUser: updatedUser,
            currentPage: "dashboard",
            auditLogs: [
              {
                id: `al_${Date.now()}`,
                occurredAt: new Date().toISOString(),
                actorUsername: u.username,
                actorRole: u.role,
                action: "تسجيل دخول",
                moduleKey: "auth",
                entityType: "user",
                entityId: u.id,
                summary: "تسجيل دخول ناجح",
              },
              ...get().auditLogs,
            ],
          });
          return true;
        }
        return false;
      },

      logout: () => {
        const u = get().currentUser;
        if (u) {
          set({
            auditLogs: [
              {
                id: `al_${Date.now()}`,
                occurredAt: new Date().toISOString(),
                actorUsername: u.username,
                actorRole: u.role,
                action: "تسجيل خروج",
                moduleKey: "auth",
                entityType: "user",
                entityId: u.id,
                summary: "تسجيل خروج",
              },
              ...get().auditLogs,
            ],
          });
        }
        set({ isAuthed: false, currentUser: null, currentPage: "dashboard" });
      },

      setLang: (l) => set({ lang: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setPage: (p) => set({ currentPage: p }),
      toggleSection: (s) =>
        set((st) => ({
          expandedSections: { ...st.expandedSections, [s]: !st.expandedSections[s] },
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
        }));
        return newC;
      },

      addService: (s) => {
        const seq = get().seqService;
        const newS: ServiceRecord = {
          ...s,
          id: `s_${Date.now()}`,
          serviceNumber: `SRV-2026-${String(seq).padStart(5, "0")}`,
          remaining: s.price - s.paid,
          createdAt: new Date().toISOString(),
        };
        // Also create an invoice for the service
        const seqInv = get().seqInvoice;
        const newInv: Invoice = {
          id: `inv_${Date.now()}`,
          invoiceNumber: `INV-2026-${String(seqInv).padStart(5, "0")}`,
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
        const u = get().currentUser;
        set((st) => ({
          services: [newS, ...st.services],
          invoices: [newInv, ...st.invoices],
          seqService: seq + 1,
          seqInvoice: seqInv + 1,
          auditLogs: [
            {
              id: `al_${Date.now()}`,
              occurredAt: new Date().toISOString(),
              actorUsername: u?.username ?? "—",
              actorRole: u?.role ?? "booking_officer",
              action: "إنشاء معاملة",
              moduleKey: "services",
              entityType: "service",
              entityId: newS.id,
              summary: `إنشاء معاملة جديدة للعميل ${s.customerName}`,
            },
            ...st.auditLogs,
          ],
        }));
        return newS;
      },

      resetDemo: () => {
        set({
          isAuthed: false,
          currentUser: null,
          customers: seedCustomers,
          employees: seedEmployees,
          users: seedUsers,
          agents: seedAgents,
          transportCompanies: seedCompanies,
          services: seedServices,
          invoices: seedInvoices,
          payments: seedPayments,
          expenses: seedExpenses,
          auditLogs: seedAuditLogs,
          visaExpiry: seedVisaExpiry,
          seqService: seedServices.length + 1,
          seqInvoice: seedInvoices.length + 1,
          seqCustomer: seedCustomers.length + 1,
          seqPayment: seedPayments.length + 1,
          seqExpense: seedExpenses.length + 1,
          currentPage: "dashboard",
        });
      },
    }),
    {
      name: "sama-yemen-store",
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        // Don't persist auth — require login each session
      }),
    }
  )
);
