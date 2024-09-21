import { Button, Col, Row } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import AuthLayout from '../AuthLayout'
import useLogin from './useLogin'
import { VerticalForm, FormInput, PageBreadcrumb } from '@/components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface UserData {
	email: string
	password: string
}

const BottomLinks = () => {
	const navigate = useNavigate()
	return (
		<Row>
			<Col xs={12} className="text-center">
				<p
					className="text-dark-emphasis"
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					Don't have an account?
					<Button
						variant="link"
						className="text-dark fw-bold link-offset-3 text-decoration-underline"
						onClick={() => navigate('/auth/register', { replace: true })}>
						<b>Sign up</b>
					</Button>
				</p>
			</Col>
		</Row>
	)
}

const schema = yup.object().shape({
	email: yup.string().email('Invalid email').required('Please enter email'),
	password: yup.string().required('Please enter password'),
	rememberMe: yup.boolean(),
})

const Login = () => {
	const { loading, login, redirectUrl, isAuthenticated } = useLogin()

	const onSubmit = (data: UserData) => {
		const completeData = { ...data }
		login(completeData)
	}

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Log In" />

			{isAuthenticated && <Navigate to={redirectUrl} replace />}

			<AuthLayout
				authTitle="Sign In"
				helpText="Enter your email address and password to access account."
				bottomLinks={<BottomLinks />}>
				<VerticalForm<UserData>
					onSubmit={onSubmit}
					resolver={yupResolver(schema)}>
					<FormInput
						label="Email address"
						type="email"
						name="email"
						placeholder="Enter your email"
						containerClass="mb-3"
						required
					/>
					<FormInput
						label="Password"
						name="password"
						type="password"
						required
						id="password"
						placeholder="Enter your password"
						containerClass="mb-3">
						<Link to="/auth/forgot-password" className="text-muted float-end">
							<small>Forgot your password?</small>
						</Link>
					</FormInput>
					<div className="mb-0 text-start">
						<Button
							variant="soft-primary"
							className="w-100"
							type="submit"
							disabled={loading}>
							<i className="ri-login-circle-fill me-1" />
							<span className="fw-bold">Log In</span>
						</Button>
					</div>
				</VerticalForm>
			</AuthLayout>
		</>
	)
}

export default Login
