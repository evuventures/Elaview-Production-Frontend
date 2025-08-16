import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { compression } from 'vite-plugin-compression2'
import { constants } from 'zlib'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
     
  return {
    plugins: [
      react(),
      // ✅ COMPRESSION: Add gzip and brotli compression 
      // NOTE: Enable in development for testing, but it will slow down builds
      compression({
        algorithms: ['gzip', 'brotliCompress'],
        // Only compress files larger than 1KB (Railway/CDN best practice)
        threshold: 1000,
        // Don't compress already compressed files
        exclude: [/\.(br|gz|7z|rar|zip|bz2)$/],
        // Show compression stats in console
        verbose: true,
        // ✅ CONSOLE LOG: Show which mode we're in
        ...(mode === 'development' && console.log('🔄 DEVELOPMENT: Compression enabled (slower builds)')),
        // Gzip configuration
        gzipOptions: {
          level: mode === 'production' ? 9 : 6, // Lower compression in dev for speed
        },
        // Brotli configuration - ✅ FIXED: Use ES module import
        brotliOptions: {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: mode === 'production' ? 11 : 8, // Lower quality in dev for speed
            [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          },
        },
      })
    ],
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      allowedHosts: true,
      // ✅ NEW: Proxy API requests to backend
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 Proxying API request:', req.url, '→', `${env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${req.url}`);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ Backend response:', req.url, 'Status:', proxyRes.statusCode);
            });
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@dev': path.resolve(__dirname, './src/dev'),
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    // ✅ ENHANCED: Production build optimizations
    build: {
      // Enable source maps only in development for debugging
      sourcemap: mode === 'development',
      // Use esbuild for faster, smaller builds
      minify: 'esbuild',
      // Target modern browsers for smaller bundles
      target: 'esnext',
      // Enable chunk splitting for better caching
      rollupOptions: {
        output: {
          // ✅ ENHANCED: More aggressive chunk splitting for better caching
          manualChunks: {
            // Core React libraries
            'vendor-react': ['react', 'react-dom'],
            // Router as separate chunk (lazy loading friendly)
            'vendor-router': ['react-router-dom'],
            // Authentication chunk
            'vendor-clerk': ['@clerk/clerk-react'],
            // Icons chunk (often lazy loaded)
            'vendor-icons': ['lucide-react'],
            // All Radix UI components (you have many of these)
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-popover',
              '@radix-ui/react-tooltip'
            ],
            // Form handling chunk
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Maps and heavy libraries
            'vendor-maps': ['@react-google-maps/api', '@vis.gl/react-google-maps'],
            // Animation libraries (can be lazy loaded)
            'vendor-animation': ['framer-motion'],
            // Charts and data visualization (often conditional)
            'vendor-charts': ['recharts'],
            // Utility libraries
            'vendor-utils': ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
          },
          // ✅ CONSOLE LOG: Log chunk info for verification
          chunkFileNames: (chunkInfo) => {
            console.log(`📦 Building chunk: ${chunkInfo.name}`);
            return 'assets/[name]-[hash].js';
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        }
      },
      // ✅ CONSOLE LOG: Enable build reporting
      reportCompressedSize: true,
      // Increase chunk size warning limit (default is 500kb)
      chunkSizeWarningLimit: 1000,
    }
  }
})