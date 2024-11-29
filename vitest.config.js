import { defineConfig } from 'vitest/config'
import codspeedPlugin from "@codspeed/vitest-plugin";

export default defineConfig({
    plugins: [codspeedPlugin()],
    test: {
        coverage: {
            reporter: ['text', 'json-summary', 'json', 'cobertura'],
            provider: 'v8'
        },
    },
})
