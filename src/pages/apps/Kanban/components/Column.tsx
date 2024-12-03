import { taskApi, useThemeContext } from '@/common'
import { useKanbanContext } from '../KanbanContext'
import { useDrag, useDrop } from 'react-dnd'
import { AiOutlineClose, AiOutlineFile, AiOutlinePlus } from 'react-icons/ai'
import { BsThreeDots } from 'react-icons/bs'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { ColumnProps } from '@/types/KanbanTypes'
import Button from './Button'
import styled from 'styled-components'

const ColumnContainer = styled.li`
	display: block;
	flex-shrink: 0;
	align-self: flex-start;
	padding: 0 6px;
	height: 100%;
	white-space: nowrap;
`

const ColumnWrapper = styled.div<{ isDark: boolean }>`
	${({ isDark }) => `
    background: ${isDark ? '#404954' : '#f1f2f4'};
	`}
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
	margin-bottom: 1rem;
	width: 272px;
	display: flex;
	position: relative;
	box-sizing: border-box;
	flex-direction: column;
	justify-content: space-between;
	max-height: 100%;
	padding-bottom: 8px;
	border-radius: 12px;
	vertical-align: top;
	white-space: normal;
	scroll-margin: 8px;
`

const Header = styled.div`
	display: flex;
	position: relative;
	flex-grow: 0;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	padding: 8px 8px 0;
	row-gap: 0;
`

const HeaderTitle = styled.h2<{ isEditing: boolean }>`
	display: ${({ isEditing }) => (isEditing ? 'none' : 'block')};
	margin: 0;
	padding: 6px 8px 6px 12px;
	overflow: hidden;
	font-size: 14px;
	color: black;
	font-weight: 600;
	line-height: 20px;
	white-space: normal;
	cursor: pointer;
	overflow-wrap: anywhere;
`

const TitleTextarea = styled.textarea<{ isEditing: boolean }>`
	${({ isEditing }) => `
    position: ${isEditing ? 'static' : 'absolute'};
    z-index: ${isEditing ? '1' : '-1'};
    opacity: ${isEditing ? 1 : 0};
  `}
	height: 32px;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	margin: 0;
	padding: 6px 8px 6px 12px;
	background: transparent;
	border-radius: 8px;
	font-weight: 600;
	resize: none;
	overflow-wrap: break-word;
	font-weight: 600;
	min-height: 20px;
	overflow: hidden;
	box-shadow: none;
`

const CardsList = styled.ol`
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	margin: 0 4px;
	padding: 0 4px;
	overflow-x: hidden;
	overflow-y: auto;
	list-style: none;
	row-gap: 8px;
	padding-top: 2px;
	padding-bottom: 2px;
`

const CardForm = styled.li<{ isFormVisible: boolean }>`
	display: ${({ isFormVisible }) => (isFormVisible ? 'block' : 'none')};
	scroll-margin: 8px;

	form {
		textarea {
			width: 100%;
			height: 56px;
			min-height: 36px;
			max-height: 160px;
			margin: 0;
			padding: 8px 12px;
			border: none;
			border-radius: 8px;
			resize: none;
			overflow-wrap: break-word;
			outline: none;
			font-size: 14px;
			font-weight: 400;
			overflow: hidden;
			overflow-y: auto;
		}

		div {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 4px;
			margin-top: 8px;
		}
	}
`

const Footer = styled.div<{ isFormVisible: boolean }>`
	display: ${({ isFormVisible }) => (isFormVisible ? 'none' : 'flex')};
	align-items: center;
	justify-content: space-between;
	padding: 8px 8px 0;
	column-gap: 4px;
`

const AddCardButton = styled.button`
	display: flex;
	flex-grow: 1;
	align-items: center;
	justify-content: flex-start;
	border: none;
	margin: 0px;
	padding: 6px 12px 6px 8px;
	border-radius: 8px;
	text-decoration: none;
	user-select: none;
	font-size: 14px;
	line-height: 20px;
	transition: background-color 85ms ease;

	&:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}
`

const DotsIcon = styled(BsThreeDots)<{ isDark: boolean }>`
	cursor: pointer;
	color: ${({ isDark }) => (isDark ? '#ffffff' : '#333333')};
	padding: 8px;
	border-radius: 8px;
`

function useMergeRefs(...refs) {
	return useRef((node) => {
		refs.forEach((ref) => {
			if (typeof ref === 'function') {
				ref(node)
			} else if (ref) {
				ref.current = node
			}
		})
	}).current
}

