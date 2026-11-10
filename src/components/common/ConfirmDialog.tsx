import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex items-start gap-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
        <AlertTriangle size={18} />
      </span>
      <p className="text-sm leading-relaxed text-fog">{message}</p>
    </div>
    <div className="mt-7 flex justify-end gap-3">
      <button type="button" className="btn-ghost px-4 py-2.5 text-xs" onClick={onClose} disabled={busy}>
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className={
          destructive
            ? 'btn bg-accent px-4 py-2.5 text-xs text-white hover:bg-accent-500'
            : 'btn-primary px-4 py-2.5 text-xs'
        }
      >
        {busy ? 'Working…' : confirmLabel}
      </button>
    </div>
  </Modal>
)
