import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
	child,
	getDatabase,
	onChildAdded,
	onChildChanged,
	onChildRemoved,
	onValue,
	get as rtdbGet,
	ref as rtdbRef,
	set as rtdbSet,
} from "firebase/database";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	onSnapshot,
	setDoc,
} from "firebase/firestore";

import type { FirebaseConnectionConfig } from "@/types/connection";
import type { FirebaseEventFilter } from "@/types/resource";

// Handover D asks for "one shared app instance for all tiles, not one per
// tile" — generalized to one FirebaseApp per firebase *connection* (config
// differs per connection), cached here and shared by every tile using it.
const appCache = new Map<string, FirebaseApp>();

export function getFirebaseApp(
	connectionId: string,
	config: FirebaseConnectionConfig,
): FirebaseApp {
	const cached = appCache.get(connectionId);
	if (cached) return cached;

	const name = `conn-${connectionId}`;
	const existing = getApps().find((app) => app.name === name);
	const app =
		existing ??
		initializeApp(
			{
				projectId: config.projectId,
				apiKey: config.apiKey,
				databaseURL: config.databaseURL,
			},
			name,
		);
	appCache.set(connectionId, app);
	return app;
}

export type FirebaseRunRecord = {
	request: {
		kind: "firebase_rtdb" | "firebase_firestore";
		mode: "read_once" | "listen" | "write";
		path: string;
		eventFilter?: FirebaseEventFilter;
		value?: unknown;
	};
	response: unknown;
	status: "success" | "error";
	durationMs: number;
};

async function timed<T>(
	fn: () => Promise<T>,
): Promise<{ value: T; durationMs: number }> {
	const startedAt = Date.now();
	const value = await fn();
	return { value, durationMs: Date.now() - startedAt };
}

export async function rtdbReadOnce(
	app: FirebaseApp,
	path: string,
): Promise<FirebaseRunRecord> {
	const { value, durationMs } = await timed(() =>
		rtdbGet(child(rtdbRef(getDatabase(app)), path)),
	);
	return {
		request: { kind: "firebase_rtdb", mode: "read_once", path },
		response: value.val(),
		status: "success",
		durationMs,
	};
}

export async function rtdbWrite(
	app: FirebaseApp,
	path: string,
	value: unknown,
): Promise<FirebaseRunRecord> {
	const { durationMs } = await timed(() =>
		rtdbSet(rtdbRef(getDatabase(app), path), value),
	);
	return {
		request: { kind: "firebase_rtdb", mode: "write", path, value },
		response: value,
		status: "success",
		durationMs,
	};
}

export function rtdbListen(
	app: FirebaseApp,
	path: string,
	eventFilter: FirebaseEventFilter,
	onEvent: (record: FirebaseRunRecord) => void,
	onError: (error: Error) => void,
): () => void {
	const reference = rtdbRef(getDatabase(app), path);
	const startedAt = Date.now();
	const emit = (snapshotValue: unknown) => {
		onEvent({
			request: { kind: "firebase_rtdb", mode: "listen", path, eventFilter },
			response: snapshotValue,
			status: "success",
			durationMs: Date.now() - startedAt,
		});
	};

	const listeners = {
		value: onValue,
		child_added: onChildAdded,
		child_changed: onChildChanged,
		child_removed: onChildRemoved,
	} as const;
	return listeners[eventFilter](
		reference,
		(snapshot) => emit(snapshot.val()),
		onError,
	);
}

// Odd number of path segments = collection ("customers"), even = document
// ("customers/abc") — Firestore's own addressing convention.
function isCollectionPath(path: string): boolean {
	return path.split("/").filter(Boolean).length % 2 === 1;
}

async function firestoreRead(app: FirebaseApp, path: string): Promise<unknown> {
	const db = getFirestore(app);
	if (isCollectionPath(path)) {
		const snapshot = await getDocs(collection(db, path));
		return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
	}
	const snapshot = await getDoc(doc(db, path));
	return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function firestoreReadOnce(
	app: FirebaseApp,
	path: string,
): Promise<FirebaseRunRecord> {
	const { value, durationMs } = await timed(() => firestoreRead(app, path));
	return {
		request: { kind: "firebase_firestore", mode: "read_once", path },
		response: value,
		status: "success",
		durationMs,
	};
}

export async function firestoreWrite(
	app: FirebaseApp,
	path: string,
	value: Record<string, unknown>,
): Promise<FirebaseRunRecord> {
	if (isCollectionPath(path)) {
		throw new Error(
			"Firestore writes need a document path (even number of segments)",
		);
	}
	const { durationMs } = await timed(() =>
		setDoc(doc(getFirestore(app), path), value),
	);
	return {
		request: { kind: "firebase_firestore", mode: "write", path, value },
		response: value,
		status: "success",
		durationMs,
	};
}

export function firestoreListen(
	app: FirebaseApp,
	path: string,
	onEvent: (record: FirebaseRunRecord) => void,
	onError: (error: Error) => void,
): () => void {
	const db = getFirestore(app);
	const startedAt = Date.now();
	const emit = (value: unknown) => {
		onEvent({
			request: { kind: "firebase_firestore", mode: "listen", path },
			response: value,
			status: "success",
			durationMs: Date.now() - startedAt,
		});
	};

	if (isCollectionPath(path)) {
		return onSnapshot(
			collection(db, path),
			(snapshot) => emit(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
			onError,
		);
	}
	return onSnapshot(
		doc(db, path),
		(snapshot) =>
			emit(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
		onError,
	);
}
