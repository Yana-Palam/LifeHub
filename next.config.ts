import type { NextConfig } from "next";

// cacheComponents і partialPrefetching свідомо вимкнені (не задані): класичний динамічний рендеринг.
// Рішення TD-9 — docs/decisions/0001-disable-cache-components.md.
const nextConfig: NextConfig = {};

export default nextConfig;
