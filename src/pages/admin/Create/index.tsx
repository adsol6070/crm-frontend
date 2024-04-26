import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import Select from 'react-select'
import useCreateUser from './useCreateUser'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const options = [
	{ value: '', label: 'Select Role' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'user', label: 'User' },
	{ value: 'technical', label: 'Technical Staff' },
	{ value: 'hr', label: 'HR' },
	{ value: 'manager', label: 'Manager' },
]

const CreateUser = () => {
	const [profileImage, setProfileImage] = useState<File | null>(null)
	const [selectedRole, setSelectedRole] = useState<string | null>(null)
	const { loading, createUser } = useCreateUser()

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setProfileImage(event.target.files[0])
		}
	}

	const schemaResolver = yupResolver(
		yup.object().shape({
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
			<ToastContainer />
			<PageBreadcrumb title="Create User" subName="Users" />
			<Row>
				<Col>
					<Card>
						<Card.Header>
							<h4 className="header-title">Multiple Row Selection</h4>
							<p className="text-muted mb-0">
								This table allowing selection of multiple rows
							</p>
						</Card.Header>
						<Card.Body>
							<Row>
								<Col md={12}>
									<VerticalForm
										onSubmit={(data: any) => {
											const completeData = {
												...data,
												role: selectedRole,
												profileImage,
											}
											createUser(completeData)
										}}
										resolver={schemaResolver}>
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
										<Form.Group className="mb-3">
											<Form.Label>Role</Form.Label>
											<Select
												className="select2 z-3"
												options={options}
												value={options.find(
													(option) => option.value === selectedRole
												)}
												onChange={(option) =>
													setSelectedRole(option ? option.value : null)
												}
											/>
										</Form.Group>
										<Button
											variant="primary"
											type="submit"
											className="mt-3"
											disabled={loading}>
											Create User
										</Button>
									</VerticalForm>
								</Col>
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default CreateUser
