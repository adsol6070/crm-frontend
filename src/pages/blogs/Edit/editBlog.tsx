import { PageBreadcrumb } from '@/components'
import ReactQuill from 'react-quill'
import { Row, Col, Card, Form, Button, Dropdown } from 'react-bootstrap'
import 'react-quill/dist/quill.snow.css'
import 'react-quill/dist/quill.bubble.css'
import { FileUploader, FileType  } from '@/components/FileUploader'
import  useBlogForm  from './useBlogForm'

const AddBlog: React.FC = () => {

	const {
		title,
		content,
		selectedCategory,
		categories,
		handleTitleChange,
		handleContentChange,
		handleSelectedImage,
		handleCategorySelect,
		handleSubmit,
	} = useBlogForm()

	const modules = {
		toolbar: [
			[{ font: [] }, { size: [] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ color: [] }, { background: [] }],
			[{ script: 'super' }, { script: 'sub' }],
			[{ header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
			[
				{ list: 'ordered' },
				{ list: 'bullet' },
				{ indent: '-1' },
				{ indent: '+1' },
			],
			['direction', { align: [] }],
			['link', 'image', 'video'],
			['clean'],
		],
	}

const handleFileUpload = (files: FileType[]) => {
    if (files.length > 0) {
        handleSelectedImage(files);

    }
};
	return (
		<>
			<PageBreadcrumb title="Add Blog" subName="Blogs" />
			<Row>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Add New Blog</h4>
						</Card.Header>
						<Card.Body>
							<Form onSubmit={handleSubmit}>
								<Form.Group controlId="blogTitle" className="mb-3">
									<Form.Label>Title</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter title"
										value={title}
										onChange={handleTitleChange}
									/>
								</Form.Group>
								<Form.Group controlId="blogContent" className="mb-3">
									<Form.Label>Content</Form.Label>
									<ReactQuill
										modules={modules}
										value={content}
										onChange={handleContentChange}
										theme="snow"
                                        style={{ height: 300 }}
                                        className="pb-4"
									/>

								</Form.Group>
								<Form.Group controlId="blogCategories" className="mb-3">
									<Form.Label>Categories</Form.Label>
									<div className="dropdown">
										<Form.Control
											type="text"
											value={selectedCategory}
											placeholder="Select Category"
											readOnly
										/>
										<Dropdown.Menu show={selectedCategory !== ''}>
											{categories.map((category: string) => (
												<Dropdown.Item
													key={category}
													onClick={() => handleCategorySelect(category)}>
													{category}
												</Dropdown.Item>
											))}
										</Dropdown.Menu>
									</div>
								</Form.Group>
								<Form.Group controlId="blogImage" className="mb-3">
									<Form.Label>Upload Image</Form.Label>
									<FileUploader
										icon="ri-upload-cloud-2-line"
										text="Drop files here or click to upload."
										onFileUpload={handleFileUpload}
									/>
								</Form.Group>
								<Button variant="primary" type="submit">
									Submit
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddBlog
