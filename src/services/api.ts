import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

// Same backend host as auth-client.ts (must stay in sync — see root CLAUDE.md).
const API_BASE_URL = "http://localhost:8000/api";

type CustomError = Error & { status?: number };

// No access/refresh-token dance here (unlike other projects' sendApiReq) —
// this backend uses better-auth httpOnly session cookies, so `withCredentials`
// is the entire auth story. One shared instance is enough since every request
// authenticates the same way; no per-call interceptor variation needed.
const instance = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

instance.interceptors.response.use(
	(res: AxiosResponse) => res.data,
	(error) => {
		const err: CustomError = new Error(
			error?.response?.data?.message ||
				error?.message ||
				"Something went wrong",
		);
		err.status = error?.response?.status;
		throw err;
	},
);

export const sendApiReq = <T = unknown>(
	config: AxiosRequestConfig,
): Promise<T> => instance(config);
