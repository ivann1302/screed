import type { SVGProps } from 'react';

/**
 * Мастерок / шпатель для стяжки.
 * Lucide-style outline: stroke-only, currentColor, viewBox 24x24.
 */
export function Trowel(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Лезвие — треугольник */}
      <path d="M3 19 L14 8 L20 8 L20 14 L9 19 Z" />
      {/* Соединение лезвия с ручкой */}
      <path d="M15 7 L18 4" />
      {/* Ручка (короткий прямоугольник) */}
      <path d="M18 4 L20 2 L22 4 L20 6 Z" />
    </svg>
  );
}
