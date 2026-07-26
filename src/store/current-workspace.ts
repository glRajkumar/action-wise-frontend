import { create } from "zustand";
import { persist } from "zustand/middleware";

type CurrentWorkspaceState = {
	activeWorkspaceId: string | null;
	setActiveWorkspaceId: (workspaceId: string | null) => void;
};

export const useCurrentWorkspaceStore = create<CurrentWorkspaceState>()(
	persist(
		(set) => ({
			activeWorkspaceId: null,
			setActiveWorkspaceId: (workspaceId) =>
				set({ activeWorkspaceId: workspaceId }),
		}),
		{ name: "action-wise-current-workspace" },
	),
);
