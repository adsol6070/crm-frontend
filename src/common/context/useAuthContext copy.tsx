import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useEffect,
	useRef,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken, Token } from '@/types'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { authApi } from '../api'

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
	const rawAccessToken = localStorage.getItem(accessTokenKey)
	const rawRefreshToken = localStorage.getItem(refreshTokenKey)
	const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
	const alertTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)

	let initialUser: DecodedToken | undefined

	try {
		initialUser = rawAccessToken
			? jwtDecode<DecodedToken>(rawAccessToken)
			: undefined
	} catch (error) {
		console.error('Failed to decode token:', error)
		initialUser = undefined
	}

	const [user, setUser] = useState<DecodedToken | undefined>(initialUser)

	useEffect(() => {
		if (rawRefreshToken) {
			try {
				const decodedRefreshToken = jwtDecode<DecodedToken>(rawRefreshToken)
				setupAutoLogout(decodedRefreshToken.exp)
			} catch (error) {
				console.error('Failed to decode token:', error)
				localStorage.removeItem(refreshTokenKey)
			}
		}
	}, [rawRefreshToken])

	const removeSession = useCallback(async () => {
		if (timeoutIdRef.current) {
			clearTimeout(timeoutIdRef.current)
			timeoutIdRef.current = null
		}
		if (alertTimeoutIdRef.current) {
			clearTimeout(alertTimeoutIdRef.current)
			alertTimeoutIdRef.current = null
		}

		const refreshToken = localStorage.getItem(refreshTokenKey)
		if (refreshToken) {
			await authApi.logout({
				tenantID: 'f9538438-4fc7-45f7-a07d-1c6248cee47f',
				refreshToken,
			})
		}
		localStorage.removeItem(accessTokenKey)
		localStorage.removeItem(refreshTokenKey)
		setUser(undefined)
	}, [setUser])

	const setupAutoLogout = useCallback(
		(exp: number) => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current)
				timeoutIdRef.current = null
			}
			if (alertTimeoutIdRef.current) {
				clearTimeout(alertTimeoutIdRef.current)
				alertTimeoutIdRef.current = null
			}

			const currentTime = Date.now() / 1000
			const delay = (exp - currentTime) * 1000

			if (delay < 0) {
				removeSession()
			} else {
				if (delay > 5000) {
					alertTimeoutIdRef.current = setTimeout(() => {
						MySwal.fire({
							title: 'Session Expiring Soon!',
							text: 'Your session will expire in 5 seconds.',
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
		},
		[removeSession]
	)

	const saveSession = useCallback(
		({ accessToken, refreshToken }: Token) => {
			localStorage.setItem(accessTokenKey, accessToken)
			localStorage.setItem(refreshTokenKey, refreshToken)
			const decodedAccessToken = jwtDecode<DecodedToken>(accessToken)
			setUser(decodedAccessToken)
			setupAutoLogout(jwtDecode<DecodedToken>(refreshToken).exp)
		},
		[setUser, setupAutoLogout]
	)

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: Boolean(user),
				saveSession,
				removeSession,
			}}>
			{children}
		</AuthContext.Provider>
	)
}
