import { authApi, useAuthContext } from '@/common'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from '@/types'

export default function useLogin() {
	const [loading, setLoading] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()

	const { isAuthenticated, saveSession } = useAuthContext()

	const redirectUrl = useMemo(
		() =>
			location.state && location.state.from
				? location.state.from.pathname
				: '/',
		[location.state]
	)

	const login = async ({ tenantID, email, password, rememberMe }: User) => {
		setLoading(true)
		try {
			// const res: any = await authApi.login({ tenantID, email, password, rememberMe })

			// if (res.token) {
			// 	saveSession({ ...(res.user ?? {}), token: res.token })
			const res: any = await authApi.login({ tenantID, email, password, rememberMe })
			if (res.tokens) {
				saveSession(res.tokens)
				navigate(redirectUrl)
			}
		} finally {
			setLoading(false)
		}
	}

	return { loading, login, redirectUrl, isAuthenticated }
}
