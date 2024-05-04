import { blogApi } from '@/common/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Blog } from '@/types/Blog'
import { toast } from 'react-toastify'

export default function useGetBlogPosts() {
	const [loading, setLoading] = useState(false)
	const [blogPosts, setBlogPosts] = useState<Blog[]>([])

	const navigate = useNavigate()

	const handleDeleteBlog = async (id: string) => {
		await blogApi.deletePost(id)
		const updatedBlogPosts = blogPosts.filter((blog) => blog.id !== id)
		setBlogPosts(updatedBlogPosts)
		toast.success("Blog Deleted Successfully");
	}

	const handleEditBlog = (blogId: string, updatedBlogData: any) => {
		navigate(`/blog/edit/${blogId}`, { state: { updatedBlogData } })
	}
	const handleReadBlog = (blogData: any) => {
		navigate(`/blog/read/`, { state: { blogData } })
	}
	useEffect(() => {
		async function fetchBlogPosts() {
			setLoading(true)
			try {
				const response = await blogApi.getAllPosts()
				// console.log(response)
				const blogWithImages = await Promise.all(
					response.map(async (blog: Blog) => {
						if (blog.blogImage) {
							const imageBlob = await blogApi.getImage(blog.id)
							const imageUrl = URL.createObjectURL(imageBlob)
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
			} finally {
				setLoading(false)
			}
		}

		fetchBlogPosts()
	}, [])

	return { loading, blogPosts, handleReadBlog, handleDeleteBlog, handleEditBlog }
}
