import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UserPlus, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { signUpSchema, type SignUpFormData } from "@/utils/schemas"
import { useSignUp, useSession } from "@/hooks/use-auth"

import { InputWrapper } from "@/components/ui/field-wrapper-rhf"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/sign-up")({ component: SignUpPage })

function SignUpPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const signUpMutation = useSignUp()

  if (session) {
    navigate({ to: "/", replace: true })
    return null
  }

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  function onSubmit(data: SignUpFormData) {
    signUpMutation.mutate(data, {
      onSuccess: () => navigate({ to: "/" }),
    })
  }

  return (
    <div className="flex h-svh items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Start tracking your progress
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <InputWrapper
            name="name"
            control={form.control}
            label="Name"
            placeholder="Your name"
            autoComplete="name"
          />
          <InputWrapper
            name="email"
            control={form.control}
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <InputWrapper
            name="password"
            control={form.control}
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          {signUpMutation.error && (
            <p className="text-sm text-destructive">
              {signUpMutation.error.message}
            </p>
          )}

          <Button type="submit" disabled={signUpMutation.isPending}>
            {signUpMutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Creating account…</>
            ) : (
              <><UserPlus size={15} /> Create account</>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Have an account?{" "}
          <Link to="/sign-in" className="text-foreground underline underline-offset-3">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
