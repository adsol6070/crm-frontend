import { userApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateUser() {
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, user } = useAuthContext()

	const createUser = async ({
		firstname,
		lastname,
		email,
		password,
		phone,
		profileImage,
		role,
	}: {
		firstname: string
		lastname: string
		email: string
		password: string
		phone: string
		profileImage: File
		role: string
	}) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('firstname', firstname)
			formData.append('lastname', lastname)
			formData.append('email', email)
			formData.append('password', password)
			formData.append('phone', phone)
			formData.append('role', role)
			formData.append('uploadType', 'User')

			if (profileImage) {
				formData.append('profileImage', profileImage, profileImage.name)
			}

			const data = await userApi.create(formData)
			toast.success(data.message)
		} catch (error: any) {
			if (error == 'Email already taken') {
				toast.error(error)
			}
		} finally {
			setLoading(false)
		}
	}

	return { loading, createUser, isAuthenticated }
}
