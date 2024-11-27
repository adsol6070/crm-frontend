import { Modal, Row, Col, Dropdown, Button } from 'react-bootstrap'
import styles from '../kanban.module.css'
import { useEffect, useState } from 'react'
import { formatStringDisplayName } from '@/utils/formatString'
import { FormInput } from '@/components'

interface CardType {
	id?: number
	title?: string
	description?: string
	status?: string
	createdAt?: string
}

interface ViewTaskModalProps {
	show: boolean
	onHide: () => void
	task: CardType
	handleStatusChange: (status: string) => void
	updateTask: (taskId: string, data: any) => void
}

const ViewTaskModal = ({ show, onHide, task, handleStatusChange, updateTask }: ViewTaskModalProps) => {
	const formattedDate = task.createdAt
		? new Date(task.createdAt).toLocaleString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		})
		: 'No date provided'
	const [status, setStatus] = useState(task.status);
	const [description, setDescription] = useState(task.description)
	const [isEditing, setIsEditing] = useState(false)
	const [tempDescription, setTempDescription] = useState(description)
	console.log("description ", description)

	useEffect(() => {
		setStatus(task.status);
	}, [task]);

	const handleMoveClick = () => {
		if (status) {
			handleStatusChange(status);
			onHide();
		}
	};


	const handleEditClick = () => {
		setTempDescription(task.description)
		setIsEditing(true)
	}

	const handleSaveDescription = () => {
		setDescription(tempDescription)
		const data = {
			taskDescription: tempDescription
		}
		updateTask(task.id, data)
		setIsEditing(false)
	}

	const handleCancelEdit = () => {
		setTempDescription(description)
		setIsEditing(false)
	}

	return (
		<Modal show={show} onHide={onHide} centered size="md" className={styles.customModal}>
			<Modal.Header closeButton>
				<Modal.Title className="fw-bold">{task.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body className={`${styles.modalBody} p-4`}>
				<Row>
					<Col>
						<h6 className="text-muted">Task ID</h6>
						<p className="fw-semibold text-secondary">{task.id}</p>
					</Col>
				</Row>

				<Row className="my-1">
					<Col md={10} lg={10}>
						<Dropdown onSelect={(newStatus) => setStatus(newStatus || '')}>
							<Dropdown.Toggle
								as="button"
								variant="outline-secondary"
								className="w-100 text-start text-capitalize py-1 px-3"
								style={{
									borderRadius: '8px',
									border: '1px solid #ced4da',
									fontWeight: '600',
								}}
							>
								{formatStringDisplayName(status || 'Select Status')}
							</Dropdown.Toggle>
							<Dropdown.Menu className="w-100">
								{['to_do', 'in_progress', 'need_review', 'done'].map(statusOption => (
									<Dropdown.Item eventKey={statusOption} key={statusOption}>
										{formatStringDisplayName(statusOption)}
									</Dropdown.Item>
								))}
							</Dropdown.Menu>
						</Dropdown>
					</Col>
					<Col md={2} lg={2}>
						<Button
							variant="dark"
							size="sm"
							onClick={handleMoveClick}
							disabled={!status}
						>
							Move
						</Button>
					</Col>
				</Row>

				<hr className="my-3" />

				<Row className='my-2'>
					<Col>
						<h6 className="text-muted">Description</h6>
						{isEditing ? (
							<>
								<FormInput
									label="Description"
									type="textarea"
									name="description"
									placeholder="Enter Description"
									rows={3}
									value={tempDescription}
									onChange={(e) => setTempDescription(e.target.value)}
									key="textarea"
									required
								/>
								<div className="d-flex justify-content-end gap-2 my-2">
									<Button variant="outline-secondary" size="sm" onClick={handleCancelEdit}>
										Cancel
									</Button>
									<Button variant="success" size="sm" onClick={handleSaveDescription}>
										Save
									</Button>
								</div>
							</>
						) : (
							<>
								{task.description ? (
									<>
										<p className="fw-light text-dark">{description}</p>
										<Button variant="outline-primary mb-2" onClick={handleEditClick}>
											Edit Description
										</Button>
									</>
								) : (
									<button className={styles.descriptionBtn} onClick={handleEditClick}
										disabled={!status}>
										Add Description
									</button>
								)}
							</>
						)}
					</Col>
				</Row>

				<Row>
					<Col>
						<h6 className="text-muted">Created At</h6>
						<p className="text-secondary">{formattedDate}</p>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>

	)
}

export default ViewTaskModal
