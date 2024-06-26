import { Button, Col, Row } from 'react-bootstrap'
import AuthLayout from '../AuthLayout'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import useRegister from './useRegister'

// Components
import { VerticalForm, FormInput, PageBreadcrumb } from '@/components'
import { useState } from 'react'

interface UserData {
	tenantID: string
	firstname: string
	lastname: string
	email: string
	password: string
	phone: string
	profileImage?: File
}
const BottomLink = () => {
	return (
		<Row>
			<Col xs={12} className="text-center">
				<p className="text-dark-emphasis">
					Already have account?{' '}
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
const Register = () => {
	const { loading, register } = useRegister()
	const [profileImage, setProfileImage] = useState<File | null>(null)

	console.log(profileImage)

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setProfileImage(event.target.files[0])
		}
	}

	/*
	 * form validation schema
	 */
	const schemaResolver = yupResolver(
		yup.object().shape({
			tenantID: yup.string().required('Please enter tenantID'),
			firstname: yup.string().required('Please enter Firstname'),
			lastname: yup.string().required('Please enter Lastname'),
			email: yup
				.string()
				.required('Please enter Email')
				.email('Please enter valid Email'),
			password: yup.string().required('Please enter Password'),
			phone: yup.string().required('Please enter Phone'),
			profileImage: yup.mixed(),
		})
	)

	return (
		<>
			<PageBreadcrumb title="Register" />
			<AuthLayout
				authTitle="Free Sign Up"
				helpText="Enter your email address and password to access account."
				bottomLinks={<BottomLink />}
				hasThirdPartyLogin>
				<VerticalForm<UserData>
					onSubmit={(data: any) => {
						// Only add profileImage to data if it is not undefined
						const formData = profileImage ? { ...data, profileImage } : data
						register(formData)
					}}
					resolver={schemaResolver}>
					<FormInput
						label="Tenant ID"
						type="text"
						name="tenantID"
						placeholder="Enter your ID"
						containerClass="mb-3"
						required
					/>
					<FormInput
						label="First Name"
						type="text"
						name="firstname"
						placeholder="Enter your firstname"
						containerClass="mb-3"
						required
					/>
					<FormInput
						label="Last Name"
						type="text"
						name="lastname"
						placeholder="Enter your lastname"
						containerClass="mb-3"
						required
					/>

					<FormInput
						label="Email address"
						type="text"
						name="email"
						placeholder="Enter your email"
						containerClass="mb-3"
						required
					/>

					<FormInput
						label="Password"
						type="password"
						name="password"
						placeholder="Enter your password"
						containerClass="mb-3"
					/>
					<FormInput
						label="Phone"
						type="tel"
						name="phone"
						placeholder="Enter your phone"
						containerClass="mb-3"
					/>

					<FormInput
						label="Profile Image"
						type="file"
						name="profileImage"
						onChange={handleImageChange}
						containerClass="mb-3"
					/>

					<FormInput
						isTerms={true}
						type="checkbox"
						name="checkbox"
						containerClass={'mb-3'}
					/>

					<div className="mb-0 d-grid text-center">
						<Button
							variant="primary"
							disabled={loading}
							className="fw-semibold"
							type="submit">
							Sign Up
						</Button>
					</div>
				</VerticalForm>
			</AuthLayout>
		</>
	)
}

export default Register
