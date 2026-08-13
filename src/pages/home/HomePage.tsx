// 홈화면 — 차주 홈 대시보드
// 주행 상태 배너, 오늘의 리포트 알림, 절약 시간 요약, 최근 주행 기록,
// 운송 노하우 / 하차 인증 바로가기 카드로 구성된 홈 화면.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Truck } from 'lucide-react';
import reportIcon from '@/assets/icons/report.svg';
import badge from '@/assets/illustrations/badge.png';
import logo from '@/assets/icons/logo.png';
import Knowledge from '@/assets/icons/Knowledge.png';
import certification from '@/assets/icons/certification.png';

import tradeIcon from '@/assets/icons/trade.svg';
import { ROUTES } from '@/router/routes';
import { getDrivingStatus } from '@/api/driving/driving';
import type { Package } from '@/api/negotiation/pipeline';

type TripRecord = {
  date: string;
  origin: string;
  destination: string;
  deliveredCount: number;
};

const RECENT_TRIPS: TripRecord[] = [
  {
    date: '7월 29일 (수)',
    origin: '서울',
    destination: '김천',
    deliveredCount: 4,
  },
  {
    date: '7월 28일 (화)',
    origin: '성남',
    destination: '부산',
    deliveredCount: 3,
  },
];

function TripHistoryItem({ trip }: { trip: TripRecord }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-[12px]">
        <div className="size-[48px] bg-[var(--color-gray-100)] rounded-[12px] flex items-center justify-center shrink-0">
          <Truck
            className="size-[24px] text-[color:var(--color-gray-900)]"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col gap-[1.5px]">
          <span className="text-[12px] font-medium text-[color:var(--color-gray-600)]">
            {trip.date}
          </span>
          <div className="flex items-center gap-[4px]">
            <span className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
              {trip.origin}
            </span>
            <img src={tradeIcon} alt="" className="w-[14px] h-[12px]" />
            <span className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
              {trip.destination}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="bg-[rgba(196,181,253,0.2)] rounded-[8px] px-[12px] py-[6px]"
      >
        <span className="text-[14px] font-bold text-[color:var(--color-action-primary)]">
          {trip.deliveredCount}건 전달
        </span>
      </button>
    </div>
  );
}

