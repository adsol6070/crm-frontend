import { useEffect, useRef, useState } from 'react'
import {
	Col,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	Row,
} from 'reactstrap'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import Swal from 'sweetalert2'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { useChatContext } from '../context/chatContext'
import { useThemeContext } from '@/common'

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const ChatHeaderWrapper = styled.div<{ theme: string }>`
	background-color: ${({ theme }) =>
		theme === 'dark' ? 'transparent' : '#f7f8fa'};
	border-bottom: 1px solid #e6e6e6;
	padding: 1rem 1.5rem;
	position: relative;

	.chat-avatar {
		height: 2.6rem;
		width: 2.6rem;
		object-fit: cover;
		border-radius: 50%;
		cursor: pointer;
	}

	.chat-info {
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: center;
		h5 {
			font-weight: 600;
			margin-bottom: 0.25rem;
			font-size: 1rem;
			color: ${({ theme }) => (theme === 'dark' ? 'white' : '#333')};
		}

		p {
			font-size: 0.875rem;
			margin-bottom: 0;
			color: #666;
		}
	}

	.nav-btn {
		background: none;
		border: none;
		color: ${({ theme }) => (theme === 'dark' ? 'white' : '#333')};
		font-size: 1.2rem;
		cursor: pointer;

		&:hover {
			color: #007bff;
		}
	}

	.search-container {
		position: absolute;
		top: 100%;
		right: 0;
		width: 300px;
		padding: 10px;
		background: ${({ theme }) => (theme === 'dark' ? '#313a46' : 'white')};
		border: 1px solid #e6e6e6;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		z-index: 10;
		animation: ${slideDown} 0.3s ease-out;
	}
`

const CustomDropdownMenu = styled(DropdownMenu)<{ theme: string }>`
	background-color: ${({ theme }) => theme === 'white' && '#ffffff'};
	border: 1px thin #e6e6e6;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	padding: 0;
	margin: 0;

	.dropdown-item {
		padding: 10px 20px;
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : '#333')};
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;

		&:hover {
			background-color: ${({ theme }) =>
				theme === 'dark' ? '#ffffff38' : '#f1f1f1'};
		}
	}
`
const ChatHeader = ({ messages, setFilteredMessages }) => {
	const {
		chatBoxUsername,
		chatBoxUserStatus,
		chatBoxUserImage,
		isGroupChat,
		openGroupInfoModal,
	} = useChatContext()
	const { settings } = useThemeContext()
	const [singleButton2, setSingleButton2] = useState<boolean>(false)
	const [showSearch, setShowSearch] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const searchInputRef = useRef(null)
	const searchContainerRef = useRef(null)

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
		const filtered = messages.filter((msg) =>
			msg.message.toLowerCase().includes(e.target.value.toLowerCase())
		)
		setFilteredMessages(filtered)
	}

	const handleExportChat = async (includeFiles: boolean) => {
		const textMessages = messages
			.map((msg) => {
				const timestamp = new Date(msg.timestamp).toLocaleString()
				const sender = msg.user
					? `${msg.user.firstname} ${msg.user.lastname}`
					: 'System'
				return `${timestamp} - From ${sender}: ${msg.message}`
			})
			.join('\n')
		const zip = new JSZip()
		zip.file('chat.txt', textMessages)

		if (includeFiles) {
			for (const msg of messages) {
				if (msg.file_url) {
					try {
						const response = await fetch(msg.file_url)
						if (!response.ok) {
							throw new Error(`Failed to fetch file from ${msg.file_url}`)
						}
						const blob = await response.blob()
						zip.file(msg.file_name, blob)
					} catch (error) {
						console.error(`Error fetching file ${msg.file_name}:`, error)
					}
				}
			}
		}

		zip.generateAsync({ type: 'blob' }).then((content) => {
			saveAs(content, 'chat.zip')
		})
	}

	const exportChatOptions = () => {
		Swal.fire({
			title: 'Export Chat',
			text: 'Do you want to include files?',
			icon: 'question',
			showCancelButton: true,
			showCloseButton: true,
			confirmButtonText: 'Yes, include files',
			cancelButtonText: 'No, just text',
		}).then((result) => {
			if (result.isConfirmed) {
				handleExportChat(true)
			} else if (result.dismiss === Swal.DismissReason.cancel) {
				handleExportChat(false)
			}		
		})
	}

	useEffect(() => {
		if (showSearch && searchInputRef.current) {
			searchInputRef.current?.focus()
		}

		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target)
			) {
				setShowSearch(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showSearch])

	return (
		<ChatHeaderWrapper theme={settings.theme}>
			<Row className="align-items-center">
				<Col xl={4} className="col-7">
					<div className="d-flex align-items-center">
						<div
							className="chat-avatar me-3 d-sm-block d-none"
							onClick={isGroupChat ? openGroupInfoModal : undefined}>
							<img
								src={chatBoxUserImage}
								alt=""
								className="img-fluid d-block rounded-circle"
								style={{
									height: '2.6rem',
									width: '2.6rem',
								}}
							/>
						</div>
						<div
							className="chat-info flex-grow-1"
							onClick={isGroupChat ? openGroupInfoModal : undefined}>
							<h5 className="font-size-16 mb-1 text-truncate">
								<Link to="#" className="text-reset">
									{chatBoxUsername}
								</Link>
							</h5>
							<p className="text-muted text-truncate mb-0">
								{isGroupChat ? 'Users' : chatBoxUserStatus}
							</p>
						</div>
					</div>
				</Col>
				<Col xl={8} className="col-5 text-end">
					<ul className="list-inline user-chat-nav mb-0">
						<li className="list-inline-item">
							<button
								className="btn nav-btn"
								onClick={() => setShowSearch(!showSearch)}>
								<i className="ri-search-line"></i>
							</button>
							{showSearch && (
								<div className="search-container" ref={searchContainerRef}>
									<input
										type="text"
										className="form-control border bg-light-subtle"
										placeholder="Search..."
										value={searchTerm}
										onChange={handleSearchChange}
										ref={searchInputRef}
									/>
								</div>
							)}
						</li>
						<li className="list-inline-item">
							<Dropdown
								isOpen={singleButton2}
								toggle={() => setSingleButton2(!singleButton2)}>
								<DropdownToggle className="btn nav-btn" tag="a">
									<i className="ri-more-2-fill"></i>
								</DropdownToggle>
								<CustomDropdownMenu
									className="dropdown-menu-end"
									theme={settings.theme}>
									<DropdownItem
										className="dropdown-item"
										onClick={exportChatOptions}>
										Export Chat
									</DropdownItem>
								</CustomDropdownMenu>
							</Dropdown>
						</li>
					</ul>
				</Col>
			</Row>
		</ChatHeaderWrapper>
	)
}

export default ChatHeader
