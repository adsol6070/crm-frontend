import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import { Row, Col, Card, Form, Button } from 'react-bootstrap'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { FileUploader } from '@/components/FileUploader'
import { useState } from 'react'
import Select from 'react-select'
import useEditBlog from './useEditBlogForm'
import { convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { useLocation, useParams } from 'react-router-dom'
import htmlToDraft from 'html-to-draftjs'
import { EditorState, ContentState } from 'draft-js';
import useCreateBlog from '../Create/useCreateBlog'

export interface FileType extends File {
	preview?: string
	formattedSize?: string
}

const EditBlog: React.FC = () => {
	const { blogId } = useParams();
	const location = useLocation();
	const blogData = location.state?.updatedBlogData;
	const { blogCategories } = useCreateBlog()
	const { editBlog, loading } = useEditBlog()
	const [selectedUpadatedCategory, setUpdatedSelectedCategory] = useState(blogData?.category)
	const [updatedBlogImage, setUpdatedBlogImage] = useState<File | null>(null)
	const [updateEditorState, setUpdateEditorState] = useState(() => {
		if (blogData.content) {
			const blocksFromHtml = htmlToDraft(blogData.content);
			const { contentBlocks, entityMap } = blocksFromHtml;
			const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
			return EditorState.createWithContent(contentState);
		}
		return EditorState.createEmpty();
	});

	const handleEditorChange = (state: EditorState) => {
		setUpdateEditorState(state);
	};

	const handleFileUpload = (files: any) => {
		if (files[0]) {
			setUpdatedBlogImage(files[0])
		}
	}
	const handleSubmit = async (data: any) => {
		const contentState = updateEditorState.getCurrentContent()
		const rawContentState = convertToRaw(contentState)
		const contentHTML = draftToHtml(rawContentState)
		const completedBlogData = {
			...data,
			content: contentHTML,
			category: selectedUpadatedCategory,
			blogImage: updatedBlogImage,
		}
		await editBlog(completedBlogData, blogId)
	}

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Edit Blog" subName="Blogs" />
			<Row>
				<Col xs={12}>
					<Card>
						<Card.Header>
							<h4 className="header-title">Edit Blog</h4>
						</Card.Header>
						<Card.Body>
							<VerticalForm onSubmit={handleSubmit}>
								<FormInput
									label="Title"
									type="text"
									name="title"
									defaultValue={blogData?.title}
									placeholder="Enter title"
									containerClass="mb-3"
									required
								/>
								<FormInput
									label="Description"
									type="textarea"
									name="description"
									defaultValue={blogData?.description}
									placeholder="Enter Short Description"
									rows={3}
									containerClass="mb-3"
									key="textarea"
									required
								/>
								<Form.Group controlId="blogContent" className="mb-3">
									<Form.Label>Content</Form.Label>
									<Editor
										editorState={updateEditorState}
										toolbarClassName="toolbarClassName"
										wrapperClassName="wrapperClassName"
										editorClassName="editorClassName"
										onEditorStateChange={handleEditorChange}
										editorStyle={{ minHeight: '250px', border: "1px solid #dee2e6", padding: "10px 20px" }}
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Categories</Form.Label>
									<Select
										className="select2 z-3"
										options={blogCategories}
										defaultValue={{ label: blogData.category, value: blogData.category }}
										value={blogCategories.find(
											(option) => option.category === selectedUpadatedCategory
										)}
										onChange={(option: any) =>
											setUpdatedSelectedCategory(option.value)
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

export default EditBlog
