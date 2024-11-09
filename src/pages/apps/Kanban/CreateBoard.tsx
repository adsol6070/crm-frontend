import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PageBreadcrumb } from '@/components'
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Swal from 'sweetalert2'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import styles from './kanban.module.css'

// Validation Schema with Yup
const schema = yup.object().shape({
	title: yup.string().required('Board title is required'),
	description: yup
		.string()
		.max(58, 'Description cannot exceed 58 characters')
		.required('Description is required'),
})

interface Board {
	id: string
	title: string
	description: string
}

const CreateBoard = () => {
	const [boards, setBoards] = useState<Board[]>([])
	const [showModal, setShowModal] = useState(false)
	const [mode, setMode] = useState<'create' | 'edit'>('create')
	const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		reset,
		watch,
	} = useForm<Board>({
		resolver: yupResolver(schema),
		defaultValues: {
			title: '',
			description: '',
		},
	})

	// Watch the description field for real-time updates
	const description = watch('description', '')

	useEffect(() => {
		const storedBoards = localStorage.getItem('boards')
		if (storedBoards) {
			setBoards(JSON.parse(storedBoards) as Board[])
		}
	}, [])

	useEffect(() => {
		localStorage.setItem('boards', JSON.stringify(boards))
	}, [boards])

	const handleAddBoard = () => {
		setMode('create')
		setShowModal(true)
		reset({ title: '', description: '' })
		setCurrentBoardId(null)
	}

	const handleCloseModal = () => {
		setShowModal(false)
		reset({ title: '', description: '' })
		setMode('create')
		setCurrentBoardId(null)
	}

	const handleFormSubmit = (data: Board) => {
		if (mode === 'create') {
			const newBoardData = { ...data, id: uuidv4() }
			setBoards([...boards, newBoardData])
		} else if (mode === 'edit' && currentBoardId) {
			const updatedBoards = boards.map((board) =>
				board.id === currentBoardId ? { ...data, id: currentBoardId } : board
			)
			setBoards(updatedBoards)
		}
		handleCloseModal()
	}

	const handleDeleteBoard = (id: string) => {
		Swal.fire({
			title: 'Are you sure?',
			text: 'Do you want to delete this board?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Yes, delete it!',
		}).then((result) => {
			if (result.isConfirmed) {
				const updatedBoards = boards.filter((board) => board.id !== id)
				setBoards(updatedBoards)
			}
		})
	}

	const handleEditBoard = (id: string) => {
		const boardToEdit = boards.find((board) => board.id === id)
		if (boardToEdit) {
			setValue('title', boardToEdit.title)
			setValue('description', boardToEdit.description)
			setCurrentBoardId(id)
			setMode('edit')
			setShowModal(true)
		}
	}

	const moveBoard = (dragIndex: number, hoverIndex: number) => {
		const updatedBoards = [...boards]
		const [draggedBoard] = updatedBoards.splice(dragIndex, 1)
		updatedBoards.splice(hoverIndex, 0, draggedBoard)
		setBoards(updatedBoards)
	}

	const BoardCard = ({ board, index }: { board: Board; index: number }) => {
		const [{ isDragging }, dragRef] = useDrag({
			type: 'BOARD',
			item: { index },
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		})

		const [, dropRef] = useDrop({
			accept: 'BOARD',
			hover: (item: { index: number }) => {
				if (item.index !== index) {
					moveBoard(item.index, index)
					item.index = index
				}
			},
		})

		return (
			<Col
				ref={(node) => dragRef(dropRef(node))}
				style={{ opacity: isDragging ? 0.5 : 1 }}>
				<Card className={styles.boardCard}>
					<Card.Body className={styles.cardBody}>
						<div className={styles.cardContent}>
							<Card.Title className={styles.boardTitle}>
								{board.title}
							</Card.Title>
							<Card.Text className={styles.boardDescription}>
								{board.description}
							</Card.Text>
						</div>
						<div className={styles.buttonContainer}>
							<Button
								variant="outline-primary"
								size="sm"
								className={styles.viewButton}>
								View Board
							</Button>
							<div className={styles.iconButtons}>
								<FaEdit
									className={styles.editIcon}
									onClick={() => handleEditBoard(board.id)}
								/>
								<FaTrashAlt
									className={styles.deleteIcon}
									onClick={() => handleDeleteBoard(board.id)}
								/>
							</div>
						</div>
					</Card.Body>
				</Card>
			</Col>
		)
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<PageBreadcrumb title="Boards" subName="Boards" />
			<div>
				<Row xs={1} md={2} lg={3} className="g-3">
					{boards.map((board, index) => (
						<BoardCard key={board.id} board={board} index={index} />
					))}
					<Col>
						<Card onClick={handleAddBoard} className={styles.addNewBoardCard}>
							<Card.Body className="d-flex justify-content-center align-items-center">
								<FaPlus size={40} color="#007bff" />
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</div>

			{/* Add/Edit Board Modal */}
			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>
						{mode === 'create' ? 'Add New Board' : 'Edit Board'}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleSubmit(handleFormSubmit)}>
						<Form.Group controlId="boardTitle">
							<Form.Label>Board Title</Form.Label>
							<Controller
								control={control}
								name="title"
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder="Enter board title"
										{...field}
										isInvalid={!!errors.title}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.title?.message}
							</Form.Control.Feedback>
						</Form.Group>
						<Form.Group controlId="boardDescription" className="mt-3">
							<Form.Label>Description</Form.Label>
							<Controller
								control={control}
								name="description"
								render={({ field }) => (
									<Form.Control
										as="textarea"
										rows={3}
										placeholder="Enter board description (max 58 characters)"
										{...field}
										isInvalid={!!errors.description}
										maxLength={58}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.description?.message}
							</Form.Control.Feedback>
						</Form.Group>
						<div className="text-muted">
							{description.length} / 58 characters
						</div>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleCloseModal}>
								Close
							</Button>
							<Button variant="primary" type="submit">
								{mode === 'create' ? 'Add Board' : 'Update Board'}
							</Button>
						</Modal.Footer>
					</Form>
				</Modal.Body>
			</Modal>
		</DndProvider>
	)
}

export default CreateBoard
