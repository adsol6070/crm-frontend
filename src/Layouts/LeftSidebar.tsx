import React from 'react'
import { Link } from 'react-router-dom'
import SimpleBar from 'simplebar-react'

// Images
import logo from '@/assets/images/logo.png'
import logoDark from '@/assets/images/logo-dark.png'
import logoSm from '@/assets/images/logo-sm.png'

// Components
import AppMenu from './Menu'

// Helpers
import { getMenuItems } from '@/common'

// Sidebar content component
const SideBarContent: React.FC = () => (
	<div className="clearfix">
		<AppMenu menuItems={getMenuItems()} />
	</div>
)

// LeftSidebar component
const LeftSidebar: React.FC = () => {
	return (
		<div className="leftside-menu">
			{/* Brand Logo Light */}
			<Link to="/" className="logo logo-light">
				<span className="logo-lg">
					<img src={logo} alt="logo" />
				</span>
				<span className="logo-sm">
					<img src={logoSm} alt="small logo" />
				</span>
			</Link>

			{/* Brand Logo Dark */}
			<Link to="/" className="logo logo-dark">
				<span className="logo-lg">
					<img src={logoDark} alt="dark logo" />
				</span>
				<span className="logo-sm">
					<img src={logoSm} alt="small logo" />
				</span>
			</Link>

			{/* Sidebar -left */}
			<SimpleBar className="h-100" id="leftside-menu-container">
				<SideBarContent />
			</SimpleBar>
		</div>
	)
}

export default LeftSidebar
