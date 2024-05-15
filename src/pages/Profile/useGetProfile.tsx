import { userApi } from '@/common/api'
import { useAuthContext } from '@/common/context'
import { User } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function useGetProfile() {
	const [loading, setLoading] = useState(false)
	const [getProfile, setGetProfile] = useState<User | null>(null)
	const [error, setError] = useState<string | null>(null);
	const { isAuthenticated, user } = useAuthContext()
	
	const getUserProfile = async () => {
		setLoading(true)
		try {
			const userId = {
				userId: user.sub
			}
			const userProfile = await userApi.getProfileById(userId)
            if (userProfile.profileImage) {
				const imageBlob = await userApi.getImage(userProfile.id)
                const imageUrl = URL.createObjectURL(imageBlob)
                setGetProfile({ ...userProfile, profileImage: imageUrl })
            } else {
				const placeholderImageUrl = generatePlaceholderImage(userProfile.firstname)
                setGetProfile({ ...userProfile, profileImage: placeholderImageUrl })
            }
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}
	const generatePlaceholderImage = (name: string) => {
		const canvas = document.createElement('canvas')
		const context = canvas.getContext('2d')

		if (!context) {
			console.error('2D context is not supported')
			return ''
		}

		const size = 50
		canvas.width = size
		canvas.height = size
		const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16)

		context.beginPath()
		context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
		context.fillStyle = randomColor
		context.fill()

		context.font = '20px Arial'
		context.fillStyle = 'white'
		context.textAlign = 'center'
		context.textBaseline = 'middle'
		context.fillText(name.charAt(0).toUpperCase(), size / 2, size / 2)

		const imageUrl = canvas.toDataURL()
		return imageUrl
	}
    useEffect(()=>{
        getUserProfile();
    },[])

	return { loading, getProfile, isAuthenticated, error, setError }
}
