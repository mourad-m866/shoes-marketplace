/**
 * The "خطواتك للمعارض" word-mark used in the header.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-accent-400 shadow-sm"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <path d="M2.5 16.5h19" />
          <path d="M4 16.5v-4.2a2 2 0 0 1 .5-1.3l2.6-2.4a2 2 0 0 1 1.3-.6h3.1a2 2 0 0 1 1.7 1l1.1 1.4" />
          <path d="M13.2 9.4 15 6.6a1.6 1.6 0 0 1 1.4-.7h1.4a1.8 1.8 0 0 1 1.7 2.3l-1.5 5.1" />
          <path d="M4 16.5v1.2a1.3 1.3 0 0 0 1.3 1.3h1.4A1.3 1.3 0 0 0 8 17.7v-1.2" />
          <path d="M9 17.7v1.2a1.3 1.3 0 0 0 1.3 1.3h1.4a1.3 1.3 0 0 0 1.3-1.3v-1.2" />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-brand-950 sm:text-xl">
          خطواتك للمعارض
        </span>
        <span className="text-[0.7rem] font-medium text-brand-500 sm:text-xs">
          منصة معارض الأحذية
        </span>
      </span>
    </span>
  )
}
