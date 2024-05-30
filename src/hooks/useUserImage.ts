import { userApi } from '@/common'
import { generatePlaceholderImage } from '@/utils'

const useUserImage = () => {
	const fetchUserImage = async (user: any): Promise<string> => {
		try {
			if (user.profileImage) {
				const imageBlob = await userApi.getImage(user.id)
				if (imageBlob) {
					const imageUrl = URL.createObjectURL(imageBlob)
					return imageUrl
				}
			}
		} catch (error) {
			console.error('Error fetching user image:', error)
		}
		return generatePlaceholderImage(`${user.firstname} ${user.lastname}`)
	}

	return fetchUserImage
}

export default useUserImage
