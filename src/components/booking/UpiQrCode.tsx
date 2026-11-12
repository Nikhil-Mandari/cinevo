import { cn } from '../../utils/cn'

export const DEMO_UPI_ID = '9014995301@ybl'

interface UpiQrCodeProps {
  amount: number
  size?: number
  className?: string
}

export const UpiQrCode = ({ amount, size = 168, className }: UpiQrCodeProps) => {
  const upiUri = `upi://pay?pa=${DEMO_UPI_ID}&pn=CINEVO%20Tickets&am=${amount.toFixed(2)}&cu=INR`
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(upiUri)}`

  return (
    <div className={cn('inline-flex flex-col items-center gap-2 rounded-xl bg-white p-3', className)}>
      <img
        src={src}
        alt={`UPI payment QR for ${DEMO_UPI_ID}`}
        width={size}
        height={size}
        className="h-auto w-full"
        loading="lazy"
      />
      <span className="text-center text-[9px] font-semibold tracking-[0.08em] text-ink-950">{DEMO_UPI_ID}</span>
    </div>
  )
}
