// APIのRequest/Response型をまとめたファイル（通信の入出力を型で固定）
// apiClient.get<T>() の T に指定して型安全に扱う

import type { User, Product, Purchase } from "./domain"; // ドメイン型（アプリの中心概念）

// サーバの構造化エラー形式（message は省略されることがある）
export type ApiErrorBody = { error: { code: string; message?: string } };

// 認証：送信ボディ（新規登録 / ログイン）
export type SignUpRequest = { email: string; password: string };
export type SignInRequest = { email: string; password: string };

// ユーザー：受信ボディ（user を返す）
export type UserResponse = { user: User };
export type MeResponse = { user: User };

// 商品：一覧（ページング付き） / 詳細
export type ProductsResponse = { items: Product[]; total: number; page: number; limit: number };
export type ProductResponse = { product: Product };

// 決済：開始リクエスト / チェックアウトURL
export type CheckoutRequest = { productId: string };
export type CheckoutResponse = { checkoutUrl: string };

// 購入履歴：購入一覧
export type PurchasesResponse = { items: Purchase[] };

// ダウンロード：署名付きURL（期限付きURL）
export type DownloadResponse = { signedUrl: string };

// お気に入り：商品一覧
export type WishlistResponse = { items: Product[] };
