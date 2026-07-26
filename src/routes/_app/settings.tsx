import { useState } from "react"
import { KeyRound, Loader2, Trash2 } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { changePasswordSchema, type ChangePasswordFormData } from "@/utils/schemas"
import { useChangePassword, useDeleteUser } from "@/hooks/use-auth"

import { InputWrapper } from "@/components/ui/field-wrapper-rhf"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage })

function SettingsPage() {
  return (
    <div className="max-w-lg p-8 flex flex-col gap-10">
      <h1 className="text-lg font-semibold">Settings</h1>
      <ChangePasswordSection />
      <DeleteAccountSection />
    </div>
  )
}

function ChangePasswordSection() {
  const changePasswordMutation = useChangePassword()

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  function onSubmit(data: ChangePasswordFormData) {
    changePasswordMutation.mutate(data, {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-medium">Change password</h2>
        <p className="text-sm text-muted-foreground">All other sessions will be signed out.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputWrapper
          name="currentPassword"
          control={form.control}
          label="Current password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <InputWrapper
          name="newPassword"
          control={form.control}
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        {changePasswordMutation.error && (
          <p className="text-sm text-destructive">{changePasswordMutation.error.message}</p>
        )}

        <Button type="submit" disabled={changePasswordMutation.isPending} className="self-start">
          {changePasswordMutation.isPending ? (
            <><Loader2 size={15} className="animate-spin" /> Saving…</>
          ) : (
            <><KeyRound size={15} /> Update password</>
          )}
        </Button>
      </form>
    </section>
  )
}

function DeleteAccountSection() {
  const deleteUserMutation = useDeleteUser()
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="flex flex-col gap-4 border-t pt-8">
      <div>
        <h2 className="font-medium text-destructive">Delete account</h2>
        <p className="text-sm text-muted-foreground">
          A confirmation email will be sent. This action is permanent.
        </p>
      </div>

      {!confirming ? (
        <Button
          variant="destructive"
          className="self-start"
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={15} /> Delete account
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            disabled={deleteUserMutation.isPending}
            onClick={() => deleteUserMutation.mutate()}
          >
            {deleteUserMutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Sending…</>
            ) : (
              <><Trash2 size={15} /> Confirm — send deletion email</>
            )}
          </Button>
          <Button variant="outline" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      )}
    </section>
  )
}
