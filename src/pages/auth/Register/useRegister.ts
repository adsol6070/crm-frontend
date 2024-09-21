import { authApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

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
			formData.append('uploadType', 'User')

			if (userData.profileImage) {
				formData.append(
					'profileImage',
					userData.profileImage,
					userData.profileImage.name
				)
			}

			const data = await authApi.register(formData)

			if (data?.user?.tenantID) {
				Swal.fire({
					icon: 'success',
					title: 'Registration Successful',
					text: 'Your account has been created successfully.',
					showConfirmButton: false,
					timer: 1500,
				}).then(() => {
					navigate('/auth/login')
				})
			}
		} catch (error) {
			console.error('Registration failed', error)

			let errorMessage
			if (error === 'File too large') {
				errorMessage = error
			} else {
				errorMessage = 'Registration failed. Please try again.'
			}

			Swal.fire({
				icon: 'error',
				title: 'Registration Failed',
				text: errorMessage,
			})
		} finally {
			setLoading(false)
		}
	}

	return { loading, register, isAuthenticated }
}
