import { leadApi, visaCategoryApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { useQuery } from '@/hooks'
import { VisaCategory } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function useCreateLead() {
	const query = useQuery();
    const tenantID = query.get('tenantID');
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, user } = useAuthContext()
	const [visaCategories, setVisaCategories] = useState<VisaCategory[]>([])

	const createLead = async (formData: FormData) => {
		setLoading(true)
		try {
			if (tenantID) {
                formData.append('tenantID', tenantID);
            } else {
                throw new Error("tenantID is missing");
            }
			formData.append('userID', "By QR Code")
			const data = await leadApi.createLead(formData)
			toast.success(data.message)
			return true
		} catch (error: any) {
			console.error("Error creating lead:", error)
			toast.error("Lead not added")
			return false
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const getCategories = async () => {
			setLoading(true)
			try {
				const categoriesData = await visaCategoryApi.getAllCategory()
				const newCategories = categoriesData.map((category: any) => {
					return {
						value: category.category,
						label: category.category,
					}
				})
				setVisaCategories(newCategories)
			} catch (error: any) {
				console.error("Error fetching visa categories:", error)
				toast.error("Failed to load visa categories")
			} finally {
				setLoading(false)
			}
		}

		getCategories()
	}, [])

	return { loading, createLead, visaCategories, isAuthenticated }
}
