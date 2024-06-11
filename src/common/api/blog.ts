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

function BlogService() {
	return {
		// Create a new blog post
		createPost: (post: any) => {
			return HttpClient.post('/blog/', post, { headers: getAuthHeaders(true) })
		},

		// Retrieve all blog posts
		getAllPosts: () => {
			return HttpClient.get('/blog/', { headers: getAuthHeaders() })
		},

		// Retrieve an image for a blog post
		getImage: async (blogId: string) => {
			return await HttpClient.get(`/blog/${blogId}/image`, {
				responseType: 'blob',
				headers: getAuthHeaders(),
			})
		},
																				
		// Retrieve a single blog post by ID
		getPostById: (postId: string) => {
			return HttpClient.get(`/blog/${postId}`, {
				headers: getAuthHeaders(),
			})
		},

		// Update an existing blog post
		updatePost: (postId: any, updatedPost: any) => {
			return HttpClient.patch(`/blog/${postId}`, updatedPost, {
				headers: getAuthHeaders(true),
			})
		},

		// Delete a blog post by ID
		deletePost: (postId: string) => {
			return HttpClient.delete(`/blog/${postId}`, { headers: getAuthHeaders() })
		},
	}
}

export default BlogService()
