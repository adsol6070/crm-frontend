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
				<Col className="mb-4">
					<Card className="border-0 shadow-sm">
						<Card.Img
							variant="top"
							src={imageUrl}
							alt="Blog Image"
							style={{
								height: 'auto',
								width: '100%',
								maxHeight: '500px',
								objectFit: 'cover',
							}}
						/>
						<Card.Body>
							<Card.Title as="h3" className="fw-bold mb-3">
								{title}
							</Card.Title>
							<Card.Text>
								<small className="text-muted">
									Posted on {formattedDateTime} | Category: {category}
								</small>
							</Card.Text>
							<Card.Text className="mb-4 text-muted">
								<i>{description}</i>
							</Card.Text>
							<div
								className="blog-content"
								dangerouslySetInnerHTML={renderHTML(content)}
								style={{
									fontSize: '1rem',
									lineHeight: '1.8',
									textIndent: '2em',
								}}
							/>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default ReadBlog
