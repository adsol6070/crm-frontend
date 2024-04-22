import useLocalStorage from '@/hooks/useLocalStorage'
import { ChangeEvent, MouseEvent, useCallback, useState } from 'react'

interface Blog {
	title: string
	content: string
	category: string
}

interface BlogFormState {
	title: string
	content: string
	selectedCategory: string
	categories: string[]
	blogs: Blog[]
}

export const useBlogForm = (): BlogFormState & {
	handleTitleChange: (e: ChangeEvent<HTMLInputElement>) => void
	handleContentChange: (value: string) => void
	handleCategorySelect: (category: string) => void
	handleSubmit: (e: MouseEvent<HTMLFormElement>) => void
	setBlogs: (blogs: Blog[]) => void
	setCategories: (categories: string[]) => void
} => {
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [categories, setCategories] = useLocalStorage<string[]>(
		'categories',
		[]
	)
	const [blogs, setBlogs] = useLocalStorage<Blog[]>('blogs', [])

	const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value)
	}, [])

	const handleContentChange = useCallback((value: string) => {
		setContent(value)
	}, [])

	const handleCategorySelect = useCallback((category: string) => {
		setSelectedCategory(category)
	}, [])

	const handleSubmit = useCallback(
		(e: MouseEvent<HTMLFormElement>) => {
			e.preventDefault()
			const newBlog = { title, content, category: selectedCategory }
			setBlogs([...blogs, newBlog])
			setTitle('')
			setContent('')
			setSelectedCategory('')
		},
		[title, content, selectedCategory, blogs, setBlogs]
	)

	return {
		title,
		content,
		selectedCategory,
		categories,
		blogs,
		handleTitleChange,
		handleContentChange,
		handleCategorySelect,
		handleSubmit,
		setBlogs,
		setCategories,
	}
}
