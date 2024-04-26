import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { blogApi } from '@/common/api';
import { useAuthContext } from '@/common/context';

interface FormData {
    tenantID: string;
    title: string;
    content: string;
    category: string;
    selectedImage: File;
}
type FileType = /*unresolved*/ any
export default function useBlogForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const { user } = useAuthContext();

    const createBlog = useCallback(async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await blogApi.createPost(formData);
            // Reset form state
            setTitle('');
            setContent('');
            setSelectedCategory('');
            setSelectedImage(null);
            alert("Blog Created Successfully");
            // Optionally, navigate to another page if necessary
        } catch (error) {
            console.error('Error creating new blog:', error);
            setError('Failed to create new blog. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("image: ", selectedImage)

        if (!user) {
            setError('User must be authenticated.');
            return;
        }
        const formData = new FormData();
        formData.append('tenantID', user.tenantID);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', selectedCategory);
        if (selectedImage) {
            formData.append('blogImage', selectedImage, selectedImage.name);
        }
        await createBlog(formData);
    };

    return {
        loading,
        error,
        title,
        content,
        selectedCategory,
        categories,
        selectedImage,
        setSelectedImage,
        handleTitleChange: (e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value),
        handleContentChange: (value: string) => setContent(value),
        handleCategorySelect: (category: string) => setSelectedCategory(category),
        handleSelectedImage: (files: FileType[]) => {
            // Ensure files array is not empty
            if (files.length > 0) {
                console.log(files[0]);
                setSelectedImage(files[0]);
            }
        },
        handleSubmit
    };
}
