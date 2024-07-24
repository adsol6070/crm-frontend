import { useAuthContext, userApi } from '@/common'
import { useEffect, useState } from 'react'
import useUserImage from './useUserImage'

interface User {
	id: string
	tenantID: string
	firstname: string
	lastname: string
	email: string
	phone: string
	city: string
	address: string
	profileImage: string | null
	isEmailVerified: boolean
	role: string
	online: boolean
	imageUrl: string
}

const useUser = () => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const { user: authUser } = useAuthContext()
	const fetchUserImage = useUserImage()

	useEffect(() => {
		const fetchLoggedInUser = async () => {
			try {
				const userId = {
					userId: authUser.sub,
				}
				const currentLoggedInUser = await userApi.getProfileById(userId)
				const imageUrl = await fetchUserImage(currentLoggedInUser)
				setUser({ ...currentLoggedInUser, imageUrl })
			} catch (error) {
				console.error('Error fetching logged in user:', error)
			} finally{
				setLoading(false)
			}
		}

		if (authUser) {
			fetchLoggedInUser()
		}
	}, [authUser])

	return [user, loading]
}

export default useUser
