import type { Config } from "tailwindcss"
import baseConfig from "@repo/ui/tailwind.config"

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...baseConfig.theme.extend.colors,
      },
    },
  },
  variants: {},
  plugins: [],
  presets: [baseConfig],
} satisfies Config