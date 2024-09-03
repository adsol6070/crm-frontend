import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi, useAuthContext } from '@/common'
import Swal from 'sweetalert2'

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

	const login = async ({ email, password }: LoginData) => {
		setLoading(true)
		try {
			const res = await authApi.login({ email, password })
			if (res.tokens) {
				saveSession(res.tokens)

				Swal.fire({
					icon: 'success',
					title: 'Login Successful',
					text: 'You have successfully logged in.',
					showConfirmButton: false,
					timer: 1500,
				}).then(() => {
					navigate(redirectUrl, { replace: true })
				})
			}
		} catch (error) {
			console.error('Login failed', error)
			Swal.fire({
				icon: 'error',
				title: 'Login Failed',
				text: 'Invalid email or password. Please try again.',
			})
		} finally {
			setLoading(false)
		}
	}

	return { loading, login, redirectUrl, isAuthenticated }
}
