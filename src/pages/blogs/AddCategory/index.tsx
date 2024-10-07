import React, { useState } from 'react'
import { PageBreadcrumb, Table, FormInput, VerticalForm } from '@/components'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useCategory } from './useCategory'
import { ToastContainer } from 'react-toastify'
import "react-toastify/ReactToastify.css";

const AddCategory: React.FC = () => {
	const { columns, loading, blogCategories, createCategory, handleDeleteSelected } = useCategory();
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

    let toggleAllRowsSelected: ((selected: boolean) => void) | undefined;

	const showDeleteSelectedButton = selectedCategoryIds?.length > 0

	const handleDeleteSelectedCategories = () => {
		handleDeleteSelected(selectedCategoryIds)
		setSelectedCategoryIds([])
		toggleAllRowsSelected && toggleAllRowsSelected(false)
	}

	const onSubmit = (data: { category: string }, { reset }: { reset: () => void }) => {
		createCategory(data);
		reset();
	};
	const schemaResolver = yupResolver(
		yup.object().shape({
			category: yup.string().required('Please enter category').matches(/^[a-z]+$/, "Category name must be lowercase"),
		})
	)

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Add Category" subName="Category" />
			<Row>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Add New Blog Category</h4>
						</Card.Header>
						<Card.Body>
							<VerticalForm
								onSubmit={onSubmit}
								resolver={schemaResolver}>
								<FormInput
									label="Category Name"
									type="text"
									name="category"
									placeholder="Enter your Category"
									containerClass="mb-3"
									required
								/>
								<Button
									variant="primary"
									type="submit"
									disabled={loading}>
									Add Category
								</Button>
							</VerticalForm>
						</Card.Body>
					</Card>
				</Col>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<div className="d-flex justify-content-between">
								<div className="my-2">
									<h4 className="header-title">Categories List</h4>
								</div>
								<div>
									{showDeleteSelectedButton && (
										<Button
											variant="danger"
											onClick={handleDeleteSelectedCategories}
											className="mx-2">
											{`Delete ${selectedCategoryIds.length} Selected`}
										</Button>
									)}
								</div>
							</div>
						</Card.Header>
						<Card.Body>
							<Table
								columns={columns}
								data={blogCategories}
								pageSize={5}
								isSortable={true}
								pagination={true}
								isSelectable={true}
								isSearchable={true}
								setSelectedUserIds={setSelectedCategoryIds}
								toggleAllRowsSelected={(val) => (toggleAllRowsSelected = val)}
							/>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddCategory
