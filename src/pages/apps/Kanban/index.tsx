import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PageBreadcrumb } from '@/components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { RiDeleteBinLine } from 'react-icons/ri'
import { LuMoveRight } from 'react-icons/lu'
import { SlPencil } from 'react-icons/sl'
import { MdContentCopy } from 'react-icons/md'
import ViewTaskModal from './modals/viewTaskModal'
import {
	ColumnProps,
	CardType,
	KanbanState,
	CardProps,
} from '@/types/KanbanTypes'
import { taskCommentsApi, useThemeContext } from '@/common'
import { kanbanBackgroundStyle } from '@/utils'
import { BsThreeDots } from 'react-icons/bs'
import { useKanbanContext } from './KanbanContext'
import MoveModal from './modals/moveModal'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { AiOutlineClose, AiOutlineFile, AiOutlinePlus } from 'react-icons/ai'
import CopyModal from './modals/copyModal'
import { MdOutlineSubject } from 'react-icons/md'
import { FaRegComments } from "react-icons/fa6";

const ItemType = {
	CARD: 'card',
}

const Column = ({
	columnId,
	title,
	children,
	status,
	taskCount,
	isFormVisible,
	setOpenColumnStatus,
}: ColumnProps) => {
	const { settings } = useThemeContext()
	const {
		handleDrop,
		addTaskToSection,
		newTaskTitle,
		setNewTaskTitle,
		setIsFormVisible,
		setListName,
	} = useKanbanContext()

	const [, drop] = useDrop({
		accept: ItemType.CARD,
		drop: (
			draggedItem: CardType & { status: keyof KanbanState; index: number }
		) => {
			if (draggedItem.status !== status) {
				handleDrop(draggedItem, status)
			}
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
		setIsFormVisible(false)
		setListName('')
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
								<button
									type="submit"
									style={{
										margin: '0px',
										border: 'none',
										backgroundColor: '#579dff',
										color: '#1D2125',
										fontSize: '14px',
										lineHeight: '20px',
										display: 'inline-flex',
										boxSizing: 'border-box',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '6px 12px',
										borderRadius: '3px',
										textDecoration: 'none',
										whiteSpace: 'normal',
										cursor: 'pointer',
										fontWeight: 500,
									}}>
									Add card
								</button>
								<button
									type="button"
									style={{
										border: 'none',
										backgroundColor: 'transparent',
										boxShadow: 'none',
										display: 'inline-flex',
										boxSizing: 'border-box',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '6px',
										borderRadius: '3px',
										cursor: 'pointer',
										transition: 'all 0.2s ease-in-out',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'transparent'
									}}
									onClick={handleFormCancel}
									aria-label="Close">
									<AiOutlineClose size={20} color="#333" />
								</button>
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
							margin: '0px',
							padding: '6px 12px 6px 8px',
							borderRadius: '8px',
							textDecoration: 'none',
							userSelect: 'none',
							border: 'none',
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

const KanbanCard = ({ card, index, status }: CardProps) => {
	const { moveCard, highlightTask, editableRef, setTaskCardDimensions } =
		useKanbanContext()

	const [{ isDragging }, ref] = useDrag({
		type: ItemType.CARD,
		item: { ...card, index, status },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	})

	const [, drop] = useDrop({
		accept: ItemType.CARD,
		hover: (
			draggedItem: CardType & { index: number; status: keyof KanbanState }
		) => {
			if (draggedItem.index !== index || draggedItem.status !== status) {
				moveCard(draggedItem, index, status)
				draggedItem.index = index
				draggedItem.status = status
			}
		},
	})

	const [isCardHovered, setIsCardHovered] = useState<boolean>(false)
	const [allComments, setAllComments] = useState<boolean>(false)
	const getComments = async () => {
		const comments = await taskCommentsApi.getAllTaskCommentsWithoutId();
		setAllComments(comments)
	}

	useEffect(() => {
		getComments()
	}, [])

	const getTaskCommentsCount = (taskComments: any, taskId: string) => {
		if (taskComments) {
			return taskComments.filter((comment: any) => comment.task_id === taskId).length;
		}
		return 0
	}

	const prepareTaskForEditing = (e: React.MouseEvent<HTMLDivElement>) => {
		highlightTask(card)

		const liElement = e.currentTarget.closest('li')
		if (liElement) {
			const rect = liElement.getBoundingClientRect()
			setTaskCardDimensions({
				width: rect.width,
				height: rect.height,
				top: rect.top,
				left: rect.left,
				bottom: rect.bottom,
				right: rect.right,
			})
		}

		setTimeout(() => {
			if (editableRef.current) {
				editableRef.current.focus()
				const range = document.createRange()
				range.selectNodeContents(editableRef.current)
				const selection = window.getSelection()
				selection?.removeAllRanges()
				selection?.addRange(range)
			}
		}, 0)
	}

	return (
		<>
			<div style={{ position: 'relative' }}>
				<li
					ref={(node: any) => ref(drop(node))}
					style={{
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						rowGap: '8px',
						scrollMargin: '80px',
					}}
					onMouseEnter={() => setIsCardHovered(true)}
					onMouseLeave={() => setIsCardHovered(false)}>
					<div
						style={{
							position: 'relative',
							minHeight: '36px',
							borderRadius: '8px',
							boxShadow:
								'0px 1px 1px rgba(0, 0, 0, 0.2), 0px 0px 1px rgba(0, 0, 0, 0.2)',
							color: '#000',
							cursor: 'pointer',
							scrollMargin: '8px',
							background: 'white',
						}}>
						<div
							style={{
								display: 'flow-root',
								position: 'relative',
								zIndex: '10',
								minHeight: '24px',
								padding: '8px 12px 4px',
							}}>
							<a
								ref={editableRef}
								draggable="false"
								dir="auto"
								style={{
									display: 'block',
									marginBottom: '4px',
									overflow: 'hidden',
									overflowWrap: 'break-word',
									whiteSpace: 'normal',
								}}>
								{card.title}
								<br />
								{card.description &&
									<span className='mx-1'>
										<MdOutlineSubject
											style={{ color: '#000', fontSize: '16px' }}
										/>
									</span>
								}
								{getTaskCommentsCount(allComments, card.id) !== 0 &&
									(
										<span>
											<FaRegComments style={{ color: '#000', fontSize: '16px' }} /> <span>{getTaskCommentsCount(allComments, card.id)}</span>
										</span>
									)
								}
							</a>
						</div>
						{isCardHovered && (
							<div
								style={{
									display: 'flex',
									flexDirection: 'row-reverse',
									alignItems: 'center',
									position: 'absolute',
									zIndex: 10,
									top: '3px',
									right: '3px',
									lineHeight: 1,
									padding: '6px',
									background: 'white',
									borderRadius: '50%',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent'
								}}
								onClick={prepareTaskForEditing}>
								<SlPencil size={12} />
							</div>
						)}
					</div>
				</li>
			</div>
		</>
	)
}

const Kanban = () => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const {
		kanbanState,
		highlightedTaskId,
		setHighlightedTaskId,
		handleStatusChange,
		isViewTaskModalVisible,
		setIsViewTaskModalVisible,
		selectedTask,
		showMoveModal,
		setShowMoveModal,
		updateTaskById,
		editTask,
		setEditTask,
		updateTask,
		viewTaskModal,
		onMoveTask,
		removeTask,
		listName,
		setListName,
		handleAddList,
		taskCardDimensions,
		isFormVisible,
		setIsFormVisible,
		openColumnStatus,
		setOpenColumnStatus,
		showCopyModal,
		setShowCopyModal,
		createTask,
		onCopyTask,
	} = useKanbanContext()

	useEffect(() => {
		if (highlightedTaskId && textareaRef.current) {
			setTimeout(() => {
				textareaRef.current?.focus()
				textareaRef.current?.setSelectionRange(
					0,
					textareaRef.current?.value.length
				)
			}, 0)
		}
	}, [highlightedTaskId])

	const handleShowForm = () => {
		if (openColumnStatus) {
			setOpenColumnStatus(null)
		}
		setIsFormVisible(true)
	}

	const handleHideForm = () => {
		setIsFormVisible(false)
		setListName('')
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			updateTask()
		}
	}

	const handleTaskUpdateSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		updateTask()
	}

	const handleKeyDownn = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			await handleAddList()
		}
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<div
				style={{
					backgroundImage: 'url("/images/kanban-background.jpeg")',
					backgroundSize: 'cover',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					padding: '1rem',
				}}>
				<ToastContainer />
				<PageBreadcrumb title="Kanban" subName="Kanban" />
				<div
					style={{
						flexGrow: 1,
						marginTop: '12px',
						position: 'relative',
						height: '77vh',
					}}>
					<ol
						style={{
							bottom: 0,
							left: 0,
							marginBottom: '8px',
							overflowX: 'auto',
							overflowY: 'hidden',
							paddingBottom: '8px',
							paddingTop: '2px',
							position: 'absolute',
							right: 0,
							scrollbarColor: '#fff6 #00000026',
							scrollbarWidth: 'auto',
							top: '-2px',
							userSelect: 'none',
							whiteSpace: 'nowrap',
							display: 'flex',
							flexDirection: 'row',
							padding: '0 6px',
							listStyle: 'none',
						}}>
						{kanbanState.columns?.map((column, index) => (
							<Column
								key={index}
								columnId={column.id}
								title={column.name || 'Default Status'}
								status={column.name}
								taskCount={column.cards.length}
								isFormVisible={openColumnStatus === column.id}
								setOpenColumnStatus={setOpenColumnStatus}>
								{column.cards.map((card, cardIndex) => (
									<KanbanCard
										key={card.id}
										card={card}
										index={cardIndex}
										status={column.name}
									/>
								))}
							</Column>
						))}
						<div
							style={{
								display: isFormVisible ? 'block' : 'none',
								flexShrink: 0,
								alignSelf: 'flex-start',
								padding: '0 6px',
							}}>
							<form
								onSubmit={(e) => {
									e.preventDefault()
									handleAddList()
								}}
								style={{
									boxSizing: 'border-box',
									width: '272px',
									padding: '8px',
									borderRadius: '12px',
									background: 'rgba(241, 242, 244)',
								}}>
								<textarea
									value={listName}
									onChange={(event) => setListName(event.target.value)}
									onKeyDown={handleKeyDownn}
									style={{
										height: '32px',
										width: '100%',
										minHeight: '20px',
										maxHeight: '256px',
										margin: '0px',
										padding: '6px 12px',
										overflow: 'hidden',
										borderRadius: '4px',
										resize: 'none',
										fontWeight: 600,
										overflowWrap: 'break-word',
										outline: 'none',
									}}
									spellCheck="false"
									dir="auto"
									maxLength={512}
									autoComplete="off"
									placeholder="Enter list name..."></textarea>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'flex-start',
										marginTop: '8px',
										borderRadius: '4px',
										gap: '4px',
									}}>
									<button
										type="submit"
										style={{
											border: 'none',
											backgroundColor: '#007BFF',
											color: '#FFFFFF',
											boxShadow: 'none',
											fontSize: '14px',
											fontWeight: 'bold',
											lineHeight: '20px',
											display: 'inline-flex',
											boxSizing: 'border-box',
											alignItems: 'center',
											justifyContent: 'center',
											padding: '6px 12px',
											borderRadius: '3px',
											textDecoration: 'none',
											whiteSpace: 'normal',
											cursor: 'pointer',
										}}>
										Add list
									</button>
									<button
										type="button"
										onClick={handleHideForm}
										style={{
											border: 'none',
											backgroundColor: 'transparent',
											boxShadow: 'none',
											display: 'inline-flex',
											boxSizing: 'border-box',
											alignItems: 'center',
											justifyContent: 'center',
											padding: '6px',
											borderRadius: '3px',
											cursor: 'pointer',
											transition: 'all 0.2s ease-in-out',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor =
												'rgba(0, 0, 0, 0.1)'
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'transparent'
										}}
										aria-label="Close">
										<AiOutlineClose size={20} color="#333" />
									</button>
								</div>
							</form>
						</div>

						<div
							style={{
								display: isFormVisible ? 'none' : 'block',
								flexShrink: 0,
								alignSelf: 'flex-start',
								padding: '0 6px',
								flexGrow: 1,
								height: '100%',
							}}>
							<button
								style={{
									display: 'flex',
									justifyContent: 'flex-start',
									alignItems: 'center',
									width: '272px',
									padding: '12px',
									borderRadius: '12px',
									background: 'rgba(241, 242, 244)',
									border: 'none',
								}}
								onClick={handleShowForm}>
								<AiOutlinePlus size={15} color="#333" className="me-1" />
								Add another list
							</button>
						</div>
					</ol>
				</div>
				{selectedTask && (
					<ViewTaskModal
						show={isViewTaskModalVisible}
						onHide={() => setIsViewTaskModalVisible(false)}
						task={selectedTask}
						handleStatusChange={handleStatusChange}
						updateTask={updateTaskById}
					/>
				)}
				{selectedTask && (
					<MoveModal
						show={showMoveModal}
						onHide={() => setShowMoveModal(false)}
						task={selectedTask}
						handleStatusChange={handleStatusChange}
					/>
				)}
				{selectedTask && (
					<CopyModal
						show={showCopyModal}
						onHide={() => setShowCopyModal(false)}
						task={selectedTask}
						createTask={createTask}
					/>
				)}
			</div>
			{highlightedTaskId && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						background: '#00000099',
						zIndex: 11,
					}}
					onClick={() => setHighlightedTaskId(null)}>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							position: 'fixed',
							top: taskCardDimensions?.top,
							left: taskCardDimensions?.left,
							width: taskCardDimensions?.width,
							zIndex: 999999999,
						}}>
						<form onSubmit={handleTaskUpdateSubmit}>
							<div
								style={{
									position: 'relative',
									minHeight: '36px',
									borderRadius: '8px',
									backgroundColor: '#ffffff',
									color: '#B6C2CF',
									cursor: 'pointer',
									scrollMargin: '8px',
								}}>
								<div
									style={{
										display: 'flow-root',
										position: 'relative',
										zIndex: 10,
										minHeight: '24px',
										padding: '8px 12px 4px',
									}}>
									<textarea
										ref={textareaRef}
										value={editTask}
										onChange={(e) => setEditTask(e.target.value)}
										onKeyDown={handleKeyDown}
										style={{
											height: '56px',
											backgroundColor: 'unset',
											marginBottom: '4px',
											padding: 0,
											overflow: 'hidden',
											overflowWrap: 'break-word',
											resize: 'none',
											width: '100%',
											border: 'none',
											borderRadius: '3px',
											boxSizing: 'border-box',
											display: 'block',
											lineHeight: '20px',
											outline: 'none',
											fontSize: '14px',
											fontWeight: 400,
										}}></textarea>
								</div>
							</div>
							<button
								type="submit"
								style={{
									marginTop: '8px',
									marginBottom: 0,
									border: 'none',
									backgroundColor: '#579DFF',
									color: '#1D2125',
									display: 'inline-flex',
									boxSizing: 'border-box',
									alignItems: 'center',
									justifyContent: 'center',
									padding: '6px 12px',
									borderRadius: '3px',
									textDecoration: 'none',
									whiteSpace: 'normal',
									cursor: 'pointer',
									fontWeight: 500,
								}}>
								Save
							</button>
						</form>
						<div
							style={{
								position: 'fixed',
								top: taskCardDimensions?.top,
								left: taskCardDimensions?.left + taskCardDimensions?.width + 5,
							}}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-start',
								}}>
								<button
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										margin: '0px',
										padding: '6px 12px 6px 10px',
										borderRadius: '3px',
										textDecoration: 'none',
										userSelect: 'none',
										border: 'none',
										fontSize: '14px',
										lineHeight: '20px',
										marginBottom: '4px',
										fontWeight: 500,
									}}
									onClick={viewTaskModal}>
									<AiOutlinePlus size={15} color="#333" className="me-1" />
									Open card
								</button>
								<button
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										margin: '0px',
										padding: '6px 12px 6px 10px',

										borderRadius: '3px',
										textDecoration: 'none',
										userSelect: 'none',
										border: 'none',
										fontSize: '14px',
										lineHeight: '20px',
										fontWeight: 500,
										marginBottom: '4px',
									}}
									onClick={onMoveTask}>
									<LuMoveRight size={14} color="#333" className="me-1" />
									Move
								</button>
								<button
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										margin: '0px',
										padding: '6px 12px 6px 10px',
										borderRadius: '3px',
										textDecoration: 'none',
										userSelect: 'none',
										border: 'none',
										fontSize: '14px',
										lineHeight: '20px',
										fontWeight: 500,
										marginBottom: '4px',
									}}
									onClick={onCopyTask}>
									<MdContentCopy size={14} color="#333" className="me-1" />
									Copy
								</button>
								<button
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										margin: '0px',
										padding: '6px 12px 6px 10px',
										borderRadius: '3px',
										textDecoration: 'none',
										userSelect: 'none',
										border: 'none',
										fontSize: '14px',
										lineHeight: '20px',
										fontWeight: 500,
										marginBottom: '4px',
									}}
									onClick={removeTask}>
									<RiDeleteBinLine size={14} color="#333" className="me-1" />
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</DndProvider>
	)
}

export default Kanban
