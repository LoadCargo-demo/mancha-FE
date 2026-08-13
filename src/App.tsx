import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileLayout from '@/layouts/MobileLayout';
import { ROUTES } from '@/router/routes';
import OfferCostStep from './pages/offer/OfferCostStep';
import OfferScheduleStep from './pages/offer/OfferScheduleStep';
import OfferConditionsStep from './pages/offer/OfferConditionsStep';
import OfferCompleteStep from './pages/offer/OfferCompleteStep';
import OfferSummaryPage from './pages/offer/OfferSummaryPage';

import HomePage from '@/pages/home/HomePage';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 하단 탭바가 있는 화면들 (차주 모바일 앱) */}
        <Route element={<MobileLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.offer} element={<OfferSummaryPage />} />
        </Route>
        <Route path={ROUTES.myCriteria} element={<OfferCostStep />} />
        <Route path={ROUTES.offerNewSchedule} element={<OfferScheduleStep />} />
        <Route
          path={ROUTES.offerNewConditions}
          element={<OfferConditionsStep />}
        />
        <Route path={ROUTES.offerNewComplete} element={<OfferCompleteStep />} />
      </Routes>
    </BrowserRouter>
  );
}
