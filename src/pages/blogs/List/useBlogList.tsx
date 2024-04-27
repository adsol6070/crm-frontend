import { blogApi } from '@/common/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Blog } from '@/types/Blog'

export default function useGetBlogPosts() {
	const [loading, setLoading] = useState(false)
	const [blogPosts, setBlogPosts] = useState<Blog[]>([])

	const navigate = useNavigate()

	const handleDeleteBlog = async (id: string) => {
		await blogApi.deletePost(id)
		const updatedBlogPosts = blogPosts.filter((blog) => blog.id !== id)
		setBlogPosts(updatedBlogPosts)
	}

	const handleEditBlog = async (id: string, updatedBlogData: Partial<Blog>) => {
		try {
			await blogApi.updatePost(id, updatedBlogData)
			const updatedBlogPosts = blogPosts.map((blog) => {
				if (blog.id === id) {
					return { ...blog, ...updatedBlogData }
				}
				return blog
			})
			setBlogPosts(updatedBlogPosts)
			navigate(`/blog/${id}`)
		} catch (error) {
			console.error('Error updating blog post:', error)
			// Handle error
		}
	}
	useEffect(() => {
		async function fetchBlogPosts() {
			setLoading(true)
			try {
				const response = await blogApi.getAllPosts()
				const blogWithImages = await Promise.all(
					response.map(async (blog: Blog) => {
						if (blog.blogImage) {
							const imageBlob = await blogApi.getImage(blog.id)
							const imageUrl = URL.createObjectURL(imageBlob)
							console.log(imageUrl)
							return { ...blog, blogImage: imageUrl }
						} else {
							const placeholderImageUrl = ''
							return { ...blog, blogImage: placeholderImageUrl }
						}
					})
				)
				setBlogPosts(blogWithImages)
				// setBlogPosts(response as any)
			} catch (error) {
				console.error('Error fetching blog posts:', error)
				navigate('/error')
			} finally {
				setLoading(false)
			}
		}

		fetchBlogPosts()
	}, [])

	return { loading, blogPosts, handleDeleteBlog, handleEditBlog }
}
