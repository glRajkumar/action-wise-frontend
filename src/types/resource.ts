export type ResourceKind = "http" | "firebase_rtdb" | "firebase_firestore";
export type ResourceDirection = "invoke" | "subscribe" | "receive";
export type ResourceDanger = "safe" | "mutating" | "destructive";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type HttpBodyType = "json" | "form" | "raw" | "none";

export type HttpResourceConfig = {
	method: HttpMethod;
	headers?: Record<string, string>;
	queryParams?: Record<string, string>;
	bodyType: HttpBodyType;
};

export type FirebaseMode = "read_once" | "listen" | "write";
export type FirebaseEventFilter =
	| "value"
	| "child_added"
	| "child_changed"
	| "child_removed";

export type FirebaseRtdbResourceConfig = {
	mode: FirebaseMode;
	eventFilter?: FirebaseEventFilter;
};

export type FirebaseFirestoreResourceConfig = {
	mode: FirebaseMode;
};

export type ResourceConfig =
	| HttpResourceConfig
	| FirebaseRtdbResourceConfig
	| FirebaseFirestoreResourceConfig;

export type Resource = {
	id: string;
	workspaceId: string;
	folderId: string | null;
	connectionId: string;
	kind: ResourceKind;
	direction: ResourceDirection;
	danger: ResourceDanger;
	name: string;
	address: string;
	payloadTemplate?: unknown;
	config: ResourceConfig;
	visibility: "private" | "link";
	createdAt: string;
	updatedAt: string;
	createdBy: string;
};

export type ResourceFolder = {
	id: string;
	workspaceId: string;
	parentFolderId: string | null;
	name: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
};

export const RESOURCE_KINDS: ResourceKind[] = [
	"http",
	"firebase_rtdb",
	"firebase_firestore",
];
export const RESOURCE_DIRECTIONS: ResourceDirection[] = [
	"invoke",
	"subscribe",
	"receive",
];
export const RESOURCE_DANGERS: ResourceDanger[] = [
	"safe",
	"mutating",
	"destructive",
];
export const HTTP_METHODS: HttpMethod[] = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
];
export const HTTP_BODY_TYPES: HttpBodyType[] = ["json", "form", "raw", "none"];
export const FIREBASE_MODES: FirebaseMode[] = ["read_once", "listen", "write"];
export const FIREBASE_EVENT_FILTERS: FirebaseEventFilter[] = [
	"value",
	"child_added",
	"child_changed",
	"child_removed",
];
