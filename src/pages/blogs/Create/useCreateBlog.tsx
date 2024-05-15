import { blogApi, categoryApi, useAuthContext } from '@/common'
import { BlogCategory } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateBlog() {
	const [loading, setLoading] = useState(false)
	const { user } = useAuthContext()
	const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])
	const createBlog = async ({
		title,
		description,
		content,
		category,
		blogImage,
	}: {
		title: string
		description: string
		content: string
		category: string
		blogImage: File
	}) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('title', title)
			formData.append('description', description)
			formData.append('content', content)
			formData.append('category', category)
			formData.append('uploadType', "Blog")

			if (blogImage) {
				formData.append('blogImage', blogImage, blogImage.name)
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
			const categoriesData = await categoryApi.getAllCategory();
			const newCategories = categoriesData.map((category: any) => {
				return {
					value: category.category,
					label: category.category
				}
			})
			setBlogCategories(newCategories);
			setLoading(false)
		}

		getCategories()
	}, [])

	return {
		createBlog,
		loading,
		blogCategories
	}
}
