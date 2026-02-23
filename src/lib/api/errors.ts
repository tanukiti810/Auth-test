export type ApiErrorCode =
    | "UNAUTHORIZED"//未認証（HTTP401）
    | "FORBIDDEN" //認可エラー（HTTP403）
    | "NOT_FOUND" //データがない（HTTP404）
    | "PURCHASE_REQUIRED" //ログイン済みだが、購入していない
    | "EXPIRED" //期限切れ（トークン、期限付きURL）（HTTP410）
    | "VALIDATION_ERROR" //入力エラー（HTTP400）
    | "SERVER_ERROR" //サーバエラー（HTTP500，502，503）
    | "NETWORK_ERROR" //通信エラー（鯖落ち）
    | "UNKNOWN_ERROR"; //分類不能エラー

//エラーの型定義
export type ApiError = {
    code: ApiErrorCode;
    message: string;
    status?: number;
    details?: unknown;
}

//型ガード関数（型保証）
export function isServerErrorShape(errData: unknown): errData is { error: { code: string; message?: string } } {
    if (typeof errData !== "object" || errData === null) return false;
    const err = (errData as any).error;
    return !!err && typeof err === "object" && typeof err.code === "string";
}

//エラーコードを変換
export function mapHttpStatusToCode(status: number): ApiErrorCode {
    if (status === 400) return "VALIDATION_ERROR";
    if (status === 401) return "UNAUTHORIZED";
    if (status === 403) return "FORBIDDEN";
    if (status === 404) return "NOT_FOUND";
    if (status === 410) return "EXPIRED";
    if (status >= 500) return "SERVER_ERROR";
    return "UNKNOWN_ERROR";
}

//ApiError型に変換
export function toApiError(input: {
    status?: number;
    body?: unknown;
    fallbackMessage?: string;
//上記の入力を受け取り、ApiErrorを返す
}): ApiError {
    const {status, body, fallbackMessage} = input; //分割代入（input.status, input.bodyのようになる）

    if (isServerErrorShape(body)) {
        const code = body.error.code as ApiErrorCode; //型アサーション
        return {
            code: code ?? (status ? mapHttpStatusToCode(status): "UNKNOWN_ERROR"), //codeがnullの場合に右側を使用
            message: body.error.message ?? fallbackMessage ?? "UNKOWN_ERROR",
            status,
            details: body
        }
    }

    if (typeof status === "number") {
        return {
            code: mapHttpStatusToCode(status),
            message: fallbackMessage ?? "ERROR",
            status,
            details: body
        }
    }

    return {
        code: "NETWORK_ERROR",
        message: fallbackMessage ?? "通信に失敗しました",
        details: body
    }
}