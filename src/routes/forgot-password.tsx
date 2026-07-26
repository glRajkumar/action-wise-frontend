import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Mail, Loader2, MailCheck } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/utils/schemas"
import { useForgotPassword } from "@/hooks/use-auth"

import { InputWrapper } from "@/components/ui/field-wrapper-rhf"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage })

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPassword()
  const [sent, setSent] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setSent(true),
    })
  }

  if (sent) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="w-full max-w-sm px-6 text-center flex flex-col items-center gap-4">
          <MailCheck size={32} className="text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold mb-1">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If that address is registered, a reset link is on its way.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/sign-in" })}>
            Back to sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-svh items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold mb-1">Reset password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your email and we'll send a reset link.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputWrapper
            name="email"
            control={form.control}
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />

          {forgotPasswordMutation.error && (
            <p className="text-sm text-destructive">
              {forgotPasswordMutation.error.message}
            </p>
          )}

          <Button type="submit" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Sending…</>
            ) : (
              <><Mail size={15} /> Send reset link</>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          <Link to="/sign-in" className="text-foreground underline underline-offset-3">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
