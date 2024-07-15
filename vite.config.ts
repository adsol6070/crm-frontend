import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		base: '/',
		plugins: [react()],
		define: {
			'process.env': {
				...process.env,
				VITE_API_URL: env.VITE_API_URL,
        VITE_SOCKET_URL: env.VITE_SOCKET_URL
			},
			global: 'window',
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
	}
})
