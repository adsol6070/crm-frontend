import { HttpClient } from '../helpers'

const authSessionKey = '_ADSOL_AUTH'

const getAuthHeaders = (isMultipart: boolean = false) => {
	const token: string | null = localStorage.getItem(authSessionKey)
	let headers: { [key: string]: string } = {}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	if (isMultipart) {
		headers['Content-Type'] = 'multipart/form-data'
	}

	return headers
}

function VisaCategoryService() {
	return {
		createVisaCategory: (categoryData: any) => {
			return HttpClient.post('/lead/visaCategory', categoryData, { headers: getAuthHeaders() })
		},

		getAllVisaCategory: (tenantID: any) => {
			return HttpClient.post('/lead/getVisaCategory', tenantID)
		},

		getAllCategory: () => {
			return HttpClient.get('/lead/visaCategory', { headers: getAuthHeaders() })
		},

		getCategoryById: (visaCategoryId: string) => {
			return HttpClient.get(`/lead/visaCategory/${visaCategoryId}`, {
				headers: getAuthHeaders(),
			})
		},

		updateCategory: (visaCategoryId: any, updatedVisaCategory: any) => {
			return HttpClient.patch(`/lead/visaCategory/${visaCategoryId}`, updatedVisaCategory, {
				headers: getAuthHeaders(),
			})
		},

		deleteCategory: (visaCategoryId: string) => {
			return HttpClient.delete(`/lead/visaCategory/${visaCategoryId}`, { headers: getAuthHeaders() })
		},

		deleteSelectedVisaCategories: async (values: any) => {
			return await HttpClient.post('/lead/deleteSelectedCategories', values, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default VisaCategoryService()
