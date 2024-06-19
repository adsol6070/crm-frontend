import { userApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface User {
	id: string;
	tenantID: string;
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	phone: string;
	city: string;
	address: string;
	profileImage: File;
	role: string;
	isEmailVerified: boolean;
	uploadType?: string;
  }
  

export default function useCreateUser() {
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, user } = useAuthContext()

	const createUser = async (data: User) => {
		const userData = data;
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('firstname', userData.firstname)
			formData.append('lastname', userData.lastname)
			formData.append('email', userData.email)
			formData.append('password', userData.password)
			formData.append('phone', userData.phone)
			formData.append('city', userData.city)
			formData.append('address', userData.address)
			formData.append('role', userData.role)
			formData.append('uploadType', "User")

			if (userData.profileImage) {
				formData.append('profileImage', userData.profileImage, userData.profileImage.name)
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
