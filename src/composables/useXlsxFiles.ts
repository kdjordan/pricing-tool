import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { DBName, AZColumnRole, USColumnRole } from '../../types/app-types';
import { useDBstate } from '@/stores/dbStore';

const DBstore = useDBstate();

export default function useXLSXProcessing(initialDBName: DBName) {
    const DBname = ref<DBName>(initialDBName);
    const file = ref<File | null>(null);
    const startLine = ref<number>(1);
    const columnRoles = ref<(AZColumnRole | USColumnRole)[]>([]);
    const componentName = ref<string>('');
    const previewData = ref<string[][]>([]);
    const columns = ref<string[]>([]);
    const showModal = ref<boolean>(false);

    function parseXLSXForPreview(uploadedFile: File) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

            previewData.value = jsonData.slice(0, 25);
            columns.value = jsonData[startLine.value - 1] as string[];
            columnRoles.value = Array(columns.value.length).fill('');
            showModal.value = true;
        };
        reader.readAsArrayBuffer(uploadedFile);
    }

    async function parseXLSXForFullProcessing(): Promise<void> {
        if (!file.value) return;

        const fileNameExists = DBstore.checkFileNameAvailable(file.value.name);
        if (fileNameExists) {
            console.log('File with this name already exists.');
            return;
        }

        DBstore.setComponentFileIsUploading(componentName.value);
        try {
            const data = await file.value.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

            const dataStartIndex = startLine.value - 1;
            const fullData = jsonData.slice(dataStartIndex);
            
            // Process the data similar to how you do with CSV
            // This part will depend on your specific requirements
            // const standardizedData = processXLSXData(fullData);
            // await storeDataInIndexedDB(standardizedData);
        } catch (error) {
            console.error('Error during XLSX parsing', error);
        }
    }

    // You'll need to implement these functions based on your specific requirements
    // function processXLSXData(data: string[][]): StandardizedData[] {
    //     // Process the XLSX data similar to how you process CSV data
    // }

    // async function storeDataInIndexedDB(data: StandardizedData[]) {
    //     // Store the processed data in IndexedDB
    // }

    return {
        file,
        startLine,
        columnRoles,
        previewData,
        columns,
        DBname,
        showModal,
        componentName,
        parseXLSXForPreview,
        parseXLSXForFullProcessing,
        // Add other functions as needed
    };
}