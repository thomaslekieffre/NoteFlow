/** @type {import('next').NextConfig} */
const nextConfig = {};
const { withClerkMiddleware } = require("@clerk/nextjs/middleware");

module.exports = withClerkMiddleware({
  // Vos autres configurations Next.js
});

module.exports = nextConfig;
