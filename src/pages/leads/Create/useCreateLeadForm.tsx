import { leadApi, visaCategoryApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { VisaCategory } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateLead() {
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, user } = useAuthContext()
	const [visaCategories, setVisaCategories] = useState<VisaCategory[]>([])
	const createLead = async (formData: FormData) => {
		setLoading(true)
		try {
			formData.append('tenantID', user.tenantID)
			// for (let [key, value] of formData.entries()) {
			// 	console.log(`${key}: ${value}`);
			//   }
			const data = await leadApi.create(formData)
			toast.success(data.message)
			return true;
		} catch (error: any) {
			toast.error("Lead not added")
			return false;
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const getCategories = async () => {
			setLoading(true)
			const categoriesData = await visaCategoryApi.getAllCategory();
			const newCategories = categoriesData.map((category: any) => {
				return {
					value: category.category,
					label: category.category
				}
			})
			setVisaCategories(newCategories);
			setLoading(false)
		}

		getCategories()
	}, [])

	return { loading, createLead, visaCategories, isAuthenticated }
}
