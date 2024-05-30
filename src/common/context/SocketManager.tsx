import { io, Socket } from 'socket.io-client'

class SocketManager {
	private static instance: Socket | null = null

	private constructor() {}

	static getInstance(token: string): Socket {
		if (!SocketManager.instance) {
			SocketManager.instance = io('http://127.0.0.1:8000', {
				auth: { token },
			})

			SocketManager.instance.on('connect', () => {
				console.log('Connected to WebSocket server')
				SocketManager.instance?.emit('authenticate')
			})

			SocketManager.instance.on('disconnect', () => {
				console.log('Disconnected from WebSocket server')
			})

			SocketManager.instance.on('error', (error: any) => {
				console.error('WebSocket error:', error)
			})
		} else {
			// Update the token without disconnecting the socket
			SocketManager.instance.auth = { token }
			SocketManager.instance.connect() // Reconnect with the new token
		}

		return SocketManager.instance
	}

	static disconnect() {
		if (SocketManager.instance) {
			console.log('Disconnecting from WebSocket server')
			SocketManager.instance.disconnect()
			SocketManager.instance = null
		}
	}

	static getSocket(): Socket | null {
		return SocketManager.instance
	}

	static updateToken(token: string) {
		if (SocketManager.instance) {
			SocketManager.instance.auth = { token }
			SocketManager.instance.connect() // Reconnect with the new token
		}
	}
}

export default SocketManager
