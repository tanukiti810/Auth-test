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

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorFieldState>({});

  const isDisabled = useMemo(() => {
    return email.trim() === "" || password.trim() === "" || loading;
  }, [email, password, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDisabled) return;

    try {
      setLoading(true);
      setErrors({});

      // API に送信
      await authApi.signin({
        email,
        password,
      });

      // 成功したらホームページへリダイレクト
      router.push("/");
    } catch (error) {
      console.error("SignIn error:", error);
      setErrors({
        general: error instanceof Error ? error.message : "サインインに失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signin-page">
      <div className="signin-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="signin-wrap">
        <div className="signin-card">
          <section className="signin-brand">
            <div>
              <div className="signin-badge">
                <span className="signin-badge-dot" />
                Secure Sign In
              </div>

              <h1 className="signin-brand-title">おかえりなさい</h1>
              <p className="signin-brand-text">
                サインインして、あなたの情報にアクセスします。
              </p>
            </div>

            <div className="signin-brand-notes">
              <div className="signin-note-box">
                <p className="signin-note-title">コメント１</p>
                <p className="signin-note-text">
                  ○○○○
                </p>
              </div>
              <div className="signin-note-box">
                <p className="signin-note-title">コメント２</p>
                <p className="signin-note-text">
                  ○○○○
                </p>
              </div>
            </div>
          </section>

          <section className="signin-form-area">
            <div className="signin-form-inner">
              <div className="signin-head">
                <p className="signin-head-sub">SIGN IN</p>
                <h2 className="signin-head-title">アカウントにログイン</h2>
                <p className="signin-head-text">
                  登録済みのメールアドレスとパスワードを入力してください。
                </p>
              </div>

              {errors.general && (
                <div className="error-alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="signin-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`form-input ${errors.email ? "is-error" : ""}`}
                    required
                  />
                  {errors.email && (
                    <p className="error-text">{errors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="password" className="form-label">
                      パスワード
                    </label>
                    <Link href="/forgot-password" className="form-link">
                      パスワードを忘れた方
                    </Link>
                  </div>

                  <div className="password-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input form-input-password"
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
                  {errors.password && (
                    <p className="error-text">{errors.password}</p>
                  )}
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                  />
                  <span>ログイン状態を保持</span>
                </label>

                <button type="submit" disabled={isDisabled} className="submit-btn">
                  {loading ? "サインイン中..." : "サインイン"}
                </button>
              </form>

              <div className="divider">
                <span />
                <em>または</em>
                <span />
              </div>

              <div className="social-buttons">
                <button type="button" className="social-btn">
                  Googleでサインイン
                </button>
                <button type="button" className="social-btn">
                  GitHubでサインイン
                </button>
              </div>

              <p className="signup-text">
                アカウントをお持ちでない方は{" "}
                <Link href="/signup" className="signup-link">
                  新規登録
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
