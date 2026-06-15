/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ["10.153.78.236", "localhost"],
};

export default nextConfig;
