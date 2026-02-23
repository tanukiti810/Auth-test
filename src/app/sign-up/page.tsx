"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/endpoints";

interface ErrorFieldState {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorFieldState>({});

  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

  const passwordTooShort =
    password.length > 0 && password.length < 8;

  const isDisabled = useMemo(() => {
    return (
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      passwordConfirm.trim() === "" ||
      passwordMismatch ||
      passwordTooShort ||
      !agree ||
      loading
    );
  }, [
    name,
    email,
    password,
    passwordConfirm,
    passwordMismatch,
    passwordTooShort,
    agree,
    loading,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDisabled) return;

    try {
      setLoading(true);
      setErrors({});

      // API に送信
      await authApi.signup({
        email,
        password,
      });

      // 成功したらサインインページへリダイレクト
      alert("新規登録が完了しました。サインインしてください。");
      router.push("/signin");
    } catch (error) {
      console.error("SignUp error:", error);
      setErrors({
        general: error instanceof Error ? error.message : "新規登録に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-bg">
        <div className="signup-blob signup-blob-1" />
        <div className="signup-blob signup-blob-2" />
        <div className="signup-blob signup-blob-3" />
      </div>

      <div className="signup-wrap">
        <div className="signup-card">
          {/* 左カラム（説明） */}
          <section className="signup-brand">
            <div>
              <div className="signup-badge">
                <span className="signup-badge-dot" />
                Create Account
              </div>

              <h1 className="signup-brand-title">新しいアカウントを作成</h1>
              <p className="signup-brand-text">
                必要な情報を入力して、すぐに利用を開始できます。
              </p>
            </div>

            <div className="signup-brand-notes">
              <div className="signup-note-box">
                <p className="signup-note-title">コメント１</p>
                <p className="signup-note-text">
                  ○○○○
                </p>
              </div>
              <div className="signup-note-box">
                <p className="signup-note-title">安全性</p>
                <p className="signup-note-text">
                  ○○○○
                </p>
              </div>
            </div>
          </section>

          {/* 右カラム（フォーム） */}
          <section className="signup-form-area">
            <div className="signup-form-inner">
              <div className="signup-head">
                <p className="signup-head-sub">SIGN UP</p>
                <h2 className="signup-head-title">アカウント登録</h2>
                <p className="signup-head-text">
                  以下の情報を入力してください。
                </p>
              </div>

              {errors.general && (
                <div className="error-alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    表示名
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`form-input ${errors.email ? "is-error" : ""}`}
                    autoComplete="email"
                    required
                  />
                  {errors.email && (
                    <p className="error-text">{errors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    パスワード
                  </label>
                  <div className="password-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8文字以上"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`form-input form-input-password ${
                        passwordTooShort ? "is-error" : ""
                      }`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="password-toggle"
                    >
                      {showPassword ? "非表示" : "表示"}
                    </button>
                  </div>
                  {passwordTooShort && (
                    <p className="error-text">
                      パスワードは8文字以上で入力してください。
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="passwordConfirm" className="form-label">
                    パスワード（確認）
                  </label>
                  <div className="password-wrap">
                    <input
                      id="passwordConfirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="もう一度入力"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className={`form-input form-input-password ${
                        passwordMismatch ? "is-error" : ""
                      }`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirm((prev) => !prev)
                      }
                      className="password-toggle"
                    >
                      {showPasswordConfirm ? "非表示" : "表示"}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="error-text">
                      パスワードが一致していません。
                    </p>
                  )}
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    <Link href="/terms" className="inline-link">
                      利用規約
                    </Link>
                    と
                    <Link href="/privacy" className="inline-link">
                      プライバシーポリシー
                    </Link>
                    に同意する
                  </span>
                </label>

                <button type="submit" disabled={isDisabled} className="submit-btn">
                  {loading ? "登録中..." : "新規登録"}
                </button>
              </form>

              <div className="divider">
                <span />
                <em>または</em>
                <span />
              </div>

              <div className="social-buttons">
                <button type="button" className="social-btn">
                  Googleで登録
                </button>
                <button type="button" className="social-btn">
                  GitHubで登録
                </button>
              </div>

              <p className="signin-text">
                すでにアカウントをお持ちの方は{" "}
                <Link href="/signin" className="signin-link">
                  サインイン
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

