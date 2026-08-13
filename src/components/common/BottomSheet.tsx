import { useEffect } from 'react';
import type { ReactNode } from 'react';

export type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  // 시트가 열려 있는 동안 뒤 배경 스크롤 방지
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-[390px] rounded-t-[20px] bg-[var(--color-white-1000)] px-[var(--spacing-screen)] pb-[32px] pt-[12px]">
        <div className="mx-auto mb-[16px] h-[4px] w-[36px] rounded-full bg-[var(--color-gray-300)]" />
        {title && (
          <p className="mb-[8px] text-[16px] font-bold text-[color:var(--color-text-primary)]">
            {title}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
