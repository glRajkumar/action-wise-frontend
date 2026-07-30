import { Copy } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Props = {
	data: unknown;
	defaultDepth?: number;
	highlightKeys?: string[];
	showSearch?: boolean;
};

type NodeProps = {
	nodeKey: string | null;
	value: unknown;
	path: string;
	depth: number;
	defaultDepth: number;
	overrides: Record<string, boolean>;
	onToggle: (path: string) => void;
	matches: Set<string> | null;
	highlighted: boolean;
	topHighlights: Set<string>;
	onCopyPath: (path: string) => void;
};

function isExpandable(
	value: unknown,
): value is Record<string, unknown> | unknown[] {
	return typeof value === "object" && value !== null;
}

function childEntries(
	value: Record<string, unknown> | unknown[],
): [string, unknown][] {
	return Array.isArray(value)
		? value.map((item, i): [string, unknown] => [String(i), item])
		: Object.entries(value);
}

function childPath(
	parentPath: string,
	value: Record<string, unknown> | unknown[],
	key: string,
): string {
	if (Array.isArray(value)) return `${parentPath}[${key}]`;
	return parentPath ? `${parentPath}.${key}` : key;
}

// One pass over the tree collecting every path that matches the query or has a
// matching descendant — nodes outside this set are hidden while searching.
function collectMatches(
	value: unknown,
	path: string,
	query: string,
	out: Set<string>,
	key: string | null,
): boolean {
	const selfMatch =
		key?.toLowerCase().includes(query) ||
		(!isExpandable(value) && String(value).toLowerCase().includes(query));

	let descendantMatch = false;
	if (isExpandable(value)) {
		for (const [childKey, childValue] of childEntries(value)) {
			if (
				collectMatches(
					childValue,
					childPath(path, value, childKey),
					query,
					out,
					childKey,
				)
			) {
				descendantMatch = true;
			}
		}
	}

	if (selfMatch || descendantMatch) {
		out.add(path);
		return true;
	}
	return false;
}

function primitiveClass(value: unknown): string {
	if (typeof value === "string") return "text-green-600 dark:text-green-400";
	if (typeof value === "number") return "text-blue-600 dark:text-blue-400";
	if (typeof value === "boolean") return "text-purple-600 dark:text-purple-400";
	return "text-muted-foreground";
}

function formatPrimitive(value: unknown): string {
	if (typeof value === "string") return `"${value}"`;
	return String(value);
}

function JsonNode({
	nodeKey,
	value,
	path,
	depth,
	defaultDepth,
	overrides,
	onToggle,
	matches,
	highlighted,
	topHighlights,
	onCopyPath,
}: NodeProps) {
	if (matches !== null && path !== "" && !matches.has(path)) return null;

	const expandable = isExpandable(value);
	// While searching, branches with matches stay open regardless of toggles.
	const expanded =
		matches !== null ? true : (overrides[path] ?? depth < defaultDepth);

	const label =
		nodeKey !== null ? (
			<span
				className={cn(
					"text-foreground",
					highlighted && "rounded bg-amber-200/60 px-0.5 dark:bg-amber-500/30",
				)}
			>
				{nodeKey}
				<span className="text-muted-foreground">: </span>
			</span>
		) : null;

	if (!expandable) {
		return (
			<div className="group flex items-start gap-1 py-px pl-4">
				<span className="min-w-0 break-all text-xs">
					{label}
					<span className={primitiveClass(value)}>
						{formatPrimitive(value)}
					</span>
				</span>
				<CopyPathButton path={path} onCopyPath={onCopyPath} />
			</div>
		);
	}

	const entries = childEntries(value);
	const summary = Array.isArray(value)
		? `[${entries.length}]`
		: `{${entries.length} keys}`;

	return (
		<div className="py-px">
			<div className="group flex items-start gap-1">
				<button
					type="button"
					onClick={() => onToggle(path)}
					className="flex items-center gap-1 text-xs hover:opacity-70"
				>
					<span className="inline-block w-3 text-muted-foreground">
						{expanded ? "▾" : "▸"}
					</span>
					{label}
					<span className="text-muted-foreground">{summary}</span>
				</button>
				<CopyPathButton path={path} onCopyPath={onCopyPath} />
			</div>
			{expanded && (
				<div className="ml-1.5 border-l border-border pl-2">
					{entries.map(([childKey, childValue]) => (
						<JsonNode
							key={childKey}
							nodeKey={childKey}
							value={childValue}
							path={childPath(path, value, childKey)}
							depth={depth + 1}
							defaultDepth={defaultDepth}
							overrides={overrides}
							onToggle={onToggle}
							matches={matches}
							highlighted={depth === 0 && topHighlights.has(childKey)}
							topHighlights={topHighlights}
							onCopyPath={onCopyPath}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function CopyPathButton({
	path,
	onCopyPath,
}: {
	path: string;
	onCopyPath: (path: string) => void;
}) {
	if (!path) return null;
	return (
		<button
			type="button"
			onClick={() => onCopyPath(path)}
			className="invisible mt-0.5 shrink-0 text-muted-foreground hover:text-foreground group-hover:visible"
			aria-label={`Copy path ${path}`}
		>
			<Copy className="size-3" />
		</button>
	);
}

export function JsonTree({
	data,
	defaultDepth = 2,
	highlightKeys,
	showSearch = false,
}: Props) {
	const [overrides, setOverrides] = useState<Record<string, boolean>>({});
	const [query, setQuery] = useState("");
	const toast = useToast();

	const matches = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return null;
		const out = new Set<string>();
		collectMatches(data, "", trimmed, out, null);
		return out;
	}, [data, query]);

	const highlightSet = useMemo(
		() => new Set(highlightKeys ?? []),
		[highlightKeys],
	);

	const onToggle = (path: string) => {
		setOverrides((prev) => {
			const depth = path === "" ? 0 : path.split(/\.|\[/).length;
			const current = prev[path] ?? depth < defaultDepth;
			return { ...prev, [path]: !current };
		});
	};

	const onCopyPath = (path: string) => {
		navigator.clipboard
			.writeText(path)
			.then(() => toast.success(`Copied ${path}`))
			.catch(() => toast.error("Failed to copy"));
	};

	if (data === undefined)
		return <p className="text-xs text-muted-foreground">No data.</p>;

	const topLevelKeys =
		isExpandable(data) && !Array.isArray(data) ? Object.keys(data) : [];

	return (
		<div className="text-xs">
			{showSearch && (
				<div className="mb-2 max-w-60">
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search keys and values..."
					/>
				</div>
			)}
			{matches !== null && matches.size === 0 ? (
				<p className="text-muted-foreground">No matches.</p>
			) : (
				<JsonNode
					nodeKey={null}
					value={data}
					path=""
					depth={0}
					defaultDepth={defaultDepth}
					overrides={overrides}
					onToggle={onToggle}
					matches={matches}
					highlighted={false}
					topHighlights={highlightSet}
					onCopyPath={onCopyPath}
				/>
			)}
			{topLevelKeys.some((key) => highlightSet.has(key)) && (
				<p className="mt-1 text-[10px] text-muted-foreground">
					Highlighted keys changed in the latest update.
				</p>
			)}
		</div>
	);
}
