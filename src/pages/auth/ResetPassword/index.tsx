import { Button, Col, Row } from 'react-bootstrap'
import AuthLayout from '../AuthLayout'
import { Link, useLocation } from 'react-router-dom'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import useResetPassword from './useResetPassword'
import { jwtDecode } from 'jwt-decode'

// Components
import { FormInput, VerticalForm, PageBreadcrumb } from '@/components'

const BottomLink = () => (
	<Row>
		<Col xs={12} className="text-center">
			<p className="text-dark-emphasis">
				Remember your password?{' '}
				<Link
					to="/auth/login"
					className="text-dark fw-bold ms-1 link-offset-3 text-decoration-underline">
					<b>Log In</b>
				</Link>
			</p>
		</Col>
	</Row>
)

interface ResetData {
	newPassword: string
}

interface DecodedToken {
	tenantID: string
	exp: number
	iat: number
}

const ResetPassword = () => {
	const location = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const token = queryParams.get('token')
	let tenantID: string = ''

	if (token) {
		try {
			const decodedToken = jwtDecode<DecodedToken>(token)
			tenantID = decodedToken.tenantID
		} catch (error) {
			console.error('Invalid token:', error)
		}
	}

	const schemaResolver = yupResolver(
		yup.object().shape({
			newPassword: yup
				.string()
				.min(6, 'Password must be at least 6 characters')
				.required('Please enter new password'),
		})
	)

	const { loading, onSubmit } = useResetPassword()

	const handleSubmit = (data: ResetData) => {
		if (token && tenantID) {
			onSubmit({ ...data, token, tenantID })
		} else {
			console.error('Reset token or tenantID is missing.')
		}
	}

	return (
		<div>
			<PageBreadcrumb title="Reset Password" />
			<AuthLayout
				authTitle="Reset Your Password"
				helpText="Enter the new password you would like to set for your account."
				bottomLinks={<BottomLink />}>
				<VerticalForm<ResetData>
					onSubmit={handleSubmit}
					resolver={schemaResolver}>
					<FormInput
						label="New Password"
						type="password"
						name="newPassword"
						placeholder="Enter your new password"
						containerClass="mb-3"
						required
					/>
					<div className="mb-0 text-start">
						<Button
							variant="soft-primary"
							className="w-100"
							type="submit"
							disabled={loading}>
							<i className="ri-key-line me-1 fw-bold" />{' '}
							<span className="fw-bold">Set New Password</span>
						</Button>
					</div>
				</VerticalForm>
			</AuthLayout>
		</div>
	)
}

export default ResetPassword
