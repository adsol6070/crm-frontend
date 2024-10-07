import React from 'react';
import { useParams } from 'react-router-dom';
import { PageBreadcrumb } from '@/components';
import { Row, Col, Card, Alert, Container } from 'react-bootstrap';
import useReadBlog from './useReadBlog';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { capitalizeFirstLetter } from '@/utils';

interface DateTimeOptions {
	year?: 'numeric' | '2-digit';
	month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
	day?: 'numeric' | '2-digit';
	hour?: 'numeric' | '2-digit';
	minute?: 'numeric' | '2-digit';
	second?: 'numeric' | '2-digit';
	hour12?: boolean;
}

const ReadBlog: React.FC = () => {
	const { blogId } = useParams() as { blogId: string };
	const { blogData, loading, error } = useReadBlog(blogId);

	const renderHTML = (htmlString: string) => ({ __html: htmlString });

	const formatDateTime = (dateTimeString: string) => {
		const date = new Date(dateTimeString);
		const options: DateTimeOptions = {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		};
		return new Intl.DateTimeFormat('en-US', options).format(date);
	};

	if (loading) {
		return (
			<>
				<PageBreadcrumb title="Read Blog" subName="Blogs" />
				<Container className="my-4">
					<Row className="justify-content-center">
						<Col md={10} lg={8}>
							<Card className="border-0 shadow-lg">
								<Skeleton height={500} />
								<Card.Body className="p-5">
									<Skeleton width="60%" height={40} />
									<Skeleton width="40%" height={20} className="my-2" />
									<Skeleton width="100%" height={20} count={3} className="my-2" />
									<Skeleton width="100%" height={300} className="mt-3" />
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Container>
			</>
		);
	}

	if (error) {
		return (
			<Alert variant="danger" className="mt-4">
				<Alert.Heading>Error</Alert.Heading>
				<p>{error}</p>
			</Alert>
		);
	}

	if (!blogData) {
		return (
			<Alert variant="warning" className="mt-4">
				<Alert.Heading>No Blog Data Found</Alert.Heading>
				<p>The blog data is currently unavailable.</p>
			</Alert>
		);
	}

	const { title, content, created_at, category, description, blogImage } = blogData;
	const imageUrl = blogImage;
	const formattedDateTime = formatDateTime(created_at);

	return (
		<>
			<PageBreadcrumb title="Read Blog" subName="Blogs" />
			<Container className="my-4">
				<Row className="justify-content-center">
					<Col md={10} lg={8}>
						<Card className="border-0 shadow-lg">
							<Card.Img
								variant="top"
								src={imageUrl}
								alt="Blog Image"
								style={{
									height: 'auto',
									width: '100%',
									maxHeight: '500px',
									objectFit: 'cover',
									borderTopLeftRadius: '15px',
									borderTopRightRadius: '15px',
								}}
							/>
							<Card.Body className="p-5">
								<Card.Title as="h2" className="fw-bold mb-3" style={{ color: '#2c3e50' }}>
									{title==null?"N/A":title}
								</Card.Title>
								<Card.Text className="text-muted mb-2">
									<small>
										Posted on {formattedDateTime ?? "N/A"} | Category: {capitalizeFirstLetter(category ?? "N/A")}
									</small>
								</Card.Text>
								<Card.Text className="text-muted mb-4" style={{ fontStyle: 'italic' }}>
									{description??"N/A"}
								</Card.Text>
								<div
									className="blog-content"
									dangerouslySetInnerHTML={renderHTML(content)}
									style={{
										fontSize: '1.1rem',
										lineHeight: '1.8',
										color: '#34495e',
										marginBottom: '1rem',
									}}
								/>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ReadBlog;
