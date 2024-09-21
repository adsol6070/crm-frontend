import { Button, Col, Image, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthContext } from '@/common'
import AuthLayout from './AuthLayout'

// images
import shield from '@/assets/images/svg/shield.gif'


import { PageBreadcrumb } from '@/components'

const Logout = () => {
	const { removeSession } = useAuthContext()
	const navigate = useNavigate()

	useEffect(() => {
		const performLogout = async () => {
			try {
				await removeSession()
			} catch (error) {
				console.error('Failed to logout:', error)
			}
		}

		performLogout()
	}, [])

	const handleLoginClick = () => {
		navigate('/auth/login', { replace: true })
	}

	const BottomLink = () => {
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
						Back To
						<Button
							variant="link"
							className="text-dark fw-bold link-offset-3 text-decoration-underline"
							onClick={handleLoginClick}>
							<b>Log In</b>
						</Button>
					</p>
				</Col>
			</Row>
		)
	}

	return (
		<>
			<PageBreadcrumb title="Logout" />
			<AuthLayout
				authTitle="See You Again !"
				helpText="You are now successfully sign out."
				bottomLinks={<BottomLink />}
				starterClass>
				<div className="logout-icon m-auto">
					<Image fluid src={shield} alt="" />
				</div>
			</AuthLayout>
		</>
	)
}

export default Logout
