import { Modal, Badge, Row, Col, Dropdown } from 'react-bootstrap'
import styles from '../kanban.module.css'

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
}

const ViewTaskModal = ({ show, onHide, task }: ViewTaskModalProps) => {
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
	return (
		<Modal show={show} onHide={onHide} centered size="md" className={styles.customModal}>
			<Modal.Header closeButton>
				<Modal.Title className="fw-bold">{task.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body className={`${styles.modalBody} p-4`}>
				<Row>
					<Col lg={8} md={8} sm={6}>
						<h6 className="text-muted">Task ID</h6>
						<p className="fw-semibold text-secondary">{task.id}</p>
					</Col>
					<Col lg={4} md={4} sm={6} className="d-flex align-items-center justify-content-center">
						<Badge bg={
							task.status === 'Done'
								? 'success'
								: task.status === 'In Progress'
									? 'warning'
									: task.status === 'Need Review'
										? 'info'
										: 'secondary'
						} className="py-2 px-3 text-uppercase">
							{task.status}
						</Badge>
					</Col>
				</Row>
				<Row className="my-1">
					<Col>
						<h6 className="text-muted">Change Status</h6>
						<Dropdown>
							<Dropdown.Toggle
								as="button"
								id="dropdown-custom-components"
								variant="outline-secondary"
								className="w-100 text-start text-capitalize py-2 px-3"
								style={{
									borderRadius: '8px',
									border: '1px solid #ced4da',
									fontWeight: '600',
								}}
							>
								{task.status || 'Select Status'}
							</Dropdown.Toggle>
							<Dropdown.Menu className="w-100">
								<Dropdown.Item eventKey="To Do">
									To Do
								</Dropdown.Item>
								<Dropdown.Item eventKey="In Progress">
									In Progress
								</Dropdown.Item>
								<Dropdown.Item eventKey="Done">
									Done
								</Dropdown.Item>
								<Dropdown.Item eventKey="Need Review">
									Need Review
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Col>
				</Row>

				<hr className="my-3" />

				<Row>
					<Col>
						<h6 className="text-muted">Description</h6>
						<p className="fw-light text-dark">
							{task.description || 'No description provided.'}
						</p>
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
