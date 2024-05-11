import { useState } from 'react'
import { Modal, Button, Form, InputGroup, FormControl } from 'react-bootstrap'

// Updated data structure for roles and permissions with sub-categories
const initialPermissions = {
	CRM: {
		Channel: { Create: false, Read: true, Update: false, Delete: false },
		Contact: { Create: true, Read: true, Update: true, Delete: true },
		Campaign: { Create: false, Read: false, Update: true, Delete: false },
		'Campaign Report': {
			'View Partial': true,
			'View Full': false,
			'Export Partial': false,
			'Export Full': true,
		},
		'Custom Field': { Create: false, Read: true, Update: true, Delete: false },
		Segment: { Create: false, Read: false, Update: true, Delete: true },
		'Canned Reply': { Create: true, Read: true, Update: false, Delete: false },
		Trigger: { Create: false, Read: true, Update: true, Delete: false },
	},
}

const PermissionsModal = ({ showModal, handleClose }) => {
	const [permissions, setPermissions] = useState(initialPermissions)
	const [roleName, setRoleName] = useState('')

	const handleCheckboxChange = (category, subCategory, operation) => {
		const updatedPermissions = {
			...permissions,
			[category]: {
				...permissions[category],
				[subCategory]: {
					...permissions[category][subCategory],
					[operation]: !permissions[category][subCategory][operation],
				},
			},
		}
		setPermissions(updatedPermissions)
	}

	const renderSubCategoryCheckboxes = (category, subCategory) => {
		return Object.keys(permissions[category][subCategory]).map((operation) => (
			<td key={operation}>
				<Form.Check
					type="checkbox"
					checked={permissions[category][subCategory][operation]}
					onChange={() =>
						handleCheckboxChange(category, subCategory, operation)
					}
				/>
			</td>
		))
	}

	const renderCategories = () => {
		return Object.keys(permissions).map((category) => (
			<>
				<tr className="table-secondary">
					<td colSpan="5">
						<strong>{category}</strong>
					</td>
				</tr>
				{Object.keys(permissions[category]).map((subCategory) => (
					<tr key={subCategory}>
						<td>{subCategory}</td>
						{renderSubCategoryCheckboxes(category, subCategory)}
					</tr>
				))}
			</>
		))
	}

	return (
		<Modal show={showModal} onHide={handleClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Manage Permissions</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<InputGroup className="mb-3">
					<InputGroup.Text id="role-name">Role Name</InputGroup.Text>
					<FormControl
						placeholder="Enter role name"
						aria-label="Role Name"
						aria-describedby="role-name"
						value={roleName}
						onChange={(e) => setRoleName(e.target.value)}
					/>
				</InputGroup>
				<table className="table">
					<thead>
						<tr>
							<th>Sub-Category</th>
							<th>Create</th>
							<th>Read</th>
							<th>Update</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>{renderCategories()}</tbody>
				</table>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button variant="primary">Save Changes</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default PermissionsModal
