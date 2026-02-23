// src/lib/api/endpoints.ts

// =====================================
// APIエンドポイント定義（呼び出し口の集約）
// =====================================
// 目的：
// - 画面（UI）側が "URL文字列" や "HTTPメソッド" を直に扱わないようにする
// - apiClient（通信・エラー正規化）を通して、型付きで安全にAPIを呼べるようにする
// - APIの呼び出し場所を1箇所に集約し、変更に強くする（URL変更・仕様変更に対応しやすい）

import { apiClient } from "./client";
import type {
    // /me のレスポンス型
    MeResponse,
    // サインイン・サインアップのリクエスト型
    SignInRequest,
    SignUpRequest,
    // ユーザー情報のレスポンス型
    UserResponse,
    // 商品一覧・商品詳細のレスポンス型
    ProductsResponse,
    ProductResponse,
    // 決済開始のリクエスト/レスポンス型
    CheckoutRequest,
    CheckoutResponse,
    // 購入履歴レスポンス型
    PurchasesResponse,
    // ダウンロード用署名付きURL発行レスポンス型
    DownloadResponse,
    // お気に入り（ウィッシュリスト）レスポンス型
    WishlistResponse,
} from "@/types/api";

// ---------- Auth ----------
// 認証関連のAPI群
// UI側は authApi.signup(...) のように呼ぶだけでよく、
// URLやHTTPメソッド、型指定をここに閉じ込める
export const authApi = {
    // 新規登録
    signup(req: SignUpRequest) {
        // POST /auth/signup に SignUpRequest を送り、UserResponse を受け取る
        return apiClient.post<UserResponse>("/auth/signup", req);
    },

    // ログイン
    signin(req: SignInRequest) {
        // POST /auth/signin に SignInRequest を送り、UserResponse を受け取る
        return apiClient.post<UserResponse>("/auth/signin", req);
    },

    // ログアウト
    logout() {
        // POST /auth/logout（ボディなし）
        // 成功時は { ok: true } のようなシンプルな応答を想定
        return apiClient.post<{ ok: true }>("/auth/logout");
    },

    // 自分のユーザー情報取得
    me() {
        // GET /me
        return apiClient.get<MeResponse>("/me");
    },
};

// ---------- Products ----------

// 商品一覧の検索条件（クエリパラメータ）
// type: 商品の種類フィルタ
// q: 検索キーワード
// tags: タグ配列（複数指定）
// sort: 並び順
// page/limit: ページング
export type ProductsQuery = {
    type?: "image" | "music" | "video" | "fonts";
    q?: string;
    tags?: string[];
    sort?: "new" | "rank";
    page?: number;
    limit?: number;
};

// =====================================
// クエリ文字列を安全に組み立てるヘルパー
// =====================================
// params を "?a=1&b=2" の形に変換して返す。
// - undefined / null はクエリに含めない（不要パラメータの混入防止）
// - 配列は tags=a&tags=b のように同一キーを複数回付与する
//   （バックエンドがこの形式を想定している場合に有効）
function buildQuery(params: Record<string, unknown>): string {
    const sp = new URLSearchParams();

    for (const [k, v] of Object.entries(params)) {
        // 値が無いものはスキップ
        if (v === undefined || v === null) continue;

        // 配列は同じキーで複数回 append する
        if (Array.isArray(v)) {
            // 例：tags=["a","b"] → tags=a&tags=b
            for (const item of v) sp.append(k, String(item));
            continue;
        }

        // それ以外は 1キー1値でセット
        sp.set(k, String(v));
    }

    // URLSearchParams を文字列化
    const q = sp.toString();

    // 空なら ""、あれば "?" を付けて返す
    return q ? `?${q}` : "";
}

export const productsApi = {
    // 商品一覧取得（クエリ付き）
    list(query: ProductsQuery = {}) {
        // ProductsQuery を buildQuery に渡してクエリ文字列化
        const qs = buildQuery(query as Record<string, unknown>);

        // GET /products?...
        return apiClient.get<ProductsResponse>(`/products${qs}`);
    },

    // 商品IDで詳細取得
    getById(id: string) {
        // encodeURIComponent は URLパス内の安全性確保
        // 例：id に / や ? などが混じっても URL が壊れないようにする
        return apiClient.get<ProductResponse>(`/products/${encodeURIComponent(id)}`);
    },
};

// ---------- Checkout / Purchases ----------

// 決済（チェックアウト）と購入履歴関連
export const checkoutApi = {
    // 決済開始（チェックアウトセッション作成など）
    createCheckout(req: CheckoutRequest) {
        // POST /checkout
        return apiClient.post<CheckoutResponse>("/checkout", req);
    },

    // 購入履歴取得
    purchases() {
        // GET /purchases
        return apiClient.get<PurchasesResponse>("/purchases");
    },
};

// ---------- Downloads ----------

// ダウンロード関連
export const downloadsApi = {
    // 署名付きURL（Signed URL：期限付きダウンロードURL）を発行
    createSignedUrl(productId: string) {
        // productId をURLに埋め込むため encodeURIComponent で安全化
        // POST /downloads/:productId
        return apiClient.post<DownloadResponse>(
            `/downloads/${encodeURIComponent(productId)}`
        );
    },
};

// ---------- Wishlist (optional) ----------

// お気に入り（ウィッシュリスト）関連
// "optional" ＝機能として後から外したり追加したりしやすいよう、独立モジュール化
export const wishlistApi = {
    // 一覧取得
    get() {
        // GET /wishlist
        return apiClient.get<WishlistResponse>("/wishlist");
    },

    // 追加
    add(productId: string) {
        // POST /wishlist/:productId
        return apiClient.post<{ ok: true }>(
            `/wishlist/${encodeURIComponent(productId)}`
        );
    },

    // 削除
    remove(productId: string) {
        // DELETE /wishlist/:productId
        return apiClient.delete<{ ok: true }>(
            `/wishlist/${encodeURIComponent(productId)}`
        );
    },
};
