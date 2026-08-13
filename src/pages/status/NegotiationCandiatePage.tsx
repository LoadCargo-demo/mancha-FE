// → 거래 후보(경유지) 리스트
// risk.order_risks에는 확률 정보만 있고 위치/화물 정보가 없어서,
// scout.passed_orders와 order_id로 조인해서 카드를 만든다.
//
// "탈락 오더 N건 사유 보기" 버튼: 대응하는 Figma 디자인이 없어서, 별도 화면
// 이동 대신 가벼운 바텀시트로 자동 탈락된 오더의 exclude_reason만 모아 보여준다.
//
// MobileLayout 밖에 있는 화면이라 자체 홈 이동 버튼도 직접 둔다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import RiskOrderCard from '../../components/negotiation/RiskOrderCard';
import { ROUTES } from '@/router/routes';
import {
  runAll,
  type ScoutOrder,
  type OrderRisk,
} from '@/api/negotiation/pipeline';

/** "0.41999999999999993" 같은 문자열 속 소수점 숫자를 "0.4"처럼 1자리로 반올림 */
function roundDecimalsInText(text: string): string {
  return text.replace(/\d+\.\d+/g, (match) => Number(match).toFixed(1));
}

type CandidateCard = {
  orderId: string;
  title: string;
  statLine: string;
  probability: number;
  probabilityLabel: string;
  tone: 'high' | 'mid' | 'low';
  riskNote?: string;
};

type DroppedOrder = {
  orderId: string;
  title: string;
  reason: string;
};

function buildCandidates(
  orders: ScoutOrder[],
  risks: OrderRisk[],
): CandidateCard[] {
  const orderById = new Map(orders.map((o) => [o.order_id, o]));

  return risks
    .map((risk): CandidateCard | null => {
      const order = orderById.get(risk.order_id);
      if (!order) return null;

      const probability = Math.round(risk.success_probability * 100);

      const tone: CandidateCard['tone'] = risk.is_auto_excluded
        ? 'low'
        : probability >= 90
          ? 'high'
          : probability >= 60
            ? 'mid'
            : 'low';

      const title = risk.is_auto_excluded
        ? `${order.pickup} · 자동 탈락`
        : `${order.pickup} · 파레트 ${order.pallet_count}`;

      const statLine =
        risk.is_auto_excluded && risk.exclude_reason
          ? risk.exclude_reason
          : `취소 확률 ${Math.round(risk.cancel_probability * 100)}% · 지연 확률 ${Math.round(risk.delay_probability * 100)}%`;

      const backupOrder = risk.backup_order_id
        ? orderById.get(risk.backup_order_id)
        : undefined;
      const riskNote = backupOrder
        ? `지연 대비 대체안(${backupOrder.pickup} 건)을 미리 확보해 두었습니다`
        : undefined;

      return {
        orderId: risk.order_id,
        title,
        statLine,
        probability,
        probabilityLabel: risk.is_auto_excluded ? '기준 미달' : '성사 확률',
        tone,
        riskNote,
      };
    })
    .filter((c): c is CandidateCard => c !== null)
    .sort((a, b) => b.probability - a.probability);
}

function buildDroppedOrders(
  orders: ScoutOrder[],
  risks: OrderRisk[],
): DroppedOrder[] {
  const orderById = new Map(orders.map((o) => [o.order_id, o]));

  return risks
    .filter((r) => r.is_auto_excluded)
    .map((r) => {
      const order = orderById.get(r.order_id);
      return {
        orderId: r.order_id,
        title: order ? `${order.pickup} → ${order.dropoff}` : r.shipper_name,
        // exclude_reason(규칙 기반 문구) 대신 explanation(Gemini가 생성한 근거 문장) 사용
        reason: roundDecimalsInText(r.explanation ?? '사유 정보 없음'),
      };
    });
}

function DroppedOrdersSheet({
  orders,
  onClose,
}: {
  orders: DroppedOrder[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[390px] bg-white rounded-t-[20px] px-[20px] pt-[16px] pb-[32px] max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-[16px]">
          <h2 className="text-[18px] font-bold text-[color:var(--color-gray-900)]">
            탈락 오더 {orders.length}건 사유
          </h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X
              className="size-[20px] text-[color:var(--color-gray-600)]"
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="flex flex-col gap-[12px]">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="border border-[var(--color-gray-200)] rounded-[12px] p-[14px] flex flex-col gap-[4px]"
            >
              <span className="text-[15px] font-bold text-[color:var(--color-gray-900)]">
                {o.title}
              </span>
              <span className="text-[13px] text-[color:var(--color-text-secondary)] leading-[19px]">
                {o.reason}
              </span>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-[14px] text-[color:var(--color-text-secondary)] py-[20px] text-center">
              오늘은 탈락한 오더가 없어요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NegotiationCandidatesPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateCard[]>([]);
  const [droppedOrders, setDroppedOrders] = useState<DroppedOrder[]>([]);
  const [showDroppedSheet, setShowDroppedSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    runAll()
      .then((res) => {
        if (cancelled) return;
        setCandidates(
          buildCandidates(res.scout.passed_orders, res.risk.order_risks),
        );
        setDroppedOrders(
          buildDroppedOrders(res.scout.passed_orders, res.risk.order_risks),
        );
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

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-white relative">
      <SystemStatusBar />

      {/* 홈으로 나가기 */}
      <div className="px-[20px] pt-[16px] flex justify-end">
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          aria-label="홈으로"
        >
          <X
            className="size-[24px] text-[color:var(--color-gray-900)]"
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* 헤더 */}
        <div className="px-[20px] pb-[16px] flex flex-col gap-[8px]">
          <h1 className="text-[24px] font-bold text-[color:var(--color-gray-900)] leading-[1.45]">
            기사님,
            <br />
            이런 하루는 어떠신가요?
          </h1>
          <p className="text-[14px] text-[color:var(--color-text-secondary)]">
            AI 작업 결과 제안된 거래 후보를 제시합니다.
          </p>
        </div>

        {loading && (
          <p className="px-[20px] text-[14px] text-[color:var(--color-text-secondary)]">
            불러오는 중...
          </p>
        )}
        {error && (
          <p className="px-[20px] text-[14px] text-red-500">
            불러오지 못했습니다: {error}
          </p>
        )}

        {!loading &&
          !error &&
          candidates.map((c) => (
            <RiskOrderCard
              key={c.orderId}
              title={c.title}
              statLine={c.statLine}
              probability={c.probability}
              probabilityLabel={c.probabilityLabel}
              tone={c.tone}
              riskNote={c.riskNote}
            />
          ))}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="absolute bottom-0 left-0 w-full pt-[16px] pb-[32px] px-[20px] bg-white">
        <button
          type="button"
          onClick={() => setShowDroppedSheet(true)}
          disabled={droppedOrders.length === 0}
          className={`w-full font-bold text-[16px] rounded-[12px] p-[16px] ${
            droppedOrders.length === 0
              ? 'bg-[var(--color-gray-200)] text-[color:var(--color-gray-400)]'
              : 'bg-[var(--color-action-primary)] text-white'
          }`}
        >
          탈락 오더 {droppedOrders.length}건 사유 보기
        </button>
      </div>

      {showDroppedSheet && (
        <DroppedOrdersSheet
          orders={droppedOrders}
          onClose={() => setShowDroppedSheet(false)}
        />
      )}
    </div>
  );
}
