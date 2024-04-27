import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import { Row, Col, Card, Form, Button } from 'react-bootstrap'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { FileUploader } from '@/components/FileUploader'
import { useState } from 'react'
import Select from 'react-select'
import useCreateBlog from './useCreateBlog'
import { convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { ToastContainer } from 'react-toastify'

const options = [
	{ value: '', label: 'Select Role' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'user', label: 'User' },
	{ value: 'technical', label: 'Technical Staff' },
	{ value: 'hr', label: 'HR' },
	{ value: 'manager', label: 'Manager' },
]

export interface FileType extends File {
	preview?: string
	formattedSize?: string
}

const AddBlog: React.FC = () => {
	const { createBlog, loading } = useCreateBlog()
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [blogImage, setBlogImage] = useState<File | null>(null)
	const [editorState, setEditorState] = useState(EditorState.createEmpty())

	const handleEditorChange = (state: EditorState) => {
		setEditorState(state)
	}

	const handleFileUpload = (files: any) => {
		if (files[0]) {
			setBlogImage(files[0])
		}
	}

	const handleSubmit = async (data: any) => {
		const contentState = editorState.getCurrentContent()
		const rawContentState = convertToRaw(contentState)
		const contentHTML = draftToHtml(rawContentState)
		const completedBlogData = {
			...data,
			content: contentHTML,
			category: selectedCategory,
			blogImage,
		}
		await createBlog(completedBlogData)
	}

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Add Blog" subName="Blogs" />
			<Row>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Add New Blog</h4>
						</Card.Header>
						<Card.Body>
							<VerticalForm onSubmit={handleSubmit}>
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
								<Button variant="primary" type="submit" disabled={loading}>
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
