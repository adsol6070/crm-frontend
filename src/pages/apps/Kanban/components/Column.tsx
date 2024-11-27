import { useThemeContext } from '@/common'
import { useKanbanContext } from '../KanbanContext'
import { useDrop } from 'react-dnd'
import { AiOutlineClose, AiOutlineFile, AiOutlinePlus } from 'react-icons/ai'
import { BsThreeDots } from 'react-icons/bs'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { ColumnProps } from '@/types/KanbanTypes'
import { kanbanBackgroundStyle } from '@/utils'
import Button from './Button'

const Column = ({
	columnId,
	title,
	children,
	status,
	taskCount,
	isFormVisible,
}: ColumnProps) => {
	const { settings } = useThemeContext()
	const {
		addTaskToSection,
		newTaskTitle,
		setNewTaskTitle,
		setColumnFormState,
		moveCard,
		setOpenColumnStatus,
	} = useKanbanContext()

	const [, drop] = useDrop({
		accept: 'card',
		drop: (item, monitor) => {
			moveCard(item?.columnId, columnId, item?.card, item?.index)
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

	return (
		<li
			ref={drop}
			style={{
				display: 'block',
				flexShrink: 0,
				alignSelf: 'flex-start',
				padding: '0 6px',
				height: '100%',
				whiteSpace: 'nowrap',
			}}>
			<div
				style={{
					...kanbanBackgroundStyle(settings.theme === 'dark'),
					boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
					marginBottom: '1rem',
					width: '272px',
					display: 'flex',
					position: 'relative',
					boxSizing: 'border-box',
					flexDirection: 'column',
					justifyContent: 'space-between',
					maxHeight: '100%',
					paddingBottom: '8px',
					borderRadius: '12px',
					verticalAlign: 'top',
					whiteSpace: 'normal',
					scrollMargin: '8px',
					background: '#f1f2f4',
				}}>
				<div
					id="header"
					style={{
						display: 'flex',
						position: 'relative',
						flexGrow: 0,
						flexWrap: 'wrap',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						padding: '8px 8px 0',
						rowGap: '0',
					}}>
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
						<h2
							style={{
								display: isEditing ? 'none' : 'block',
								margin: 0,
								padding: '6px 8px 6px 12px',
								overflow: 'hidden',
								fontSize: '14px',
								color: 'black',
								fontWeight: 600,
								lineHeight: '20px',
								whiteSpace: 'normal',
								cursor: 'pointer',
								overflowWrap: 'anywhere',
							}}>
							{currentTitle}
						</h2>
						<textarea
							ref={textareaRef}
							dir="auto"
							maxLength={512}
							spellCheck="false"
							value={currentTitle}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setCurrentTitle(e.target.value)
							}
							onBlur={() => {
								setIsEditing(false)
							}}
							style={{
								height: '32px',
								position: isEditing ? 'static' : 'absolute',
								zIndex: isEditing ? '1' : '-1',
								top: 0,
								right: 0,
								bottom: 0,
								left: 0,
								boxSizing: 'border-box',
								minHeight: '20px',
								margin: 0,
								padding: '6px 8px 6px 12px',
								overflow: 'hidden',
								borderRadius: '8px',
								opacity: isEditing ? 1 : 0,
								background: 'transparent',
								boxShadow: 'none',
								fontWeight: 600,
								resize: 'none',
								overflowWrap: 'break-word',
							}}></textarea>
					</div>
					<div>
						<BsThreeDots
							size={34}
							style={{
								cursor: 'pointer',
								color: settings.theme === 'dark' ? '#ffffff' : '#333333',
								padding: '8px',
								borderRadius: '8px',
								marginBottom: '0px',
							}}
						/>
					</div>
				</div>
				<ol
					style={{
						display: 'flex',
						flex: '1 1 auto',
						flexDirection: 'column',
						margin: '0 4px',
						padding: '0 4px',
						overflowX: 'hidden',
						overflowY: 'auto',
						listStyle: 'none',
						rowGap: '8px',
						paddingTop: '2px',
						paddingBottom: '2px',
					}}>
					{children}
					<li
						style={{
							display: isFormVisible ? 'block' : 'none',
							scrollMargin: '8px',
						}}>
						<form onSubmit={handleTaskCreationSubmit}>
							<textarea
								dir="auto"
								placeholder="Enter a title or paste a link"
								value={newTaskTitle}
								onChange={(e) => setNewTaskTitle(e.target.value)}
								onKeyDown={handleKeyDown}
								style={{
									width: '100%',
									height: '56px',
									minHeight: '36px',
									maxHeight: '160px',
									margin: 0,
									padding: '8px 12px',
									overflow: 'hidden',
									overflowY: 'auto',
									border: 'none',
									borderRadius: '8px',
									resize: 'none',
									overflowWrap: 'break-word',
									outline: 'none',
									fontSize: '14px',
									fontWeight: 400,
								}}></textarea>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'flex-start',
									gap: '4px',
									marginTop: '8px',
								}}>
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
					</li>
				</ol>

				<div
					id="list-footer"
					style={{
						display: isFormVisible ? 'none' : 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '8px 8px 0',
						columnGap: '4px',
					}}>
					<button
						style={{
							display: 'flex',
							flexGrow: 1,
							alignItems: 'center',
							justifyContent: 'flex-start',
							border: 'none',
							margin: '0px',
							padding: '6px 12px 6px 8px',
							borderRadius: '8px',
							textDecoration: 'none',
							userSelect: 'none',
							fontSize: '14px',
							lineHeight: '20px',
							transition: 'background-color 85ms ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent'
						}}
						onClick={handleAddCardClick}>
						<AiOutlinePlus size={15} color="#333" className="me-1" />
						Add a card
					</button>
					<AiOutlineFile size={15} color="#333" className="me-1" />
				</div>
			</div>
		</li>
	)
}

export default Column
