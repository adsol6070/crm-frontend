import { userApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useEditUser() {
	const [loading, setLoading] = useState(false)
	const { isAuthenticated } = useAuthContext()

	const editUser = async (updatedData: FormData, userId?: string) => {
		setLoading(true)
		try {
			const data = await userApi.update(updatedData, userId)
			toast.success(data.message)
		} catch (error) {
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	return { loading, editUser, isAuthenticated }
}
