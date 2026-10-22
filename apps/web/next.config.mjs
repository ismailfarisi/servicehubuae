import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Local S3 + Cloudflare Stream stand-ins (backend docker-compose) serve media from
// localhost. Allowed under `next dev` and `bun run prod:local` (LOCAL_MEDIA=1),
// never in a deployed build. Next 16 also refuses to optimise images from local
// IPs unless dangerouslyAllowLocalIP is set.
const localMedia =
  process.env.NODE_ENV === "development" || process.env.LOCAL_MEDIA === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: localMedia,
    remotePatterns: [
      ...(localMedia
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
