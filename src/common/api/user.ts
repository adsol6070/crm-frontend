import { HttpClient } from '../helpers'

function UserService() {
	const authSessionKey = '_ADSOL_AUTH'
	const token: string | null = localStorage.getItem(authSessionKey)

	return {
		create: async (values: any) => {
			return await HttpClient.post('/users/', values, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`,
				},
			})
		},
		get: async () => {
			return await HttpClient.get('/users/', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		},
		getImage: async (userId: string) => {
			return await HttpClient.get(`/users/${userId}/image`, {
				responseType: 'blob',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		},
		update: async (values: any) => {
			const data = await HttpClient.post('/users/', values, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			return data
		},
		delete: async (userId: string) => {
			return await HttpClient.delete(`/users/${userId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		},
	}
}

export default UserService()
