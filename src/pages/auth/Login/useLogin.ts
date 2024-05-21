import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi, useAuthContext } from '@/common'

interface LoginData {
	email: string
	password: string
	rememberMe?: boolean
}

export default function useLogin() {
	const [loading, setLoading] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const { isAuthenticated, saveSession } = useAuthContext()

	const redirectUrl = useMemo(() => {
		return location.state && location.state.from
			? location.state.from.pathname
			: '/'
	}, [location.state])

	const login = async ({ email, password, rememberMe }: LoginData) => {
		setLoading(true)
		try {
			const res = await authApi.login({ email, password, rememberMe })
			if (res.tokens) {
				saveSession(res.tokens)
				navigate(redirectUrl)
			}
		} catch (error) {
			console.error('Login failed', error)
		} finally {
			setLoading(false)
		}
	}

	return { loading, login, redirectUrl, isAuthenticated }
}
