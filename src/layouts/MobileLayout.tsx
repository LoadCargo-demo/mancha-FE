import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import SystemStatusBar from '../components/common/SystemStatusBar';
import BottomTabBar, {
  type BottomTabKey,
} from '../components/common/BottomTabBar';
import { ROUTES } from '../router/routes';

// 경로 ↔ 탭 매핑. 탭이 없는 페이지(예: 온보딩)는 여기 없으면 탭바가 전부 비활성으로 보입니다.
const PATH_TO_TAB: Record<string, BottomTabKey> = {
  [ROUTES.home]: 'home',
  [ROUTES.offer]: 'offer',
  [ROUTES.negotiation]: 'negotiation',
  [ROUTES.myCriteria]: 'myCriteria',
};

const TAB_TO_PATH: Record<BottomTabKey, string> = {
  home: ROUTES.home,
  offer: ROUTES.offer,
  negotiation: ROUTES.negotiation,
  myCriteria: ROUTES.myCriteria,
};

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = PATH_TO_TAB[location.pathname];
  const showTabBar = Boolean(activeTab);

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-white">
      <SystemStatusBar />

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>

      {showTabBar && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => navigate(TAB_TO_PATH[tab])}
        />
      )}
    </div>
  );
}
