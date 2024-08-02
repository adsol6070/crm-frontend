import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from 'reactstrap';
import SimpleBar from 'simplebar-react';
import classNames from 'classnames';
import { CHAT_TAB, GROUP_TAB } from '@/constants/chat';
import styled from 'styled-components';
import { filterByName } from '@/utils';
import { useChatContext } from '../context/chatContext';
import { useThemeContext } from '@/common';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const {
        chats,
        groups,
        currentRoomId,
        unreadMessages,
        unreadGroupMessages,
        currentUser,
        userChatOpen,
        groupChatOpen,
        handleGroupContextMenu,
        setShowCreateGroupModal,
    } = useChatContext();
    const { settings } = useThemeContext();
    const [singleButton, setSingleButton] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>(CHAT_TAB);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredChats, setFilteredChats] = useState(chats);
    const [filteredGroups, setFilteredGroups] = useState(groups);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFilteredChats(filterByName(chats, searchTerm));
        setFilteredGroups(filterByName(groups, searchTerm));
        setLoading(false);
    }, [searchTerm, chats, groups]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <StyledCard className="chat-leftsidebar">
            <StyledCardBody className="profileStyles">
                <div className="text-center bg-light rounded px-4 py-3">
                    <div className="text-end">
                        <StyledDropdown
                            className="chat-noti-dropdown"
                            isOpen={singleButton}
                            toggle={() => setSingleButton(!singleButton)}>
                            <DropdownToggle tag="a" className="p-0">
                                <i className="ri-settings-3-line"></i>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => navigate('/pages/Profile')}>
                                    Profile
                                </DropdownItem>
                            </DropdownMenu>
                        </StyledDropdown>
                    </div>
                    {currentUser ? (
                        <UserStatus className="chat-user-status">
                            <img
                                src={currentUser.imageUrl}
                                className="avatar-md rounded-circle"
                                alt=""
                            />
                            <div className="">
                                <div className="status"></div>
                            </div>
                            <h5 className="font-size-16 mb-1 mt-3">
                                <Link to="#" className="text-reset">
                                    {`${currentUser.firstname} ${currentUser.lastname}`}
                                </Link>
                            </h5>
                            <p className="text-muted mb-0">
                                {currentUser.online ? 'Available' : 'Offline'}
                            </p>
                        </UserStatus>
                    ) : (
                        <SkeletonWrapper>
                            <Skeleton circle={true} height={100} width={100} />
                            <Skeleton height={24} width={120} style={{ marginTop: '1rem' }} />
                            <Skeleton height={16} width={80} style={{ marginTop: '0.5rem' }} />
                        </SkeletonWrapper>
                    )}
                </div>
            </StyledCardBody>
            <SearchContainer className="px-3">
                <div className="search-box position-relative">
                    <Input
                        type="text"
                        className="form-control rounded border"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <i className="ri-search-line search-icon"></i>
                </div>
                <Button
                    color="primary"
                    className="w-100 mt-2"
                    onClick={() => setShowCreateGroupModal(true)}>
                    Create Group
                </Button>
            </SearchContainer>

            <NavContainer className="chat-leftsidebar-nav">
                <Nav pills justified className="bg-light m-3 rounded">
                    <NavItem className="nav-item-hover">
                        <NavLink
                            className={classNames({
                                active: activeTab === CHAT_TAB,
                            })}
                            onClick={() => {
                                setActiveTab(CHAT_TAB);
                            }}>
                            <i className="bx bx-chat font-size-20 d-sm-none"></i>
                            <span className="d-sm-block">Chat</span>
                        </NavLink>
                    </NavItem>
                    <NavItem className="nav-item-hover">
                        <NavLink
                            className={classNames({
                                active: activeTab === GROUP_TAB,
                            })}
                            onClick={() => {
                                setActiveTab(GROUP_TAB);
                            }}>
                            <i className="bx bx-group font-size-20 d-sm-none"></i>
                            <span className="d-sm-block">Groups</span>
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={CHAT_TAB}>
                        <SimpleBar className="chat-message-list">
                            <div>
                                <div className="px-3">
                                    <h5 className="font-size-14">Recent</h5>
                                    {loading ? (
                                        <>
                                            {[...Array(4)].map((_, index) => (
                                                <div key={index} className="d-flex align-items-center mb-3">
                                                    <Skeleton circle={true} height={40} width={40} className="me-2" />
                                                    <div>
                                                        <Skeleton width={150} height={20} />
                                                        <Skeleton width={100} height={15} className="mt-1" />
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : filteredChats.length === 0 ? (
                                        <NoResultsMessage>No Chats Found</NoResultsMessage>
                                    ) : (
                                        <ChatList
                                            className="list-unstyled chat-list px-1"
                                            theme={settings.theme}>
                                            {filteredChats.map((chat: any) => (
                                                <li
                                                    key={chat.id + chat.status}
                                                    className={
                                                        currentRoomId === chat.roomId ? 'active' : ''
                                                    }>
                                                    <Link
                                                        to="#"
                                                        onClick={() => {
                                                            userChatOpen(chat);
                                                        }}>
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className={`flex-shrink-0 user-img ${chat.status} align-self-center me-3`}>
                                                                <img
                                                                    src={chat.image}
                                                                    className="rounded-circle"
                                                                    style={{
                                                                        height: '2.6rem',
                                                                        width: '2.6rem',
                                                                    }}
                                                                    alt=""
                                                                />
                                                                <span className="user-status"></span>
                                                            </div>

                                                            <div className="flex-grow-1 overflow-hidden">
                                                                <h5 className="text-truncate font-size-15 mb-0">
                                                                    {chat.name}
                                                                </h5>
                                                                <p className="text-muted mb-0 mt-1 text-truncate">
                                                                    {chat.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex-shrink-0 ms-3">
                                                                {unreadMessages.get(chat.roomId) > 0 && (
                                                                    <span
                                                                        className="badge bg-danger"
                                                                        style={{
                                                                            paddingRight: '.6em',
                                                                            paddingLeft: '.6em',
                                                                        }}>
                                                                        {unreadMessages.get(chat.roomId)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ChatList>
                                    )}
                                </div>
                            </div>
                        </SimpleBar>
                    </TabPane>

                    <TabPane tabId={GROUP_TAB}>
                        <SimpleBar className="chat-message-list">
                            <div>
                                <div className="px-3">
                                    <h5 className="font-size-14">Groups</h5>
                                    {loading ? (
                                        <>
                                            {[...Array(5)].map((_, index) => (
                                                <div key={index} className="d-flex align-items-center mb-3">
                                                    <Skeleton circle={true} height={40} width={40} className="me-2" />
                                                    <div>
                                                        <Skeleton width={150} height={20} />
                                                        <Skeleton width={100} height={15} className="mt-1" />
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : filteredGroups.length === 0 ? (
                                        <NoResultsMessage>No Groups Found</NoResultsMessage>
                                    ) : (
                                        <ChatList
                                            className="list-unstyled chat-list px-1"
                                            theme={settings.theme}>
                                            {filteredGroups.map((group: any) => (
                                                <li
                                                    key={group.id}
                                                    className={currentRoomId === group.id ? 'active' : ''}
                                                    onContextMenu={(event) =>
                                                        handleGroupContextMenu(event, group)
                                                    }>
                                                    <Link
                                                        to="#"
                                                        onClick={() => {
                                                            groupChatOpen(group);
                                                        }}>
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className={`flex-shrink-0 user-img  align-self-center me-3`}>
                                                                <img
                                                                    src={group.image}
                                                                    className="rounded-circle"
                                                                    style={{
                                                                        height: '2.6rem',
                                                                        width: '2.6rem',
                                                                    }}
                                                                    alt=""
                                                                />
                                                            </div>

                                                            <div className="flex-grow-1">
                                                                <h5 className="font-size-13 mb-0">
                                                                    {group.name}
                                                                </h5>
                                                            </div>

                                                            <div className="flex-shrink-0 ms-3">
                                                                {unreadGroupMessages.get(group.id) > 0 && (
                                                                    <span
                                                                        className="badge bg-danger"
                                                                        style={{
                                                                            paddingRight: '.6em',
                                                                            paddingLeft: '.6em',
                                                                        }}>
                                                                        {unreadGroupMessages.get(group.id)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ChatList>
                                    )}
                                </div>
                            </div>
                        </SimpleBar>
                    </TabPane>
                </TabContent>
            </NavContainer>
        </StyledCard>
    );
};

export default Sidebar;

const StyledCard = styled(Card)`
    @media (min-width: 1200px) {
        min-width: 380px;
    }

    @media (min-width: 992px) and (max-width: 1199.98px) {
        min-width: 290px;
    }
`;

const StyledCardBody = styled(CardBody)`
    padding: 10px;
`;

const StyledDropdown = styled(Dropdown)`
    position: relative;
    z-index: 2;

    &.active:before {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: #ff0000;
        border-radius: 50%;
        right: 0;
    }
`;

const UserStatus = styled.div`
    position: relative;
    margin-top: -25px;

    img {
        height: 4.5rem;
        width: 4.5rem;
    }

    .status {
        width: 12px;
        height: 12px;
        background-color: #28a745;
        border-radius: 50%;
        border: 2px solid #1a2942;
        position: absolute;
        left: 35px;
        right: 0;
        margin: 0 auto;
        bottom: 67px;
    }

    h5 {
        font-size: 16px !important;
    }
`;

const SearchContainer = styled.div`
    .search-box .form-control {
        border-radius: 30px;
        padding-left: 40px;
    }

    .search-box .search-icon {
        font-size: 18px;
        position: absolute;
        left: 13px;
        top: 0px;
        color: #ffffff;
        line-height: 34px;
    }
`;

const NavContainer = styled.div`
    .nav-item-hover:hover {
        cursor: pointer;
    }

    .chat-message-list {
        height: calc(100vh - 346px);
    }

    @media (min-width: 992px) {
        .chat-message-list {
            height: calc(100vh - 610px);
        }
    }
`;

const ChatList = styled.ul<{ theme: string }>`
    margin: 0;

    .active {
        background: ${({ theme }) => (theme === 'dark' ? '#f8f9fa24' : '#f8f9fa')};
        border-radius: 0.5rem !important;
        border: 1px solid rgba(128, 128, 128, 0.236);

        h5 {
            color: ${({ theme }) => (theme === 'dark' ? 'white' : 'black')};
        }

        p {
            color: ${({ theme }) =>
                theme === 'dark' ? '#ffffffb5' : 'black'} !important;
        }
    }

    li a {
        position: relative;
        display: block;
        padding: 12px 12px;
        color: ${({ theme }) => (theme === 'dark' ? 'white' : '#1a2942')};
        transition: all 0.4s;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
    }

    li .user-img {
        position: relative;

        .user-status {
            width: 10px;
            height: 10px;
            background-color: #6c757d;
            border-radius: 50%;
            position: absolute;
            right: 3px;
            bottom: 0;

            &.Online {
                background-color: #28a745;
            }

            &.Offline {
                background-color: #6c757d;
            }

            &.Away {
                background-color: #ffc107;
            }
        }
    }

    li.unread a {
        font-weight: 600;
        color: #1a2942;
    }

    .unread-message {
        position: absolute;
        display: inline-block;
        right: 16px;
        top: 33px;
    }

    .font-size-15 {
        font-size: 15px !important;
    }
`;

const NoResultsMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 16px;
    color: #6c757d;
`;

const SkeletonWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
`;