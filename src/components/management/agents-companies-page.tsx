"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Building2, Briefcase } from "lucide-react";

export function AgentsCompaniesPage() {
  const lang = useAppStore((s) => s.lang);
  const agents = useAppStore((s) => s.agents);
  const companies = useAppStore((s) => s.transportCompanies);

  const [tab, setTab] = useState("agents");
  const [openAgent, setOpenAgent] = useState(false);
  const [openComp, setOpenComp] = useState(false);
  const [agentForm, setAgentForm] = useState({ officeName: "", agentNumber: "", serviceType: "" });
  const [compForm, setCompForm] = useState({ companyName: "", companyNumber: "", address: "" });

  const saveAgent = () => {
    if (!agentForm.officeName.trim()) {
      toast.error(lang === "ar" ? "أدخل اسم المكتب" : "Enter office name");
      return;
    }
    // Local demo add (no store mutation needed in this view-only demo)
    toast.success(lang === "ar" ? "تم الحفظ (تجريبي)" : "Saved (demo)");
    setOpenAgent(false);
    setAgentForm({ officeName: "", agentNumber: "", serviceType: "" });
  };

  const saveComp = () => {
    if (!compForm.companyName.trim()) {
      toast.error(lang === "ar" ? "أدخل اسم الشركة" : "Enter company name");
      return;
    }
    toast.success(lang === "ar" ? "تم الحفظ (تجريبي)" : "Saved (demo)");
    setOpenComp(false);
    setCompForm({ companyName: "", companyNumber: "", address: "" });
  };

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_agents_companies")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة الوكلاء وشركات النقل" : "Manage agents & transport companies"}
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="agents" className="gap-2">
            <Briefcase className="w-4 h-4" />
            {lang === "ar" ? "وكلاء السفر" : "Travel Agents"}
            <span className="text-[10px] text-muted-foreground num">({agents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="w-4 h-4" />
            {lang === "ar" ? "شركات النقل" : "Transport Companies"}
            <span className="text-[10px] text-muted-foreground num">({companies.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button
              className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2"
              onClick={() => setOpenAgent(true)}
            >
              <Plus className="w-4 h-4" />
              {tr(lang, "add")}
            </Button>
          </div>
          <Card className="border-border card-shadow">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs font-semibold">{lang === "ar" ? "اسم مكتب الوكيل" : "Office Name"}</TableHead>
                      <TableHead className="text-xs font-semibold">{lang === "ar" ? "الرقم" : "No."}</TableHead>
                      <TableHead className="text-xs font-semibold">{lang === "ar" ? "نوع الخدمة" : "Service Type"}</TableHead>
                      <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((a) => (
                      <TableRow key={a.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-foreground text-sm">{a.officeName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{a.agentNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.serviceType}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={a.isActive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-muted text-muted-foreground"}>
                            {a.isActive ? tr(lang, "active") : tr(lang, "inactive")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button
              className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2"
              onClick={() => setOpenComp(true)}
            >
              <Plus className="w-4 h-4" />
              {tr(lang, "add")}
            </Button>
          </div>
          <Card className="border-border card-shadow">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs font-semibold">{lang === "ar" ? "اسم الشركة" : "Company Name"}</TableHead>
                      <TableHead className="text-xs font-semibold">{lang === "ar" ? "رقم الشركة" : "Company No."}</TableHead>
                      <TableHead className="text-xs font-semibold">{lang === "ar" ? "العنوان" : "Address"}</TableHead>
                      <TableHead className="text-xs font-semibold">{tr(lang, "status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((c) => (
                      <TableRow key={c.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-foreground text-sm">{c.companyName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground num">{c.companyNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.address}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={c.isActive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-muted text-muted-foreground"}>
                            {c.isActive ? tr(lang, "active") : tr(lang, "inactive")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agent dialog */}
      <Dialog open={openAgent} onOpenChange={setOpenAgent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "إضافة وكيل سفر" : "Add Travel Agent"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div>
              <Label className="text-xs">{lang === "ar" ? "اسم مكتب الوكيل" : "Office Name"} *</Label>
              <Input value={agentForm.officeName} onChange={(e) => setAgentForm({ ...agentForm, officeName: e.target.value })} className="bg-background mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === "ar" ? "الرقم" : "No."}</Label>
              <Input value={agentForm.agentNumber} onChange={(e) => setAgentForm({ ...agentForm, agentNumber: e.target.value })} className="bg-background mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === "ar" ? "نوع الخدمة" : "Service Type"}</Label>
              <Input value={agentForm.serviceType} onChange={(e) => setAgentForm({ ...agentForm, serviceType: e.target.value })} className="bg-background mt-1" placeholder={lang === "ar" ? "حج وعمرة، تأشيرات..." : "Hajj, visas..."} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpenAgent(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={saveAgent} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95">{tr(lang, "save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openComp} onOpenChange={setOpenComp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "إضافة شركة نقل" : "Add Transport Company"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div>
              <Label className="text-xs">{lang === "ar" ? "اسم الشركة" : "Company Name"} *</Label>
              <Input value={compForm.companyName} onChange={(e) => setCompForm({ ...compForm, companyName: e.target.value })} className="bg-background mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === "ar" ? "رقم الشركة" : "Company No."}</Label>
              <Input value={compForm.companyNumber} onChange={(e) => setCompForm({ ...compForm, companyNumber: e.target.value })} className="bg-background mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === "ar" ? "العنوان" : "Address"}</Label>
              <Input value={compForm.address} onChange={(e) => setCompForm({ ...compForm, address: e.target.value })} className="bg-background mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpenComp(false)}>{tr(lang, "cancel")}</Button>
            <Button onClick={saveComp} className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95">{tr(lang, "save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
