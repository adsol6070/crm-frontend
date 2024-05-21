import { blogApi, useAuthContext } from '@/common'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useEditBlog() {
	const [loading, setLoading] = useState(false)
	const { user } = useAuthContext()

	const editBlog = async (
		{
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
		},
		blogId?: string
	) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('title', title)
			formData.append('description', description)
			formData.append('content', content)
			formData.append('category', category)
			formData.append('uploadType', 'Blog')

			if (blogImage) {
				formData.append('blogImage', blogImage, blogImage.name)
			}
			const data = await blogApi.updatePost(blogId, formData)
			toast.success(data.message)
		} catch (error) {
			toast.error('Blog not updated')
		} finally {
			setLoading(false)
		}
	}

	return {
		editBlog,
		loading,
	}
}
