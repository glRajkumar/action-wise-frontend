import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import {
  changePassword,
  deleteUser,
  forgotPassword,
  getSession,
  resetPassword,
  sendVerificationEmail,
  signIn,
  signOut,
  signUp,
} from "@/actions/auth"
import { useToast } from "@/components/ui/toast"

export const SESSION_KEY = ["session"]

export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: getSession,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export function useSignIn() {
  const toast = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: signIn,
    onSuccess() {
      qc.invalidateQueries({ queryKey: SESSION_KEY })
      toast.success("Welcome back!")
    },
    onError(error) {
      toast.error(error?.message || "Sign in failed")
    },
  })
}

export function useSignUp() {
  const toast = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: signUp,
    onSuccess() {
      qc.invalidateQueries({ queryKey: SESSION_KEY })
      toast.success("Account created — welcome!")
    },
    onError(error) {
      toast.error(error?.message || "Sign up failed")
    },
  })
}

export function useSignOut() {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSuccess() {
      qc.clear()
      toast.success("Signed out")
      navigate({ to: "/sign-in", replace: true })
    },
    onError(error) {
      toast.error(error?.message || "Something went wrong")
    },
  })
}

export function useForgotPassword() {
  const toast = useToast()
  return useMutation({
    mutationFn: forgotPassword,
    onError(error) {
      toast.error(error?.message || "Failed to send reset email")
    },
  })
}

export function useResetPassword() {
  const toast = useToast()
  return useMutation({
    mutationFn: resetPassword,
    onError(error) {
      toast.error(error?.message || "Password reset failed")
    },
  })
}

export function useSendVerificationEmail() {
  const toast = useToast()
  return useMutation({
    mutationFn: sendVerificationEmail,
    onSuccess() {
      toast.success("Verification email sent")
    },
    onError(error) {
      toast.error(error?.message || "Failed to send verification email")
    },
  })
}

export function useChangePassword() {
  const toast = useToast()
  return useMutation({
    mutationFn: changePassword,
    onSuccess() {
      toast.success("Password updated")
    },
    onError(error) {
      toast.error(error?.message || "Password change failed")
    },
  })
}

export function useDeleteUser() {
  const toast = useToast()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess() {
      toast.success("Check your email to confirm account deletion")
    },
    onError(error) {
      toast.error(error?.message || "Failed to initiate account deletion")
    },
  })
}
