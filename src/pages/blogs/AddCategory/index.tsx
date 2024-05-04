import React from 'react'
import { PageBreadcrumb, Table } from '@/components'
import { Row, Col, Card, Form, Button } from 'react-bootstrap'
import { useCategory } from './useCategory'
import { BlogCategory } from '@/types'
import { ToastContainer } from 'react-toastify'
import "react-toastify/ReactToastify.css";

const AddCategory: React.FC = () => {
	const { columns, loading, blogCategories, category, sizePerPageList, createCategory, handleCategoryChange } = useCategory();

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Add Category" subName="Blogs" />
			<Row>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Add New Blog Category</h4>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={createCategory}>
								<Form.Group controlId="categoryName" className="mb-3">
									<Form.Label>Category Name</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter category name"
										value={category}
										onChange={handleCategoryChange}
									/>
								</Form.Group>
								<Button variant="primary" type="submit" disabled={loading}>
									Add Category
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Categories List</h4>
						</Card.Header>
						<Card.Body>
							<Table<BlogCategory>
								columns={columns}
								data={blogCategories}
								pageSize={6}
								sizePerPageList={sizePerPageList}
								isSortable={true}
								pagination={true}
								isSearchable={true}
							/>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddCategory
