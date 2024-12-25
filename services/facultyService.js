import facultiesData from '../data/faculties.json';

export const fetchFaculties = async () => {
    try {
        return facultiesData;
    } catch (error) {
        console.error('Fakülte bilgileri yüklenirken hata oluştu:', error);
        return null;
    }
}; 