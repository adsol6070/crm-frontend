import styled, { keyframes } from 'styled-components'
import { useChatContext } from '../context/chatContext'
import { useThemeContext } from '@/common'

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`

const TypingIndicatorWrapper = styled.div<{ theme: string }>`
	position: absolute;
	display: flex;
	align-items: center;
	background-color: transparent;
	padding: 15px;
	border-radius: 0px 15px 15px 15px;
	bottom: 100px;
	left: 75px;
	color: ${({ theme }) => (theme === 'dark' ? 'white' : 'black')};
`

const TypingUser = styled.div`
	margin: 0;
	padding-right: 0.5rem;
`

const TypingDots = styled.div`
	display: flex;
	align-items: flex-end;
`

const Dot = styled.span<{ theme: string }>`
	display: block;
	width: 0.5rem;
	height: 0.5rem;
	margin-right: 0.2rem;
	background-color: ${({ theme }) => (theme === 'dark' ? 'white' : '#333')};
	border-radius: 50%;
	animation: ${bounce} 1s infinite ease-in-out;

	&:nth-child(1) {
		animation-delay: 0s;
	}
	&:nth-child(2) {
		animation-delay: 0.2s;
	}
	&:nth-child(3) {
		animation-delay: 0.4s;
	}
`

const TypingIndicator = () => {
	const { settings } = useThemeContext()
	const { isTyping, typingUsers, isGroupChat } = useChatContext()
	return (
		<>
			{isTyping && (
				<TypingIndicatorWrapper theme={settings.theme}>
					{isGroupChat ? (
						typingUsers.map((user) => (
							<TypingUser key={user.id} className="typing-user">
								{user.firstname} {user.lastname} is typing
								<TypingDots>
									<Dot theme={settings.theme} />
									<Dot theme={settings.theme} />
									<Dot theme={settings.theme} />
								</TypingDots>
							</TypingUser>
						))
					) : (
						<TypingDots>
							<Dot theme={settings.theme} />
							<Dot theme={settings.theme} />
							<Dot theme={settings.theme} />
						</TypingDots>
					)}
				</TypingIndicatorWrapper>
			)}
		</>
	)
}

export default TypingIndicator
