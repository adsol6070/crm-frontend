import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import Select from 'react-select'
import { FormInput, PageBreadcrumb, VerticalForm } from '@/components'
import useEditBlog from './useEditBlogForm'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useForm } from 'react-hook-form'
import { convertToRaw } from 'draft-js'
import { FileUploader } from '@/components/FileUploader'
import { ToastContainer } from 'react-toastify'
import draftToHtml from 'draftjs-to-html'
import 'react-toastify/ReactToastify.css'

interface Blog {
	id: string
	tenantID: string
	title: string
	content: string
	blogImage: string
	category: string
}
const EditBlog = () => {
	const { blogId } = useParams<{ blogId: string }>()
	const location = useLocation()
	const [blog, setBlog] = useState<Blog | null>(null)
	const [newBlogImage, setNewBlogImage] = useState<File | null>(null)
	const [editorState, setEditorState] = useState(EditorState.createEmpty())
	// console.log(blog?.content)
	const { editBlog } = useEditBlog()
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<Blog>()

	useEffect(() => {
		if (location.state && location.state.updatedBlogData) {
			setBlog(location.state.updatedBlogData)
			Object.keys(location.state.updatedBlogData).forEach((key) => {
				setValue(key as keyof Blog, location.state.updatedBlogData[key as keyof Blog])
			})
		}
	}, [location, blogId, setValue])

	if (blog?.content) {
		// Set the editor state with the content from the blog object
		setEditorState(EditorState.createWithContent(blog.content));
	  }


	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setNewBlogImage(event.target.files[0])
		}
	}

	const onSubmit = async (data: Blog) => {
		let formData = new FormData()
		Object.keys(data).forEach((key) => {
			if (key !== 'blogImage') {
				formData.append(key, data[key as keyof Blog])
			}
		})

		if (newBlogImage) {
			formData.append('blogImage', newBlogImage)
		}

		await editBlog(formData, blogId)
	}

	if (!blog) return <p>Loading user data...</p>

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
						<VerticalForm onSubmit={onSubmit}>
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
									onFileUpload={handleImageChange}
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
