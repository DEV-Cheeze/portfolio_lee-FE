"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function SignupForm() {
  const router = useRouter();
  const { register, checkNicknameDuplicate } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Nickname duplicate check state
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset nickname check when nickname changes
    if (name === "nickname") {
      setNicknameStatus("idle");
      setIsNicknameChecked(false);
    }
    setError("");
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    
    setNicknameStatus("checking");
    try {
      const isDuplicate = await checkNicknameDuplicate(formData.nickname);
      setNicknameStatus(isDuplicate ? "taken" : "available");
      setIsNicknameChecked(!isDuplicate);
    } catch (err) {
      setError("닉네임 확인 중 오류가 발생했습니다.");
      setNicknameStatus("idle");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError("아이디를 입력해주세요.");
      return false;
    }
    if (formData.username.length < 4) {
      setError("아이디는 4자 이상이어야 합니다.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    if (!formData.nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return false;
    }
    if (!isNicknameChecked) {
      setError("닉네임 중복확인을 해주세요.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register({
        username: formData.username,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        router.push("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const pwd = formData.password;
    if (pwd.length === 0) return { level: 0, text: "" };
    if (pwd.length < 8) return { level: 1, text: "8자 이상 필요" };
    
    let strength = 1;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    if (strength === 1) return { level: 1, text: "약함" };
    if (strength === 2) return { level: 2, text: "보통" };
    if (strength === 3) return { level: 3, text: "강함" };
    return { level: 4, text: "매우 강함" };
  };

  const strength = passwordStrength();

  return (
    <div className={`w-full max-w-md transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>돌아가기</span>
      </Link>

      <div className="bg-glass backdrop-blur-xl border border-glass-border rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">회원가입</h1>
          <p className="text-muted-foreground">새 계정을 만들어보세요</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-foreground mb-2"
            >
              아이디
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-muted/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              placeholder="4자 이상의 아이디"
              required
              autoComplete="username"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-muted/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              placeholder="이메일을 입력하세요"
              required
              autoComplete="email"
            />
          </div>

          {/* Nickname with duplicate check */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-foreground mb-2"
            >
              닉네임
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-muted/50 border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm ${
                    nicknameStatus === "available"
                      ? "border-green-500"
                      : nicknameStatus === "taken"
                      ? "border-destructive"
                      : "border-glass-border"
                  }`}
                  placeholder="사용할 닉네임"
                  required
                />
                {nicknameStatus === "available" && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {nicknameStatus === "taken" && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
              </div>
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={nicknameStatus === "checking" || !formData.nickname.trim()}
                className="px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
              >
                {nicknameStatus === "checking" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "중복확인"
                )}
              </button>
            </div>
            {nicknameStatus === "available" && (
              <p className="text-sm text-green-500 mt-1">사용 가능한 닉네임입니다.</p>
            )}
            {nicknameStatus === "taken" && (
              <p className="text-sm text-destructive mt-1">이미 사용 중인 닉네임입니다.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 bg-muted/50 border border-glass-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                placeholder="8자 이상의 비밀번호"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= strength.level
                          ? strength.level <= 1
                            ? "bg-destructive"
                            : strength.level === 2
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs ${
                    strength.level <= 1
                      ? "text-destructive"
                      : strength.level === 2
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {strength.text}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground mb-2"
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 bg-muted/50 border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? "border-destructive"
                    : formData.confirmPassword &&
                      formData.password === formData.confirmPassword
                    ? "border-green-500"
                    : "border-glass-border"
                }`}
                placeholder="비밀번호를 다시 입력하세요"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <p
                className={`text-xs mt-1 ${
                  formData.password === formData.confirmPassword
                    ? "text-green-500"
                    : "text-destructive"
                }`}
              >
                {formData.password === formData.confirmPassword
                  ? "비밀번호가 일치합니다."
                  : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                가입 중...
              </>
            ) : (
              "회원가입"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/" className="text-foreground hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
