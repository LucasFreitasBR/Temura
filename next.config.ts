import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', images: { unoptimized: true }, poweredByHeader: false, experimental: { useTypeScriptCli: false, workerThreads: true, cpus: 2, webpackBuildWorker: false } };
export default config;

