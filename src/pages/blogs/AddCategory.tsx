import React, { ChangeEvent, MouseEvent, useState } from 'react'
import { PageBreadcrumb } from '@/components'
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap'
import { useBlogForm } from './Create/useBlogForm' // Adjust the import path as needed

interface AddCategoryProps {}

const AddCategory: React.FC<AddCategoryProps> = () => {
	const { categories, setCategories } = useBlogForm()
	const [category, setCategory] = useState<string>('')
	const [editIndex, setEditIndex] = useState<number | null>(null)

	const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setCategory(e.target.value)
	}

	const handleSubmit = (e: MouseEvent<HTMLFormElement>): void => {
		e.preventDefault()
		if (category.trim()) {
			const newCategories = [...categories, category.trim()]
			setCategories(newCategories)
			setCategory('')
		}
	}

	const handleDeleteCategory = (index: number): void => {
		const updatedCategories = [...categories]
		updatedCategories.splice(index, 1)
		setCategories(updatedCategories)
	}

	const handleEditCategory = (index: number): void => {
		setEditIndex(index)
	}

	const handleSaveCategory = (index: number, newValue: string): void => {
		const updatedCategories = categories.map((item, idx) =>
			idx === index ? newValue : item
		)
		setCategories(updatedCategories)
		setEditIndex(null)
	}

	return (
		<>
			<PageBreadcrumb title="Add Category" subName="Blogs" />
			<Row>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Add New Blog Category</h4>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={handleSubmit}>
								<Form.Group controlId="categoryName" className="mb-3">
									<Form.Label>Category Name</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter category name"
										value={category}
										onChange={handleCategoryChange}
									/>
								</Form.Group>
								<Button variant="primary" type="submit">
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
							<Table striped bordered hover>
								<thead>
									<tr>
										<th>Category Name</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{categories.map((cat, index) => (
										<tr key={index}>
											<td>
												{editIndex === index ? (
													<Form.Control
														type="text"
														defaultValue={cat}
														onBlur={(e) =>
															handleSaveCategory(index, e.target.value)
														}
													/>
												) : (
													cat
												)}
											</td>
											<td>
												{editIndex === index ? (
													<Button
														variant="success"
														size="sm"
														onClick={() => handleSaveCategory(index, category)}>
														Save
													</Button>
												) : (
													<>
														<Button
															variant="danger"
															size="sm"
															onClick={() => handleDeleteCategory(index)}>
															<i className="ri-delete-bin-2-line"></i>
														</Button>{' '}
														<Button
															variant="info"
															size="sm"
															onClick={() => handleEditCategory(index)}>
															<i className="ri-edit-line"></i>
														</Button>
													</>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddCategory
