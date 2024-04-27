import { blogApi, useAuthContext } from '@/common'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateBlog() {
	const [loading, setLoading] = useState(false)
	const { user } = useAuthContext()

	const createBlog = async ({
		title,
		content,
		category,
		blogImage,
	}: {
		title: string
		content: string
		category: string
		blogImage: File
	}) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('title', title)
			formData.append('content', content)
			formData.append('category', category)

			if (blogImage) {
				formData.append('blogImage', blogImage, blogImage.name)
			}
			const data = await blogApi.createPost(formData)
			toast.success(data.message)
		} catch (error) {
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	return {
		createBlog,
		loading,
	}
}
