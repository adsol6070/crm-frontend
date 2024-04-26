import { PageBreadcrumb } from '@/components'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useBlogForm } from './Create/useBlogForm'

const BlogList = () => {
	const { blogs, setBlogs } = useBlogForm()

	const handleDeleteBlog = (index: any) => {
		const updatedBlogs = [...blogs]
		updatedBlogs.splice(index, 1)
		setBlogs(updatedBlogs)
	}

	const renderHTML = (htmlString: any) => {
		return { __html: htmlString }
	}

	return (
		<>
			<PageBreadcrumb title="Blog List" subName="Blogs" />
			{blogs.length === 0 ? (
				<div className="text-center mt-5">
					<h3>No blogs found</h3>
				</div>
			) : (
				<Row className="mt-4">
					{blogs.map((blog, index) => (
						<Col key={index} md={4} className="mb-4">
							<Card>
								<Card.Img
									variant="top"
									src="https://media.istockphoto.com/id/1488919446/photo/working-from-home-in-downtown-los-angeles.webp?b=1&s=170667a&w=0&k=20&c=r9qTUsKCOKZBK1wDUfjIhExcrpRYRBUS0sSWZ10jcgw="
								/>
								<Card.Body>
									<Card.Title>{blog.title}</Card.Title>
									<Card.Text
										dangerouslySetInnerHTML={renderHTML(blog.content)}
									/>
									<div className="d-flex justify-content-between">
										<Button
											variant="danger"
											onClick={() => handleDeleteBlog(index)}>
											Delete
										</Button>
										<Button variant="primary">Edit</Button>
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
