import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
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
	const rawToken = localStorage.getItem(authSessionKey)
	let initialUser: DecodedToken | undefined

	try {
		initialUser = rawToken ? jwtDecode<DecodedToken>(rawToken) : undefined
	} catch (error) {
		console.error('Failed to decode token:', error)
		initialUser = undefined
	}

	const [user, setUser] = useState<DecodedToken | undefined>(initialUser)

	const saveSession = useCallback(
		(user: Token) => {
			localStorage.setItem(authSessionKey, user.token)
			const decodedToken = jwtDecode<DecodedToken>(user.token)
			setUser(decodedToken)
		},
		[setUser]
	)

	const removeSession = useCallback(() => {
		localStorage.removeItem(authSessionKey)
		setUser(undefined)
	}, [setUser])

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
