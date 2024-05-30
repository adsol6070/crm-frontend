import { useState } from 'react'
import { authApi } from '@/common'
import Swal from 'sweetalert2'

export default function useForgotPassword() {
	const [loading, setLoading] = useState(false)

	const onSubmit = async (data: any) => {
		setLoading(true)
		try {
			await authApi.forgetPassword(data)
			Swal.fire({
				icon: 'success',
				title: 'Success',
				text: 'Reset password link send successfully.',
				showConfirmButton: true,
			})
		} catch (error) {
			console.error('Password recovery failed', error)
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to send recovery email. Please try again.',
				showConfirmButton: true,
			})
		} finally {
			setLoading(false)
		}
	}

	return { loading, onSubmit }
}
