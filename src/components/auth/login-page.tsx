"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tr } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Plane, Loader2, Lock, User as UserIcon } from "lucide-react";

export function LoginPage() {
  const lang = useAppStore((s) => s.lang);
  const login = useAppStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (!ok) {
        setErr(tr(lang, "invalid_credentials"));
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative lg:w-5/12 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] text-white p-8 lg:p-12 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full bg-white"></div>
          <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tr(lang, "brand_name")}</h1>
              <p className="text-white/80 text-sm">{tr(lang, "brand_sub")}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-8 lg:my-0">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {lang === "ar"
              ? "نظام إداري متكامل لخدمات السفر والسياحة والحج والعمرة"
              : "Integrated management system for travel, tourism, Hajj & Umrah"}
          </h2>
          <p className="text-white/85 leading-relaxed">
            {lang === "ar"
              ? "إدارة احترافية للعملاء والخدمات والفواتير والمدفوعات والإحصائيات في منصة واحدة آمنة وسريعة."
              : "Professional management of customers, services, invoices, payments, and statistics in one secure, fast platform."}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          {[
            lang === "ar" ? "حج وعمرة" : "Hajj & Umrah",
            lang === "ar" ? "تأشيرات" : "Visas",
            lang === "ar" ? "تذاكر طيران" : "Flight Tickets",
            lang === "ar" ? "نقل وشحن" : "Transport & Shipping",
          ].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <Card className="card-shadow border-border">
            <CardHeader className="space-y-2 text-center pb-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center lg:hidden">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {tr(lang, "login_title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{tr(lang, "login_subtitle")}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{tr(lang, "username")}</Label>
                  <div className="relative">
                    <UserIcon className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={tr(lang, "username")}
                      className="ps-9 h-11"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{tr(lang, "password")}</Label>
                    <button type="button" className="text-xs text-primary hover:underline">
                      {tr(lang, "forgot_password")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tr(lang, "password")}
                      className="ps-9 pe-9 h-11"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute inset-y-0 end-3 my-auto text-muted-foreground hover:text-foreground"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(!!v)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    {tr(lang, "remember_me")}
                  </Label>
                </div>

                {err && (
                  <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2">
                    {err}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-95 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    tr(lang, "sign_in")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
