import { Modal, Badge, Row, Col, Dropdown, Button } from 'react-bootstrap'
import styles from '../kanban.module.css'
import { useEffect, useState } from 'react'
import { formatStringDisplayName } from '@/utils/formatString'

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
}

const ViewTaskModal = ({ show, onHide, task, handleStatusChange }: ViewTaskModalProps) => {
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

	useEffect(() => {
		setStatus(task.status);
	}, [task]);

	const handleMoveClick = () => {
		if (status) {
			handleStatusChange(status);
			onHide();
		}
	};

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
					{/* <Col lg={4} md={4} sm={6} className="d-flex align-items-center justify-content-center">
						<Badge bg="secondary" className="fs-5 px-2 py-1">
							{formatStringDisplayName(status || "")}
						</Badge>
					</Col> */}
				</Row>
				{/* <Row className="my-1">
					<Col>
						<h6 className="text-muted">Change Status</h6>
						<Dropdown onSelect={(status) => {
							handleStatusChange(status || "");
							setStatus(status || "");
						}}>
							<Dropdown.Toggle
								as="button"
								variant="outline-secondary"
								className="w-100 text-start text-capitalize py-2 px-3"
								style={{
									borderRadius: '8px',
									border: '1px solid #ced4da',
									fontWeight: '600',
								}}
							>
								{formatStringDisplayName(status || 'Select Status')}
							</Dropdown.Toggle>
							<Dropdown.Menu className="w-100">
								{['to_do', 'in_progress', 'done', 'need_review'].map(status => (
									<Dropdown.Item eventKey={status} key={status}>
										{formatStringDisplayName(status)}
									</Dropdown.Item>
								))}
							</Dropdown.Menu>
						</Dropdown>
					</Col>
				</Row> */}

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
							onClick={handleMoveClick} 
							disabled={!status}
						>
							Move
						</Button>
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
