import { Form } from 'react-bootstrap'

const FormInput = () => {
	return (
		<>
			<Form.Group>
				<Form.Label>Name</Form.Label>
				<Form.Control
					type="text"
					placeholder="Enter your name"
					name="name"
					className="mb-3"></Form.Control>
			</Form.Group>
		</>
	)
}

export default FormInput
