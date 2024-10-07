import React, { useState } from 'react';
import { PageBreadcrumb, Table, FormInput, VerticalForm } from '@/components';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useVisaCategory } from './useVisaCategory';
import { ToastContainer } from 'react-toastify';
import "react-toastify/ReactToastify.css";

const AddVisaCategory: React.FC = () => {
    const { columns, loading, visaCategories, createCategory, category, handleCategoryChange, dataLoading, handleDeleteSelected } = useVisaCategory();

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
            category: yup.string().required('Please enter a category').trim('Please enter a valid category').matches(/^[a-z_]+$/, "Category name must be lowercase"),
        })
    );

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
                                    placeholder="eg. student_visa, visitor_visa"
                                    containerClass="mb-3"
                                    onChange={handleCategoryChange}
                                    value={category}
                                    required
                                />
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading || !category.trim()}>
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
                                <div className="my-1">
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
                            {dataLoading ? (
                                <div className="text-center" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <Table
                                    columns={columns}
                                    data={visaCategories}
                                    pageSize={5}
                                    isSortable={true}
                                    pagination={true}
                                    isSelectable={true}
                                    isSearchable={true}
                                    setSelectedUserIds={setSelectedCategoryIds}
                                    toggleAllRowsSelected={(val) => (toggleAllRowsSelected = val)}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AddVisaCategory;
