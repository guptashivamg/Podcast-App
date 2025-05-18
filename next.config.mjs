/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        // Enable ESLint
        ignoreDuringBuilds: true, // Ignore ESLint during production builds
        dirs: ['app', 'components'], // Specify the directories to lint
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'elated-bloodhound-151.convex.cloud'
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com'
            },
        ]
    }
};

export default nextConfig;
