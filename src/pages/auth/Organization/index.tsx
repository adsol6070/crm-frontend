import { Button } from 'react-bootstrap'
import AuthLayout from '../AuthLayout'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import useRegister from './useOrganizationRegister'
import { VerticalForm, FormInput, PageBreadcrumb } from '@/components'

interface organizationData {
	organizationName: string
}

const Register = () => {
	const { loading, registerOrganization } = useRegister()

	const schemaResolver = yupResolver(
		yup.object().shape({
			organizationName: yup.string().required('Please enter organization name'),
		})
	)

	const onSubmit = (data: organizationData) => {
		registerOrganization(data)
	}

	return (
		<>
			<PageBreadcrumb title="Register" />
			<AuthLayout
				authTitle="Create a organization"
				helpText="Enter your organization name"
				>
				<VerticalForm<organizationData> onSubmit={onSubmit} resolver={schemaResolver}>
					<FormInput
						label="Organization Name"
						type="text"
						name="organizationName"
						placeholder="Enter your organization name"
						containerClass="mb-3"
						required
					/>

					<div className="mb-0 d-grid text-center">
						<Button
							variant="primary"
							disabled={loading}
							className="fw-semibold"
							type="submit">
							Create
						</Button>
					</div>
				</VerticalForm>
			</AuthLayout>
		</>
	)
}

export default Register
