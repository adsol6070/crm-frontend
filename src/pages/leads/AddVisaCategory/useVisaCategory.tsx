import { useAuthContext } from '@/common';
import visaCategory from '@/common/api/visaCategory';
import { PageSize } from '@/components';
import { VisaCategory } from '@/types';
import { capitalizeFirstLetter } from '@/utils';
import { ChangeEvent, useEffect, useState } from 'react';
import { RiDeleteBinLine, RiEdit2Line, RiSaveLine } from 'react-icons/ri';
import { Column } from 'react-table';
import { toast } from 'react-toastify';

export function useVisaCategory() {
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const { user } = useAuthContext();
    const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
    const [editCategoryValue, setEditCategoryValue] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [visaCategories, setVisaCategories] = useState<VisaCategory[]>([]);

    const columns: ReadonlyArray<Column> = [
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
                        value={editCategoryValue}
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
    ];

    const handleDelete = async (categoryID: string) => {
        try {
            setLoading(true);
            await visaCategory.deleteCategory(categoryID);
            const updatedVisaCategory = visaCategories.filter((category) => category.id !== categoryID);
            const updatedCategoriesWithSno = updatedVisaCategory.map((category, index) => ({
                ...category,
                sno: index + 1
            }));
            setVisaCategories(updatedCategoriesWithSno);
            toast.success("Category Deleted successfully!");
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error("Failed to delete category.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (categoryID: string, currentCategory: string) => {
        setEditCategoryId(categoryID);
        setEditCategoryValue(currentCategory);
    };

    const handleSave = async (categoryID: string) => {
        if (!editCategoryValue.trim()) {
            toast.error("Please enter a category name.");
            return;
        }
        try {
            setLoading(true);
            const updatedCategory = { category: editCategoryValue };
            await visaCategory.updateCategory(categoryID, updatedCategory);
            const updatedVisaCategories = visaCategories.map((category) =>
                category.id === categoryID ? { ...category, category: editCategoryValue } : category
            );
            setVisaCategories(updatedVisaCategories);
            setEditCategoryId(null);
            toast.success("Category updated successfully!");
        } catch (error) {
            console.error('Error updating category:', error);
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
            value: visaCategories.length,
        },
    ];

    useEffect(() => {
        const getCategories = async () => {
            setDataLoading(true);
            try {
                const response = await visaCategory.getAllCategory();
                setVisaCategories(response.map((category: any, index: any) => ({ ...category, sno: index + 1 })));
            } catch (error) {
                console.error('Error fetching categories:', error);
                // toast.error("Failed to load visa categories");
            } finally {
                setDataLoading(false);
            }
        };

        getCategories();
    }, []);

    const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCategory(event.target.value);
    };

    const createCategory = async ({
        category,
    }: {
        category: string
    }) => {
        if (category.trim() === '') {
            toast.error("Please enter a valid category name.");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('tenantID', user.tenantID);
            formData.append('category', category.trim());

            const data = await visaCategory.createVisaCategory(formData);

            const newCategory = { ...data.visaCategory, sno: visaCategories.length + 1 };
            setVisaCategories(visaCategories => [...visaCategories, newCategory]);
            toast.success(data.message);
            setCategory('');
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error("Failed to create category.");
        } finally {
            setLoading(false);
        }
    };

    return {
        visaCategories,
        columns,
        loading,
        dataLoading,
        category,
        createCategory,
        handleCategoryChange,
        sizePerPageList,
    };
}
