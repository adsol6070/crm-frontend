// hooks/useReadBlog.js
import { useEffect, useState } from 'react'
import { blogApi } from '@/common' // Ensure this path is correct

interface BlogData {
	id: string
	title: string
	content: string
	description: string
	category: string
	categories?: string[]
	blogImage?: string
	created_at: string
}

const useReadBlog = (blogId: string) => {
	const [blogData, setBlogData] = useState<BlogData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchBlogPostAndImage = async () => {
			try {
				const data = (await blogApi.getPostById(blogId)) as BlogData
				if (data) {
					if (data.blogImage === null) {
						setBlogData({ ...data, blogImage: '/images/blog-placeholder.jpg' })
					} else {
						const imageUrl = await blogApi.getImage(blogId)
						const image = URL.createObjectURL(imageUrl)
						setBlogData({ ...data, blogImage: image })
					}
				}
				setLoading(false)
			} catch (err) {
				console.error('Failed to fetch blog post or image:', err)
				setError('Failed to load the blog post.')
				setLoading(false)
			}
		}

		if (blogId) {
			fetchBlogPostAndImage()
		} else {
			setError('Blog ID is missing.')
			setLoading(false)
		}
	}, [blogId])

	return { blogData, loading, error }
}

export default useReadBlog
