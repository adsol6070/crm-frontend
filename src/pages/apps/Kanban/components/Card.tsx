import { CardProps } from '@/types/KanbanTypes'
import { useKanbanContext } from '../KanbanContext'
import { useDrag } from 'react-dnd'
import { useEffect, useState } from 'react'
import { SlPencil } from 'react-icons/sl'
import { MdOutlineSubject } from 'react-icons/md'
import { FaRegComments } from 'react-icons/fa'
import { taskCommentsApi } from '@/common'

const KanbanCard = ({ card, index, status, columnId }: CardProps) => {
	const {
		highlightTask,
		editableRef,
		setTaskCardDimensions,
		setHighlightedTaskId,
		toggleModal,
		setEditTask,
		setSelectedTask,
	} = useKanbanContext()

	const [, drag] = useDrag({
		type: 'card',
		item: { card, index, status, columnId },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	})

	const [isCardHovered, setIsCardHovered] = useState<boolean>(false)
	const [isDescriptionHovered, setIsDescriptionHovered] = useState(false)

	const [allComments, setAllComments] = useState<boolean>(false)
	const getComments = async () => {
		const comments = await taskCommentsApi.getAllTaskCommentsWithoutId()
		setAllComments(comments)
	}

	useEffect(() => {
		getComments()
	}, [])

	const getTaskCommentsCount = (taskComments: any, taskId: string) => {
		if (taskComments) {
			return taskComments.filter((comment: any) => comment.task_id === taskId)
				.length
		}
		return 0
	}

	const prepareTaskForEditing = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		highlightTask({ ...card, columnId })

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
					ref={drag}
					style={{
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						rowGap: '8px',
						scrollMargin: '80px',
					}}
					onMouseEnter={() => setIsCardHovered(true)}
					onMouseLeave={() => setIsCardHovered(false)}
					onClick={(e) => {
						setHighlightedTaskId(null)
						setEditTask('')
						setSelectedTask({ ...card, columnId })
						toggleModal('viewTask', true)
					}}>
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
								{card.description && (
									<>
										<span
											style={{
												display: 'flex',
												alignItems: 'center',
												position: 'relative',
											}}>
											<MdOutlineSubject
												style={{
													color: '#000',
													fontSize: '16px',
													marginRight: '4px',
												}}
												onMouseEnter={() => setIsDescriptionHovered(true)}
												onMouseLeave={() => setIsDescriptionHovered(false)}
											/>
											<span
												style={{
													position: 'absolute',
													bottom: '-18px',
													left: '-5px',
													background: '#555555',
													lineHeight: '15px',
													padding: '2px 5px',
													borderRadius: '5px',
													fontSize: '13px',
													color: 'white',
													wordSpacing: '1px',
													opacity: isDescriptionHovered ? 1 : 0,
													transform: isDescriptionHovered
														? 'translateY(0)'
														: 'translateY(-10px)',
													visibility: isDescriptionHovered
														? 'visible'
														: 'hidden',
													transition:
														'opacity 0.1s ease, transform 0.3s ease, visibility 0.3s ease',
												}}>
												This card has a description.
											</span>
										</span>
									</>
								)}

								{getTaskCommentsCount(allComments, card.id) !== 0 && (
									<span>
										<FaRegComments
											style={{ color: '#000', fontSize: '16px' }}
										/>{' '}
										<span>{getTaskCommentsCount(allComments, card.id)}</span>
									</span>
								)}
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

export default KanbanCard
