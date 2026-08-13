// 홈 / 오퍼 / 협상 / 내 기준 4개 탭의 하단 내비게이션 바.

import homeActive from '../../assets/icons/home_active.svg';
import homeInactive from '../../assets/icons/home_inactive.svg';
import negoActive from '../../assets/icons/nego_active.svg';
import negoInactive from '../../assets/icons/nego_inactive.svg';
import settingInactive from '../../assets/icons/setting_incactive.svg';

export type BottomTabKey = 'home' | 'offer' | 'negotiation' | 'myCriteria';

const ACTIVE_COLOR = '#3366ff';
const INACTIVE_COLOR = '#434655';

function OfferIcon({ color }: { color: string }) {
  return (
    <svg
      width="23"
      height="16"
      viewBox="0 0 23 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.73684 11.6226C8.18456 11.6226 7.73684 12.0704 7.73684 12.6226C7.73684 13.1749 8.18456 13.6226 8.73684 13.6226V12.6226V11.6226ZM15.3684 13.6226C15.9207 13.6226 16.3684 13.1749 16.3684 12.6226C16.3684 12.0704 15.9207 11.6226 15.3684 11.6226V12.6226V13.6226ZM20.8947 11.6226C20.3425 11.6226 19.8947 12.0704 19.8947 12.6226C19.8947 13.1749 20.3425 13.6226 20.8947 13.6226V12.6226V11.6226ZM22 9.45283H23C23 9.17981 22.8884 8.91865 22.691 8.72999L22 9.45283ZM17.5789 5.22642L18.27 4.50358V4.50358L17.5789 5.22642ZM3.21053 13.6226C3.76281 13.6226 4.21053 13.1749 4.21053 12.6226C4.21053 12.0704 3.76281 11.6226 3.21053 11.6226V12.6226V13.6226ZM12.1579 12.6226C12.1579 13.1749 12.6056 13.6226 13.1579 13.6226C13.7102 13.6226 14.1579 13.1749 14.1579 12.6226H13.1579H12.1579ZM8.73684 12.6226V13.6226H15.3684V12.6226V11.6226H8.73684V12.6226ZM20.8947 12.6226V13.6226C21.2357 13.6226 21.5945 13.5843 21.9248 13.444C22.2894 13.289 22.5698 13.0304 22.748 12.6899C22.9073 12.3852 22.9573 12.0659 22.979 11.818C23.0008 11.5674 23 11.2884 23 11.0377H22H21C21 11.3154 20.9992 11.4986 20.9865 11.6443C20.9736 11.7926 20.9545 11.8035 20.9757 11.763C20.9901 11.7355 21.0155 11.6984 21.054 11.663C21.0922 11.628 21.1264 11.6101 21.1427 11.6032C21.1621 11.595 21.1064 11.6226 20.8947 11.6226V12.6226ZM22 11.0377H23V9.45283H22H21V11.0377H22ZM22 9.45283L22.691 8.72999L18.27 4.50358L17.5789 5.22642L16.8879 5.94925L21.309 10.1757L22 9.45283ZM17.5789 5.22642L18.27 4.50358C17.4193 3.69035 16.4478 3.16981 15.3684 3.16981V4.16981V5.16981C15.7628 5.16981 16.2649 5.35368 16.8879 5.94925L17.5789 5.22642ZM15.3684 4.16981V3.16981H13.1579V4.16981V5.16981H15.3684V4.16981ZM13.1579 4.16981H14.1579V2.58491H13.1579H12.1579V4.16981H13.1579ZM13.1579 2.58491H14.1579C14.1579 1.8907 13.9741 1.18925 13.4344 0.673387C12.9032 0.16557 12.1958 0 11.5 0V1V2C11.9095 2 12.031 2.09858 12.0524 2.11907C12.0654 2.13151 12.1579 2.22251 12.1579 2.58491H13.1579ZM11.5 1V0H2.65789V1V2H11.5V1ZM2.65789 1V0C1.96209 0 1.25466 0.16557 0.723457 0.673387C0.183843 1.18925 0 1.8907 0 2.58491H1H2C2 2.22251 2.09247 2.13151 2.10549 2.11907C2.12692 2.09858 2.24844 2 2.65789 2V1ZM1 2.58491H0V11.0377H1H2V2.58491H1ZM1 11.0377H0C0 11.7319 0.183843 12.4334 0.723457 12.9493C1.25466 13.4571 1.96209 13.6226 2.65789 13.6226V12.6226V11.6226C2.24844 11.6226 2.12692 11.5241 2.10549 11.5036C2.09247 11.4911 2 11.4001 2 11.0377H1ZM2.65789 12.6226V13.6226H3.21053V12.6226V11.6226H2.65789V12.6226ZM13.1579 4.16981H12.1579V12.6226H13.1579H14.1579V4.16981H13.1579ZM8.46053 12.6226H7.46053C7.46053 13.3414 6.83775 14 5.97368 14V15V16C7.85651 16 9.46053 14.5299 9.46053 12.6226H8.46053ZM5.97368 15V14C5.10962 14 4.48684 13.3414 4.48684 12.6226H3.48684H2.48684C2.48684 14.5299 4.09086 16 5.97368 16V15ZM3.48684 12.6226H4.48684C4.48684 11.9039 5.10962 11.2453 5.97368 11.2453V10.2453V9.24528C4.09086 9.24528 2.48684 10.7154 2.48684 12.6226H3.48684ZM5.97368 10.2453V11.2453C6.83775 11.2453 7.46053 11.9039 7.46053 12.6226H8.46053H9.46053C9.46053 10.7154 7.85651 9.24528 5.97368 9.24528V10.2453ZM20.6184 12.6226H19.6184C19.6184 13.3414 18.9956 14 18.1316 14V15V16C20.0144 16 21.6184 14.5299 21.6184 12.6226H20.6184ZM18.1316 15V14C17.2675 14 16.6447 13.3414 16.6447 12.6226H15.6447H14.6447C14.6447 14.5299 16.2488 16 18.1316 16V15ZM15.6447 12.6226H16.6447C16.6447 11.9039 17.2675 11.2453 18.1316 11.2453V10.2453V9.24528C16.2488 9.24528 14.6447 10.7154 14.6447 12.6226H15.6447ZM18.1316 10.2453V11.2453C18.9956 11.2453 19.6184 11.9039 19.6184 12.6226H20.6184H21.6184C21.6184 10.7154 20.0144 9.24528 18.1316 9.24528V10.2453Z"
        fill={color}
      />
    </svg>
  );
}

