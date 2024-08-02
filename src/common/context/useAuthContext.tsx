import { createContext, useContext, useState, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken, Token } from '@/types'
import { authApi } from '../api'
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

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<DecodedToken | undefined>(() => {
		const token = localStorage.getItem(accessTokenKey)
		return token ? jwtDecode<DecodedToken>(token) : undefined
	})

	const removeSession = async () => {
		const accessToken = localStorage.getItem(accessTokenKey)
		if (!accessToken) {
			return
		}

		try {
			await authApi.logout({
				tenantID: user?.tenantID,
				user: user?.sub,
			})
		} catch (error) {
			console.error('Logout failed:', error)
		}

		localStorage.removeItem(accessTokenKey)
		setUser(undefined)

		const socket = SocketManager.getSocket()
		socket?.emit('logout')

		SocketManager.disconnect()
	}

	const saveSession = ({ accessToken }: Token) => {
		localStorage.setItem(accessTokenKey, accessToken)
		const decodedAccessToken = jwtDecode<DecodedToken>(accessToken)
		setUser(decodedAccessToken)
		SocketManager.getInstance(accessToken)
	}

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
