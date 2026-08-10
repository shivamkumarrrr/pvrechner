import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PVGIS (re.jrc.ec.europa.eu) sends no Access-Control-Allow-Origin header,
// so a direct browser fetch() is CORS-blocked (confirmed via real browser
// testing, Aug 2026). In production this is proxied through api/pvgis.js
// (Vercel serverless function, same-origin). This dev proxy mirrors that so
// `npm run dev` also gets real PVGIS data instead of always falling back to
// the location-independent estimate.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pvgis': {
        target: 'https://re.jrc.ec.europa.eu',
        changeOrigin: true,
        rewrite: (path) => {
          const query = path.split('?')[1] || '';
          const params = new URLSearchParams(query);
          const forward = new URLSearchParams({
            lat: params.get('lat') ?? '',
            lon: params.get('lon') ?? '',
            peakpower: params.get('peakpower') ?? '1',
            loss: params.get('loss') ?? '14',
            angle: params.get('angle') ?? '30',
            aspect: params.get('aspect') ?? '0',
            outputformat: 'json',
          });
          return `/api/v5_2/PVcalc?${forward.toString()}`;
        },
      },
    },
  },
})
