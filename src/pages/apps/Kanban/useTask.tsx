import { taskApi } from "@/common";
import { Task } from "@/types";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify'

const useTask = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const getTasks = async () => {
	setLoading(true);
	try {
	  const tasksData = await taskApi.getAllTaks();
	  setTasks(tasksData);
	} catch (err) {
	  console.error('Failed to get tasks:', err);
	  toast.error('Failed to get tasks');
	} finally {
	  setLoading(false);
	}
  };

  const createTask = async (data: Task) => {
	setLoading(true);
	try {
	  const response = await taskApi.createTask(data);
	  toast.success(response.message)
	} catch (err) {
	  console.error('Failed to get tasks:', err);
	  toast.error('Failed to get tasks');
	} finally {
	  setLoading(false);
	}
  };

  const deleteTaskById = async (id: string) => {
	setLoading(true);
	try {
	  await taskApi.deleteTaskByID(id);
	} catch (err) {
	  console.error('Failed to delete task:', err);
	  toast.error('Failed to delete task');
	} finally {
	  setLoading(false);
	}
  };


  useEffect(() => {
    getTasks();
  }, []);

  return { loading, createTask, getTasks, tasks, deleteTaskById };
};

export default useTask;
