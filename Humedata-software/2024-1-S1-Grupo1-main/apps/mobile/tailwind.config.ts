import type { Config } from "tailwindcss"
// @ts-expect-error - no types
import nativewind from "nativewind/preset"
import baseConfig from "@repo/ui/tailwind.config"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig, nativewind],
} satisfies Config