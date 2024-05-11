import { PageBreadcrumb } from '@/components';
import { Row, Col, Card, Button } from 'react-bootstrap';
import useGetBlogPosts from './useBlogList';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { useAuthContext } from '@/common/context'

const BlogList = () => {
    const { loading, blogPosts, handleReadBlog, handleDeleteBlog, handleEditBlog } = useGetBlogPosts();
    const { user } = useAuthContext()
    const renderHTML = (htmlString: string) => ({ __html: htmlString });

    const getImageUrl = (image: any) => {
        if (image instanceof File) {
            return URL.createObjectURL(image);  // Create a URL for rendering
        }
        return image || '/images/blog-placeholder.jpg';  // Use placeholder if no image
    };
    function trimText(text: any, maxLength: any) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }
    function capitalizeFirstLetter(line: any) {
        if (!line) return line; 
        return line.charAt(0).toUpperCase() + line.slice(1);
    }
    return (
        <>
            <ToastContainer />
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
                                    src={getImageUrl(blog.blogImage)}
                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                    <Card.Title>{capitalizeFirstLetter(blog.title)}</Card.Title>
                                    <Card.Text style={{ height: '50px', overflow:"hidden" }} dangerouslySetInnerHTML={renderHTML(capitalizeFirstLetter(trimText(blog.description, 150)))} />
                                    <div className="my-2 d-flex justify-content-between align-items-center">
                                        <div className="text-primary" style={{ textDecoration: 'none', cursor: 'pointer' }} onClick={() => handleReadBlog(blog)}>
    Read More
</div>     
                             {user.role === 'superAdmin' && (
                                            <div>
                                                <Button variant="danger" className="btn-sm m-1" onClick={() => handleDeleteBlog(blog.id)}>
                                                    Delete
                                                </Button>
                                                <Button variant="primary" className="btn-sm m-1" onClick={() => handleEditBlog(blog.id, blog)}>Edit</Button>
                                            </div>
                                        )}
                                        {/* <div>
                                            <Button variant="danger" className="btn-sm m-1" onClick={() => handleDeleteBlog(blog.id)}>
                                                Delete
                                            </Button>
                                            <Button variant="primary" className="btn-sm m-1" onClick={() => handleEditBlog(blog.id, blog)}>Edit</Button>
                                        </div> */}
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