/** 주행 중이면 파란 배너, 확정된 패키지가 없으면 등록 유도 배너 */
function DrivingStatusBanner({
  pkg,
  loading,
  onClickBanner,
}: {
  pkg: Package | null;
  loading: boolean;
  onClickBanner: () => void;
}) {
  if (loading) return null; // 깜빡임 방지 — 로딩 중엔 아무것도 안 보여줌

  if (!pkg) {
    return (
      <button
        type="button"
        onClick={onClickBanner}
        className="w-full bg-[var(--color-gray-100)] rounded-[12px] px-[16px] py-[12px] flex items-center justify-between text-left"
      >
        <span className="text-[14px] font-medium text-[color:var(--color-gray-600)]">
          오늘 등록된 하루가 없어요 · 등록하러 가기
        </span>
        <ChevronRight
          className="size-[16px] text-[color:var(--color-gray-600)]"
          strokeWidth={2.5}
        />
      </button>
    );
  }

  const origin = pkg.blocks[0]?.location ?? '-';
  const destination = pkg.blocks[pkg.blocks.length - 1]?.location ?? '-';

  return (
    <button
      type="button"
      onClick={onClickBanner}
      className="w-full bg-[var(--color-action-primary)] rounded-[12px] px-[16px] py-[12px] flex items-center justify-between"
    >
      <div className="flex items-center gap-[10px]">
        <span className="bg-white/20 rounded-full px-[10px] py-[4px] text-[12px] font-normal text-white">
          주행 중
        </span>
        <span className="text-[14px] font-semibold text-white leading-6">
          {origin}
        </span>
        <img
          src={tradeIcon}
          alt=""
          className="size-[14px] brightness-0 invert"
        />
        <span className="text-[14px] font-semibold text-white leading-6">
          {destination}
        </span>
      </div>
      <div className="flex items-center gap-[2px]">
        <span className="text-[12px] font-medium text-white">전체보기</span>
        <ChevronRight className="size-[16px] text-white" strokeWidth={2.5} />
      </div>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState<'default' | 'large'>('default');
  const [drivingPackage, setDrivingPackage] = useState<Package | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getDrivingStatus()
      .then((res) => {
        if (!cancelled) setDrivingPackage(res.package);
      })
      .catch(() => {
        // 확정된 패키지가 없으면 404 — 에러가 아니라 정상적인 "아직 등록 전" 상태
        if (!cancelled) setDrivingPackage(null);
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col bg-white min-h-full">
      {/* 상단 헤더: 로고 + 글자크기 토글 + 알림 */}
      <div className="px-[20px] pb-[16px] flex items-center justify-between">
        <img src={logo} alt="만차" className="h-9 w-auto object-contain" />

        <div className="flex items-center gap-[12px]">
          <div className="bg-[var(--color-gray-100)] rounded-full p-[4px] flex items-center">
            <button
              type="button"
              onClick={() => setFontSize('default')}
              className={`px-[12px] py-[4px] rounded-full text-[12px] font-bold ${
                fontSize === 'default'
                  ? 'bg-white text-[color:var(--color-gray-900)] shadow-sm'
                  : 'text-[color:var(--color-gray-600)]'
              }`}
            >
              기본
            </button>
            <button
              type="button"
              onClick={() => setFontSize('large')}
              className={`px-[12px] py-[4px] rounded-full text-[12px] font-bold ${
                fontSize === 'large'
                  ? 'bg-white text-[color:var(--color-gray-900)] shadow-sm'
                  : 'text-[color:var(--color-gray-600)]'
              }`}
            >
              크게
            </button>
          </div>

          <button type="button" aria-label="알림" className="relative">
            <Bell
              className="size-[24px] text-[color:var(--color-gray-900)]"
              strokeWidth={1.5}
            />
            <span className="absolute -top-[2px] -right-[2px] size-[8px] bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* 주행 상태 배너 — 실제 driving/status API 연동 */}
      <div className="px-[20px] pb-[16px]">
        <DrivingStatusBanner
          pkg={drivingPackage}
          loading={statusLoading}
          onClickBanner={() =>
            navigate(drivingPackage ? ROUTES.drivingMode1 : ROUTES.myCriteria)
          }
        />
      </div>

      {/* 오늘의 리포트 카드 */}
      <div className="px-[20px] pb-[16px]">
        <button
          type="button"
          onClick={() => navigate(ROUTES.dailyReport)}
          className="w-full bg-white border border-[var(--color-gray-100)] rounded-[12px] shadow-sm p-[20px] flex items-start gap-[16px] text-left"
        >
          <div className="size-[56px] bg-blue-600/10 rounded-full flex items-center justify-center shrink-0">
            <img src={reportIcon} alt="" className="w-[20px] h-[24px]" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="text-[18px] font-bold text-[color:var(--color-gray-900)]">
              오늘의 리포트가 도착했어요!
            </p>
            <div className="flex items-center gap-[2px]">
              <span className="text-[14px] text-[color:var(--color-action-primary)]">
                내 공차 성과 확인하러 가기
              </span>
              <ChevronRight
                className="size-[14px] text-[color:var(--color-action-primary)]"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </button>
      </div>

      {/* 절약 시간 배너 (일러스트 자리는 임시 placeholder) */}
      {/* 절약 시간 배너 */}
      <div className="px-[20px] pb-[16px]">
        <div className="relative bg-gradient-to-b from-[#0c2a52] to-[var(--color-action-primary)] rounded-[24px] p-[20px] h-[144px] overflow-hidden flex flex-col justify-center gap-[8px]">
          <img
            src={badge}
            alt=""
            className="w-[149px] h-[224px] absolute -top-[23px] right-[10px]"
          />
          <p className="text-[14px] text-neutral-50 font-light font-['Pretendard'] leading-6">
            시간을 조립하는 만차 서비스
          </p>
          <p>
            <span className="text-neutral-50 text-xl font-bold font-['Pretendard'] leading-8">
              지금까지{' '}
            </span>
            <span className="text-yellow-400 text-3xl font-bold font-['Pretendard'] leading-10">
              12일
            </span>
            <span className="text-slate-100 text-xl font-bold font-['Pretendard'] leading-8">
              의<br />
              시간을 아꼈어요{' '}
            </span>
          </p>
        </div>
      </div>

      {/* 최근 주행 기록 */}
      <div className="px-[20px] pb-[16px]">
        <div className="bg-white border border-[var(--color-gray-100)] rounded-[12px] shadow-sm p-[20px] flex flex-col gap-[16px]">
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-bold text-[color:var(--color-gray-900)]">
              최근 주행 기록
            </p>
            <div className="flex items-center gap-[2px]">
              <span className="text-[12px] font-medium text-[color:var(--color-gray-600)]">
                전체보기
              </span>
              <ChevronRight
                className="size-[12px] text-[color:var(--color-gray-600)]"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            {RECENT_TRIPS.map((trip, i) => (
              <div key={trip.date}>
                <TripHistoryItem trip={trip} />
                {i < RECENT_TRIPS.length - 1 && (
                  <div className="pl-[60px] pt-[16px]">
                    <div className="h-px bg-[var(--color-gray-200)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 바로가기 카드 2개 */}
      <div className="px-[20px] pb-[24px] flex gap-[16px]">
        {/* 운송 노하우 */}
        <div className="w-40 h-56 rounded-xl border border-[var(--color-gray-200)] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <img
            src={Knowledge}
            alt="운송 노하우"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-10 p-[16px]">
            <p className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
              운송 노하우
            </p>
            <p className="text-xs font-medium text-stone-500 leading-5">
              나만 알고 있는 현장 지식,
              <br />
              함께 나눠 볼까요?
            </p>
          </div>
        </div>

        {/* 하차 인증 */}
        <div className="flex-1 h-56 rounded-xl border border-[var(--color-gray-200)] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <img
            src={certification}
            alt="하차 인증"
            className="absolute inset-0 w-full h-full scale-[1.3] object-cover"
          />

          <div className="relative z-10 p-[16px]">
            <p className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
              하차 인증
            </p>
            <p className="text-[12px] text-[color:var(--color-gray-600)] leading-[20px]">
              내가 운반한 화물,
              <br />
              하차 알리면 신뢰도가 올라가요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
