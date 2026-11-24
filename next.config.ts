import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Увімкнено шаблоном create-next-app 16.4. Остаточне рішення — TD-9 у docs/TECHNICAL_PLAN.md §18 (до дня 3).
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
