import React from 'react'
import { PageBreadcrumb } from '@/components'
import ForwardMessageModal from './Modals/ForwardMessageModal'
import CreateGroupModal from './Modals/CreateGroupModal'
import GroupInfoModal from './Modals/GroupInfoModal'
import AddUserToGroupModal from './Modals/AddUserToGroupModal'
import SelectNewOwnerModal from './Modals/SelectNewOwnerModal'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import { ChatProvider } from './context/chatContext'

const Chat: React.FC = () => {
	return (
		<ChatProvider>
			<PageBreadcrumb title="Chat" subName="Chat" />
			<div className="d-lg-flex">
				<Sidebar />
				<ChatWindow />
			</div>
			<ForwardMessageModal />
			<CreateGroupModal />
			<GroupInfoModal />
			<AddUserToGroupModal />
			<SelectNewOwnerModal />
		</ChatProvider>
	)
}

export default Chat
