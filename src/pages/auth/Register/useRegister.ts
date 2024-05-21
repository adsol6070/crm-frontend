import { authApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface RegisterData {
	tenantID: string
	firstname: string
	lastname: string
	email: string
	password: string
	phone: string
	profileImage?: File | null
}

export default function useRegister() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { isAuthenticated } = useAuthContext()

	const register = async (data: RegisterData) => {
		const userData = data
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', userData.tenantID)
			formData.append('firstname', userData.firstname)
			formData.append('lastname', userData.lastname)
			formData.append('email', userData.email)
			formData.append('password', userData.password)
			formData.append('phone', userData.phone)
			formData.append('role', 'superAdmin')

			if (userData.profileImage) {
				formData.append(
					'profileImage',
					userData.profileImage,
					userData.profileImage.name
				)
			}

			const data = await authApi.register(formData)
			if (data?.user?.tenantID) {
				navigate('/auth/login')
			}
		} catch (error) {
			console.error('Registration failed', error)
		} finally {
			setLoading(false)
		}
	}

	return { loading, register, isAuthenticated }
}
