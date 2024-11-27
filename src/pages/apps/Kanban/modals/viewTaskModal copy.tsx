import { Modal, Row, Col, Dropdown, Button } from 'react-bootstrap'
import styles from '../kanban.module.css'
import { useEffect, useState } from 'react'
import { formatStringDisplayName } from '@/utils/formatString'
import { FormInput } from '@/components'
import { RiAlignLeft, RiTimeLine, RiMessage3Line, RiEdit2Line, RiDeleteBin6Line } from 'react-icons/ri'
import useTaskComment from '../useTaskComment'
import { generatePlaceholderImage } from '@/utils'
import useTask from '../useTask'
import { RxActivityLog } from 'react-icons/rx'

interface CardType {
	id: string
	boardId: string
	title?: string
	description?: string
	taskHistory?: string
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
	const { taskComments, createTaskComment, updateTaskCommentById, deleteTaskCommentById } = useTaskComment(task.id);
	const [description, setDescription] = useState(task.description)
	const [isEditing, setIsEditing] = useState(false)
	const [tempDescription, setTempDescription] = useState(task.description)
	const [comments, setComments] = useState<string[]>([])
	const [newComment, setNewComment] = useState<string>('')
	const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null)
	const [tempEditComment, setTempEditComment] = useState<string>('')
	const { getTaskColumns } = useTask(task.boardId);
	const [columns, setColumns] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		setStatus(task.status);
		setDescription(task.description || '');
		setTempDescription(task.description || '');
	}, [task]);

	const handleMoveClick = () => {
		if (status) {
			handleStatusChange(status);
			onHide();
		}
	};

	const handleEditClick = () => {
		setTempDescription(description)
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

	const handleAddComment = async () => {
		if (newComment.trim()) {
			setComments([...comments, newComment.trim()])
			await createTaskComment({ content: newComment.trim() })
			setNewComment('')
		}
	}

	const handleDeleteComment = async (index: number) => {
		const commentId = taskComments[index].id;
		await deleteTaskCommentById(commentId)
		setComments(comments.filter((_, idx) => idx !== index))
	}

	const handleEditCommentClick = (index: number) => {
		setEditingCommentIndex(index)
		setTempEditComment(taskComments[index].content)
	}

	const handleSaveComment = async (commentId: string) => {
		if (editingCommentIndex !== null && tempEditComment.trim()) {
			const updatedComments = [...comments]
			updatedComments[editingCommentIndex] = tempEditComment.trim()
			await updateTaskCommentById(commentId, { content: tempEditComment.trim() })
			setComments(updatedComments)
			setEditingCommentIndex(null)
			setTempEditComment('')
		}
	}

	const handleCancelEditComment = () => {
		setEditingCommentIndex(null)
		setTempEditComment('')
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);

		// Extract components
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		const formattedDate = date.toLocaleDateString(undefined, options);
		const time = date.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
		});

		return `${formattedDate}, ${time}`;
	}

	return (
		<Modal show={show} onHide={onHide} size="md" centered className={styles.customModal}>
			<Modal.Header closeButton>
				<Modal.Title className="fw-bold">{task.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body className={`${styles.modalBody} px-4`}>
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
									border: 'none',
									fontWeight: '600',
								}}
							>
								{formatStringDisplayName(status || 'Select Status')}
							</Dropdown.Toggle>
							<Dropdown.Menu className="w-100">
								{columns.map(column => (
									<Dropdown.Item eventKey={column.name} key={column.id}>
										{column.name}
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
								<div className="d-flex justify-content-end gap-2 mt-2">
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
								{description ? (
									<>
										<div className='d-flex align-items-center justify-content-between'>
											<h6 className="fs-5"><RiAlignLeft size={16} className="my-1" /> Description</h6>
											<button className={styles.editDescriptionBtn} onClick={handleEditClick}>
												Edit
											</button>
										</div>
										<p className="text-dark">{description}</p>
									</>
								) : (
									<>
										<h6 className="fw-bolder fs-5"><RiAlignLeft size={16} className="my-1" /> Description</h6>
										<button className={styles.descriptionBtn} onClick={handleEditClick}
											disabled={!status}>
											Add Description
										</button>
									</>
								)}
							</>
						)}
					</Col>
				</Row>

				<Row>
					<Col>
						<h6 className="fw-bolder fs-5"><RiTimeLine size={16} className="my-1" /> Created At</h6>
						<p className="text-secondary">{formattedDate}</p>
					</Col>
				</Row>
				<Row>
					<Col>
						<h6 className="fw-bolder fs-5">
							<RxActivityLog style={{ color: '#000', fontSize: '16px' }} />{' '}Activity
						</h6>

						<div className="activity-log my-3">
							{task.taskHistory && Array.isArray(task.taskHistory) ? (
								task.taskHistory.map((activity: any, index: number) => (
									<div key={index} className="d-flex align-items-start mb-4">
										<div
											style={{
												backgroundColor: '#f9f9f9',
												padding: '12px 16px',
												borderRadius: '12px',
												boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
												width: '100%',
											}}
										>
											<div className="d-flex justify-content-between">
												<p className="mb-1 fw-bold text-primary">
													{activity.action}
												</p>
												<span className="text-muted small">
													{formatDate(activity.timestamp)}
												</span>
											</div>
											<p className="mb-0 text-muted">
												<strong>User:</strong>{' '}
												{activity.details?.user
													? `${activity.details.user.firstname} ${activity.details.user.lastname}`
													: 'Unknown User'}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-muted">No activity history available.</p>
							)}
						</div>
					</Col>
				</Row>

				<Row>
					<Col>
						<h6 className="fw-bolder fs-5"><RiMessage3Line size={16} className="my-1" /> Comments</h6>
						<div className='my-2'>
							<FormInput
								type="textarea"
								name="newComment"
								placeholder="Add a comment..."
								rows={2}
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
							/>
						</div>
						<div>
							<Button variant="dark" size='sm' onClick={handleAddComment}>
								Add
							</Button>
						</div>
						<div className={`my-2 ${styles.commentsDesign}`}>
							{taskComments.length > 0 ? (
								<ul className="list-unstyled">
									{taskComments.map((comment: any, index: number) => (
										<li key={index} className="mb-2">
											{editingCommentIndex === index ? (
												<>
													<span>
														<img src={generatePlaceholderImage(`${comment.author.firstname} ${comment.author.lastname}`)} alt="Profile" className="rounded-circle" style={{ width: 30, objectFit: 'cover', margin: "2px 5px" }} /></span>
													<span className='fs-4 fw-bolder fs-5'>{comment.author.firstname} {comment.author.lastname} </span>
													<span className='text-muted fs-6'>{formatDate(comment.created_at)}</span>
													{comment.is_edited && <span className='text-muted fs-6'> (Edited)</span>}
													<div className="flex-grow-1 my-2">
														<FormInput
															type="textarea"
															name={`editComment-${index}`}
															value={tempEditComment}
															rows={2}
															onChange={(e) => setTempEditComment(e.target.value)}
														/>
														<div className="d-flex justify-content-end gap-2 mt-2">
															<Button
																variant="outline-secondary"
																size="sm"
																onClick={() => { handleCancelEditComment() }}
															>
																Cancel
															</Button>
															<Button variant="success" size="sm" onClick={() => { handleSaveComment(comment.id) }}>
																Save
															</Button>
														</div>
													</div>
												</>
											) : (
												<>
													<div>
														<span>
															<img src={generatePlaceholderImage(`${comment.author.firstname} ${comment.author.lastname}`)} alt="Profile" className="rounded-circle" style={{ width: 30, objectFit: 'cover', margin: "2px 5px" }} /></span>
														<span className='fs-4 fw-bolder fs-5'>{comment.author.firstname} {comment.author.lastname} </span>
														<span className='text-muted fs-6'>{formatDate(comment.created_at)}</span>
														{comment.is_edited && <span className='text-muted fs-6'> (Edited)</span>}
														<div className="bg-light py-1 px-2 m-2 rounded d-flex align-items-center justify-content-between gap-2" style={{ boxShadow: '1px 1px 1px black' }}>
															<div className='fs-5'>{comment.content}</div>
															<div>
																<RiEdit2Line size={16} className="my-1" color="black" style={{ cursor: 'pointer', margin: "0px 5px" }} onClick={() => handleEditCommentClick(index)} />

																<RiDeleteBin6Line size={16} className="my-1" color="black" style={{ cursor: 'pointer', margin: "0px 5px" }} onClick={() => handleDeleteComment(index)} />
															</div>
														</div>
													</div>
												</>
											)}
										</li>
									))}
								</ul>
							) : (
								<p className="text-muted">No comments added yet.</p>
							)}
						</div>
					</Col>
				</Row>

			</Modal.Body>
		</Modal>

	)
}

export default ViewTaskModal
