import { Modal, Row, Col, Dropdown, Button } from 'react-bootstrap'
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

interface CopyModalProps {
	show: boolean
	onHide: () => void
	task: CardType
	createTask: (task: any) => void
}

const CopyModal = ({ show, onHide, task, createTask }: CopyModalProps) => {
	const [status, setStatus] = useState(task.status)

	useEffect(() => {
		setStatus(task.status)
	}, [task])

	const handleCopyClick = () => {
		const newTask: any = {
			taskStatus: status,
			taskTitle: task.title,
			taskDescription: task.description,
		}

		createTask(newTask)
		onHide()
	}

	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
			size="sm"
			className={styles.customModal}>
			<Modal.Header closeButton>
				<Modal.Title className="fw-bold">Copy Card</Modal.Title>
			</Modal.Header>
			<Modal.Body className={`${styles.moveModalBody}`}>
				<Row className="my-1">
					<Col>
						<Dropdown onSelect={(newStatus) => setStatus(newStatus || '')}>
							<Dropdown.Toggle
								as="button"
								variant="outline-secondary"
								className="w-100 text-start text-capitalize py-2 px-3"
								style={{
									borderRadius: '8px',
									border: '1px solid #ced4da',
									fontWeight: '600',
								}}>
								{formatStringDisplayName(status || 'Select Status')}
							</Dropdown.Toggle>
							<Dropdown.Menu className="w-100">
								{['to_do', 'in_progress', 'need_review', 'done'].map(
									(statusOption) => (
										<Dropdown.Item eventKey={statusOption} key={statusOption}>
											{formatStringDisplayName(statusOption)}
										</Dropdown.Item>
									)
								)}
							</Dropdown.Menu>
						</Dropdown>
					</Col>
				</Row>
				<Row className="mt-3">
					<Col>
						<Button
							variant="dark"
							className="w-100"
							onClick={handleCopyClick}
							disabled={!status}>
							Copy
						</Button>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	)
}

export default CopyModal
