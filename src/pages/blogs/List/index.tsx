import { PageBreadcrumb } from '@/components'
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap'
import useGetBlogPosts from './useBlogList'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { useAuthContext } from '@/common/context'
import { capitalizeFirstLetter } from '@/utils'

const BlogList = () => {
	const {
		loading,
		blogPosts,
		handleReadBlog,
		handleDeleteBlog,
		handleEditBlog,
	} = useGetBlogPosts()
	const { user } = useAuthContext()
	const renderHTML = (htmlString: string) => ({ __html: htmlString })

	const getImageUrl = (image: any) => {
		if (image instanceof File) {
			return URL.createObjectURL(image)
		}
		return image || '/images/blog-placeholder.jpg'
	}
	function trimText(text: any, maxLength: any) {
		if (text.length > maxLength) {
			return text.substring(0, maxLength) + '...'
		}
		return text
	}
	
	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Blog List" subName="Blogs" />
			{loading ? (
				<div className="text-center" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			</div>
			) : blogPosts.length === 0 ? (
				<div className="text-center mt-5">
					<h3>No blogs found</h3>
				</div>
			) : (
				<Row className="mt-4">
					{blogPosts.map((blog, index) => (
						<Col key={index} md={4} className="mb-4">
							<Card>
								<Card.Img
									variant="top"
									src={getImageUrl(blog.blogImage)}
									style={{ width: '100%', height: '300px', objectFit: 'cover' }}
								/>
								<Card.Body>
									<Card.Title>{capitalizeFirstLetter(blog.title)}</Card.Title>
									<Card.Text
										style={{ height: '50px', overflow: 'hidden' }}
										dangerouslySetInnerHTML={renderHTML(
											capitalizeFirstLetter(trimText(blog.description, 150))
										)}
									/>
									<div className="my-2 d-flex justify-content-between align-items-center">
										<div
											className="text-primary"
											style={{ textDecoration: 'none', cursor: 'pointer' }}
											onClick={() => handleReadBlog(blog.id)}>
											Read More
										</div>
										{user.role === ('superAdmin' || 'admin') && (
											<div>
												<Button
													variant="danger"
													className="btn-sm m-1"
													onClick={() => handleDeleteBlog(blog.id)}>
													Delete
												</Button>
												<Button
													variant="primary"
													className="btn-sm m-1"
													onClick={() => handleEditBlog(blog.id)}>
													Edit
												</Button>
											</div>
										)}
									</div>
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</>
	)
}

export default BlogList
