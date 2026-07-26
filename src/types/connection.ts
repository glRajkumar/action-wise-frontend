export type ConnectionKind = "http" | "firebase";

export type HttpConnectionAuth =
	| { type: "none" }
	| { type: "bearer" }
	| { type: "apiKey"; headerName: string }
	| { type: "basic" };

export type HttpConnectionConfig = {
	baseUrl: string;
	defaultHeaders?: Record<string, string>;
	auth: HttpConnectionAuth;
};

export type FirebaseConnectionConfig = {
	projectId: string;
	apiKey: string;
	databaseURL?: string;
};

export type ConnectionConfig = HttpConnectionConfig | FirebaseConnectionConfig;

export type Connection = {
	id: string;
	workspaceId: string;
	kind: ConnectionKind;
	name: string;
	config: ConnectionConfig;
	visibility: "private" | "link";
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	// True only if the *current* user has a secret stored — never anyone else's.
	hasSecret: boolean;
};

export const CONNECTION_KINDS: ConnectionKind[] = ["http", "firebase"];
export const HTTP_AUTH_TYPES: HttpConnectionAuth["type"][] = [
	"none",
	"bearer",
	"apiKey",
	"basic",
];
