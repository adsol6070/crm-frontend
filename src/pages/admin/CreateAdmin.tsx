import { PageBreadcrumb } from '@/components'
import { useState } from 'react'
import { Row, Col, Card, Form, Button } from 'react-bootstrap'

const CreateAdmin = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const handleSubmit = (e) => {
		e.preventDefault()
		// Add logic to create admin
		console.log('Creating admin with email:', email)
		console.log('Password:', password)
		console.log('Confirm Password:', confirmPassword)
		// Reset form fields after submission
		setEmail('')
		setPassword('')
		setConfirmPassword('')
	}

	return (
		<>
			<PageBreadcrumb title="Create Admin" subName="Admins" />
			<Row className="mt-4 justify-content-center">
				<Col xs={6}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Create New Admin</h4>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={handleSubmit}>
								<Form.Group controlId="email" className="mb-3">
									<Form.Label>Email Address</Form.Label>
									<Form.Control
										type="email"
										placeholder="Enter email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</Form.Group>
								<Form.Group controlId="password" className="mb-3">
									<Form.Label>Password</Form.Label>
									<Form.Control
										type="password"
										placeholder="Enter password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</Form.Group>
								<Form.Group controlId="confirmPassword" className="mb-3">
									<Form.Label>Confirm Password</Form.Label>
									<Form.Control
										type="password"
										placeholder="Confirm password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
								</Form.Group>
								<Button variant="primary" type="submit">
									Create Admin
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default CreateAdmin
