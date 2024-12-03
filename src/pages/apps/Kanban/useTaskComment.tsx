import { taskCommentsApi } from '@/common'
import { TaskComment } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const useTaskComment = (taskId: string) => {
	const [loading, setLoading] = useState(true)
	const [taskComments, setTaskComments] = useState([])

	const getTaskComments = async (taskId: string) => {
		setLoading(true)
		try {
			const taskCommentsData = await taskCommentsApi.getAllTaskComments(taskId)
			setTaskComments(taskCommentsData)
		} catch (err) {
			console.error('Failed to get task comments:', err)
		} finally {
			setLoading(false)
		}
	}

	const createTaskComment = async (data: TaskComment): Promise<void> => {
		setLoading(true)
		try {
			const response = await taskCommentsApi.createTaskComment(taskId, data)
			await getTaskComments(taskId)
		} catch (err) {
			console.error('Failed to create task comment', err)
			toast.error('Failed to create task comment')
		} finally {
			setLoading(false)
		}
	}

	const deleteTaskCommentById = async (commentId: string) => {
		setLoading(true)
		try {
			await taskCommentsApi.deleteTaskCommentByID(commentId)
			await getTaskComments(taskId)
		} catch (err) {
			console.error('Failed to delete task:', err)
			toast.error('Failed to delete task')
		} finally {
			setLoading(false)
		}
	}

	const updateTaskCommentById = async (commentId: any, data: any) => {
		setLoading(true)
		try {
			await taskCommentsApi.updateTaskCommentByID(commentId, data)
			await getTaskComments(taskId)
		} catch (err) {
			console.error('Failed to add description:', err)
			toast.error('Failed to add description')
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		getTaskComments(taskId)
	}, [taskId])

	return {
		loading,
		createTaskComment,
		getTaskComments,
		taskComments,
		deleteTaskCommentById,
		updateTaskCommentById,
	}
}

export default useTaskComment
