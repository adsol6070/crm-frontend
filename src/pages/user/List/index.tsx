import { PageBreadcrumb, Table } from '@/components';
import { Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useUserList } from './useUserList';
import { hasPermission } from '@/utils';
import { usePermissions, userApi } from '@/common';
import 'react-toastify/ReactToastify.css';

const UserList = () => {
	const { permissions } = usePermissions();
	const { columns, userRecords, loading, getUsers } = useUserList();
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const toggleAllRowsSelected = useRef<(() => void) | undefined>(undefined);

	const showDeleteSelectedButton = selectedUserIds?.length > 0;
	const canDeleteSelected = hasPermission(permissions, 'Users', 'DeleteSelected');

	const handleDeleteSelectedUsers = async () => {
		try {
			await userApi.deleteSelectedUsers({ userIds: selectedUserIds });
			setSelectedUserIds([]);
			getUsers();
			toggleAllRowsSelected.current && toggleAllRowsSelected.current();
		} catch (error) {
			console.error("Error in deleting users:", error)
		}
	};

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Users List" subName="Users" />

			<Row>
				<Col>
					<Card>
						<Card.Header>
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h4 className="header-title">User Management</h4>
									<p className="text-muted mb-0">View and manage user accounts in the system.</p>
								</div>
								{showDeleteSelectedButton && canDeleteSelected && (
									<Button
										variant="danger"
										onClick={handleDeleteSelectedUsers}
										className="mx-2"
									>
										{`Delete ${selectedUserIds.length} Selected`}
									</Button>
								)}
							</div>
						</Card.Header>
						<Card.Body>
							{loading ? (
								<div className="text-center d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
									<Spinner animation="border" role="status">
										<span className="visually-hidden">Loading...</span>
									</Spinner>
								</div>
							) : (
								<Table
									columns={columns}
									data={userRecords}
									pageSize={5}
									isSortable
									pagination
									isSearchable
									isSelectable={canDeleteSelected}
									setSelectedUserIds={setSelectedUserIds}
									toggleAllRowsSelected={(val) => (toggleAllRowsSelected.current = val)}
								/>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	);
};

export default UserList;
