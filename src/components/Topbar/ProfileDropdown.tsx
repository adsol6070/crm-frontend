import React, { useState, useEffect } from 'react';
import { Dropdown, Image } from 'react-bootstrap';
import { ProfileOption } from '@/Layouts/Topbar';
import { Link, useNavigate } from 'react-router-dom';
import { useToggle } from '@/hooks';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type ProfileDropdownProps = {
	loading: boolean,
	menuItems: Array<ProfileOption>;
	userImage?: string;
	username?: string;
};

const ProfileDropdown = ({
	loading,
	menuItems,
	userImage,
	username,
}: ProfileDropdownProps) => {
	const [isOpen, toggleDropdown] = useToggle();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			navigate('/auth/logout', { replace: true });
		} catch (error) {
			console.error('Failed to logout:', error);
		}
	};

	return (
		<Dropdown show={isOpen} onToggle={toggleDropdown}>
			<Dropdown.Toggle
				className="nav-link dropdown-toggle arrow-none nav-user"
				to="#"
				role="button"
				as={Link}
				onClick={toggleDropdown}>
				<span className="account-user-avatar">
					{loading ? (
						<Skeleton circle={true} height={32} width={32} />
					) : (
						<Image
							src={userImage}
							alt="user-image"
							height={32}
							width={32}
							className="rounded-circle"
						/>
					)}
				</span>
				<span className="d-lg-block d-none">
					<h5 className="my-0 fw-normal">
						{loading ? <Skeleton width={80} /> : username}
						{!loading && (
							<i className="ri-arrow-down-s-line d-none d-sm-inline-block align-middle" />
						)}
					</h5>
				</span>
			</Dropdown.Toggle>
			<Dropdown.Menu
				align="end"
				className="dropdown-menu-animated profile-dropdown">
				<div onClick={toggleDropdown}>
					<div className="dropdown-header noti-title">
						<h6 className="text-overflow m-0">Welcome!</h6>
					</div>
					{menuItems.map((item, idx) => {
						if (item.label === 'Logout') {
							return (
								<button
									key={idx}
									onClick={handleLogout}
									className="dropdown-item">
									<i className={`${item.icon} fs-18 align-middle me-1`} />
									<span>{item.label}</span>
								</button>
							);
						} else {
							return (
								<Link key={idx} to={item.redirectTo} className="dropdown-item">
									<i className={`${item.icon} fs-18 align-middle me-1`} />
									<span>{item.label}</span>
								</Link>
							);
						}
					})}
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default ProfileDropdown;
