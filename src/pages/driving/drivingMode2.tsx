// Figma: 주행중2 — 인앱 내비게이션 화면
// 실제 지도(SDK)는 아직 미연동 — 지도 자리는 placeholder이며, 나중에 카카오맵 SDK로 교체 예정.
// 핵심 동작: 운행 중 지연이 감지되면 실제 /api/driving/event를 호출해 재조립 제안을 받고,
// 그 결과를 상단 팝업으로 보여준다. "제안 보기" 클릭 시 결과를 다음 화면(주행중3)으로 전달.
//
// 지연시킬 주문은 하드코딩하지 않고, 지금 실제로 확정된 패키지(driving/status)에서
// 하나 골라서 씀 — 팀원들이 테스트하면서 패키지가 계속 바뀌기 때문에, 존재하지 않는
// order_id로 지연 이벤트를 보내면 항상 should_notify:false만 받게 되는 문제를 피하기 위함.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CornerUpLeft,
  Home,
  TriangleAlert,
  Mic,
  Plus,
  Minus,
  LocateFixed,
  MapPin,
  ParkingSquare,
  RefreshCw,
  Camera,
} from 'lucide-react';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import { ROUTES } from '../../router/routes';
import {
  getDrivingStatus,
  submitDrivingEvent,
  type DrivingEventResponse,
} from '@/api/driving/driving';
import type { Package } from '@/api/negotiation/pipeline';
import { GeminiTTS } from '@/hooks/GeminiTTS';
import mapBackground from '@/assets/illustrations/map.png';

// TODO: 실제 서비스에서는 실시간 지연 감지(WebSocket 등)로 트리거하세요.
// 데모 목적으로 화면 진입 일정 시간 후 지연 이벤트를 시뮬레이션합니다.
const DEMO_DELAY_TRIGGER_MS = 4000;
const DEMO_DELAY_MIN = 40;

