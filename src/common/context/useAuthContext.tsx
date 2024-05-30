import {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken, Token } from '@/types'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { authApi } from '../api'
import { useLocation } from 'react-router-dom'
import SocketManager from './SocketManager'

const AuthContext = createContext<any>({})

export function useAuthContext() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider')
	}
	return context
}

const accessTokenKey = 'access_token'
const refreshTokenKey = 'refresh_token'

const MySwal = withReactContent(Swal)

export function AuthProvider({ children }: { children: ReactNode }) {
	const location = useLocation()
	const [user, setUser] = useState<DecodedToken | undefined>(() => {
		const token = localStorage.getItem(accessTokenKey)
		return token ? jwtDecode<DecodedToken>(token) : undefined
	})

	const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
	const alertTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)

	const checkAndSetupTokenExpiration = () => {
		const refreshToken = localStorage.getItem(refreshTokenKey)
		if (refreshToken) {
			const decodedRefreshToken = jwtDecode<DecodedToken>(refreshToken)
			setupAutoLogout(decodedRefreshToken.exp)
			const accessToken = localStorage.getItem(accessTokenKey)
			if (accessToken) {
				const decodedAccessToken = jwtDecode<DecodedToken>(accessToken)
				setUser(decodedAccessToken)
				SocketManager.updateToken(accessToken)
			}
		} else {
			setUser(undefined)
		}
	}

	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === accessTokenKey || event.key === refreshTokenKey) {
				checkAndSetupTokenExpiration()
			}
		}

		window.addEventListener('storage', handleStorageChange)

		checkAndSetupTokenExpiration()

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
			if (alertTimeoutIdRef.current) clearTimeout(alertTimeoutIdRef.current)
		}
	}, [location])

	const removeSession = async () => {
		const refreshToken = localStorage.getItem(refreshTokenKey)
		if (!refreshToken) {
			return
		}
		if (refreshToken) {
			try {
				await authApi.logout({
					refreshToken,
				})
			} catch (error) {
				console.error('Logout failed:', error)
			}
		}
		localStorage.removeItem(accessTokenKey)
		localStorage.removeItem(refreshTokenKey)
		setUser(undefined)

		const socket = SocketManager.getSocket()
		socket?.emit('logout')

		SocketManager.disconnect()
		if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
		if (alertTimeoutIdRef.current) clearTimeout(alertTimeoutIdRef.current)
	}

	const setupAutoLogout = (exp: number) => {
		if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
		if (alertTimeoutIdRef.current) clearTimeout(alertTimeoutIdRef.current)

		const currentTime = Date.now() / 1000
		const delay = (exp - currentTime) * 1000

		if (delay < 0) {
			removeSession()
		} else {
			if (delay > 5000) {
				alertTimeoutIdRef.current = setTimeout(() => {
					MySwal.fire({
						title: 'Session Expiring Soon!',
						text: 'Your session will expire in 5 seconds. Please refresh your session to continue.',
						icon: 'warning',
						timer: 5000,
						willClose: () => {
							removeSession()
						},
					})
				}, delay - 5000)
			}

			timeoutIdRef.current = setTimeout(() => {
				removeSession()
			}, delay)
		}
	}

	const saveSession = ({ accessToken, refreshToken }: Token) => {
		localStorage.setItem(accessTokenKey, accessToken)
		localStorage.setItem(refreshTokenKey, refreshToken)
		const decodedAccessToken = jwtDecode<DecodedToken>(accessToken)
		setUser(decodedAccessToken)
		setupAutoLogout(jwtDecode<DecodedToken>(refreshToken).exp)
		SocketManager.getInstance(accessToken)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: Boolean(user),
				setupAutoLogout,
				saveSession,
				removeSession,
			}}>
			{children}
		</AuthContext.Provider>
	)
}
