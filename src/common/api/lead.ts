import { HttpClient } from '../helpers'

const accessTokenKey = 'access_token'

const getAuthHeaders = () => {
	const token: string | null = localStorage.getItem(accessTokenKey)
	let headers: { [key: string]: string } = {}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	return headers
}

function LeadService() {
	return {
		create: async (values: any) => {
			return await HttpClient.post('/lead/', values, {
				headers: getAuthHeaders(),
			})
		},
		get: async () => {
			return await HttpClient.get('/lead/', {
				headers: getAuthHeaders(),
			})
		},
		update: async (values: any, leadId?: string) => {
			const data = await HttpClient.patch(`/lead/${leadId}`, values, {
				headers: getAuthHeaders(),
			})                             
			return data
		},
		delete: async (leadId: string) => {
			return await HttpClient.delete(`/lead/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default LeadService()