const Column = ({
	id,
	columnId,
	title,
	children,
	status,
	taskCount,
	isFormVisible,
}: ColumnProps) => {
	const containerRef = useRef<HTMLOListElement>(null)
	const { settings } = useThemeContext()
	const {
		addTaskToSection,
		newTaskTitle,
		setNewTaskTitle,
		setColumnFormState,
		moveCard,
		setOpenColumnStatus,
		boardId,
	} = useKanbanContext()

	const [{ isDragging }, drag] = useDrag({
		type: 'column',
		item: { columnId },
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	})

	const [, drop] = useDrop({
		accept: 'card',
		drop: (item, monitor) => {
			const clientOffset = monitor.getClientOffset()
			const columnCards = Array.from(containerRef.current?.children || [])
			const tolerance = 2
			let dropIndex = columnCards.findIndex((card) => {
				const rect = card.getBoundingClientRect()
				return (
					clientOffset &&
					clientOffset.y >= rect.top - tolerance &&
					clientOffset.y <= rect.bottom + tolerance
				)
			})

			if (dropIndex === -1) {
				dropIndex = columnCards.length
			}

			moveCard(item?.columnId, columnId, item?.card, dropIndex)
		},
	})

	const [isEditing, setIsEditing] = useState(false)
	const [currentTitle, setCurrentTitle] = useState(title)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (isEditing) {
			textareaRef.current?.setSelectionRange(0, currentTitle.length)
			textareaRef.current?.focus()
		}
	}, [isEditing])

	useEffect(() => {
		setCurrentTitle(title)
	}, [title])

	const handleBlur = async () => {
		if (currentTitle.trim() === '') {
			setIsEditing(false)
			return
		}

		if (currentTitle.trim() === title.trim()) {
			setIsEditing(false)
			return
		}

		try {
			await taskApi.updateTaskColumn(boardId, {
				taskStatus: [{ id: columnId, name: currentTitle }],
			})
		} catch (error) {
			console.error('Error saving title:', error)
			setCurrentTitle(title)
		} finally {
			setIsEditing(false)
		}
	}

	const handleAddCardClick = () => {
		setOpenColumnStatus((prev) => (prev === columnId ? null : columnId))
		setColumnFormState({
			columnName: '',
			isFormVisible: false,
		})
		setNewTaskTitle('')
	}

	const handleFormCancel = () => {
		setOpenColumnStatus(null)
		setNewTaskTitle('')
	}

	const handleTaskSubmit = () => {
		if (newTaskTitle.trim() === '') {
			handleFormCancel()
			return
		}
		addTaskToSection(status, columnId)
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleTaskSubmit()
		}
	}

	const handleTaskCreationSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		handleTaskSubmit()
	}

	const mergedRef = useMergeRefs(drag, drop)

	return (
		<ColumnContainer ref={mergedRef} id={id}>
			<ColumnWrapper isDark={settings.theme === 'dark'}>
				<Header>
					<div
						style={{
							position: 'relative',
							flexBasis: 'min-content',
							flexGrow: 1,
							flexShrink: 1,
							minHeight: '20px',
						}}
						onClick={() => {
							setIsEditing(true)
						}}>
						<HeaderTitle isEditing={isEditing}>{currentTitle}</HeaderTitle>
						<TitleTextarea
							ref={textareaRef}
							isEditing={isEditing}
							dir="auto"
							maxLength={512}
							spellCheck="false"
							value={currentTitle}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setCurrentTitle(e.target.value)
							}
							onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault()
									handleBlur()
								}
							}}
							onBlur={handleBlur}></TitleTextarea>
					</div>
					<DotsIcon size={34} isDark={settings.theme === 'dark'} />
				</Header>

				<CardsList ref={containerRef}>
					{children}
					<CardForm isFormVisible={isFormVisible}>
						<form onSubmit={handleTaskCreationSubmit}>
							<textarea
								dir="auto"
								placeholder="Enter a title or paste a link"
								value={newTaskTitle}
								onChange={(e) => setNewTaskTitle(e.target.value)}
								onKeyDown={handleKeyDown}></textarea>
							<div>
								<Button
									type="submit"
									background="#579dff"
									color="#1D2125"
									padding="6px 12px"
									borderRadius="3px"
									lineHeight="20px">
									Add Card
								</Button>
								<Button
									background="transparent"
									padding="6px"
									borderRadius="3px"
									hoverBackground="rgba(0, 0, 0, 0.1)"
									transition="background 0.2s ease-in-out"
									onClick={handleFormCancel}>
									<AiOutlineClose size={20} color="#333" />
								</Button>
							</div>
						</form>
					</CardForm>
				</CardsList>

				<Footer isFormVisible={isFormVisible}>
					<AddCardButton onClick={handleAddCardClick}>
						<AiOutlinePlus size={15} color="#333" className="me-1" />
						Add a card
					</AddCardButton>
					<AiOutlineFile size={15} color="#333" className="me-1" />
				</Footer>
			</ColumnWrapper>
		</ColumnContainer>
	)
}

export default Column
