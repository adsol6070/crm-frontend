import { Modal, Badge, Row, Col } from 'react-bootstrap'
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
		<Modal show={show} onHide={onHide} centered size="lg" className={styles.customModal}>
			<Modal.Header closeButton className="bg-primary text-white">
				<Modal.Title className="fw-bold">{task.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body className={`${styles.modalBody} p-4`}>
				<Row className="mb-3">
					<Col>
						<h6 className="text-muted">Task ID</h6>
						<p className="fw-semibold text-secondary">{task.id}</p>
					</Col>
					<Col className="text-end">
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
