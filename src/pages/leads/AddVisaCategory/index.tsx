import React from 'react'
import { PageBreadcrumb, Table, FormInput, VerticalForm } from '@/components'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useVisaCategory } from './useVisaCategory'
import { BlogCategory } from '@/types'
import { ToastContainer } from 'react-toastify'
import "react-toastify/ReactToastify.css";

const AddVisaCategory: React.FC = () => {
	const { columns, loading, visaCategories, sizePerPageList, createCategory } = useVisaCategory();

    const onSubmit = (data: { category: string }, { reset }: { reset: () => void }) => {
        createCategory(data);
		reset();
    };
	const schemaResolver = yupResolver(
		yup.object().shape({
			category: yup.string().required('Please enter category'),
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
							<h4 className="header-title">Add New Visa Category</h4>
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
							<h4 className="header-title">Categories List</h4>
						</Card.Header>
						<Card.Body>
							<Table<BlogCategory>
								columns={columns}
								data={visaCategories}
								pageSize={6}
								sizePerPageList={sizePerPageList}
								isSortable={true}
								pagination={true}
								isSelectable={true}
								isSearchable={true}
							/>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddVisaCategory
