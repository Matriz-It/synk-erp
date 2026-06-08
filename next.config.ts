import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Cacheia respostas de fetch em Server Components durante HMR.
    // Sem isso, cada mudança de código refaz TODAS as chamadas à API,
    // tornando o HMR lento e forçando rebuilds manuais.
    serverComponentsHmrCache: true,
  },
};

export default nextConfig;
