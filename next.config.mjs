import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./app/i18n/index.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "replicate.delivery",
      "replicate.com",
      "rnunjaermsbpyjryeikl.supabase.co",
    ],
  },
};

export default withNextIntl(nextConfig);
