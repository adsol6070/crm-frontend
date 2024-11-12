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
			toast.error('Failed to get tasks')
		} finally {
			setLoading(false)
		}
	}

	const createTask = async (data: Task) => {
		setLoading(true)
		try {
			const response = await taskApi.createTask(boardId, data)
			await getTasks(boardId)
			toast.success(response.message)
		} catch (err) {
			console.error('Failed to get tasks:', err)
			toast.error('Failed to get tasks')
		} finally {
			setLoading(false)
		}
	}

	const deleteTaskById = async (id: string) => {
		setLoading(true)
		try {
			console.log("Delete ID:", id);
			await taskApi.deleteTaskByID(id)
			// await getTasks(boardId)
		} catch (err) {
			console.error('Failed to delete task:', err)
			toast.error('Failed to delete task')
		} finally {
			setLoading(false)
		}
	}

	const deleteAllTasks = async () => {
		setLoading(true)
		try {
			await taskApi.deleteTasks()
			await getTasks(boardId)
		} catch (err) {
			console.error('Failed to delete tasks:', err)
			toast.error('Failed to delete tasks')
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

	useEffect(() => {
		getTasks(boardId)
	}, [])

	return {
		loading,
		createTask,
		getTasks,
		tasks,
		deleteTaskById,
		updateTaskStatus,
		deleteAllTasks,
	}
}

export default useTask
