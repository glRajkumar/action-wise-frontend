import type { RenderMode } from "@/types/playground";

type Props = {
	mode: RenderMode;
	data: unknown;
};

// "json_tree" here is a pretty-printed block, not an interactive collapsible
// tree (collapse/search/copy-path from handover E) — kept simple for this
// pass since the same readable-JSON need is met either way.
export function RenderResult({ mode, data }: Props) {
	if (data === undefined) {
		return (
			<p className="text-xs text-muted-foreground">
				Run this tile to see a result.
			</p>
		);
	}

	if (
		mode === "table" &&
		Array.isArray(data) &&
		data.length > 0 &&
		typeof data[0] === "object" &&
		data[0] !== null
	) {
		const rows = data as Record<string, unknown>[];
		const columns = Object.keys(rows[0]);
		return (
			<div className="overflow-auto">
				<table className="w-full text-xs">
					<thead>
						<tr className="border-b text-left">
							{columns.map((col) => (
								<th key={col} className="px-1.5 py-1 font-medium">
									{col}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
							<tr key={i} className="border-b last:border-0">
								{columns.map((col) => (
									<td key={col} className="px-1.5 py-1">
										{formatCell(row[col])}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	if (mode === "big_number") {
		return (
			<p className="text-2xl font-semibold tabular-nums">
				{extractBigNumber(data)}
			</p>
		);
	}

	if (mode === "raw") {
		return (
			<pre className="text-xs break-all whitespace-pre-wrap">
				{typeof data === "string" ? data : JSON.stringify(data)}
			</pre>
		);
	}

	return (
		<pre className="text-xs break-all whitespace-pre-wrap">
			{JSON.stringify(data, null, 2)}
		</pre>
	);
}

function formatCell(value: unknown): string {
	if (value === null || value === undefined) return "—";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function extractBigNumber(data: unknown): string {
	if (typeof data === "number") return data.toLocaleString();
	if (Array.isArray(data)) return data.length.toLocaleString();
	if (data && typeof data === "object") {
		const firstNumber = Object.values(data as Record<string, unknown>).find(
			(value) => typeof value === "number",
		);
		if (typeof firstNumber === "number") return firstNumber.toLocaleString();
	}
	return "—";
}
