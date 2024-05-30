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
		// Create a new blog post
		createVisaCategory: (categoryData: any) => {
			return HttpClient.post('/lead/visaCategory', categoryData, { headers: getAuthHeaders() })
		},

		// Retrieve all blog posts
		getAllCategory: () => {
			return HttpClient.get('/lead/visaCategory', { headers: getAuthHeaders() })
		},

		// Retrieve a single blog Category post by ID
		getCategoryById: (visaCategoryId: string) => {
			return HttpClient.get(`/lead/visaCategory/${visaCategoryId}`, {
				headers: getAuthHeaders(),
			})
		},

		// Update an existing blog post
		updateCategory: (visaCategoryId: any, updatedVisaCategory: any) => {
			return HttpClient.patch(`/lead/visaCategory/${visaCategoryId}`, updatedVisaCategory, {
				headers: getAuthHeaders(),
			})
		},

		// Delete a blog post by ID
		deleteCategory: (visaCategoryId: string) => {
			return HttpClient.delete(`/lead/visaCategory/${visaCategoryId}`, { headers: getAuthHeaders() })
		},
	}
}

export default VisaCategoryService()
