import { Image } from 'react-bootstrap'
import { ThemeSettings, useThemeContext } from '@/common'
import { Link } from 'react-router-dom'
// assets
import logo from '@/assets/images/logo.png'
import logoSm from '@/assets/images/logo-sm.png'
import logoDark from '@/assets/images/logo-dark.png'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'
import avatar5 from '@/assets/images/users/avatar-5.jpg'

// components
import {
	LanguageDropdown,
	MessageDropdown,
	NotificationDropdown,
	ProfileDropdown,
	SearchDropDown,
} from '@/components'
import { useThemeCustomizer } from '@/components'
import { useUser, useViewport } from '@/hooks'
import SocketManager from '@/common/context/SocketManager'
import { useEffect, useState } from 'react'
/**
 * for subtraction minutes
 */
function subtractHours(date: Date, minutes: number) {
	date.setMinutes(date.getMinutes() - minutes)
	return date
}
export interface MessageItem {
	id: number
	name: string
	subText: string
	avatar: string
	createdAt: Date
}

export interface NotificationItem {
	id: number
	message: string
	icon: string
	variant: string
	created_at: Date
}

export interface ProfileOption {
	label: string
	icon: string
	redirectTo: string
}

const profileMenus: ProfileOption[] = [
	{
		label: 'My Account',
		icon: 'ri-account-circle-line',
		redirectTo: '/pages/Profile',
	},
	// {
	// 	label: 'Settings',
	// 	icon: 'ri-settings-4-line',
	// 	redirectTo: '/pages/Profile',
	// },
	// {
	// 	label: 'Support',
	// 	icon: 'ri-customer-service-2-line',
	// 	redirectTo: '/pages/faq',
	// },
	// {
	// 	label: 'Lock Screen',
	// 	icon: 'ri-lock-password-line',
	// 	redirectTo: '/auth/lock-screen',
	// },
	{
		label: 'Logout',
		icon: 'ri-logout-box-line',
		redirectTo: '/auth/logout',
	},
]

type TopbarProps = {
	topbarDark?: boolean
	toggleMenu?: () => void
	navOpen?: boolean
}

