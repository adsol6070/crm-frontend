import React from 'react'
import { useParams } from 'react-router-dom'
import { PageBreadcrumb } from '@/components'
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import useReadBlog from './useReadBlog'

interface DateTimeOptions {
	year?: 'numeric' | '2-digit'
	month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long'
	day?: 'numeric' | '2-digit'
	hour?: 'numeric' | '2-digit'
	minute?: 'numeric' | '2-digit'
	second?: 'numeric' | '2-digit'
	hour12?: boolean
}

const ReadBlog: React.FC = () => {
	const { blogId } = useParams() as { blogId: string }
	const { blogData, loading, error } = useReadBlog(blogId)

	const renderHTML = (htmlString: string) => ({ __html: htmlString })

	const formatDateTime = (dateTimeString: string) => {
		const date = new Date(dateTimeString)
		const options: DateTimeOptions = {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}
		return new Intl.DateTimeFormat('en-US', options).format(date)
	}

	if (loading) {
		return (
			<div className="text-center mt-5">
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			</div>
		)
	}

	if (error) {
		return (
			<Alert variant="danger">
				<Alert.Heading>Error</Alert.Heading>
				<p>{error}</p>
			</Alert>
		)
	}

	if (!blogData) {
		return (
			<Alert variant="warning">
				<Alert.Heading>No Blog Data Found</Alert.Heading>
				<p>The blog data is currently unavailable.</p>
			</Alert>
		)
	}

	const { title, content, created_at, category, description, blogImage } =
		blogData
	const imageUrl = blogImage || '/images/blog-placeholder.jpg'
	const formattedDateTime = formatDateTime(created_at)

	return (
		<>
			<PageBreadcrumb title="Read Blog" subName="Blogs" />
			<Row className="mt-4 d-flex align-items-center justify-content-center">
				<Col md={8} className="mb-4">
					<Card className="d-block">
						<div className="d-flex align-items-center justify-content-center">
							<Card.Img
								className="card-img-top"
								src={imageUrl}
								alt="Blog Image"
								style={{
									width: '100%',
									padding: '5px',
									maxWidth: '100%',
									objectFit: 'cover',
								}}
							/>
						</div>
						<Card.Body>
							<Card.Title
								as="h5"
								className="card-title"
								style={{ fontSize: '1.5rem' }}>
								{title}
							</Card.Title>
							<Card.Text>
								<small className="text-muted">{formattedDateTime}</small>
							</Card.Text>
							<Card.Text>Category: {category}</Card.Text>
							<Card.Text style={{ fontSize: '0.8rem' }}>
								Description: {description}
							</Card.Text>
							<Card.Text
								dangerouslySetInnerHTML={renderHTML(content)}
								style={{ fontSize: '1rem' }}
							/>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default ReadBlog
