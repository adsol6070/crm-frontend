import React from 'react'

const TypingIndicator = ({ isTyping, typingUsers, isGroupChat }) => {
	return (
		<>
			{isTyping && (
				<div className="chat-wrap-content typing-indicator">
					{isGroupChat ? (
						typingUsers.map((user) => (
							<div key={user.id} className="typing-user">
								{user.firstname} {user.lastname} is typing
								<div className="typing-dots">
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						))
					) : (
						<div className="typing-dots">
							<span></span>
							<span></span>
							<span></span>
						</div>
					)}
				</div>
			)}
		</>
	)
}

export default TypingIndicator

/* 

.typing-indicator {
	display: flex;
	align-items: center;
	height: 1.5rem;
}

.typing-indicator p {
	margin: 0;
	padding-right: 0.5rem;
}


.typing-dots {
	display: flex;
	align-items: flex-end;
}

.typing-dots span {
	display: block;
	width: 0.5rem;
	height: 0.5rem;
	margin-right: 0.2rem;
	background-color: #333;
	border-radius: 50%;
	animation: bounce 1s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
	animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
	animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
	animation-delay: 0.4s;
}


*/
