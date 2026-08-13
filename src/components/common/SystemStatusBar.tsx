// 모바일 화면 최상단에 고정으로 붙는 상태바입니다. 시각은 정적 텍스트이며,
// 실 서비스에서는 부모에서 현재 시각을 props로 내려주도록 확장하세요.
// variant="dark"는 주행 모드(다크 UI) 화면, variant="transparent"는 지도처럼
// 배경 콘텐츠가 상태바 뒤로 그대로 비쳐야 하는 화면에서 사용합니다.

import imgNetworkSignalLight from '../../assets/icons/network.svg';
import imgWiFiSignalLight from '../../assets/icons/wifi.svg';
import imgBatteryLight from '../../assets/icons/battery.svg';

export type SystemStatusBarProps = {
  className?: string;
  time?: string;
  variant?: 'light' | 'dark' | 'transparent';
};

export default function SystemStatusBar({
  className,
  time = '9:41',
  variant = 'light',
}: SystemStatusBarProps) {
  const isDark = variant === 'dark';
  const isTransparent = variant === 'transparent';

  const bgClass = isDark
    ? 'bg-slate-950'
    : isTransparent
      ? 'bg-transparent'
      : 'bg-[var(--color-white-1000)]';

  return (
    <div
      className={
        className ||
        `${bgClass} h-[45px] overflow-clip relative w-full max-w-[390px]`
      }
      data-name="_System/StatusBar"
    >
      <div className="absolute content-stretch flex gap-[4px] items-center right-[14px] top-[16px]">
        <div className="h-[14px] relative shrink-0 w-[20px]">
          <img
            alt=""
            className={`absolute block inset-0 max-w-none size-full ${isDark ? 'brightness-0 invert' : ''}`}
            src={imgNetworkSignalLight}
          />
        </div>
        <div className="h-[14px] relative shrink-0 w-[16px]">
          <img
            alt=""
            className={`absolute block inset-0 max-w-none size-full ${isDark ? 'brightness-0 invert' : ''}`}
            src={imgWiFiSignalLight}
          />
        </div>
        <div className="h-[14px] relative shrink-0 w-[25px]">
          <img
            alt=""
            className={`absolute block inset-0 max-w-none size-full ${isDark ? 'brightness-0 invert' : ''}`}
            src={imgBatteryLight}
          />
        </div>
      </div>
      <div className="absolute h-[21px] left-[10px] overflow-clip rounded-[20px] top-[12px] w-[54px]">
        <p
          className={`-translate-x-1/2 absolute font-semibold leading-normal left-[27px] not-italic text-[15px] text-center top-[calc(50%-8.5px)] tracking-[-0.3px] w-[54px] ${
            isDark ? 'text-slate-50' : 'text-[color:var(--color-black-900)]'
          }`}
          style={{ fontFamily: "'SF Pro Text', sans-serif" }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
