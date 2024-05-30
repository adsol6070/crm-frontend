import { useState } from 'react'
import { authApi } from '@/common'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

interface ResetPasswordData {
	tenantID: string
	newPassword: string
	token: string
}

export default function useResetPassword() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const onSubmit = async (data: ResetPasswordData) => {
		setLoading(true)
		try {
			await authApi.resetPassword({
				token: data.token,
				password: data.newPassword,
				tenantID: data.tenantID,
			})
			Swal.fire({
				icon: 'success',
				title: 'Success',
				text: 'Password reseted successfully',
				showConfirmButton: true,
			}).then(() => {
				navigate('/auth/login')
			})
		} catch (error) {
			console.error('Password reset failed', error)
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to reset password. Please try again.',
				showConfirmButton: true,
			})
		} finally {
			setLoading(false)
		}
	}

	return { loading, onSubmit }
}
