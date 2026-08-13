// qna/ask가 마크다운(**bold**, ### 소제목, 목록, ---)이 섞인 답변을 주기 때문에
// 별도 라이브러리 없이 필요한 문법만 가볍게 렌더링합니다.

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export type MarkdownLiteProps = {
  text: string;
};

export default function MarkdownLite({ text }: MarkdownLiteProps) {
  const lines = text.split('\n');

  return (
    <div className="flex flex-col gap-[6px]">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed === '---') {
          return <hr key={i} className="border-[var(--color-gray-200)]" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <p
              key={i}
              className="mt-[4px] text-[13px] font-bold text-[color:var(--color-text-primary)]"
            >
              {renderInline(trimmed.slice(4))}
            </p>
          );
        }

        if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith('- ')) {
          const content = trimmed.replace(/^\d+\.\s/, '').replace(/^-\s/, '');
          return (
            <p key={i} className="pl-[8px] text-[13px] leading-[1.6]">
              · {renderInline(content)}
            </p>
          );
        }

        return (
          <p key={i} className="text-[14px] leading-[1.6]">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
