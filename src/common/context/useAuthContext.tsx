import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useEffect,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken, Token } from '@/types'

const AuthContext = createContext<any>({})

export function useAuthContext() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider')
	}
	return context
}

const authSessionKey = '_ADSOL_AUTH'

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<DecodedToken | undefined>()

	useEffect(() => {
		const rawToken = localStorage.getItem(authSessionKey)
		if (rawToken) {
			try {
				const decodedToken = jwtDecode<DecodedToken>(rawToken)
				setUser(decodedToken)
				setupAutoLogout(decodedToken.exp)
			} catch (error) {
				console.error('Failed to decode token:', error)
			}
		}
	}, [])

	const removeSession = useCallback(() => {
		localStorage.removeItem(authSessionKey)
		setUser(undefined)
	}, [setUser])

	const setupAutoLogout = useCallback(
		(exp: number) => {
			const currentTime = Date.now() / 1000
			const delay = (exp - currentTime) * 1000

			if (delay < 0) {
				removeSession()
			} else {
				setTimeout(() => {
					removeSession()
				}, delay)
			}
		},
		[removeSession]
	)

	const saveSession = useCallback(
		(user: Token) => {
			localStorage.setItem(authSessionKey, user.token)
			const decodedToken = jwtDecode<DecodedToken>(user.token)
			setUser(decodedToken)
			setupAutoLogout(decodedToken.exp)
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
