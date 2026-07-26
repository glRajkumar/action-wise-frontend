import { useEffect } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { LogIn, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { signInSchema, type SignInFormData } from "@/utils/schemas"
import { useSignIn, useSession } from "@/hooks/use-auth"
import { web } from "@/utils/constants"

import { InputWrapper } from "@/components/ui/field-wrapper-rhf"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/sign-in")({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const signInMutation = useSignIn()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (session) {
      navigate({ to: "/", replace: true })
    }
  }, [session, navigate])

  if (session) return null

  function onSubmit(data: SignInFormData) {
    signInMutation.mutate(data, {
      onSuccess: () => navigate({ to: "/" }),
    })
  }

  return (
    <div className="flex h-svh items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Welcome back to {web.name}
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <InputWrapper
            name="email"
            control={form.control}
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <div className="flex flex-col gap-1">
            <InputWrapper
              name="password"
              control={form.control}
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <Link
              to="/forgot-password"
              className="self-end text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>

          {signInMutation.error && (
            <p className="text-sm text-destructive">
              {signInMutation.error.message}
            </p>
          )}

          <Button type="submit" disabled={signInMutation.isPending}>
            {signInMutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Signing in…</>
            ) : (
              <><LogIn size={15} /> Sign in</>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          No account?{" "}
          <Link to="/sign-up" className="text-foreground underline underline-offset-3">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
