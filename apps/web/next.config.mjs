import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local S3 + Cloudflare Stream stand-ins (backend docker-compose); dev only.
      ...(process.env.NODE_ENV === "development"
        ? [
            { protocol: "http", hostname: "localhost", port: "7070" },
            { protocol: "http", hostname: "localhost", port: "7071" },
          ]
        : []),
      {
        protocol: "https",
        hostname: "cdn.mypickuae.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestream.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
