import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { StandardizedData, DBName } from '../../types/app-types';
import { useDBstate } from '@/stores/dbStore';
import useIndexedDB from './useIndexDB';

const { storeInIndexedDB, deleteObjectStore } = useIndexedDB();
const DBstore = useDBstate();

export default function useXLSXProcessing() {
    const file = ref<File | null>(null);
    const startLine = ref<number>(1);
    const columnRoles = ref<string[]>([]);
    const DBname = ref<DBName>(DBName.AZ); // Initialize with a default value
    const componentName = ref<string>('');
    const previewData = ref<any[][]>([]);
    const columns = ref<string[]>([]);
    const showModal = ref<boolean>(false);

    async function parseXLSXForFullProcessing(): Promise<void> {
        if (!file.value) {
            return;
        }
        const fileNameExists = DBstore.checkFileNameAvailable(file.value.name);

        if (!fileNameExists) {
            DBstore.setComponentFileIsUploading(componentName.value);
            try {
                const data = await file.value.arrayBuffer();
                const workbook = XLSX.read(data);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const dataStartIndex = startLine.value - 1;
                const fullData = jsonData.slice(dataStartIndex) as any[][];
                const standardizedData: StandardizedData[] = [];

                fullData.forEach((row: any[]) => {
                    const standardizedRow: StandardizedData = {
                        destName: '',
                        dialCode: 0,
                        rate: 0,
                    };

                    columnRoles.value.forEach((role, index) => {
                        if (role) {
                            switch (role) {
                                case 'destName':
                                    standardizedRow.destName = row[index];
                                    break;
                                case 'dialCode':
                                    standardizedRow.dialCode = parseFloat(row[index]);
                                    break;
                                case 'rate':
                                    standardizedRow.rate = parseFloat(row[index]);
                                    break;
                                default:
                                    standardizedRow[role] = row[index];
                            }
                        }
                    });

                    const isValidDestName = typeof standardizedRow.destName === 'string' && standardizedRow.destName.length > 0;
                    const isValidDialCode = !isNaN(Number(standardizedRow.dialCode));
                    const isValidRate = !isNaN(parseFloat(standardizedRow.rate.toString()));

                    if (isValidDestName && isValidDialCode && isValidRate) {
                        standardizedData.push(standardizedRow);
                    } else {
                        console.error('Issue parsing file');
                    }
                });

                storeDataInIndexedDB(standardizedData);
            } catch (e) {
                console.error('Error during XLSX parsing', e);
            }
        } else {
            console.log('File with this name already exists.');
        }
    }

    function parseXLSXForPreview(uploadedFile: File) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                previewData.value = jsonData.slice(0, 25) as any[][];
                columns.value = jsonData[startLine.value - 1] as string[];
                columnRoles.value = Array(columns.value.length).fill('');
                showModal.value = true;
            };
            reader.readAsArrayBuffer(uploadedFile);
        } catch {
            console.error('error uploading file');
        }
    }

    async function storeDataInIndexedDB(data: StandardizedData[]) {
        console.log('storing with ', DBname.value, componentName.value);
        try {
            if (file.value) {
                await storeInIndexedDB(
                    data,
                    DBname.value,
                    file.value.name,
                    componentName.value
                );
            }
        } catch (error) {
            console.error('Error storing data in IndexedDB:', error);
        }
    }

    async function removeFromDB() {
        let storeName = DBstore.getStoreNameByComponent(componentName.value);
        await deleteObjectStore(DBname.value, storeName);
    }

    return {
        file,
        startLine,
        previewData,
        columns,
        DBname,
        showModal,
        componentName,
        columnRoles,
        parseXLSXForPreview: parseXLSXForPreview,
        parseXLSXForFullProcessing: parseXLSXForFullProcessing,
        removeFromDB
    };
}