import { CardProps } from '@/types/KanbanTypes'
import { useKanbanContext } from '../KanbanContext'
import { useDrag } from 'react-dnd'
import { useEffect, useState } from 'react'
import { SlPencil } from 'react-icons/sl'
import { MdOutlineSubject } from 'react-icons/md'
import { FaRegComments } from 'react-icons/fa'
import { taskCommentsApi, useThemeContext } from '@/common'
import styled from 'styled-components'

const ListItem = styled.li<{ theme: string }>`
	position: relative;
	display: flex;
	flex-direction: column;
	row-gap: 8px;
	scroll-margin: 80px;
	background: ${({ theme }) => (theme === 'dark' ? '#22272b' : 'white')};
	color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#000')};
	cursor: pointer;
	border-radius: 8px;
	box-shadow:
		0px 1px 1px rgba(0, 0, 0, 0.2),
		0px 0px 1px rgba(0, 0, 0, 0.2);
`

const IconContainer = styled.span`
	display: flex;
	align-items: center;
	position: relative;
`

const DescriptionTooltip = styled.span<{ isVisible: boolean }>`
	position: absolute;
	bottom: -18px;
	left: -5px;
	background: #555555;
	line-height: 15px;
	padding: 2px 5px;
	border-radius: 5px;
	font-size: 13px;
	color: white;
	word-spacing: 1px;
	opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
	transform: ${({ isVisible }) =>
		isVisible ? 'translateY(0)' : 'translateY(-10px)'};
	visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
	transition:
		opacity 0.1s ease,
		transform 0.3s ease,
		visibility 0.3s ease;
`

const HoverMenu = styled.div<{ isDark: boolean }>`
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	position: absolute;
	z-index: 10;
	top: 3px;
	right: 3px;
	line-height: 1;
	padding: 9px;
	background: ${({ isDark }) => (isDark ? '#22272b' : '#ffffff')};
	border-radius: 50%;
	&:hover {
		background: ${({ isDark }) => (isDark ? '#282e33' : '#f1f2f4')};
	}
`

const ContentWrapper = styled.div`
	display: flow-root;
	position: relative;
	z-index: 10;
	min-height: 24px;
	padding: 8px 12px 4px;
`

const KanbanCard = ({ card, index, status, columnId }: CardProps) => {
	const { settings } = useThemeContext()
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
				<ListItem
					ref={drag}
					theme={settings.theme}
					onMouseEnter={() => setIsCardHovered(true)}
					onMouseLeave={() => setIsCardHovered(false)}
					onClick={(e) => {
						setHighlightedTaskId(null)
						setEditTask('')
						setSelectedTask({ ...card, columnId })
						toggleModal('viewTask', true)
					}}>
					<ContentWrapper>
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
								color: settings.theme === 'dark' ? '#B6C2CF' : '#000',
							}}>
							{card.title}
							<br />
							{card.description && (
								<>
									<IconContainer>
										<MdOutlineSubject
											style={{
												color: settings.theme === 'dark' ? '#B6C2CF' : '#000',
												fontSize: '16px',
												marginRight: '4px',
											}}
											onMouseEnter={() => setIsDescriptionHovered(true)}
											onMouseLeave={() => setIsDescriptionHovered(false)}
										/>
										<DescriptionTooltip isVisible={isDescriptionHovered}>
											This card has a description.
										</DescriptionTooltip>
									</IconContainer>
								</>
							)}

							{getTaskCommentsCount(allComments, card.id) !== 0 && (
								<span>
									<FaRegComments style={{ color: '#000', fontSize: '16px' }} />{' '}
									<span>{getTaskCommentsCount(allComments, card.id)}</span>
								</span>
							)}
						</a>
					</ContentWrapper>
					{isCardHovered && (
						<HoverMenu
							isDark={settings.theme === 'dark'}
							onClick={prepareTaskForEditing}>
							<SlPencil size={12} />
						</HoverMenu>
					)}
				</ListItem>
			</div>
		</>
	)
}

export default KanbanCard
