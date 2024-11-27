import React from 'react'

interface ButtonProps {
	children: React.ReactNode
	background?: 'transparent' | string
	color?: string
	padding?: string
	borderRadius?: string
	hoverBackground?: string
	type?: 'button' | 'submit' | 'reset'
	lineHeight?: string
	transition?: string
	onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
	children,
	background,
	color,
	padding,
	borderRadius,
	hoverBackground,
	type = 'button',
	lineHeight,
	transition,
	onClick,
}) => {
	return (
		<button
			type={type}
			onClick={onClick}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxSizing: 'border-box',
				border: 'none',
				outline: 'none',
				cursor: 'pointer',
				...(background && { background }),
				...(color && { color }),
				...(padding && { padding }),
				...(borderRadius && { borderRadius }),
				...(lineHeight && { lineHeight }),
				...(transition && { transition }),
			}}
			onMouseEnter={(e) => {
				if (hoverBackground) e.currentTarget.style.background = hoverBackground
			}}
			onMouseLeave={(e) => {
				if (hoverBackground) e.currentTarget.style.background = background!
			}}>
			{children}
		</button>
	)
}

export default Button
