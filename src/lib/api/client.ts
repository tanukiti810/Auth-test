import { ApiError, toApiError } from "./errors";

// APIの接続先ベースURLを環境変数から取得
// Next.jsでは NEXT_PUBLIC_ が付く環境変数はブラウザ側にも公開される
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// BASE_URL が未設定の場合は警告を表示（設定ミスの早期検出用）
if (!BASE_URL) {
    console.warn("NEXT_PUBLIC_API_BASE_URL is not set.");
}


// ApiClient を生成するときに渡す設定オブジェクトの構造
export type ApiClientOptions = {
    // fetch における認証情報（Cookieなど）の送信ポリシー
    // "omit" | "same-origin" | "include" のいずれか
    credentials?: RequestCredentials;

    // 共通HTTPヘッダ設定
    // { ヘッダ名: ヘッダ値 } の形式
    headers?: Record<string, string>;
}

// API通信クライアントクラス
export class ApiClient {

    // コンストラクタ（インスタンス生成時に一度だけ実行される初期化処理）
    // private opts: ApiClientOptions
    //  → 設定オブジェクトをクラス内部プロパティとして自動保存
    // = {}
    //  → 引数が渡されなかった場合は空オブジェクトを使う（デフォルト引数）
    constructor(private opts: ApiClientOptions = {}) { }

    // 共通リクエスト関数（非同期）
    // T はジェネリクス（型パラメータ）
    // 呼び出し側が「このAPIはこの型を返す」と指定できる
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {

        // BASE_URL と path を連結してリクエストURLを生成
        const url = `${BASE_URL}${path}`;

        // HTTPヘッダの統合
        // 1. デフォルトヘッダ
        // 2. インスタンス共通ヘッダ（this.opts.headers）
        // 3. 呼び出し個別ヘッダ（init.headers）
        // の順でマージ（後に書かれたものが優先される）
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(this.opts.headers ?? {}),
            ...(init.headers ? (init.headers as Record<string, string>) : {})
        }

        // credentials（Cookie送信設定）の決定
        // 優先順位：
        // 1. 呼び出し個別設定 init.credentials
        // 2. インスタンス共通設定 this.opts.credentials
        // 3. デフォルト "include"
        const credentials = init.credentials ?? this.opts.credentials ?? "include";

        let res: Response;
        try {
            // fetch は非同期通信（HTTPリクエスト送信）
            res = await fetch(url, {
                ...init,
                headers,
                credentials
            })
        } catch (e) {
            // ネットワーク自体が失敗した場合（接続不能・DNS失敗・CORSなど）
            // ApiError に変換して throw
            throw toApiError({ body: e, fallbackMessage: "ネットワークエラーが発生しました。" });
        }

        // 形式が不明なため unknown 型で保持
        let body: unknown = null;

        // Content-Type ヘッダを取得
        const contentType = res.headers.get("content-type") ?? "";

        // JSONレスポンスの場合
        if (contentType.includes("application/json")) {
            try {
                body = await res.json();
            } catch {
                // JSONパース失敗時
                body = null;
            }
        } else {
            // JSON以外（text/html, text/plain など）の場合
            try {
                body = await res.text();
            } catch {
                body = null;
            }
        }

        // res.ok === false → 200〜299以外（401, 404, 500など）
        if (!res.ok) {
            const apiErr: ApiError = toApiError({
                status: res.status,
                body,
                fallbackMessage: "サーバーエラーが発生しました。"
            })
            // 正規化された ApiError を投げる
            throw apiErr;
        }

        // body を T 型として返却（型アサーション）
        return body as T;
    }

    // GETリクエスト用
    get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: "GET" });
    }

    // POSTリクエスト用
    post<T>(path: string, data?: unknown): Promise<T> {
        return this.request<T>(path, {
            method: "POST",
            // data が undefined でなければ JSON文字列に変換
            body: data === undefined ? undefined : JSON.stringify(data),
        });
    }

    // DELETEリクエスト用
    delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: "DELETE" });
    }
}

// どこからでも import して使える共通インスタンス
// Cookieセッション運用を想定して credentials: "include"
export const apiClient = new ApiClient({ credentials: "include" });
