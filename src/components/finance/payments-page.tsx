"use client";

import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currencySymbol = (c: string) => (c === "SAR" ? "ر.س" : c === "YER" ? "ر.ي" : "$");

export function PaymentsPage() {
  const lang = useAppStore((s) => s.lang);
  const payments = useAppStore((s) => s.payments);

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_payments")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? `إجمالي السندات: ${payments.length}` : `Total vouchers: ${payments.length}`}
        </p>
      </div>

      <Card className="border-border card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_no")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "customer_name")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "invoice_no")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_amount")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_method")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "payment_date")}</TableHead>
                  <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/30">
                    <TableCell className="text-xs text-muted-foreground num">{p.paymentNumber}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground">{p.customerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground num">{p.invoiceNumber ?? "—"}</TableCell>
                    <TableCell className="text-sm font-bold text-foreground num">
                      {p.amount.toLocaleString("en-US")} {currencySymbol(p.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        p.method === "cash" ? "bg-[#FEF9C3] text-[#EAB308]"
                        : p.method === "transfer" ? "bg-[#E0F2FE] text-[#0EA5E9]"
                        : "bg-[#F3E8FF] text-[#6D28D9]"
                      }>
                        {p.method === "cash" ? tr(lang, "list_cash") : p.method === "transfer" ? tr(lang, "list_transfer") : tr(lang, "list_wallet")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground num">{new Date(p.receivedAt).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={p.status === "approved" ? "bg-[#ECFDF5] text-[#10B981]" : "bg-muted text-muted-foreground"}>
                        {p.status === "approved" ? tr(lang, "completed") : tr(lang, "pending")}
                      </Badge>
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
