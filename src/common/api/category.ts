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
		// Create a new blog post
		createBlogCategory: (categoryData: any) => {
			return HttpClient.post('/blog/blogCategory', categoryData, { headers: getAuthHeaders() })
		},

		// Retrieve all blog posts
		getAllCategory: () => {
			return HttpClient.get('/blog/blogCategory', { headers: getAuthHeaders() })
		},

		// Retrieve a single blog Category post by ID
		getCategoryById: (blogCategoryId: string) => {
			return HttpClient.get(`/blog/blogCategory/${blogCategoryId}`, {
				headers: getAuthHeaders(),
			})
		},

		// Update an existing blog post
		updateCategory: (blogCategoryId: any, updatedBlogCategory: any) => {
			return HttpClient.patch(`/blog/blogCategory/${blogCategoryId}`, updatedBlogCategory, {
				headers: getAuthHeaders(),
			})
		},

		// Delete a blog post by ID
		deleteCategory: (blogCategoryId: string) => {
			return HttpClient.delete(`/blog/blogCategory/${blogCategoryId}`, { headers: getAuthHeaders() })
		},
	}
}

export default CategoryService()
