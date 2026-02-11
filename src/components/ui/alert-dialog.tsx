import * as React from 'react'
import { AlertDialog } from 'radix-ui'

import { cn } from '@/lib/utils'

function AlertDialogRoot(props: React.ComponentProps<typeof AlertDialog.Root>) {
  return <AlertDialog.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialog.Trigger>) {
  return <AlertDialog.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialog.Portal>) {
  return <AlertDialog.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialog.Overlay>) {
  return (
    <AlertDialog.Overlay
      data-slot="alert-dialog-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialog.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialog.Content
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg',
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialog.Content>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-4 flex justify-end gap-2', className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialog.Title>) {
  return <AlertDialog.Title className={cn('text-lg font-semibold', className)} {...props} />
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialog.Description>) {
  return (
    <AlertDialog.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof AlertDialog.Action>) {
  return (
    <AlertDialog.Action
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialog.Cancel>) {
  return (
    <AlertDialog.Cancel
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialogRoot as AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
