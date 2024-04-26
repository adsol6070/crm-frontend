import { PageBreadcrumb } from '@/components';
import { Row, Col, Card, Button } from 'react-bootstrap';
import useGetBlogPosts from './useBlogList';

const BlogList = () => {
    const { loading, blogPosts, handleDeleteBlog, handleEditBlog } = useGetBlogPosts();
    const renderHTML = (htmlString: string) => ({ __html: htmlString });

    return (
        <>
            <PageBreadcrumb title="Blog List" subName="Blogs" />
            {loading ? (
                <div className="text-center mt-5">
                    <h3>Loading...</h3>
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
                                    src={blog.blogImage ? blog.blogImage : '/images/blog-placeholder.jpg'}
                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                    <Card.Title>{blog.title}</Card.Title>
                                    <Card.Text dangerouslySetInnerHTML={renderHTML(blog.content)} />
                                    <div className="d-flex justify-content-between">
                                        <Button variant="danger" onClick={() => handleDeleteBlog(blog.id)}>
                                            Delete
                                        </Button>
                                        <Button variant="primary" onClick={() => handleEditBlog(blog.id, blog)}>Edit</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </>
    );
};

export default BlogList;
