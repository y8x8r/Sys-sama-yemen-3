"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Moon,
  Sun,
  Shield,
  Wallet,
  BarChart3,
  MoonStar,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function SystemSettingsPage() {
  const lang = useAppStore((s) => s.lang);
  const theme = useAppStore((s) => s.theme);
  const setLang = useAppStore((s) => s.setLang);
  const setTheme = useAppStore((s) => s.setTheme);
  const currentUser = useAppStore((s) => s.currentUser);
  const changePassword = useAppStore((s) => s.changePassword);

  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  const handleChangePassword = () => {
    const errs: Record<string, string> = {};
    if (!pwdForm.current) errs.current = lang === "ar" ? "مطلوب" : "Required";
    if (pwdForm.next.length < 4) errs.next = tr(lang, "err_password_short");
    if (pwdForm.next !== pwdForm.confirm) errs.confirm = lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords don't match";
    setPwdErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const ok = changePassword(pwdForm.current, pwdForm.next);
    if (!ok) {
      setPwdErrors({ current: tr(lang, "err_wrong_password") });
      return;
    }
    toast.success(tr(lang, "password_changed"));
    setPwdForm({ current: "", next: "", confirm: "" });
  };

  // فقط المدير العام يستطيع تغيير كلمة المرور
  const isManager = currentUser?.role === "manager";

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{tr(lang, "nav_system_settings")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "إعدادات النظام العامة والتفضيلات" : "General system settings and preferences"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Language */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {tr(lang, "settings_default_lang")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={lang}
              onValueChange={(v) => setLang(v as "ar" | "en")}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { value: "ar", label: tr(lang, "settings_arabic"), desc: lang === "ar" ? "من اليمين إلى اليسار (RTL)" : "Right-to-left (RTL)" },
                { value: "en", label: tr(lang, "settings_english"), desc: lang === "ar" ? "من اليسار إلى اليمين (LTR)" : "Left-to-right (LTR)" },
              ].map((o) => (
                <label
                  key={o.value}
                  htmlFor={`lang-${o.value}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    lang === o.value
                      ? "border-primary bg-accent/40"
                      : "border-border hover:border-primary/40 hover:bg-accent/20"
                  }`}
                >
                  <RadioGroupItem value={o.value} id={`lang-${o.value}`} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{o.label}</p>
                    <p className="text-[11px] text-muted-foreground">{o.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MoonStar className="w-4 h-4 text-primary" />
              {tr(lang, "settings_color_mode")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "light", label: tr(lang, "settings_light"), icon: Sun, color: "#F97316" },
                { value: "dark", label: tr(lang, "settings_dark"), icon: Moon, color: "#A855F7" },
              ].map((o) => (
                <button
                  key={o.value}
                  onClick={() => setTheme(o.value as "light" | "dark")}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    theme === o.value
                      ? "border-primary bg-accent/40"
                      : "border-border hover:border-primary/40 hover:bg-accent/20"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: o.value === "light" ? "#FFEDD5" : "#1A1A2E" }}
                  >
                    <o.icon className="w-4 h-4" style={{ color: o.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{o.label}</span>
                  {theme === o.value && (
                    <Badge variant="secondary" className="ms-auto bg-pastel-lilac text-pastel-lilac text-[10px]">
                      {lang === "ar" ? "نشط" : "Active"}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              {lang === "ar"
                ? "الوضع الليلي يغير المظهر الخارجي والداخلي الكامل للنظام بشكل متناسق، والوضع النهاري يعيده كاملاً."
                : "Dark mode changes the entire external and internal appearance consistently, and light mode restores it fully."}
            </p>
          </CardContent>
        </Card>

        {/* Cancellation policy */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {tr(lang, "settings_cancel_policy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {lang === "ar" ? "إلغاء مجاني خلال 24 ساعة" : "Free cancellation within 24h"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar" ? "السماح بالإلغاء المجاني خلال 24 ساعة من الحجز" : "Allow free cancellation within 24 hours of booking"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {lang === "ar" ? "رسوم إلغاء 50% بعد 24 ساعة" : "50% cancellation fee after 24h"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar" ? "تطبيق رسوم إلغاء بنسبة 50% من القيمة" : "Apply 50% cancellation fee"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {lang === "ar" ? "منع استرجاع المبلغ للحجوزات الفندقية" : "No refund for hotel bookings"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar" ? "منع استرجاع المبلغ بعد تأكيد الحجز الفندقي" : "Block refunds after hotel booking confirmation"}
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment methods */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              {tr(lang, "settings_payment_methods")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: "cash", label: tr(lang, "list_cash"), icon: Wallet, enabled: true },
                { key: "transfer", label: tr(lang, "list_transfer"), icon: Wallet, enabled: true },
                { key: "wallet", label: tr(lang, "list_wallet"), icon: Wallet, enabled: true },
              ].map((m) => (
                <div key={m.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-pastel-lilac flex items-center justify-center">
                      <m.icon className="w-4 h-4 text-pastel-lilac" />
                    </div>
                    <Label className="text-sm font-medium cursor-pointer">{m.label}</Label>
                  </div>
                  <Switch defaultChecked={m.enabled} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Label className="text-sm font-medium block mb-2">
                {lang === "ar" ? "العملات المدعومة" : "Supported currencies"}
              </Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-pastel-mint text-pastel-mint">ر.س (SAR)</Badge>
                <Badge variant="secondary" className="bg-pastel-peach text-pastel-peach">ر.ي (YER)</Badge>
                <Badge variant="secondary" className="bg-pastel-sky text-pastel-sky">$ (USD)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance evaluation */}
        <Card className="border-border card-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {tr(lang, "settings_perf_eval")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {lang === "ar" ? "تسجيل أوقات الدخول والخروج" : "Log login & logout times"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar" ? "تسجيل أوقات دخول الموظفين لأغراض الأداء" : "Log employee login times for performance"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {lang === "ar" ? "مؤشرات استخدام النظام" : "System usage indicators"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar" ? "عرض مؤشرات استخدام النظام للمدير فقط" : "Show usage indicators to manager only"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {lang === "ar" ? "عدد أيام التحذير لانتهاء التأشيرة" : "Visa expiry warning days"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar" ? "عدد الأيام للتحذير المبكر قبل انتهاء التأشيرة" : "Days to warn before visa expiry"}
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-24 h-9 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password — متاح للمدير العام لتغيير كلمة مروره */}
        {isManager && (
          <Card className="border-border card-shadow lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                {tr(lang, "change_password")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{tr(lang, "current_password")} *</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={pwdForm.current}
                      onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                      className="bg-background pe-9"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 end-3 my-auto text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.current && <p className="text-xs text-destructive">{pwdErrors.current}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tr(lang, "new_password")} *</Label>
                  <div className="relative">
                    <Input
                      type={showNext ? "text" : "password"}
                      value={pwdForm.next}
                      onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                      className="bg-background pe-9"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNext(!showNext)}
                      className="absolute inset-y-0 end-3 my-auto text-muted-foreground hover:text-foreground"
                    >
                      {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.next && <p className="text-xs text-destructive">{pwdErrors.next}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tr(lang, "confirm_password")} *</Label>
                  <Input
                    type={showNext ? "text" : "password"}
                    value={pwdForm.confirm}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                    className="bg-background"
                    dir="ltr"
                  />
                  {pwdErrors.confirm && <p className="text-xs text-destructive">{pwdErrors.confirm}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {tr(lang, "change_password")}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                {lang === "ar"
                  ? "يمكن للمدير العام تغيير كلمة مروره الخاصة به في أي وقت عبر مسار آمن."
                  : "The General Manager can change his own password at any time through a secure path."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* تم إزالة «منطقة الخطر» نهائياً — لا يوجد بديل ولا قسم مشابه */}
      </div>
    </div>
  );
}
