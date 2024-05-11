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

function UserService() {
	return {
		create: async (values: any) => {
			return await HttpClient.post('/users/', values, {
				headers: getAuthHeaders(true),
			})
		},
		get: async () => {
			return await HttpClient.get('/users/', {
				headers: getAuthHeaders(),
			})
		},
		getImage: async (userId: string) => {
			return await HttpClient.get(`/users/${userId}/image`, {
				responseType: 'blob',
				headers: getAuthHeaders(),
			})
		},
		update: async (values: any, userId?: string) => {
			const data = await HttpClient.patch(`/users/${userId}`, values, {
				headers: getAuthHeaders(true),
			})
			return data
		},
		delete: async (userId: string) => {
			return await HttpClient.delete(`/users/${userId}`, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default UserService()
