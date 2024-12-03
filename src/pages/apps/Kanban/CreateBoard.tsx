import { useState } from 'react'
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useForm, Controller } from 'react-hook-form'
import { ToastContainer } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { PageBreadcrumb } from '@/components'
import { usePermissions, useThemeContext } from '@/common'
import { addNewBoardTextStyle, hasPermission } from '@/utils'
import Swal from 'sweetalert2'
import * as yup from 'yup'
import 'react-toastify/ReactToastify.css'
import useBoard from './useBoard'
import styles from './kanban.module.css'

const colorOptions = [
	'#7f8c8d',
	'#34495e',
	'#c0392b',
	'#2980b9',
	'#01a3a4',
	'#be2edd',
]

const schema = yup.object().shape({
	boardTitle: yup.string().required('Board title is required'),
	boardDescription: yup
		.string()
		.max(58, 'Description cannot exceed 58 characters')
		.required('Description is required'),
})

interface Board {
	id?: string
	tenantID?: string
	boardColor: string
	boardTitle: string
	boardDescription: string
}

const CreateBoard = () => {
	const {
		boards,
		setBoards,
		createBoard,
		deleteBoard,
		updateBoard,
		updateBoardOrder,
	} = useBoard()
	const [showModal, setShowModal] = useState(false)
	const [mode, setMode] = useState<'create' | 'edit'>('create')
	const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)
	const [selectedColor, setSelectedColor] = useState<string | null>(null)
	const navigate = useNavigate()
	const { settings } = useThemeContext()
	const { permissions } = usePermissions()

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		reset,
		watch,
	} = useForm<{ boardTitle: string; boardDescription: string }>({
		resolver: yupResolver(schema),
		defaultValues: {
			boardTitle: '',
			boardDescription: '',
		},
	})

	const description = watch('boardDescription', '')

	const handleAddBoard = () => {
		setMode('create')
		setShowModal(true)
		setSelectedColor(null)
		reset({ boardTitle: '', boardDescription: '' })
	}

	const handleCloseModal = () => {
		setShowModal(false)
		reset({ boardTitle: '', boardDescription: '' })
		setMode('create')
		setCurrentBoardId(null)
	}

	const handleFormSubmit = (data: Board) => {
		const boardColor =
			selectedColor ||
			colorOptions[Math.floor(Math.random() * colorOptions.length)]
		if (mode === 'create') {
			const combinedData = {
				...data,
				boardColor,
			}

			createBoard(combinedData)
		} else if (mode === 'edit' && currentBoardId) {
			updateBoard(currentBoardId, data)
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
				deleteBoard(id)
			}
		})
	}

	const handleEditBoard = (id: string) => {
		const boardToEdit = boards.find((board) => board.id === id) as
			| Board
			| undefined
		if (boardToEdit) {
			setValue('boardTitle', boardToEdit.boardTitle)
			setValue('boardDescription', boardToEdit.boardDescription)
			setMode('edit')
			setShowModal(true)
			setCurrentBoardId(id)
		}
	}

	const handleViewBoard = (id: string) => {
		navigate(`/kanban/${id}`)
	}

	const moveBoard = (dragIndex: number, hoverIndex: number) => {
		const updatedBoards = [...boards]
		const [draggedBoard] = updatedBoards.splice(dragIndex, 1)
		updatedBoards.splice(hoverIndex, 0, draggedBoard)
		setBoards(updatedBoards)

		const orderedBoards = updatedBoards.map((board, index) => ({
			boardId: board.id,
			order: index,
		}))

		updateBoardOrder(orderedBoards)
	}

	const BoardCard = ({ board, index }: { board: any; index: number }) => {
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
				ref={(node: any) => dragRef(dropRef(node))}
				style={{ opacity: isDragging ? 0.5 : 1 }}>
				<Card
					className={styles.boardCard}
					style={{ backgroundColor: board.boardColor }}>
					<Card.Body className={styles.cardBody}>
						<div className={styles.cardContent}>
							<Card.Title
								className={styles.boardTitle}
								style={{ color: 'white' }}>
								{board.boardTitle}
							</Card.Title>
							<Card.Text
								className={styles.boardDescription}
								style={{ color: 'white' }}>
								{board.boardDescription}
							</Card.Text>
						</div>
						<div className={`${styles.buttonContainer}`}>
							<button
								className={styles.viewButton}
								onClick={() => handleViewBoard(board.id)}>
								View Board
							</button>
							<div className={styles.iconButtons}>
								{hasPermission(permissions, 'Task', 'Edit') && (
									<FaEdit
										className={styles.editIcon}
										style={{ color: 'white' }}
										onClick={() => handleEditBoard(board.id)}
									/>
								)}
								{hasPermission(permissions, 'Task', 'Delete') && (
									<FaTrashAlt
										className={styles.deleteIcon}
										style={{ color: 'white' }}
										onClick={() => handleDeleteBoard(board.id)}
									/>
								)}
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
			<ToastContainer />
			<div>
				<Row xs={1} md={3} lg={4} className="g-3">
					{hasPermission(permissions, 'Task', 'Read') && (
						<>
							{boards.map((board, index) => (
								<BoardCard key={board.id} board={board} index={index} />
							))}
						</>
					)}
					{hasPermission(permissions, 'Task', 'Create') && (
						<Col>
							<Card onClick={handleAddBoard} className={styles.addNewBoardCard}>
								<Card.Body className="d-flex justify-content-center align-items-center">
									<FaPlus
										size={40}
										color="#007bff"
										style={addNewBoardTextStyle(settings.theme === 'dark')}
									/>
								</Card.Body>
							</Card>
						</Col>
					)}
				</Row>
			</div>

			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>
						{mode === 'create' ? 'Add New Board' : 'Edit Board'}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleSubmit(handleFormSubmit)}>
						<Form.Label>Background</Form.Label>
						<div className="d-flex">
							{colorOptions.map((color) => (
								<div
									key={color}
									onClick={() => setSelectedColor(color)}
									style={{
										backgroundColor: color,
										width: 30,
										height: 30,
										borderRadius: '50%',
										marginRight: 8,
										cursor: 'pointer',
										border:
											selectedColor === color ? '2px solid black' : 'none',
									}}
								/>
							))}
						</div>
						<Form.Group controlId="boardTitle" className="mt-2">
							<Form.Label>Board Title</Form.Label>
							<Controller
								control={control}
								name="boardTitle"
								render={({ field }) => (
									<Form.Control
										type="text"
										placeholder="Enter board title"
										{...field}
										isInvalid={!!errors.boardTitle}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.boardTitle?.message}
							</Form.Control.Feedback>
						</Form.Group>
						<Form.Group controlId="boardDescription" className="mt-2">
							<Form.Label>Description</Form.Label>
							<Controller
								control={control}
								name="boardDescription"
								render={({ field }) => (
									<Form.Control
										as="textarea"
										rows={3}
										placeholder="Enter board description (max 58 characters)"
										{...field}
										isInvalid={!!errors.boardDescription}
										maxLength={58}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.boardDescription?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<div className="text-muted mt-2">
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
