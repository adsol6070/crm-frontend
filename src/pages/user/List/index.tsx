import { PageBreadcrumb, Table } from '@/components'
import { Row, Col, Card, Spinner } from 'react-bootstrap'
import { useUserList } from './useUserList'
import { User } from '@/types'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const UserList = () => {
	const { columns, sizePerPageList, userRecords, loading } = useUserList()
	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Users List" subName="Users" />

			<Row>
				<Col>
					<Card>
						<Card.Header>
							<h4 className="header-title">User Management</h4>
							<p className="text-muted mb-0">
								View and manage user accounts in the system.
							</p>
						</Card.Header>
						<Card.Body>
						{loading ? (
                                <div className="text-center"  style={{height: "500px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
							<Table<User>
								columns={columns}
								data={userRecords}
								pageSize={5}
								sizePerPageList={sizePerPageList}
								isSortable={true}
								pagination={true}
								isSearchable={true}
							/>)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default UserList
