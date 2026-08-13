import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileLayout from '@/layouts/MobileLayout';
import { ROUTES } from '@/router/routes';

import HomePage from '@/pages/home/HomePage';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 하단 탭바가 있는 화면들 (차주 모바일 앱) */}
        <Route element={<MobileLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
