import { useEffect, useRef, useState } from "react";
import logoUrl from "@/assets/logo.png";

export type WheelProps = {
  prizes: readonly string[];
  spinning: boolean;
  targetIndex: number | null;
  onSpinComplete?: () => void;
};

export const SEGMENT_COLORS = [
  "var(--wheel-dark)",
  "var(--wheel-blue)",
  "var(--wheel-navy)",
  "var(--wheel-purple)",
  "var(--wheel-dark)",
  "var(--wheel-teal)",
  "var(--wheel-navy)",
  "var(--wheel-purple)",
  "var(--wheel-dark)",
  "var(--wheel-teal)",
];

function splitPrize(label: string) {
  if (label === "NÃO FOI DESSA VEZ") return ["NÃO FOI", "DESSA VEZ"];
  if (label === "CONDIÇÃO ESPECIAL FÓRUM IEL") return ["CONDIÇÃO", "ESPECIAL", "FÓRUM IEL"];
  if (label === "CONDIÇÃO ESPECIAL ACADEMIA") return ["CONDIÇÃO", "ESPECIAL", "ACADEMIA"];
  if (label === "GANHOU REALIDADE VIRTUAL") return ["GANHOU", "REALIDADE", "VIRTUAL"];
  return label.split(" ");
}

export default function Wheel({ prizes, spinning, targetIndex, onSpinComplete }: WheelProps) {
  const segCount = prizes.length;
  const segAngle = 360 / segCount;
  const [rotation, setRotation] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (spinning && targetIndex === null) {
      let last = performance.now();
      const tick = (t: number) => {
        const dt = t - last;
        last = t;
        setRotation((r) => r + dt * 0.6);
        tickRef.current = requestAnimationFrame(tick);
      };
      tickRef.current = requestAnimationFrame(tick);
      return () => {
        if (tickRef.current) cancelAnimationFrame(tickRef.current);
      };
    }
  }, [spinning, targetIndex]);

  useEffect(() => {
    if (targetIndex !== null) {
      const finalBase = -targetIndex * segAngle - segAngle / 2;
      const currentMod = ((rotation % 360) + 360) % 360;
      const targetMod = ((finalBase % 360) + 360) % 360;
      const delta = ((targetMod - currentMod) + 360) % 360;
      setRotation(rotation + delta + 360 * 5);
      const id = setTimeout(() => onSpinComplete?.(), 4200);
      return () => clearTimeout(id);
    }
  }, [targetIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const transition =
    targetIndex !== null ? "transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)" : "none";

  return (
    <div className="relative mx-auto w-[min(88vw,460px)] aspect-square">
      <div className="absolute left-1/2 -top-1 z-20 -translate-x-1/2 sm:-top-2" aria-hidden>
        <div
          className="border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-white sm:border-l-[16px] sm:border-r-[16px] sm:border-t-[26px]"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}
        />
      </div>

      <div className="absolute inset-0 rounded-full wheel-glow bg-wheel-navy" />

      <div
        className="absolute inset-2 overflow-hidden rounded-full"
        style={{ transform: `rotate(${rotation}deg)`, transition }}
      >
        <svg viewBox="-100 -100 200 200" className="block h-full w-full">
          {prizes.map((label, i) => {
            const start = (i * segAngle - 90) * (Math.PI / 180);
            const end = ((i + 1) * segAngle - 90) * (Math.PI / 180);
            const mid = (i * segAngle + segAngle / 2 - 90) * (Math.PI / 180);
            const r = 100;
            const x1 = Math.cos(start) * r;
            const y1 = Math.sin(start) * r;
            const x2 = Math.cos(end) * r;
            const y2 = Math.sin(end) * r;
            const d = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
            const textX = Math.cos(mid) * 64;
            const textY = Math.sin(mid) * 64;
            const rawRotation = (mid * 180) / Math.PI + 90;
            const textRotation = rawRotation > 90 && rawRotation < 270 ? rawRotation + 180 : rawRotation;
            const lines = splitPrize(label);
            const fontSize = lines.length >= 3 ? 5.2 : 5.8;
            const lineGap = fontSize + 1.2;
            const startY = -((lines.length - 1) * lineGap) / 2;

            return (
              <g key={`${label}-${i}`}>
                <path
                  d={d}
                  fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  stroke="oklch(0.15 0.04 265)"
                  strokeWidth="0.55"
                />
                <g transform={`translate(${textX} ${textY}) rotate(${textRotation})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={fontSize}
                    fontWeight="800"
                    style={{ letterSpacing: 0 }}
                  >
                    {lines.map((line, lineIndex) => (
                      <tspan key={line} x="0" y={startY + lineIndex * lineGap}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              </g>
            );
          })}
          <circle cx="0" cy="0" r="22" fill="oklch(0.35 0.18 295)" stroke="white" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-[22%] w-[22%] items-center justify-center rounded-full"
          style={{
            background: "oklch(0.35 0.18 295)",
            boxShadow: "0 0 20px oklch(0.5 0.2 295 / 0.6)",
          }}
        >
          <img src={logoUrl} alt="Logo" className="h-3/4 w-3/4 object-contain" />
        </div>
      </div>
    </div>
  );
}
