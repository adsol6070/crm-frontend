import { leadApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateLead() {
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, user } = useAuthContext()

	const createLead = async (formData: FormData) => {
		setLoading(true)
		try {
			formData.append('tenantID', user.tenantID)
			// for (let [key, value] of formData.entries()) {
			// 	console.log(`${key}: ${value}`);
			//   }
			const data = await leadApi.create(formData)
			toast.success(data.message)
		} catch (error: any) {
			if (error == "Email already taken") {
				toast.error("Email already exists")
			}
			else {
				toast.error("Lead not added")
			}
		} finally {
			setLoading(false)
		}
	}

	return { loading, createLead, isAuthenticated }
}
