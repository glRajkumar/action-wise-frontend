import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

export function DevTools() {
  return (
    <TanStackDevtools
      config={{
        position: "bottom-right",
        hideUntilHover: true,
      }}
      plugins={[
        {
          name: "Tanstack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          name: "Tanstack Query",
          render: <ReactQueryDevtools />,
        }
      ]}
    />
  )
}
