export const generatePlaceholderImage = (name: string) => {
	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	if (!context) {
		console.error('2D context is not supported')
		return ''
	}

	const size = 50
	canvas.width = size
	canvas.height = size
	const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16)

	context.beginPath()
	context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
	context.fillStyle = randomColor
	context.fill()

	context.font = '20px Arial'
	context.fillStyle = 'white'
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	context.fillText(name.charAt(0).toUpperCase(), size / 2, size / 2)

	const imageUrl = canvas.toDataURL()
	return imageUrl
}
