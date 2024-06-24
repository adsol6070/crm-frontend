import { useEffect, useRef, useState } from 'react'
import { Card, Col, Dropdown, Image, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import { MessageItem } from '@/Layouts/Topbar'
import SocketManager from '@/common/context/SocketManager'

const MessageDropdown = () => {
	const socket = SocketManager.getSocket()
	const [dropDownOpen, setDropDownOpen] = useState<boolean>(false)
	const [newMessages, setNewMessages] = useState<MessageItem[]>([])
	const [userInteracted, setUserInteracted] = useState<boolean>(true)
	const audioRef = useRef(new Audio('/sounds/Chat_Notification.mp3'))

	useEffect(() => {
		// Request initial message notifications
		socket?.emit('requestInitialMessageNotifications')

		// Listen for new message notifications
		socket?.on('messageNotification', (notification: MessageItem) => {
			setNewMessages((prevMessages) => [notification, ...prevMessages])
			if (userInteracted) {
				playNotificationSound()
			}
		})

		socket?.on(
			'initialMessageNotifications',
			(notifications: MessageItem[]) => {
				setNewMessages(notifications)
			}
		)

		socket?.on('notificationsCleared', () => {
			setNewMessages([])
		})

		const handleUserInteraction = () => {
			setUserInteracted(true)
			document.removeEventListener('click', handleUserInteraction)
			document.removeEventListener('keydown', handleUserInteraction)
		}

		document.addEventListener('click', handleUserInteraction)
		document.addEventListener('keydown', handleUserInteraction)

		return () => {
			socket?.off('messageNotification')
			socket?.off('initialMessageNotifications')
			socket?.off('notificationsCleared')
			document.removeEventListener('click', handleUserInteraction)
			document.removeEventListener('keydown', handleUserInteraction)
		}
	}, [])

	/**
	 * Toggles the notification dropdown
	 */
	const toggleDropDown = () => {
		setDropDownOpen(!dropDownOpen)
	}

	const playNotificationSound = () => {
		const audio = audioRef.current
		audio.play().catch((error) => {
			console.log('Failed to play sound:', error)
		})
	}

	const clearAllNotifications = () => {
		socket?.emit('clearAllMessageNotifications')
	}

	/**
	 * Get time since
	 */
	function timeSince(date: Date) {
		if (typeof date !== 'object') {
			date = new Date(date)
		}

		var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000)
		var intervalType: string

		var interval = Math.floor(seconds / 31536000)
		if (interval >= 1) {
			intervalType = 'year'
		} else {
			interval = Math.floor(seconds / 2592000)
			if (interval >= 1) {
				intervalType = 'month'
			} else {
				interval = Math.floor(seconds / 86400)
				if (interval >= 1) {
					intervalType = 'day'
				} else {
					interval = Math.floor(seconds / 3600)
					if (interval >= 1) {
						intervalType = 'hour'
					} else {
						interval = Math.floor(seconds / 60)
						if (interval >= 1) {
							intervalType = 'minute'
						} else {
							interval = seconds
							intervalType = 'second'
						}
					}
				}
			}
		}
		if (interval > 1 || interval === 0) {
			intervalType += 's'
		}
		return interval + ' ' + intervalType + ' ago'
	}
	return (
		<>
			<Dropdown show={dropDownOpen} onToggle={toggleDropDown}>
				<Dropdown.Toggle
					as="a"
					className="nav-link dropdown-toggle arrow-none"
					role="button"
					onClick={toggleDropDown}>
					<i className="ri-mail-line fs-22" />
					<span className="noti-icon-badge badge text-bg-purple">
						{newMessages.length}
					</span>
				</Dropdown.Toggle>
				<Dropdown.Menu
					align="end"
					className="dropdown-menu-animated dropdown-lg py-0">
					<div
						className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border"
						onClick={toggleDropDown}>
						<Row className="align-items-center">
							<Col>
								<h6 className="m-0 fs-16 fw-semibold"> Messages</h6>
							</Col>
							<div className="col-auto">
								<Link
									to="#"
									className="text-dark text-decoration-underline"
									onClick={clearAllNotifications}>
									<small>Clear All</small>
								</Link>
							</div>
						</Row>
					</div>
					<SimpleBar style={{ maxHeight: 300 }}>
						{/* item*/}
						{(newMessages || []).map((message, idx) => {
							return (
								<Link
									key={idx}
									to=""
									className="dropdown-item p-0 notify-item read-noti card m-0 shadow-none">
									<Card.Body>
										<div className="d-flex align-items-center">
											<div className="flex-shrink-0">
												<div className="notify-icon">
													<Image
														src={message.avatar}
														className="img-fluid rounded-circle"
														alt=""
													/>
												</div>
											</div>
											<div className="flex-grow-1 text-truncate ms-2">
												<h5 className="noti-item-title fw-semibold fs-14">
													{message.name}{' '}
													<small className="fw-normal text-muted float-end ms-1">
														{timeSince(message.createdAt)}
													</small>
												</h5>
												<small className="noti-item-subtitle text-muted">
													{message.subText}
												</small>
											</div>
										</div>
									</Card.Body>
								</Link>
							)
						})}
					</SimpleBar>
					{/* All*/}
					<Link
						to="#"
						className="dropdown-item text-center text-primary text-decoration-underline fw-bold notify-item border-top border-light py-2">
						View All
					</Link>
				</Dropdown.Menu>
			</Dropdown>
		</>
	)
}

export default MessageDropdown
