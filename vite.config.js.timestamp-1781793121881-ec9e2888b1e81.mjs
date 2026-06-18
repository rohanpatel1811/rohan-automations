// vite.config.js
import { defineConfig } from "file:///sessions/keen-admiring-albattani/mnt/outputs/rohan-automations/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/keen-admiring-albattani/mnt/outputs/rohan-automations/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["three", "gsap", "framer-motion"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "three": ["three"],
          "gsap": ["gsap"],
          "framer-motion": ["framer-motion"],
          "calcom": ["@calcom/embed-react"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMva2Vlbi1hZG1pcmluZy1hbGJhdHRhbmkvbW50L291dHB1dHMvcm9oYW4tYXV0b21hdGlvbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9rZWVuLWFkbWlyaW5nLWFsYmF0dGFuaS9tbnQvb3V0cHV0cy9yb2hhbi1hdXRvbWF0aW9ucy92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMva2Vlbi1hZG1pcmluZy1hbGJhdHRhbmkvbW50L291dHB1dHMvcm9oYW4tYXV0b21hdGlvbnMvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsndGhyZWUnLCAnZ3NhcCcsICdmcmFtZXItbW90aW9uJ10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICd0aHJlZSc6ICAgICAgICAgWyd0aHJlZSddLFxuICAgICAgICAgICdnc2FwJzogICAgICAgICAgWydnc2FwJ10sXG4gICAgICAgICAgJ2ZyYW1lci1tb3Rpb24nOiBbJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICAgICAgICAnY2FsY29tJzogICAgICAgIFsnQGNhbGNvbS9lbWJlZC1yZWFjdCddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1csU0FBUyxvQkFBb0I7QUFDNVksT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxRQUFRLGVBQWU7QUFBQSxFQUM1QztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osU0FBaUIsQ0FBQyxPQUFPO0FBQUEsVUFDekIsUUFBaUIsQ0FBQyxNQUFNO0FBQUEsVUFDeEIsaUJBQWlCLENBQUMsZUFBZTtBQUFBLFVBQ2pDLFVBQWlCLENBQUMscUJBQXFCO0FBQUEsUUFDekM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
