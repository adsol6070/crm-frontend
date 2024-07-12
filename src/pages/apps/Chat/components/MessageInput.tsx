import EmojiPicker from 'emoji-picker-react'
import { Button } from 'reactstrap'
import styled from 'styled-components'

const MessageInput = ({
	disabledGroups,
	currentRoomId,
	curMessage,
	onKeyPress,
	handleTyping,
	showEmojiPicker,
	setShowEmojiPicker,
	handleEmojiClick,
	fileInputRef,
	emojiPickerRef,
	isDisable,
	isCaptionTyping,
	handleFileUpload,
	addMessage,
	selectedFile,
	caption,
	handleCaptionChange,
	handleSendFileMessage,
}) => {
	return (
		<div className="p-3 border-top">
			{disabledGroups.has(currentRoomId) ? (
				<div className="text-center text-muted">
					<p>
						{disabledGroups.get(currentRoomId)
							? 'You have been removed from this group by an admin. You cannot send messages.'
							: 'You cannot send messages to this group because you are no longer a member.'}
					</p>
				</div>
			) : (
				<>
					<div className="row">
						<InputContainer className="col">
							<ChatInput
								type="text"
								value={curMessage}
								onKeyPress={onKeyPress}
								onChange={handleTyping}
								className="form-control border"
								placeholder="Enter Message..."
							/>
							<EmojiButton
								type="button"
								color="link"
								onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
								😊
							</EmojiButton>
							{showEmojiPicker && (
								<EmojiPickerContainer
									className="position-absolute"
									ref={emojiPickerRef}>
									<EmojiPicker onEmojiClick={handleEmojiClick} />
								</EmojiPickerContainer>
							)}
						</InputContainer>
						<div className="col-auto d-flex align-items-center">
							<Button
								type="button"
								color="link"
								onClick={() => {
									const fileInput = fileInputRef.current
									if (fileInput) {
										fileInput.click()
									}
								}}>
								<i
									className="ri-attachment-line"
									style={{ fontSize: '1.2em' }}></i>
							</Button>
							<input
								type="file"
								id="fileInput"
								ref={fileInputRef}
								style={{ display: 'none' }}
								onChange={handleFileUpload}
							/>
							<SendButton
								type="button"
								color="primary"
								disabled={!isDisable || isCaptionTyping}
								onClick={addMessage}
								className="w-md waves-effect waves-light">
								<span className="d-none d-sm-inline-block me-2">Send</span>
								<i className="mdi mdi-send float-end"></i>
							</SendButton>
						</div>
					</div>
					{selectedFile && selectedFile.type === 'image' && (
						<ImageFileContainer id="selected-file-container" className="mt-3">
							<img
								src={selectedFile.url}
								alt="Selected"
								className="img-fluid rounded"
							/>
							<div className="d-flex align-items-center justify-content-center mt-2">
								<input
									type="text"
									className="form-control"
									placeholder="Caption (optional)"
									value={caption}
									onChange={handleCaptionChange}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											handleSendFileMessage()
										}
									}}
								/>
								<SendButton
									type="button"
									color="primary"
									onClick={handleSendFileMessage}
									className="w-md waves-effect waves-light">
									<i className="mdi mdi-send float-end" />
								</SendButton>
							</div>
						</ImageFileContainer>
					)}

					{selectedFile && selectedFile.type === 'pdf' && (
						<PDFFileContainer
							id="selected-file-container"
							className="mt-3 text-center pdf-preview">
							<div className="pdf-file-icon">
								<i
									className="ri-file-pdf-line"
									style={{ fontSize: '3em', color: '#d9534f' }}></i>
							</div>
							<div className="pdf-file-info">
								<p className="mb-1">{selectedFile.name}</p>
								<p className="mb-1">
									{(selectedFile.size / 1024).toFixed(2)} KB, PDF Document
								</p>
							</div>
							<div className="d-flex align-items-center mt-2">
								<input
									type="text"
									className="form-control"
									placeholder="Caption (optional)"
									value={caption}
									onChange={handleCaptionChange}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											handleSendFileMessage()
										}
									}}
								/>
								<Button
									type="button"
									color="primary"
									onClick={handleSendFileMessage}
									className="waves-effect waves-light">
									<i className="mdi mdi-send" />
								</Button>
							</div>
						</PDFFileContainer>
					)}

					{selectedFile && selectedFile.type === 'zip' && (
						<ZipFileContainer
							id="selected-file-container"
							className="mt-3 text-center zip-preview">
							<div className="zip-file-icon">
								<i
									className="ri-file-zip-line"
									style={{ fontSize: '3em', color: '#ff9800' }}></i>
							</div>
							<div className="zip-file-info">
								<p className="mb-1">{selectedFile.name}</p>
								<p className="mb-1">
									{(selectedFile.size / 1024).toFixed(2)} KB, Zip Archive
								</p>
							</div>
							<div className="d-flex align-items-center mt-2">
								<input
									type="text"
									className="form-control"
									placeholder="Caption (optional)"
									value={caption}
									onChange={handleCaptionChange}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											handleSendFileMessage()
										}
									}}
								/>
								<Button
									type="button"
									color="primary"
									onClick={handleSendFileMessage}
									className="waves-effect waves-light">
									<i className="mdi mdi-send" />
								</Button>
							</div>
						</ZipFileContainer>
					)}
				</>
			)}
		</div>
	)
}

export default MessageInput

const InputContainer = styled.div`
	position: relative;
`

const ChatInput = styled.input`
	width: 100%;
	padding-right: 2.5rem;
`

const EmojiButton = styled(Button)`
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	z-index: 1;
`

const EmojiPickerContainer = styled.div`
	bottom: 50px;
	right: 0;
	z-index: 1000;
`

const SendButton = styled(Button)`
	@media (max-width: 575.98px) {
		min-width: auto;
	}
`

const FileContainer = styled.div`
	position: absolute;
	bottom: 95px;
	right: 15px;
	width: 300px;
	max-height: 300px;
	background-color: #f8f9fa;
	padding: 10px;
	border-radius: 10px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`

const ImageFileContainer = styled(FileContainer)`
	img {
		width: '100%';
		height: 'auto';
	}
`

const PDFFileContainer = styled(FileContainer)``

const ZipFileContainer = styled(FileContainer)``
