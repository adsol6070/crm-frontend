import { createContext, useContext, useEffect, ReactNode } from 'react'
import SocketManager from './SocketManager'

const WebSocketContext = createContext<undefined>(undefined)

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
	useEffect(() => {
		const token = localStorage.getItem('access_token')
		if (token) {
			SocketManager.getInstance(token)
		}

		return () => {
			SocketManager.disconnect()
		}
	}, [])

	return (
		<WebSocketContext.Provider value={undefined}>
			{children}
		</WebSocketContext.Provider>
	)
}

export const useWebSocket = () => {
	const context = useContext(WebSocketContext)
	if (context === undefined) {
		throw new Error('useWebSocket must be used within a WebSocketProvider')
	}
	return context
}
