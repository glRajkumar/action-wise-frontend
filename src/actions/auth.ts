import { authClient } from "@/lib/auth-client"

export async function getSession() {
  const { data } = await authClient.getSession()
  return data
}

export async function signIn(payload: { email: string; password: string }) {
  const { data, error } = await authClient.signIn.email(payload)
  if (error) throw new Error(error.message ?? "Sign in failed")
  return data
}

export async function signUp(payload: { name: string; email: string; password: string }) {
  const { data, error } = await authClient.signUp.email(payload)
  if (error) throw new Error(error.message ?? "Sign up failed")
  return data
}

export async function signOut() {
  const { error } = await authClient.signOut()
  if (error) throw new Error(error.message ?? "Sign out failed")
}

export async function forgotPassword(email: string) {
  const { error } = await authClient.requestPasswordReset({
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(error.message ?? "Failed to send reset email")
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  const { error } = await authClient.resetPassword(payload)
  if (error) throw new Error(error.message ?? "Password reset failed")
}

export async function sendVerificationEmail(email: string) {
  const { error } = await authClient.sendVerificationEmail({ email })
  if (error) throw new Error(error.message ?? "Failed to send verification email")
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { error } = await authClient.changePassword({ ...payload, revokeOtherSessions: true })
  if (error) throw new Error(error.message ?? "Password change failed")
}

export async function deleteUser() {
  const { error } = await authClient.deleteUser()
  if (error) throw new Error(error.message ?? "Failed to initiate account deletion")
}
