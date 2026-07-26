import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { KeyRound, Loader2, LinkIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { resetPasswordSchema, type ResetPasswordFormData } from "@/utils/schemas"
import { useResetPassword } from "@/hooks/use-auth"

import { InputWrapper } from "@/components/ui/field-wrapper-rhf"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const resetMutation = useResetPassword()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "" },
  })

  if (!token) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="w-full max-w-sm px-6 text-center flex flex-col items-center gap-4">
          <LinkIcon size={32} className="text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold mb-1">Invalid link</h1>
            <p className="text-sm text-muted-foreground">This reset link is missing or expired.</p>
          </div>
          <Link to="/forgot-password" className="text-sm underline underline-offset-3">
            Request a new one
          </Link>
        </div>
      </div>
    )
  }

  function onSubmit(data: ResetPasswordFormData) {
    resetMutation.mutate(
      { token, newPassword: data.newPassword },
      {
        onSuccess: () => {
          navigate({ to: "/sign-in" })
        },
      },
    )
  }

  return (
    <div className="flex h-svh items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold mb-1">New password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a strong password for your account.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputWrapper
            name="newPassword"
            control={form.control}
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          {resetMutation.error && (
            <p className="text-sm text-destructive">{resetMutation.error.message}</p>
          )}

          <Button type="submit" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : (
              <><KeyRound size={15} /> Set new password</>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
