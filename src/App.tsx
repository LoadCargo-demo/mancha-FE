import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 하단 탭바가 있는 화면들 (차주 모바일 앱) */}
        <Route element={<MobileLayout />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
