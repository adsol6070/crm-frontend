import { PageBreadcrumb } from '@/components';
import { useLocation } from 'react-router-dom'
import { Row, Col, Card } from 'react-bootstrap';

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
    const renderHTML = (htmlString: string) => ({ __html: htmlString });
    const location = useLocation();
    const blogData = location.state?.blogData;
    const imageUrl = blogData?.blogImage || '/images/blog-placeholder.jpg';
    function formatDateTime(dateTimeString: any) {
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
    }
    const dateTimeString = blogData?.created_at;
    const formattedDateTime = formatDateTime(dateTimeString);

    return (
        <>
            <PageBreadcrumb title="Read Blog" subName="Blogs" />
            <Row className="mt-4 d-flex align-items-center justify-content-center">
                <Col md={8} className="mb-4">
                    <Card className="d-block">
                        <div className='d-flex align-items-center justify-content-center'>
                            <Card.Img
                                className="card-img-top"
                                src={imageUrl}
                                alt="Blog Image"
                                style={{ width: '100%', padding: "5px", maxWidth: "100%", objectFit: 'cover' }}
                            />
                        </div>
                        <Card.Body>
                            <Card.Title as="h5" className="card-title" style={{ fontSize: '1.5rem' }}>
                                {blogData.title}
                            </Card.Title>
                            <Card.Text>
                                <small className="text-muted">{formattedDateTime}</small>
                            </Card.Text>
                            <Card.Text>Category: {blogData.category}</Card.Text>
                            <Card.Text style={{ fontSize: '0.8rem' }}>Description: {blogData.description}</Card.Text>
                            <Card.Text dangerouslySetInnerHTML={renderHTML(blogData.content)} style={{ fontSize: '1rem' }} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default ReadBlog
