import { z } from "zod"

export const signInSchema = z.object({
  email: z.email("Valid email required"),
  password: z.string().min(8, "At least 8 characters"),
})
export type SignInFormData = z.infer<typeof signInSchema>

export const signUpSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.email("Valid email required"),
  password: z.string().min(8, "At least 8 characters"),
})
export type SignUpFormData = z.infer<typeof signUpSchema>

export const forgotPasswordSchema = z.object({
  email: z.email("Valid email required"),
})
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "At least 8 characters"),
})
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "At least 8 characters"),
})
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
