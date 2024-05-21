import configureFakeBackend from './common/api/fake-backend'
import { AuthProvider, ThemeProvider } from './common/context'
import AllRoutes from './routes/Routes'

import './assets/scss/app.scss'
import './assets/scss/icons.scss'
import { PermissionsProvider } from './common/context/usePermissionsContext'
import './i18n'

configureFakeBackend()

function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<PermissionsProvider>
					<AllRoutes />
				</PermissionsProvider>
			</AuthProvider>
		</ThemeProvider>
	)
}

export default App
