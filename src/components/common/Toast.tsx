import { useEffect } from 'react';
import { useToastStore } from '../../store/useToastStore';

const AUTO_DISMISS_MS = 3500;

/**
 * 앱 어디서든 useToastStore().showToast(message)만 호출하면 이 컴포넌트가 떠 있는 동안
 * 화면 하단에 토스트가 나타난다. 최상위(App.tsx 등)에 한 번만 렌더링해두면 됨.
 */
export default function Toast() {
  const message = useToastStore((s) => s.message);
  const toastKey = useToastStore((s) => s.key);
  const hideToast = useToastStore((s) => s.hideToast);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(hideToast, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
    // toastKey가 바뀌면(같은 메시지를 다시 띄워도) 타이머를 재시작한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastKey, hideToast]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[100px] z-[999] flex justify-center px-[20px]">
      <div
        key={toastKey}
        role="status"
        className="pointer-events-auto max-w-[350px] rounded-[12px] bg-[var(--color-gray-800,#333)] px-[16px] py-[12px] text-center text-[14px] text-[color:var(--color-text-inverse)] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]"
      >
        {message}
      </div>
    </div>
  );
}
