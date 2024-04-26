import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import { Row, Col, Card, Form, Button, Dropdown } from 'react-bootstrap'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { FileUploader } from '@/components/FileUploader'
// import { useBlogForm } from '../useBlogForm'
import { useState } from 'react'
import Select from 'react-select'

const options = [
	{ value: '', label: 'Select Role' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'user', label: 'User' },
	{ value: 'technical', label: 'Technical Staff' },
	{ value: 'hr', label: 'HR' },
	{ value: 'manager', label: 'Manager' },
]

const AddBlog: React.FC = () => {
	// const {
	// 	title,
	// 	// selectedCategory,
	// 	categories,
	// 	handleTitleChange,
	// 	handleCategorySelect,
	// 	handleSubmit,
	// } = useBlogForm()
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [blogImage, setBlogImage] = useState<File | null>(null)
	const [editorState, setEditorState] = useState(EditorState.createEmpty())

	console.log('EditorState:', blogImage)

	const handleEditorChange = (state: EditorState) => {
		setEditorState(state)
	}

	const handleFileUpload = (files: any) => {
		if (files[0]) {
			setBlogImage(files[0])
		}
	}

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
							<VerticalForm
								onSubmit={(data: any) => {
									const completedBlogData = {
										...data,
										content: editorState,
										category: selectedCategory,
										blogImage,
									}
									console.log(completedBlogData)
								}}>
								<FormInput
									label="Title"
									type="text"
									name="title"
									placeholder="Enter title"
									containerClass="mb-3"
									required
								/>
								<Form.Group controlId="blogContent" className="mb-3">
									<Form.Label>Content</Form.Label>
									<Editor
										editorState={editorState}
										toolbarClassName="toolbarClassName"
										wrapperClassName="wrapperClassName"
										editorClassName="editorClassName"
										onEditorStateChange={handleEditorChange}
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Role</Form.Label>
									<Select
										className="select2 z-3"
										options={options}
										value={options.find(
											(option) => option.value === selectedCategory
										)}
										onChange={(option: any) =>
											setSelectedCategory(option ? option.value : null)
										}
									/>
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
							</VerticalForm>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddBlog
