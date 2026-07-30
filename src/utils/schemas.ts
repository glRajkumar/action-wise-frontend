import { z } from "zod";

export const signInSchema = z.object({
	email: z.email("Valid email required"),
	password: z.string().min(8, "At least 8 characters"),
});
export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
	name: z.string().min(1, "Required"),
	email: z.email("Valid email required"),
	password: z.string().min(8, "At least 8 characters"),
});
export type SignUpFormData = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
	email: z.email("Valid email required"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
	newPassword: z.string().min(8, "At least 8 characters"),
});
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Required"),
	newPassword: z.string().min(8, "At least 8 characters"),
});
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const workspaceNameSchema = z.object({
	name: z.string().trim().min(1, "Required").max(120, "Too long"),
});
export type WorkspaceNameFormData = z.infer<typeof workspaceNameSchema>;

export const inviteMemberSchema = z.object({
	email: z.email("Valid email required"),
	role: z.enum(["admin", "editor", "viewer"], { message: "Role required" }),
});
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

// Optional JSON-object textarea (headers, query params, payload templates) —
// flattened as a string field rather than a dynamic key/value list editor to
// keep the form surface small; parsed back into an object at submit time.
const jsonObjectSchema = z
	.string()
	.trim()
	.optional()
	.refine((value) => {
		if (!value) return true;
		try {
			const parsed = JSON.parse(value);
			return (
				typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
			);
		} catch {
			return false;
		}
	}, "Must be a valid JSON object");

export const connectionFormSchema = z
	.object({
		kind: z.enum(["http", "firebase"]),
		name: z.string().trim().min(1, "Required").max(120, "Too long"),
		baseUrl: z.string().trim().optional(),
		defaultHeadersJson: jsonObjectSchema,
		authType: z.enum(["none", "bearer", "apiKey", "basic"]),
		authHeaderName: z.string().trim().optional(),
		projectId: z.string().trim().optional(),
		apiKey: z.string().trim().optional(),
		databaseURL: z.string().trim().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.kind === "http") {
			if (!data.baseUrl || !/^https?:\/\//.test(data.baseUrl)) {
				ctx.addIssue({
					code: "custom",
					path: ["baseUrl"],
					message: "Valid URL required",
				});
			}
			if (data.authType === "apiKey" && !data.authHeaderName) {
				ctx.addIssue({
					code: "custom",
					path: ["authHeaderName"],
					message: "Header name required",
				});
			}
		}
		if (data.kind === "firebase") {
			if (!data.projectId)
				ctx.addIssue({
					code: "custom",
					path: ["projectId"],
					message: "Required",
				});
			if (!data.apiKey)
				ctx.addIssue({ code: "custom", path: ["apiKey"], message: "Required" });
		}
	});
export type ConnectionFormData = z.infer<typeof connectionFormSchema>;

export const connectionSecretSchema = z.object({
	value: z.string().trim().min(1, "Required"),
});
export type ConnectionSecretFormData = z.infer<typeof connectionSecretSchema>;

export const folderFormSchema = z.object({
	name: z.string().trim().min(1, "Required").max(120, "Too long"),
	parentFolderId: z.string().optional(),
});
export type FolderFormData = z.infer<typeof folderFormSchema>;

// Shared by the Registry resource form (name/folder/direction/danger + this)
// and the Playground ad-hoc tile form (just this) — see resource-config-fields.tsx.
export const resourceConfigFieldsSchema = z
	.object({
		kind: z.enum(["http", "firebase_rtdb", "firebase_firestore"]),
		connectionId: z.string().optional(),
		address: z.string().trim().min(1, "Required"),
		payloadTemplateJson: jsonObjectSchema,
		method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
		headersJson: jsonObjectSchema,
		queryParamsJson: jsonObjectSchema,
		bodyType: z.enum(["json", "form", "raw", "none"]),
		mode: z.enum(["read_once", "listen", "write"]).optional(),
		eventFilter: z
			.enum(["value", "child_added", "child_changed", "child_removed"])
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.kind === "http" && !data.method) {
			ctx.addIssue({ code: "custom", path: ["method"], message: "Required" });
		}
		if (data.kind !== "http" && !data.mode) {
			ctx.addIssue({ code: "custom", path: ["mode"], message: "Required" });
		}
	});
export type ResourceConfigFieldsData = z.infer<
	typeof resourceConfigFieldsSchema
>;

export const resourceFormSchema = z.intersection(
	resourceConfigFieldsSchema,
	z.object({
		name: z.string().trim().min(1, "Required").max(200, "Too long"),
		folderId: z.string().optional(),
		connectionId: z.string().min(1, "Connection required"),
		direction: z.enum(["invoke", "subscribe", "receive"]),
		danger: z.enum(["safe", "mutating", "destructive"]),
	}),
);
export type ResourceFormData = z.infer<typeof resourceFormSchema>;

export const adhocTileFormSchema = resourceConfigFieldsSchema.and(
	z.object({
		renderMode: z.enum(["json_tree", "table", "raw", "big_number"]),
	}),
);
export type AdhocTileFormData = z.infer<typeof adhocTileFormSchema>;

export const promoteTileSchema = z.object({
	name: z.string().trim().min(1, "Required").max(200, "Too long"),
	folderId: z.string().optional(),
	direction: z.enum(["invoke", "subscribe", "receive"]),
	danger: z.enum(["safe", "mutating", "destructive"]),
});
export type PromoteTileFormData = z.infer<typeof promoteTileSchema>;

export const fakeDataCountSchema = z.object({
	count: z.number().int().min(1, "At least 1").max(100, "At most 100"),
});
export type FakeDataCountFormData = z.infer<typeof fakeDataCountSchema>;

export const actionFormSchema = z.object({
	name: z.string().trim().min(1, "Required").max(200, "Too long"),
	description: z.string().trim().max(2000, "Too long").optional(),
});
export type ActionFormData = z.infer<typeof actionFormSchema>;

export const actionStepFormSchema = z.object({
	resourceId: z.string().min(1, "Pick a resource"),
	name: z
		.string()
		.trim()
		.min(1, "Required")
		.max(100, "Too long")
		.regex(/^[A-Za-z0-9_]+$/, "Letters, numbers, underscores only"),
});
export type ActionStepFormData = z.infer<typeof actionStepFormSchema>;
