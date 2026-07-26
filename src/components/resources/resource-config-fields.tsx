import type { Control, FieldValues, Path } from "react-hook-form";
import {
	InputWrapper,
	SelectWrapper,
	TextareaWrapper,
} from "@/components/ui/field-wrapper-rhf";
import type { Connection } from "@/types/connection";
import {
	FIREBASE_EVENT_FILTERS,
	FIREBASE_MODES,
	HTTP_BODY_TYPES,
	HTTP_METHODS,
	RESOURCE_KINDS,
} from "@/types/resource";
import type { ResourceConfigFieldsData } from "@/utils/schemas";

const KIND_ITEMS: itemT[] = RESOURCE_KINDS.map((kind) => ({
	label: kind,
	value: kind,
}));
const METHOD_ITEMS: itemT[] = HTTP_METHODS.map((method) => ({
	label: method,
	value: method,
}));
const BODY_TYPE_ITEMS: itemT[] = HTTP_BODY_TYPES.map((bodyType) => ({
	label: bodyType,
	value: bodyType,
}));
const MODE_ITEMS: itemT[] = FIREBASE_MODES.map((mode) => ({
	label: mode,
	value: mode,
}));
const EVENT_FILTER_ITEMS: itemT[] = FIREBASE_EVENT_FILTERS.map((filter) => ({
	label: filter,
	value: filter,
}));

type Props<T extends FieldValues & ResourceConfigFieldsData> = {
	control: Control<T>;
	kind: ResourceConfigFieldsData["kind"];
	connections: Connection[];
	showConnection?: boolean;
};

// Shared by the Registry resource form and the Playground ad-hoc tile form —
// both forms' schemas intersect resourceConfigFieldsSchema, so the field
// names line up even though the parent form types differ.
export function ResourceConfigFields<
	T extends FieldValues & ResourceConfigFieldsData,
>({ control, kind, connections, showConnection = true }: Props<T>) {
	const matchingConnectionKind = kind === "http" ? "http" : "firebase";
	const connectionItems: itemT[] = connections
		.filter((connection) => connection.kind === matchingConnectionKind)
		.map((connection) => ({ label: connection.name, value: connection.id }));

	return (
		<div className="flex flex-col gap-4">
			<SelectWrapper
				name={"kind" as Path<T>}
				control={control}
				label="Kind"
				items={KIND_ITEMS}
			/>

			{showConnection && (
				<SelectWrapper
					name={"connectionId" as Path<T>}
					control={control}
					label="Connection"
					items={connectionItems}
					placeholder={
						connectionItems.length
							? "Select a connection"
							: "No matching connections yet"
					}
				/>
			)}

			<InputWrapper
				name={"address" as Path<T>}
				control={control}
				label={
					kind === "http"
						? "URL / path ({{variable}} allowed)"
						: "Firebase path"
				}
				placeholder={
					kind === "http"
						? "/orders or https://api.example.com/orders"
						: "/users/{{userId}}"
				}
			/>

			{kind === "http" ? (
				<>
					<SelectWrapper
						name={"method" as Path<T>}
						control={control}
						label="Method"
						items={METHOD_ITEMS}
					/>
					<SelectWrapper
						name={"bodyType" as Path<T>}
						control={control}
						label="Body type"
						items={BODY_TYPE_ITEMS}
					/>
					<TextareaWrapper
						name={"headersJson" as Path<T>}
						control={control}
						label="Headers (JSON, optional)"
						placeholder='{"Content-Type": "application/json"}'
						rows={2}
					/>
					<TextareaWrapper
						name={"queryParamsJson" as Path<T>}
						control={control}
						label="Query params (JSON, optional)"
						placeholder='{"limit": "20"}'
						rows={2}
					/>
					<TextareaWrapper
						name={"payloadTemplateJson" as Path<T>}
						control={control}
						label="Body template (JSON, optional, {{variable}} allowed in values)"
						placeholder='{"sku": "{{sku}}"}'
						rows={3}
					/>
				</>
			) : (
				<>
					<SelectWrapper
						name={"mode" as Path<T>}
						control={control}
						label="Mode"
						items={MODE_ITEMS}
					/>
					{kind === "firebase_rtdb" && (
						<SelectWrapper
							name={"eventFilter" as Path<T>}
							control={control}
							label="Event filter (optional)"
							items={EVENT_FILTER_ITEMS}
						/>
					)}
				</>
			)}
		</div>
	);
}
