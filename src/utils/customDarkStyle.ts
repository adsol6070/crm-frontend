import { color } from "html2canvas/dist/types/css/types/color";

export const customStyles = (isDarkMode: any) => ({
    control: (provided: any) => ({
        ...provided,
        backgroundColor: isDarkMode ? '#313a46' : '#fff',
        color: isDarkMode ? '#aab8c5' : '#000',
        borderColor: isDarkMode ? '#464f5b' : '#ccc',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: isDarkMode ? '#aab8c5' : '#000',
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: isDarkMode ? '#313a46' : '#fff',
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isSelected ? (isDarkMode ? '#555' : '#ddd') : isDarkMode ? '#313a46' : '#fff',
        color: isDarkMode ? '#aab8c5' : '#000',
        '&:hover': {
            backgroundColor: isDarkMode ? '#555' : '#ddd',
        },
    }),
    input: (provided: any) => ({
        ...provided,
        color: isDarkMode ? '#aab8c5' : '#000',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: isDarkMode ? '#aab8c5' : '#a3a3a3',
    }),
    dropdownIndicator: (provided: any) => ({
        ...provided,
        color: isDarkMode ? '#aab8c5' : '#a3a3a3',
    }),
    indicatorSeparator: (provided: any) => ({
        ...provided,
        backgroundColor: isDarkMode ? '#555' : '#ccc',
    }),
});

export const editorStyle = (isDarkMode: any) =>({
    minHeight: '250px',
    border: isDarkMode ? '1px solid #444' : '1px solid #dee2e6',
    padding: '10px 20px',
    backgroundColor: isDarkMode ? '#313a46' : '#fff',
    color: isDarkMode ? '#aab8c5' : '#000',
});

export const toolbarStyle = (isDarkMode: any) =>( {
    backgroundColor: isDarkMode ? '#313a46' : '#fff',
    border: isDarkMode ? '1px solid #444' : '1px solid #dee2e6',
});

export const chartStyle = (isDarkMode: any) =>( {
    padding: isDarkMode ? '10px' : '10px',
    backgroundColor: isDarkMode ? '#313a46' : '#fff',
    color:  isDarkMode ? '#313a46' : '#fff'
});

export const historyStyle = (isDarkMode: any) =>( {
    backgroundColor: isDarkMode ? '#374352' : '#f8f9fa',
    color:  isDarkMode ? '#fff' : '#798389'
});

export const actionStyle = (isDarkMode: any) =>( {
    backgroundColor: isDarkMode ? '#313a46' : '#fff',
    color:  isDarkMode ? '#aab8c5' : '#000',
    border: isDarkMode ? "none": "none"
});

export const notesStyle = (isDarkMode: any) =>( {
    backgroundColor: isDarkMode ? '#313a46' : '#fff',
    color:  isDarkMode ? '#aab8c5' : '#000',
    border: isDarkMode ? "none": "1px solid #ddd"
});


export const textStyle = (isDarkMode: any) =>( {
    color:  isDarkMode ? '#fff' : '#000',
});