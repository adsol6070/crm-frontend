import { Button, Col, Row } from 'react-bootstrap'
import AuthLayout from '../AuthLayout'
import { Link, useLocation } from 'react-router-dom'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import useResetPassword from './useResetPassword'

// components
import { FormInput, VerticalForm, PageBreadcrumb } from '@/components'

const BottomLink = () => {
	return (
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
}

interface ResetData {
	newPassword: string
}

const ResetPassword = () => {
	const location = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const token = queryParams.get('token')
	console.log('Token:', token)
	/*
	 * form validation schema
	 */
	const schemaResolver = yupResolver(
		yup.object().shape({
			newPassword: yup
				.string()
				.min(6, 'Password must be at least 6 characters')
				.required('Please enter new password'),
		})
	)

	/*
	 * handle form submission
	 */
	const { loading, onSubmit } = useResetPassword()

	return (
		<div>
			<PageBreadcrumb title="Reset Password" />
			<AuthLayout
				authTitle="Reset Your Password"
				helpText="Enter the reset token you received via email along with your new password."
				bottomLinks={<BottomLink />}>
				<VerticalForm<ResetData> onSubmit={onSubmit} resolver={schemaResolver}>
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
							<span className="fw-bold">Set New Password</span>{' '}
						</Button>
					</div>
				</VerticalForm>
			</AuthLayout>
		</div>
	)
}

export default ResetPassword
