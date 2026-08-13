"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Receipt as ReceiptIcon } from "lucide-react";

const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");

export function InvoicesPage() {
  const lang = useAppStore((s) => s.lang);
  const invoices = useAppStore((s) => s.invoices);
  const [statusFilter, setStatusFilter] = useState("all");

  const list = invoices.filter((i) => statusFilter === "all" || i.status === statusFilter);

  const totalAmount = invoices.reduce((sum, i) => sum + (i.currency === "SAR" ? i.totalAmount * 0.27 : i.currency === "YER" ? i.totalAmount * 0.0004 : i.totalAmount), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.currency === "SAR" ? i.paidAmount * 0.27 : i.currency === "YER" ? i.paidAmount * 0.0004 : i.paidAmount), 0);
  const totalRemaining = totalAmount - totalPaid;

  const statusLabel = (s: string) =>
    s === "paid" ? tr(lang, "invoice_paid") : s === "partial" ? tr(lang, "invoice_partial") : s === "issued" ? tr(lang, "invoice_issued") : tr(lang, "invoice_draft");

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_invoices")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? `إجمالي الفواتير: ${invoices.length}` : `Total invoices: ${invoices.length}`}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-44 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tr(lang, "overall")}</SelectItem>
            <SelectItem value="paid">{tr(lang, "invoice_paid")}</SelectItem>
            <SelectItem value="partial">{tr(lang, "invoice_partial")}</SelectItem>
            <SelectItem value="issued">{tr(lang, "invoice_issued")}</SelectItem>
            <SelectItem value="draft">{tr(lang, "invoice_draft")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <p className="text-xs text-muted-foreground">{tr(lang, "total")}</p>
            </div>
            <p className="text-2xl font-bold text-foreground num">${Math.round(totalAmount).toLocaleString("en-US")}</p>
          </CardContent>
        </Card>
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-[#10B981]" />
              </div>
              <p className="text-xs text-muted-foreground">{tr(lang, "paid")}</p>
            </div>
            <p className="text-2xl font-bold text-[#10B981] num">${Math.round(totalPaid).toLocaleString("en-US")}</p>
          </CardContent>
        </Card>
        <Card className="border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-xs text-muted-foreground">{tr(lang, "remaining")}</p>
            </div>
            <p className="text-2xl font-bold text-destructive num">${Math.round(totalRemaining).toLocaleString("en-US")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "invoice_no")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "total")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "paid")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "remaining")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "invoice_date")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "invoice_status")}</TableHead>
                  <TableHead className="text-xs font-semibold text-end">{tr(lang, "actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((i) => (
                  <TableRow key={i.id} className="hover:bg-accent/30">
                    <TableCell className="text-xs text-muted-foreground num font-medium">{i.invoiceNumber}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground">{i.customerName}</TableCell>
                    <TableCell className="text-sm font-bold text-foreground num">
                      {i.totalAmount.toLocaleString("en-US")} {currencySymbol(i.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-[#10B981] num">
                      {i.paidAmount.toLocaleString("en-US")} {currencySymbol(i.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-destructive num">
                      {i.remainingAmount.toLocaleString("en-US")} {currencySymbol(i.currency)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground num">{new Date(i.issuedAt).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        i.status === "paid" ? "bg-[#ECFDF5] text-[#10B981]"
                        : i.status === "partial" ? "bg-[#FEF9C3] text-[#EAB308]"
                        : i.status === "issued" ? "bg-[#E0F2FE] text-[#0EA5E9]"
                        : "bg-muted text-muted-foreground"
                      }>
                        {statusLabel(i.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
