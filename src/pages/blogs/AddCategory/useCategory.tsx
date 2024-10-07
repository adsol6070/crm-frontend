import { categoryApi, useAuthContext } from '@/common';
import { PageSize } from '@/components'
import { BlogCategory } from '@/types'
import { capitalizeFirstLetter } from '@/utils';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { RiDeleteBinLine, RiEdit2Line, RiSaveLine } from 'react-icons/ri';
import { Column } from 'react-table'
import { toast } from 'react-toastify';

export function useCategory() {
    const [loading, setLoading] = useState(false)
    const { user } = useAuthContext()
    const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
    const [editCategoryValue, setEditCategoryValue] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])

    const columns: ReadonlyArray<Column<any>> = useMemo(() => [
        {
            Header: 'S.No',
            accessor: 'sno',
            defaultCanSort: true,
        },
        {
            Header: 'ID',
            accessor: 'id',
            defaultCanSort: true,
        },
        {
            Header: 'Category',
            accessor: 'category',
            defaultCanSort: true,
            Cell: ({ cell }: any) => {
                return editCategoryId === cell.row.original.id ? (
                    <input
                        type='text'
                        value={capitalizeFirstLetter(editCategoryValue)}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        autoFocus
                    />
                ) : (
                    capitalizeFirstLetter(cell.value)
                );
            },
        },
        {
            Header: 'Delete',
            accessor: 'delete',
            disableSortBy: true,
            Cell: ({ cell }: any) => (
                <RiDeleteBinLine
                    size={24}
                    color="#dc3545"
                    cursor="pointer"
                    onClick={() => handleDelete(cell.row.original.id)}
                />
            ),
        },
        {
            Header: 'Edit',
            accessor: 'Edit',
            disableSortBy: true,
            Cell: ({ cell }: any) => {
                return editCategoryId === cell.row.original.id ? (
                    <RiSaveLine
                        size={24}
                        color="#28a745"
                        cursor="pointer"
                        onClick={() => handleSave(cell.row.original.id)}
                    />
                ) : (
                    <RiEdit2Line
                        size={24}
                        color="#007bff"
                        cursor="pointer"
                        onClick={() => handleEdit(cell.row.original.id, cell.row.original.category)}
                    />
                );
            },
        },
    ], [editCategoryId, editCategoryValue])

    const handleDelete = async (categoryID: string) => {
        await categoryApi.deleteCategory(categoryID)
        const response = await categoryApi.getAllCategory();
        setBlogCategories(response.map((category: any, index: any) => ({ ...category, sno: index + 1 })));
        toast.success("Category Deleted successfully!");
    }

    const handleEdit = (categoryID: string, currentCategory: string) => {
        setEditCategoryId(categoryID);
        setEditCategoryValue(currentCategory);
    };

    const handleDeleteSelected = async (selectedCategoryIds: any[]) => {
        try {
            setLoading(true);
            await categoryApi.deleteSelectedBlogCategories({ categoryIds: selectedCategoryIds });

            const updatedVisaCategories = blogCategories.filter(
                (category) => !selectedCategoryIds.includes(category.id)
            );

            const updatedCategoriesWithSno = updatedVisaCategories.map((category, index) => ({
                ...category,
                sno: index + 1
            }));

            setBlogCategories(updatedCategoriesWithSno);
            toast.success('Categories deleted successfully.')
        } catch (error) {
            toast.error('Failed to delete categories.')
            console.error(error)
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (categoryID: string) => {
        if (!editCategoryValue.trim()) {
            toast.error("Please enter a category name.");
            return;
        }
        try {
            setLoading(true);
            const updatedCategory = { category: editCategoryValue };
            await categoryApi.updateCategory(categoryID, updatedCategory);
            const updatedBlogCategories = blogCategories.map((category) =>
                category.id === categoryID ? { ...category, category: editCategoryValue } : category
            );
            setBlogCategories(updatedBlogCategories);
            setEditCategoryId(null);
            toast.success("Category updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update category.");
        } finally {
            setLoading(false);
        }
    };

    const sizePerPageList: PageSize[] = [
        {
            text: '5',
            value: 5,
        },
        {
            text: '10',
            value: 10,
        },
        {
            text: '25',
            value: 25,
        },
        {
            text: 'All',
            value: blogCategories.length,
        },
    ]

    useEffect(() => {
        const getCategories = async () => {
            setLoading(true)
            try {
                const response = await categoryApi.getAllCategory();
                setBlogCategories(response.map((category: any, index: any) => ({ ...category, sno: index + 1 })))
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false)
            }
        }

        getCategories()
    }, [])

    const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCategory(event.target.value);
    }

    const createCategory = async ({
        category,
    }: {
        category: string
    }) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('tenantID', user.tenantID)
            formData.append('category', category)

            const data = await categoryApi.createBlogCategory(formData);

            const newCategory = { ...data.blogCategory, sno: blogCategories.length + 1 };
            setBlogCategories(blogCategories => [...blogCategories, newCategory]);
            toast.success(data.message);
            setLoading(false)
        } catch (error: any) {
            if (error.includes("duplicate key value violates unique constraint")) {
                toast.error("Category already exists");
            }
            else {
                toast.error("Failed to create category.");
                console.error('Error creating category:', error);
            }
        } finally {
            setLoading(false)
        }
    }

    return {
        blogCategories,
        columns,
        loading,
        category,
        createCategory,
        handleCategoryChange,
        sizePerPageList,
        handleDeleteSelected
    }
}
