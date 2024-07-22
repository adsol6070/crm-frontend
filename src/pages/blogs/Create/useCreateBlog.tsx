import { blogApi, categoryApi, useAuthContext } from '@/common'
import { BlogCategory } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface BlogDetails {
	title: string
	description: string
	content: string
	category: string
	blogImage: File
}

export default function useCreateBlog() {
	const [loading, setLoading] = useState(false)
	const { user } = useAuthContext()
	const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])

	const createBlog = async (blog: BlogDetails) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('title', blog.title)
			formData.append('description', blog.description)
			formData.append('content', blog.content)
			formData.append('category', blog.category)
			formData.append('uploadType', 'Blog')

			if (blog.blogImage) {
				formData.append('blogImage', blog.blogImage, blog.blogImage.name)
			}
			const data = await blogApi.createPost(formData)
			toast.success(data.message)
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const getCategories = async () => {
			setLoading(true)
			const categoriesData = await categoryApi.getAllCategory()
			const newCategories = categoriesData.map((category: any) => {
				return {
					value: category.category,
					label: category.category,
				}
			})
			setBlogCategories(newCategories)
			setLoading(false)
		}

		getCategories()
	}, [])

	return {
		createBlog,
		loading,
		blogCategories,
	}
}
