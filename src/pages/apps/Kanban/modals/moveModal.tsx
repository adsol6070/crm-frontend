import { Modal, Row, Col, Dropdown } from 'react-bootstrap'
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

interface MoveModalProps {
	show: boolean
	onHide: () => void
	task: CardType
	handleStatusChange: (status: string) => void
}

const MoveModal = ({ show, onHide, task, handleStatusChange }: MoveModalProps) => {

	const [status, setStatus] = useState(task.status);
	console.log("currentStatus ", task.status)

	useEffect(() => {
		setStatus(task.status);
	}, [task]);

	return (
		<Modal show={show} onHide={onHide} centered size="sm" className={styles.customModal}>
			<Modal.Header closeButton>
				<Modal.Title className="fw-bold">Move Card</Modal.Title>
			</Modal.Header>
			<Modal.Body className={`${styles.moveModalBody}`}>
				<Row className="my-1">
					<Col>
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
				</Row>
		
			</Modal.Body>
		</Modal>

	)
}

export default MoveModal
