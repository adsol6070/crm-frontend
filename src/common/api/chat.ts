import { HttpClient } from '../helpers'

const accessTokenKey = 'access_token'

const getAuthHeaders = (isMultipart: boolean = false) => {
	const token: string | null = localStorage.getItem(accessTokenKey)
	let headers: { [key: string]: string } = {}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	if (isMultipart) {
		headers['Content-Type'] = 'multipart/form-data'
	}

	return headers
}

function ChatService() {
	return {
		uploadGroupImage: (values: any) => {
			return HttpClient.post('/chat/groupImage', values, {
				headers: getAuthHeaders(true),
			})
		},
		getGroupImage: async (groupId: string) => {
			return await HttpClient.get(`/chat/groupImage/${groupId}`, {
				responseType: 'blob',
				headers: getAuthHeaders(),
			})
		},
	}
}

export default ChatService()
