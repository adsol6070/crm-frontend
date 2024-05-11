import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageBreadcrumb, VerticalForm, FormInput } from '@/components'
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import Select from 'react-select'
import { convertToRaw, EditorState, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import useEditBlog from './useEditBlogForm'
import useReadBlog from '../Readblog/useReadBlog'
import { FileUploader } from '@/components/FileUploader'

interface FileType extends File {
	preview?: string
	formattedSize?: string
}

const EditBlog: React.FC = () => {
	const { blogId } = useParams() as { blogId: string }
	const {
		blogData,
		loading: readLoading,
		error: readError,
	} = useReadBlog(blogId)
	const { editBlog, loading: editLoading } = useEditBlog()
	const [editorState, setEditorState] = useState<EditorState>(
		EditorState.createEmpty()
	)
	const [selectedCategory, setSelectedCategory] = useState<{
		label: string
		value: string
	} | null>(null)
	const [updatedBlogImage, setUpdatedBlogImage] = useState<FileType | null>(
		null
	)

	useEffect(() => {
		if (blogData) {
			const blocksFromHtml = htmlToDraft(blogData.content || '<p></p>')
			const { contentBlocks, entityMap } = blocksFromHtml
			const contentState = ContentState.createFromBlockArray(
				contentBlocks,
				entityMap
			)
			setEditorState(EditorState.createWithContent(contentState))

			if (blogData.category) {
				setSelectedCategory({
					label: blogData.category,
					value: blogData.category,
				})
			}
		}
	}, [blogData])

	const handleEditorChange = (state: EditorState) => {
		setEditorState(state)
	}

	const handleFileUpload = (files: FileType[]) => {
		if (files.length > 0) {
			const file = files[0]
			file.preview = URL.createObjectURL(file)
			file.formattedSize = (file.size / 1024 ** 2).toFixed(2) + ' MB'
			setUpdatedBlogImage(file)
		}
	}

	const handleSubmit = async (data: any) => {
		if (!selectedCategory) {
			toast.error('Please select a category for the blog.')
			return
		}

		const contentHTML = draftToHtml(
			convertToRaw(editorState.getCurrentContent())
		)
		const completedBlogData = {
			...data,
			content: contentHTML,
			category: selectedCategory.value,
			blogImage: updatedBlogImage,
		}

		try {
			await editBlog(completedBlogData, blogId)
		} catch (error) {
			toast.error('Failed to update the blog.')
			console.error('Edit Blog Error:', error)
		}
	}

	if (readLoading) {
		return <Spinner animation="border" />
	}

	if (readError) {
		return <Alert variant="danger">{readError}</Alert>
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
										editorState={editorState}
										toolbarClassName="toolbarClassName"
										wrapperClassName="wrapperClassName"
										editorClassName="editorClassName"
										onEditorStateChange={handleEditorChange}
										editorStyle={{
											minHeight: '250px',
											border: '1px solid #dee2e6',
											padding: '10px 20px',
										}}
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Category</Form.Label>
									<Select
										className="basic-single"
										classNamePrefix="select"
										defaultValue={selectedCategory}
										value={selectedCategory}
										onChange={setSelectedCategory}
										options={blogData?.categories?.map((category) => ({
											label: category,
											value: category,
										}))}
										isClearable
									/>
								</Form.Group>
								<Form.Group controlId="blogImage" className="mb-3">
									<Form.Label>Upload Image</Form.Label>
									<FileUploader
										icon="ri-upload-cloud-2-line"
										text={
											updatedBlogImage
												? `Uploaded: ${updatedBlogImage.name} (${updatedBlogImage.formattedSize})`
												: 'Drop files here or click to upload.'
										}
										onFileUpload={handleFileUpload}
									/>
								</Form.Group>
								<Button variant="primary" type="submit" disabled={editLoading}>
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
