import { Button, Card, Col, Image, Nav, Row, Tab } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import bgProfile from '@/assets/images/bg-profile.jpg';
import useGetProfile from './useGetProfile';

const ProfilePages = () => {
  const { getProfile } = useGetProfile();

  function capitalizeFirstLetter(line: any) {
    if (!line) return line;
    return line.charAt(0).toUpperCase() + line.slice(1);
  }

  const navigate = useNavigate();
  const handleEdit = (userId: string) => {
    navigate(`/user/edit/${userId}`);
  };

  return (
    <div>
      <Row>
        <Col sm={12}>
          <div
            className="profile-bg-picture"
            style={{ backgroundImage: `url(${bgProfile})` }}
          >
            <span className="picture-bg-overlay" />
          </div>
          <div className="profile-user-box">
            <Row>
              <Col sm={6}>
                <div className="profile-user-img">
                  <Image
                    src={getProfile?.profileImage}
                    className="avatar-lg rounded-circle"
                    alt={`${getProfile?.role}`}
                  />
                </div>
                <div>
                  <h4 className="mt-4 fs-17 ellipsis">
                    {capitalizeFirstLetter(getProfile?.firstname)}{' '}
                    {capitalizeFirstLetter(getProfile?.lastname)}
                  </h4>
                  <p className="font-13">{capitalizeFirstLetter(getProfile?.role)}</p>
                  <p className="text-muted mb-0">
                    <small>California, United States</small>
                  </p>
                </div>
              </Col>
              <Col sm={6}>
                {getProfile?.role === 'superAdmin' && (
                  <div className="d-flex justify-content-end align-items-center gap-2">
                    <Button
                      type="button"
                      variant="soft-danger"
                      onClick={() => handleEdit(getProfile.id)}
                    >
                      <i className="ri-settings-2-line align-text-bottom me-1 fs-16 lh-1" /> Edit
                      Profile
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Card className="p-0">
            <Card.Body className="p-0">
              <div className="profile-content">
                <Tab.Container defaultActiveKey="About">
                  <Nav as="ul" justify className="nav-underline gap-0">
                    <Nav.Item as="li">
                      <Nav.Link as={Link} to="#" eventKey="About" type="button">
                        About
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content className="m-0 p-4">
                    <Tab.Pane eventKey="About" id="aboutme" tabIndex={0}>
                      <div className="profile-desk">
                        <h5 className="mt-4 fs-17 text-dark">Personal Information</h5>
                        <table className="table table-condensed mb-0 border-top">
                          <tbody>
                            <tr>
                              <th scope="row">User ID</th>
                              <td className="ng-binding">{getProfile?.id}</td>
                            </tr>
                            <tr>
                              <th scope="row">Role</th>
                              <td className="ng-binding">{capitalizeFirstLetter(getProfile?.role)}</td>
                            </tr>
                            <tr>
                              <th scope="row">Email</th>
                              <td>
                                <Link to={`mailto:${getProfile?.email}`} className="ng-binding">
                                  {getProfile?.email}
                                </Link>
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">Phone</th>
                              <td className="ng-binding">{getProfile?.phone}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePages;