function DelayAlertCard({
  delayLabel,
  onViewSuggestion,
}: {
  delayLabel: string;
  onViewSuggestion: () => void;
}) {
  return (
    <div className="absolute left-[20px] right-[20px] top-[45px] z-20 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-purple-50 border border-gray-200 rounded-[12px] shadow-lg p-[16px] flex flex-col gap-[8px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <TriangleAlert
              className="size-[20px] text-red-500"
              strokeWidth={2}
            />
            <span className="text-[16px] font-bold text-zinc-900">
              {delayLabel}
            </span>
          </div>
          <span className="bg-rose-200 text-red-800 text-[14px] font-medium rounded-full px-[8px] py-[4px]">
            AI 자동 감지
          </span>
        </div>
        <div className="flex items-center justify-between pt-[4px]">
          <span className="text-[16px] font-medium text-stone-500">
            새로운 최적 경로를 계산했습니다.
          </span>
          <button
            type="button"
            onClick={onViewSuggestion}
            className="text-[16px] font-bold text-blue-600 shrink-0"
          >
            제안 보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DrivingMode2Page() {
  const { preloadTTS } = GeminiTTS();
  const navigate = useNavigate();
  const [eventResult, setEventResult] = useState<DrivingEventResponse | null>(
    null,
  );
  const [delayedLabel, setDelayedLabel] = useState('');
  const [originalPackage, setOriginalPackage] = useState<Package | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true); // 바텀시트 접힘/펼침
  const [destinationLabel, setDestinationLabel] = useState('목적지 확인 중...'); // "~ 가는 중"에 쓸 실제 목적지

  // 지연 이벤트 흐름과 별개로, 화면 진입하자마자 "지금 향하고 있는 목적지"를 가져온다.
  // driving/status는 항상 "현재 확정된 패키지"를 돌려주므로, 재조립이 실제로 적용된 뒤
  // 이 화면에 다시 들어오면 자동으로 새 목적지가 반영된다 (하드코딩 없음).
  useEffect(() => {
    let cancelled = false;

    getDrivingStatus()
      .then((res) => {
        if (cancelled) return;
        const nextBlock =
          res.package.blocks[2] ??
          res.package.blocks[res.package.blocks.length - 1];
        if (nextBlock) setDestinationLabel(nextBlock.location);
      })
      .catch(() => {
        // 확정된 패키지가 없으면 조용히 기본 문구 유지
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        // 1) 지금 실제로 확정된 패키지를 조회해서 (재조립 결과 화면에서 취소된 주문을
        //    보여주려면 "재조립 전" 원본 패키지가 필요하므로 같이 저장해둠)
        const status = await getDrivingStatus();
        setOriginalPackage(status.package);
        const orderIds = status.package.order_ids;
        if (orderIds.length === 0) {
          console.warn('확정 패키지에 지연시킬 주문이 없습니다.');
          return;
        }

        // 2) 그중 하나를 골라 (첫 번째 주문) 지연 이벤트를 발생시킴
        const targetOrderId = orderIds[0];
        const targetBlock = status.package.blocks.find(
          (b) => b.order_id === targetOrderId && b.action === '상차',
        );
        const label = targetBlock?.location ?? targetOrderId;

        const res = await submitDrivingEvent({
          event_type: 'DELAY',
          order_id: targetOrderId,
          delay_min: DEMO_DELAY_MIN,
          detail: `${label} 상차 지연`,
        });

        if (cancelled) return;

        if (res.should_notify && res.new_package) {
          setDelayedLabel(label);
          setEventResult(res);

          // 팝업 뜨자마자(=유저가 "제안 보기" 누르기 전) 미리 TTS 오디오를 만들어둔다.
          // 유저가 클릭하는 시점엔 이미 준비돼 있어서 주행중3에서 딜레이 없이 바로 재생됨.
          if (res.tradeoff_text) {
            preloadTTS(res.tradeoff_text).then((url) => {
              if (!cancelled) setAudioUrl(url);
            });
          }
        } else {
          console.warn('재조립 제안 없음 (should_notify=false):', res);
        }
      } catch (err) {
        console.error('지연 이벤트 처리 실패:', err);
      }
    }, DEMO_DELAY_TRIGGER_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [preloadTTS]);

  return (
    <div className="relative flex flex-col h-dvh max-w-[390px] mx-auto bg-white overflow-hidden">
      {/* 지도 영역 — 실제 지도 스크린샷 이미지 (하드코딩, 카카오맵 SDK 연동 전까지 임시) */}
      <img
        src={mapBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 상태바는 지도 위에 투명하게 얹힘 */}
      <div className="relative z-20">
        <SystemStatusBar variant="transparent" />
      </div>

      {/* 상단 지연 알림 팝업 — 실제 API 응답을 받은 뒤에만 표시 */}
      {eventResult && (
        <DelayAlertCard
          delayLabel={`${delayedLabel} 상차 ${DEMO_DELAY_MIN}분 지연`}
          onViewSuggestion={() =>
            navigate(ROUTES.drivingMode3, {
              state: {
                eventResult,
                delayedOrderLabel: delayedLabel,
                delayMin: DEMO_DELAY_MIN,
                originalPackage,
                audioUrl, // 아직 준비 안 됐으면 null → 주행중3이 케이스 B로 직접 재생 호출
              },
            })
          }
        />
      )}

      {/* AI 어시스턴트 플로팅 버튼 */}
      <button
        type="button"
        aria-label="AI 어시스턴트"
        className="absolute right-[20px] top-[78px] z-10 size-[56px] rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-[0px_10px_15px_-3px_rgba(168,85,247,0.3)] flex items-center justify-center"
      >
        <Mic className="w-[25px] h-[25px] brightness-0 invert" />
      </button>

      {/* 좌측 회전 안내 카드 */}
      <div className="absolute left-0 top-[50px] z-10 w-[240px]">
        <div
          className="h-[80px] rounded-r-[20px] shadow-[0px_4px_15px_0px_rgba(0,117,255,0.3)] p-[16px] flex items-center gap-[12px]"
          style={{
            backgroundImage: 'linear-gradient(64deg, #0075FF 0%, #0047B3 100%)',
          }}
        >
          <div className="size-[56px] rounded-3xl outline outline-4 -outline-offset-4 outline-white flex items-center justify-center shrink-0">
            <span className="text-[18px] font-bold text-white">출발</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-[2px]">
              <span className="text-[36px] font-bold text-white tracking-[3px]">
                0
              </span>
              <span className="text-[30px] font-bold text-white">m</span>
            </div>
            <span className="text-[16px] font-medium text-white/90">
              양산IC 방면
            </span>
          </div>
        </div>
        <div className="h-[44px] bg-blue-800 rounded-br-[20px] pl-[10px] pr-[16px] inline-flex items-center gap-[6px]">
          <CornerUpLeft className="size-[24px] text-white" strokeWidth={4} />
          <span className="text-[24px] font-bold text-blue-200 tracking-wide">
            80<span className="text-[20px]">m</span>
          </span>
        </div>
      </div>

      {/* 경유지 마커 (검은 핀) */}
      <div className="absolute left-[45px] top-[194px] z-10 drop-shadow-[0px_1px_17px_rgba(0,0,0,0.15)]">
        <MapPin
          className="w-5 h-7"
          fill="black"
          stroke="white"
          strokeWidth={2.69}
        />
      </div>

      {/* 중간 지도 마커 — 단속 카메라 정보수집 */}
      <div className="absolute left-[20px] top-[246px] z-10 flex flex-col items-center">
        <div className="size-[64px] bg-blue-600 rounded-full shadow-lg flex flex-col items-center justify-center gap-[2px]">
          <Camera className="size-[20px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-bold text-white">정보수집</span>
        </div>
        <div className="min-w-[64px] h-9 px-[12px] py-[6px] bg-zinc-800 rounded-md -mt-[8px]">
          <span className="text-[16px] font-bold text-white whitespace-nowrap">
            401m
          </span>
        </div>
      </div>

      {/* 현 위치 마커 */}
      <div className="absolute left-[165px] top-[375px] z-10">
        <div className="size-[56px] bg-zinc-400/75 rounded-full backdrop-blur-[2px] shadow-lg flex items-center justify-center">
          <div className="size-[48px] bg-white rounded-full border-2 border-blue-600 flex items-center justify-center">
            <NavigationArrow />
          </div>
        </div>
      </div>

      {/* 우측 지도 컨트롤 */}
      <div className="absolute right-[20px] top-[430px] z-10 flex flex-col items-center gap-[8px]">
        <div className="bg-purple-50 border border-gray-200 rounded-[12px] shadow-md overflow-hidden flex flex-col">
          <button
            type="button"
            aria-label="확대"
            className="size-[48px] flex items-center justify-center border-b border-gray-200"
          >
            <Plus className="size-[16px] text-zinc-900" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="축소"
            className="size-[48px] flex items-center justify-center"
          >
            <Minus className="size-[16px] text-zinc-900" strokeWidth={2.5} />
          </button>
        </div>
        <button
          type="button"
          aria-label="현재 위치로"
          className="size-[48px] bg-purple-50 border border-gray-200 rounded-[12px] shadow-md flex items-center justify-center"
        >
          <LocateFixed className="size-[20px] text-blue-600" strokeWidth={2} />
        </button>
      </div>

      {/* 하단: 목적지 브레드크럼 + 바텀시트 */}
      <div className="absolute left-0 right-0 bottom-0 z-10 flex flex-col items-center gap-[12px]">
        <div className="bg-white/95 backdrop-blur-[2px] border border-gray-100 rounded-full shadow-md px-[12px] py-[4px] flex items-center gap-[6px]">
          <MapPin className="size-[14px] text-gray-400" strokeWidth={2} />
          <span className="text-[14px] font-medium text-zinc-900">
            {destinationLabel}
          </span>
        </div>

        <div className="self-stretch bg-stone-50 rounded-t-3xl shadow-[0px_-10px_40px_0px_rgba(0,0,0,0.1)] pb-[16px]">
          <div className="bg-white rounded-t-3xl">
            <button
              type="button"
              onClick={() => setIsSheetExpanded((prev) => !prev)}
              aria-label={isSheetExpanded ? '바텀시트 접기' : '바텀시트 펼치기'}
              className="pt-[8px] pb-[16px] flex justify-center w-full"
            >
              <div className="w-[48px] h-[4px] bg-gray-300 rounded-full" />
            </button>

            <div className="pb-[8px]">
              <div className="px-[12px] flex items-center justify-between">
                <div className="size-[40px] flex items-center justify-center">
                  <RefreshCw
                    className="size-[18px] text-gray-700"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex flex-col items-center pt-[2px]">
                  <div className="flex items-baseline gap-[10px]">
                    <span>
                      <span className="text-[16px] font-bold text-gray-700">
                        오후{' '}
                      </span>
                      <span className="text-[24px] font-bold text-zinc-900">
                        01:50
                      </span>
                    </span>
                    <span className="pl-[8px]">
                      <span className="text-[24px] font-bold text-zinc-900">
                        2.4
                      </span>
                      <span className="text-[16px] font-bold text-gray-700 pl-[4px]">
                        km
                      </span>
                    </span>
                  </div>
                  <span className="text-[14px] font-medium text-gray-500 pt-[2px]">
                    7분 남음
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.home)}
                  aria-label="홈으로"
                  className="size-[40px] flex items-center justify-center relative"
                >
                  <Home className="size-[20px] text-gray-800" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="px-[24px] py-[8px] relative">
              <div className="bg-gray-200 rounded-full flex overflow-hidden h-[8px]">
                <div className="w-[20%] bg-blue-600" />
                <div className="w-[14%] bg-orange-500" />
                <div className="w-[16%] bg-blue-600" />
                <div className="w-[7%] bg-orange-500" />
                <div className="w-[14%] bg-blue-600" />
                <div className="w-[14%] bg-red-500" />
              </div>
            </div>

            <div className="pt-[8px]">
              <div className="h-px bg-gray-100" />
            </div>
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out ${
              isSheetExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-[20px] pt-[16px]">
                <div className="h-[48px] bg-blue-100 rounded-[12px] flex items-center justify-center">
                  <span className="text-[16px] font-bold text-blue-600">
                    현재 경로는 최적의 경로입니다.
                  </span>
                </div>
              </div>

              <div className="px-[20px] pt-[8px] pb-[4px] flex items-center justify-between">
                <div className="flex items-center gap-[6px]">
                  <NavigationLine />
                  <span className="text-[14px] font-medium text-zinc-900">
                    {destinationLabel} 가는 중
                  </span>
                </div>
                <div className="bg-white border border-gray-200 rounded-full shadow-sm px-[12px] py-[4px] flex items-center gap-[6px]">
                  <div className="size-[20px] bg-blue-50 rounded-sm flex items-center justify-center">
                    <ParkingSquare
                      className="size-[14px] text-blue-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-gray-700">
                    도착지 주변 주차장
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationArrow() {
  return (
    <div className="rotate-[0deg]">
      <svg width="30" height="30" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L17 18L10 14L3 18L10 2Z" fill="#2563EB" />
      </svg>
    </div>
  );
}

function NavigationLine() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 12L12 2M12 2H5M12 2V9"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
