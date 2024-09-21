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

function ScoreService() {
	return {
		// Create a new score 
		createScore: (data: any) => {
			return HttpClient.post('/CRSScore/', data, { headers: getAuthHeaders() })
		},

        // Retrieve all results
		getAllResults: () => {
			return HttpClient.get('/CRSScore/', { headers: getAuthHeaders() })
		},

        // Retrieve single results
		getResultById: (scoreId: string) => {
			return HttpClient.get(`/CRSScore/${scoreId}`, { headers: getAuthHeaders() })
		},

        // Retrieve single results
		deleteResultById: (scoreId: string) => {
			return HttpClient.delete(`/CRSScore/${scoreId}`, { headers: getAuthHeaders() })
		},

		deleteAllResult: (userId: string) => {
			return HttpClient.delete(`/CRSScore/deleteAll/${userId}`, { headers: getAuthHeaders() })
		},

		deleteSelectedScores: async (values: any) => {
			return await HttpClient.post('/CRSScore/deleteSelected', values, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default ScoreService()
