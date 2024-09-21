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

function CategoryService() {
	return {
		createBlogCategory: (categoryData: any) => {
			return HttpClient.post('/blog/blogCategory', categoryData, { headers: getAuthHeaders() })
		},

		getAllCategory: () => {
			return HttpClient.get('/blog/blogCategory', { headers: getAuthHeaders() })
		},

		getCategoryById: (blogCategoryId: string) => {
			return HttpClient.get(`/blog/blogCategory/${blogCategoryId}`, {
				headers: getAuthHeaders(),
			})
		},

		updateCategory: (blogCategoryId: any, updatedBlogCategory: any) => {
			return HttpClient.patch(`/blog/blogCategory/${blogCategoryId}`, updatedBlogCategory, {
				headers: getAuthHeaders(),
			})
		},

		deleteCategory: (blogCategoryId: string) => {
			return HttpClient.delete(`/blog/blogCategory/${blogCategoryId}`, { headers: getAuthHeaders() })
		},

		deleteSelectedBlogCategories: async (values: any) => {
			return await HttpClient.post('/blog/deleteSelected', values, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default CategoryService()