const Topbar = ({ toggleMenu, navOpen }: TopbarProps) => {
	const { sideBarType } = useThemeCustomizer()
	const { width } = useViewport()
	const [getProfile] = useUser()
	const socket = SocketManager.getSocket()
	const [notifications, setNotifications] = useState<NotificationItem[]>([])

	useEffect(() => {
		const requestInitialNotifications = () => {
			socket?.emit('requestInitialNotifications')
		}

		const receiveInitialNotifications = (leadNotifications: any) => {
			setNotifications(leadNotifications)
		}

		const receiveNewNotification = (newNotification: any) => {
			setNotifications((prevNotifications) => [
				...prevNotifications,
				newNotification,
			])
			playNotificationSound()
		}

		const notificationsCleared = () => {
			setNotifications([])
		}

		socket?.on('initialNotifications', receiveInitialNotifications)
		socket?.on('notification', receiveNewNotification)
		socket?.on('notificationsCleared', notificationsCleared)

		requestInitialNotifications()

		return () => {
			socket?.off('initialNotifications', receiveInitialNotifications)
			socket?.off('notification', receiveNewNotification)
			socket?.off('notificationsCleared', notificationsCleared)
		}
	}, [])

	const handleClear = () => {
		socket?.emit('clearAllNotifications')
	}

	const handleLeftMenuCallBack = () => {
		if (width < 768) {
			if (sideBarType === 'full') {
				showLeftSideBarBackdrop()
				document.getElementsByTagName('html')[0].classList.add('sidebar-enable')
			} else {
				updateSidebar({ size: ThemeSettings.sidebar.size.full })
			}
		} else if (sideBarType === 'condensed') {
			updateSidebar({ size: ThemeSettings.sidebar.size.default })
		} else if (sideBarType === 'full') {
			showLeftSideBarBackdrop()
			document.getElementsByTagName('html')[0].classList.add('sidebar-enable')
		} else if (sideBarType === 'fullscreen') {
			updateSidebar({ size: ThemeSettings.sidebar.size.default })
			document.getElementsByTagName('html')[0].classList.add('sidebar-enable')
		} else {
			updateSidebar({ size: ThemeSettings.sidebar.size.condensed })
		}
	}

	/**
	 * creates backdrop for leftsidebar
	 */
	function showLeftSideBarBackdrop() {
		const backdrop = document.createElement('div')
		backdrop.id = 'custom-backdrop'
		backdrop.className = 'offcanvas-backdrop fade show'
		document.body.appendChild(backdrop)
		backdrop.addEventListener('click', function () {
			document
				.getElementsByTagName('html')[0]
				.classList.remove('sidebar-enable')
			hideLeftSideBarBackdrop()
		})
	}

	function hideLeftSideBarBackdrop() {
		const backdrop = document.getElementById('custom-backdrop')
		if (backdrop) {
			document.body.removeChild(backdrop)
			document.body.style.removeProperty('overflow')
		}
	}
	const { settings, updateSettings, updateSidebar } = useThemeContext()

	/**
	 * Toggle Dark Mode
	 */
	const toggleDarkMode = () => {
		if (settings.theme === 'dark') {
			updateSettings({ theme: ThemeSettings.theme.light })
		} else {
			updateSettings({ theme: ThemeSettings.theme.dark })
		}
	}

	const playNotificationSound = () => {
		const audio = new Audio('/sounds/notification.mp3')
		audio.play()
	}

	const handleRightSideBar = () => {
		updateSettings({ rightSidebar: ThemeSettings.rightSidebar.show })
	}
	return (
		<>
			<div className="navbar-custom">
				<div className="topbar container-fluid">
					<div className="d-flex align-items-center gap-1">
						{/* Topbar Brand Logo */}
						<div className="logo-topbar">
							{/* Logo light */}
							<Link to="/" className="logo-light">
								<span className="logo-lg">
									<Image src={logo} alt="logo" />
								</span>
								<span className="logo-sm">
									<Image src={logoSm} alt="small logo" />
								</span>
							</Link>
							{/* Logo Dark */}
							<Link to="/" className="logo-dark">
								<span className="logo-lg">
									<img src={logoDark} alt="dark logo" />
								</span>
								<span className="logo-sm">
									<img src={logoSm} alt="small logo" />
								</span>
							</Link>
						</div>
						{/* Sidebar Menu Toggle Button */}
						<button
							className="button-toggle-menu"
							onClick={handleLeftMenuCallBack}>
							<i className="ri-menu-line" />
						</button>
						{/* Horizontal Menu Toggle Button */}
						<button
							className={`navbar-toggle ${navOpen ? 'open' : ''}`}
							data-bs-toggle="collapse"
							data-bs-target="#topnav-menu-content"
							onClick={toggleMenu}>
							<div className="lines">
								<span />
								<span />
								<span />
							</div>
						</button>
						{/* Topbar Search Form */}
						{/* <div className="app-search d-none d-lg-block">
							<form>
								<div className="input-group">
									<input
										type="search"
										className="form-control"
										placeholder="Search..."
									/>
									<span className="ri-search-line search-icon text-muted" />
								</div>
							</form>
						</div> */}
					</div>
					<ul className="topbar-menu d-flex align-items-center gap-3">
						<li className="dropdown d-lg-none">
							<SearchDropDown />
						</li>
						<li className="dropdown">
							<LanguageDropdown />
						</li>
						<li className="dropdown notification-list">
							<MessageDropdown />
						</li>
						<li className="dropdown notification-list">
							<NotificationDropdown
								handleClear={handleClear}
								notifications={notifications}
							/>
						</li>
						{/* <li className="d-none d-sm-inline-block">
							<button className="nav-link" onClick={handleRightSideBar}>
								<i className="ri-settings-3-line fs-22" />
							</button>
						</li> */}
						<li className="d-none d-sm-inline-block">
							<div
								className="nav-link"
								id="light-dark-mode"
								onClick={toggleDarkMode}>
								<i className="ri-moon-line fs-22" />
							</div>
						</li>
						<li className="dropdown">
							<ProfileDropdown
								menuItems={profileMenus}
								userImage={`${getProfile?.imageUrl}`}
								username={`${getProfile?.firstname}`}
							/>
						</li>
					</ul>
				</div>
			</div>
		</>
	)
}

export default Topbar
