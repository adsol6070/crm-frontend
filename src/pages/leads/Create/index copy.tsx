import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Row, Col, Card, Button } from 'react-bootstrap'
import useCreateLead from './useCreateLeadForm'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const AddLead = () => {
	const { loading, createLead } = useCreateLead()

	const schemaResolver = yupResolver(
		yup.object().shape({
			firstname: yup.string().required('Please enter Firstname'),
			lastname: yup.string().required('Please enter Lastname'),
			email: yup
				.string()
				.required('Please enter Email')
				.email('Please enter valid Email'),
			phone: yup.string().required('Please enter Phone'),
			qualification: yup.string().required('Please enter qualification'),
			VisaInterest: yup.string().required('Please enter visa interest'),
		})
	)
	const onSubmit = (data: any, { reset }: any)=>{
		const completeData = {
			...data
		}
		createLead(completeData)
		reset();
	}
	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Create Lead" subName="Leads" />
			<Row>
				<Col>
					<Card>
						<Card.Header>
							<h4 className="header-title">Add New Lead</h4>
						</Card.Header>
						<Card.Body>
							<Row>
								<Col md={12}>
									<VerticalForm
										onSubmit={onSubmit}
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
											type="email"
											name="email"
											placeholder="Enter your email"
											containerClass="mb-3"
											required
										/>
										<FormInput
											label="Phone"
											type="tel"
											name="phone"
											placeholder="Enter your phone"
											containerClass="mb-3"
										/>
										<FormInput
											label="Qualification"
											type="text"
											name="qualification"
											placeholder="Enter your Qualification"
											containerClass="mb-3"
											required
										/>
                                        <FormInput
											label="Visa Interest"
											type="text"
											name="VisaInterest"
											placeholder="Enter your Visa Interest"
											containerClass="mb-3"
											required
										/>
										<Button
											variant="primary"
											type="submit"
											className="mt-3"
											disabled={loading}>
											Create Lead
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

export default AddLead
