import { authApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useRegister() {
	const [loading, setLoading] = useState(false)

	const navigate = useNavigate()

	const { isAuthenticated } = useAuthContext()

	const register = async ({
		tenantID,
		firstname,
		lastname,
		email,
		password,
		phone,
		profileImage,
	}: {
		tenantID: string
		firstname: string
		lastname: string
		email: string
		password: string
		phone: string
		profileImage: File
	}) => {
		console.table({
			tenantID,
			firstname,
			lastname,
			email,
			password,
			phone,
			profileImage,
		})
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', tenantID)
			formData.append('firstname', firstname)
			formData.append('lastname', lastname)
			formData.append('email', email)
			formData.append('password', password)
			formData.append('phone', phone)
			formData.append('role', 'superAdmin')

			if (profileImage) {
				formData.append('profileImage', profileImage, profileImage.name)
			}

			const data = await authApi.register(formData)
			if (data?.user?.tenantID) {
				navigate('/auth/login')
			}
		} finally {
			setLoading(false)
		}
	}

	return { loading, register, isAuthenticated }
}
