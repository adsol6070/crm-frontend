import { HttpClient } from '../helpers'

const authSessionKey = '_ADSOL_AUTH'
const token: string | null = localStorage.getItem(authSessionKey)

function BlogService() {
	return {
		// Create a new blog post
		createPost: (post: any) => {
			const headers = token ? { 
			    'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}` 
			} : {}
			return HttpClient.post('/blog/', post, { headers })
		},

		// Retrieve all blog posts
		getAllPosts: () => {
			const headers = token ? { Authorization: `Bearer ${token}` } : {}
			return HttpClient.get('/blog/', { headers })
		},
		getImage: async (blogId: string) => {
			return await HttpClient.get(`/blog/${blogId}/image`, {
				responseType: 'blob',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		},
		// Retrieve a single blog post by ID
		getPostById: (postId: any) => {
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
			return HttpClient.get(`/blog/posts/${postId}`, { headers })
		},

		// Update an existing blog post
		updatePost: (postId: any, updatedPost: any) => {
            const headers = token ? { 
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}` 
			} : {}
			return HttpClient.patch(`/blog/${postId}`, updatedPost, { headers })
		},

		// Delete a blog post by ID
		deletePost: (postId: any) => {
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
			return HttpClient.delete(`/blog/${postId}`, { headers })
		}
	}
}

export default BlogService()