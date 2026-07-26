import { createFileRoute, Link } from "@tanstack/react-router"
import { MailCheck, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/utils/schemas"
import { useSendVerificationEmail } from "@/hooks/use-auth"

import { InputWrapper } from "@/components/ui/field-wrapper-rhf"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/verify-email")({ component: VerifyEmailPage })

function VerifyEmailPage() {
  const resendMutation = useSendVerificationEmail()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(data: ForgotPasswordFormData) {
    resendMutation.mutate(data.email)
  }

  return (
    <div className="flex h-svh items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold mb-1">Verify your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your email to resend the verification link.
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

          {resendMutation.error && (
            <p className="text-sm text-destructive">{resendMutation.error.message}</p>
          )}

          <Button type="submit" disabled={resendMutation.isPending}>
            {resendMutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Sending…</>
            ) : (
              <><MailCheck size={15} /> Resend verification email</>
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
