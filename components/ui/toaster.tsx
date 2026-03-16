'use client'

import { CircleAlert, CircleCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isError = variant === 'destructive'

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="mt-0.5 shrink-0">
              {isError ? (
                <CircleAlert className="h-5 w-5" />
              ) : (
                <CircleCheck className="h-5 w-5" />
              )}
            </div>
            <div className="grid flex-1 gap-1 pr-2">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
