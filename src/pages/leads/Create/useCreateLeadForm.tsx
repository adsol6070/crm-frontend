import { leadApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateLead() {
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, user } = useAuthContext()

	const createLead = async ({
		firstname,
		lastname,
		email,
		phone,
		qualification,
		VisaInterest,
	}: {
		firstname: string
		lastname: string
		email: string
		phone: string
		qualification: string
		VisaInterest: string
	}) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('firstname', firstname)
			formData.append('lastname', lastname)
			formData.append('email', email)
			formData.append('phone', phone)
			formData.append('qualification', qualification)
			formData.append('VisaInterest', VisaInterest)

			const data = await leadApi.create(formData)
			toast.success(data.message)
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	return { loading, createLead, isAuthenticated }
}
