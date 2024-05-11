import { useState } from 'react'
import { AxiosResponse } from 'axios'
import { User } from '@/types'
import { authApi } from '@/common'

export default function useResetPassword() {
	const [loading, setLoading] = useState(false)

	/*
	 * handle form submission
	 */
	const onSubmit = async (data: any) => {
		setLoading(true)
		try {
			const response: AxiosResponse<User> = await authApi.forgetPassword(data)
			console.log(response)
		} finally {
			setLoading(false)
		}
	}

	return { loading, onSubmit }
}
