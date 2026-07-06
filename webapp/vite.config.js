import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { readFileSync } from "fs"

// Leggi la versione dal package.json
const packageJson = JSON.parse(readFileSync("./package.json", "utf8"))

// Il frontend è servito alla root di CloudFront → base '/'
// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [react(), tailwindcss()],
	build: {
		outDir: "build",
	},
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	},
})