const TABS: {
  key: BottomTabKey;
  label: string;
  activeIcon?: string;
  inactiveIcon?: string;
}[] = [
  {
    key: 'home',
    label: '홈',
    activeIcon: homeActive,
    inactiveIcon: homeInactive,
  },
  { key: 'offer', label: '오퍼' }, // OfferIcon 컴포넌트로 따로 렌더링
  {
    key: 'negotiation',
    label: '협상',
    activeIcon: negoActive,
    inactiveIcon: negoInactive,
  },
  {
    key: 'myCriteria',
    label: '내 기준',
    activeIcon: settingInactive,
    inactiveIcon: settingInactive,
  }, // TODO: setting_active.svg 생기면 교체
];

export type BottomTabBarProps = {
  className?: string;
  activeTab?: BottomTabKey;
  onTabChange?: (tab: BottomTabKey) => void;
};

export default function BottomTabBar({
  className,
  activeTab = 'home',
  onTabChange,
}: BottomTabBarProps) {
  return (
    <div
      className={
        className ||
        'bg-white drop-shadow-[0px_-4px_8px_rgba(0,0,0,0.05)] flex gap-[33.5px] items-center pb-[24px] pt-[8px] px-[16.75px] relative rounded-tl-[20px] rounded-tr-[20px] w-full max-w-[390px]'
      }
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange?.(tab.key)}
            className="flex flex-col items-center justify-center relative shrink-0 w-[64px]"
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="flex flex-col items-center justify-center pb-[4px] relative shrink-0 size-[24px]">
              {tab.key === 'offer' ? (
                <OfferIcon color={color} />
              ) : (
                <img
                  alt={tab.label}
                  className="shrink-0 size-[24px]"
                  src={isActive ? tab.activeIcon : tab.inactiveIcon}
                />
              )}
            </div>
            <span
              className="font-medium text-[11px] text-center whitespace-nowrap leading-[13.75px]"
              style={{ color }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
      <div className="-translate-x-1/2 absolute bg-[#191b24] bottom-[6px] h-[5px] left-1/2 rounded-[9999px] w-[134px]" />
    </div>
  );
}
