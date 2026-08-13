import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Bell,
  CheckCircle2,
  Navigation as NavigationIcon,
} from 'lucide-react';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import { ROUTES } from '../../router/routes';
import { getDrivingStatus } from '@/api/driving/driving';
import type { Package, PackageBlock } from '@/api/negotiation/pipeline';

/** "HH:MM" 두 개 사이 분(min) 차이 계산 */
function diffMinutes(from: string, to: string): number {
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  return th * 60 + tm - (fh * 60 + fm);
}

export default function DrivingMode1Page() {
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDrivingStatus()
      .then((res) => {
        if (!cancelled) setPkg(res.package);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : '불러오기 실패');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-slate-950 items-center justify-center">
        <SystemStatusBar variant="dark" />
        <p className="text-[14px] text-slate-400">불러오는 중...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-slate-950 items-center justify-center gap-[8px] px-[20px]">
        <SystemStatusBar variant="dark" />
        <p className="text-[14px] text-red-400 text-center">
          {error ?? '확정된 패키지가 없습니다.'}
        </p>
        <p className="text-[12px] text-slate-500 text-center">
          협상2에서 하루 패키지를 먼저 확정해주세요.
        </p>
      </div>
    );
  }

  // 실시간 위치 추적이 없어서, "성남 상차→부산 사상 하차(고정 구간)"는 이미 끝난 것으로
  // 간주하고 그 다음 첫 유동 구간을 "다음 행동"으로 삼는다 (데모 단순화).
  const completedBlock: PackageBlock | undefined = pkg.blocks[1];
  const nextBlock: PackageBlock | undefined = pkg.blocks[2];
  const nonFixedBlocks = pkg.blocks.filter((b: PackageBlock) => !b.is_fixed);
  const currentIndex = nextBlock ? nonFixedBlocks.indexOf(nextBlock) : 0;

  const minutesUntilNext =
    completedBlock && nextBlock
      ? diffMinutes(completedBlock.arrival_time, nextBlock.arrival_time)
      : 0;

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-slate-950">
      <SystemStatusBar variant="dark" />

      {/* 주행 모드 상단바 */}
      <div className="h-[48px] px-[12px] bg-slate-950 flex items-center justify-between shrink-0">
        <button
          type="button"
          aria-label="홈"
          className="p-[8px]"
          onClick={() => navigate(ROUTES.home)}
        >
          <Home className="size-[24px] text-slate-50" strokeWidth={2} />
        </button>
        <p className="text-[18px] font-bold text-slate-50">주행 중</p>
        <button type="button" aria-label="알림" className="p-[8px] relative">
          <Bell className="size-[24px] text-slate-50" strokeWidth={1.5} />
          <span className="absolute top-[6px] right-[6px] size-[6px] bg-red-500 rounded-full" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-[16px] pb-[96px] flex flex-col gap-[20px]">
        {/* 직전 구간 완료 알림 */}
        {completedBlock && (
          <div className="px-[20px]">
            <div className="bg-[#012155] rounded-[12px] p-[16px] flex items-center gap-[8px]">
              <CheckCircle2
                className="size-[20px] text-blue-500 shrink-0"
                strokeWidth={2}
              />
              <div className="flex flex-col gap-[1px]">
                <p className="text-[16px] font-medium text-slate-50 leading-[20px]">
                  {completedBlock.location} {completedBlock.action} 완료
                </p>
                <p className="text-[14px] text-slate-400 leading-[16px]">
                  {completedBlock.arrival_time}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 다음 상차까지 카운트다운 */}
        <div className="px-[20px]">
          <div className="flex flex-col items-center gap-[4px]">
            <p className="text-[14px] text-slate-400 text-center">
              다음 상차까지
            </p>
            <div className="flex items-end justify-center gap-[4px]">
              <span className="text-[48px] font-bold text-slate-50 leading-[48px]">
                {Math.max(minutesUntilNext, 0)}
              </span>
              <span className="text-[20px] font-bold text-slate-50 leading-[32px] pb-[4px]">
                분
              </span>
            </div>
          </div>
        </div>

        {/* 다음 행동 카드 */}
        {nextBlock && (
          <div className="px-[20px]">
            <div className="bg-[#012155] rounded-[12px] p-[16px] flex flex-col gap-[4px]">
              <p className="text-[12px] font-medium text-blue-500">다음 행동</p>
              <p className="text-[20px] font-bold text-slate-50 pt-[4px]">
                {nextBlock.location}
              </p>
              <p className="text-[20px] font-bold text-blue-500">
                {nextBlock.arrival_time} {nextBlock.action}
              </p>
              {/* TODO: driving/status 응답에 화물/적재방식/거리 필드가 없어서 하드코딩.
                  나중에 scout 데이터를 order_id로 조인하거나, 백엔드가 필드를 추가해주면 교체 */}
              <div className="flex items-center gap-[4px] pt-[12px]">
                <span className="text-[14px] text-slate-400">파렛트 6</span>
                <span className="text-[14px] text-slate-800">|</span>
                <span className="text-[14px] text-slate-400">지게차 상차</span>
                <span className="text-[14px] text-slate-800">|</span>
                <span className="text-[14px] text-slate-400">32km / 41분</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정: 경로 안내 CTA + 오늘 진행 요약 */}
      <div className="shrink-0 bg-slate-950 flex flex-col gap-[12px] pb-[20px]">
        <div className="px-[20px]">
          <button
            type="button"
            onClick={() => navigate(ROUTES.drivingMode2)}
            className="w-full h-[56px] bg-yellow-400 rounded-[12px] shadow-[0px_6px_16px_-2px_rgba(0,0,0,0.12)] flex items-center justify-center gap-[8px]"
          >
            <NavigationIcon
              className="size-[18px] text-sky-950"
              strokeWidth={2.5}
            />
            <span className="text-[16px] font-bold text-sky-950">
              경로 안내 시작
            </span>
          </button>
        </div>

        <div className="px-[20px]">
          <div className="bg-[#012155] rounded-[12px] p-[16px] flex items-center">
            <div className="flex-1 flex flex-col items-center gap-[4px]">
              <span className="text-[12px] font-medium text-slate-400">
                오늘 진행
              </span>
              <span className="text-[16px] font-bold text-slate-50">
                {currentIndex} / {nonFixedBlocks.length} 구간
              </span>
            </div>
            <div className="w-px h-[32px] bg-gray-200/20" />
            <div className="flex-1 flex flex-col items-center gap-[4px]">
              <span className="text-[12px] font-medium text-slate-400">
                공차
              </span>
              <span className="text-[16px] font-bold text-blue-500">
                {pkg.empty_km.toFixed(1)} km
              </span>
            </div>
            <div className="w-px h-[32px] bg-gray-200/20" />
            <div className="flex-1 flex flex-col items-center gap-[4px]">
              <span className="text-[12px] font-medium text-slate-400">
                복귀 예정
              </span>
              <span className="text-[16px] font-bold text-slate-50">
                {pkg.return_time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
