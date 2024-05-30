import configureFakeBackend from './common/api/fake-backend'
import { AuthProvider, ThemeProvider } from './common/context'
import AllRoutes from './routes/Routes'

import './assets/scss/app.scss'
import './assets/scss/icons.scss'
import { PermissionsProvider } from './common/context/usePermissionsContext'
import './i18n'
import { WebSocketProvider } from './common/context/WebSocketContext'

configureFakeBackend()

function App() {
	return (
		<ThemeProvider>
			<WebSocketProvider>
				<AuthProvider>
					<PermissionsProvider>
						<AllRoutes />
					</PermissionsProvider>
				</AuthProvider>
			</WebSocketProvider>
		</ThemeProvider>
	)
}

export default App
