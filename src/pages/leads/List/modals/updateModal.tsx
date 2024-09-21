import React, { useState } from 'react'
import { Modal, Button, Form, Table } from 'react-bootstrap'
import styles from '../LeadList.module.css'

interface UpdateModalProps {
	show: boolean
	handleClose: () => void
	selectedLeads: any[]
	selectedUserIds: string[]
	handleUpdateSelected: (data: any) => void
}

const UpdateModal: React.FC<UpdateModalProps> = ({
	show,
	handleClose,
	selectedLeads,
	selectedUserIds,
	handleUpdateSelected,
}) => {
	const [status, setStatus] = useState('')
	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value)
	}

	const handleSubmit = () => {
		const data = {
			leadIds: selectedUserIds,
			leadStatus: status,
		}
		handleUpdateSelected(data)
		handleClose()
	}

	return (
		<Modal show={show} onHide={handleClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Update Status for Selected Leads</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className={styles.listBody}>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>S.No</th>
								<th>Lead ID</th>
								<th>Name</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{selectedLeads?.map((lead, index) => {
								return (
									<tr key={index}>
										<td>{index + 1}</td>
										<td>{lead.id}</td>
										<td>
											{lead.firstname} {lead.lastname}
										</td>
										<td>{lead.leadStatus}</td>
									</tr>
								)
							})}
						</tbody>
					</Table>
				</div>
				<Form.Group className="mt-3">
					<Form.Label>Update Status</Form.Label>
					<Form.Select value={status} onChange={handleStatusChange}>
						<option value="">Select Status</option>
						<option value="new">New</option>
						<option value="pending">Pending</option>
						<option value="inprogress">Inprogress</option>
						<option value="completed">Completed</option>
					</Form.Select>
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button variant="primary" onClick={handleSubmit} disabled={!status}>
					Update Status
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default UpdateModal
