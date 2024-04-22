import { PageBreadcrumb } from '@/components'
import { Table, Row, Col, Button } from 'react-bootstrap'

const AdminList = () => {
	// Dummy data for demonstration
	const admins = [
		{ id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
		{
			id: 3,
			name: 'Alice Johnson',
			email: 'alice@example.com',
			role: 'Viewer',
		},
	]

	return (
		<>
			<PageBreadcrumb title="Admin List" subName="Admins" />
			<Row className="mt-4">
				<Col>
					<div className="admin-list">
						<div style={{ overflowX: 'auto' }}>
							<Table striped bordered hover>
								<thead>
									<tr>
										<th>#</th>
										<th>Name</th>
										<th>Email</th>
										<th>Role</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{admins.map((admin, index) => (
										<tr key={admin.id}>
											<td>{index + 1}</td>
											<td>{admin.name}</td>
											<td>{admin.email}</td>
											<td>{admin.role}</td>
											<td>
												<Button variant="primary" style={{ margin: '5px' }}>
													Edit
												</Button>
												<Button variant="danger">Delete</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</div>
					</div>
				</Col>
			</Row>
		</>
	)
}

export default AdminList
