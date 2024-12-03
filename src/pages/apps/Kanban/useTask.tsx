import { taskApi } from '@/common'
import { Task } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const useTask = (boardId: string) => {
	const [loading, setLoading] = useState(true)
	const [tasks, setTasks] = useState([])

	const getTasks = async (boardId: string) => {
		setLoading(true)
		try {
			const tasksData = await taskApi.getAllTaks(boardId)
			setTasks(tasksData)
		} catch (err) {
			console.error('Failed to get tasks:', err)
			// toast.error('Failed to get tasks')
		} finally {
			setLoading(false)
		}
	}

	const createTask = async (data: Task): Promise<void> => {
		setLoading(true)
		try {
			await taskApi.createTask(boardId, data)
			await getTasks(boardId)
		} catch (err) {
			console.error('Failed to get tasks:', err)
			toast.error('Failed to get tasks')
		} finally {
			setLoading(false)
		}
	}

	const createTaskColumn = async (data: any) => {
		setLoading(true)
		try {
			await taskApi.createTaskColumn(boardId, data)
		} catch (error) {
			console.error('Failed to create task column:', error)
			toast.error('Failed to create column')
		} finally {
			setLoading(false)
		}
	}

	const getTaskColumns = async () => {
		setLoading(true)
		try {
			const response = await taskApi.getTaskColumn(boardId)
			return response[0]?.taskStatus ? response[0].taskStatus : []
		} catch (error) {
			console.error('Failed to get task columns:', error)
			toast.error('Failed to get task columns')
		} finally {
			setLoading(false)
		}
	}

	const deleteTaskById = async (id: string) => {
		setLoading(true)
		try {
			console.log('Delete ID:', id)
			await taskApi.deleteTaskByID(id)
			await getTasks(boardId)
		} catch (err) {
			console.error('Failed to delete task:', err)
			toast.error('Failed to delete task')
		} finally {
			setLoading(false)
		}
	}

	const updateTaskStatus = async (taskId: string, data: any) => {
		try {
			await taskApi.updateTaskByID(taskId, data)
			await getTasks(boardId)
		} catch (error) {
			console.error('Error updating task status:', error)
		}
	}

	const updateTaskOrder = async (updatedTasks: any[]) => {
		setLoading(true)
		try {
			await taskApi.updateTaskOrder(
				{
					orderedTasks: updatedTasks,
				},
				boardId
			)
			await getTasks(boardId)
			// toast.success(response.message || 'Board order updated successfully')
		} catch (err) {
			console.error('Failed to update board order:', err)
			toast.error('Failed to update board order')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getTasks(boardId)
	}, [])

	const updateTaskById = async (taskId: any, data: any) => {
		setLoading(true)
		try {
			await taskApi.updateTaskByID(taskId, data)
			await getTasks(boardId)
		} catch (err) {
			console.error('Failed to add description:', err)
			toast.error('Failed to add description')
		} finally {
			setLoading(false)
		}
	}

	return {
		loading,
		createTask,
		createTaskColumn,
		getTaskColumns,
		getTasks,
		tasks,
		deleteTaskById,
		updateTaskStatus,
		updateTaskOrder,
		updateTaskById,
	}
}

export default useTask