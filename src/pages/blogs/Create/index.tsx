import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import { Row, Col, Card, Form, Button } from 'react-bootstrap'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { FileUploader } from '@/components/FileUploader'
import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import Select from 'react-select'
import useCreateBlog from './useCreateBlog'
import { convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import Swal from 'sweetalert2'
import { customStyles, editorStyle, toolbarStyle } from '@/utils'
import { useThemeContext } from '@/common'

interface BlogCategory {
	value: string
	label: string
}

const AddBlog: React.FC = () => {
	const { settings } = useThemeContext();
	const { createBlog, loading, blogCategories } = useCreateBlog()
	const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null)
	const [blogImage, setBlogImage] = useState<File | null>(null)
	const [editorState, setEditorState] = useState(EditorState.createEmpty())
	const [resetFileUploader, setResetFileUploader] = useState(0)

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

	const handleEditorChange = (state: EditorState) => {
		setEditorState(state)
	}

	const handleSelect = (option: BlogCategory | null) => {
		setSelectedCategory(option)
	}

	const handleFileUpload = (files: any) => {
		if (files[0]) {
			const file = files[0];
			if (file.size > MAX_FILE_SIZE) {
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					text: 'File size exceeds 10MB',
				});
				setResetFileUploader(resetFileUploader + 1);
				return;
			}
			setBlogImage(file)
		}
	}

	const onSubmit = async (data: any, { reset }: { reset: () => void }) => {
		const contentState = editorState.getCurrentContent()
		const rawContentState = convertToRaw(contentState)
		const contentHTML = draftToHtml(rawContentState)
		const completedBlogData = {
			...data,
			content: contentHTML,
			category: selectedCategory ? selectedCategory.value : null,
			blogImage,
		}

		await createBlog(completedBlogData)
		reset()
		setEditorState(EditorState.createEmpty())
		setBlogImage(null)
		setSelectedCategory(null)
		setResetFileUploader(resetFileUploader + 1)
	}

	const schemaResolver = yupResolver(
		yup.object().shape({
			title: yup.string().required('Please enter blog title'),
			description: yup.string().required('Please enter blog description'),
		})
	)

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
							<VerticalForm onSubmit={onSubmit} resolver={schemaResolver}>
								<FormInput
									label="Title"
									type="text"
									name="title"
									placeholder="Enter Title"
									containerClass="mb-3"
									required
								/>
								<FormInput
									label="Description"
									type="textarea"
									name="description"
									placeholder="Enter Short Description"
									rows={3}
									containerClass="mb-3"
									key="textarea"
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
										editorStyle={editorStyle(settings.theme === "dark")}
										toolbarStyle={toolbarStyle(settings.theme === "dark")}
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Categories</Form.Label>
									<Select
										styles={customStyles(settings.theme === "dark")}
										className="select2 z-3"
										options={blogCategories as any[]}
										getOptionLabel={(e: any) => e.label}
										getOptionValue={(e: any) => e.value}
										value={selectedCategory}
										onChange={handleSelect}
										isClearable={true}
									/>
								</Form.Group>
								<Form.Group controlId="blogImage" className="mb-3">
									<Form.Label>Upload Image</Form.Label>
									<FileUploader
										icon="ri-upload-cloud-2-line"
										text="Drop files here or click to upload."
										onFileUpload={handleFileUpload}
										showPreview={true}
										resetTrigger={resetFileUploader}
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
