import { ref, Ref, watch } from 'vue';
import * as XLSX from 'xlsx';
import { DBName, AZColumnRole, USColumnRole } from '../../types/app-types';
import { useDBstate } from '@/stores/dbStore';

const DBstore = useDBstate();

export default function useXLSXProcessing(initialDBName: DBName) {
    const DBname: Ref<DBName> = ref(initialDBName);
    const file: Ref<File | null> = ref(null);
    const startLine: Ref<number> = ref(1);
    const columnRoles: Ref<(AZColumnRole | USColumnRole)[]> = ref([]);
    const componentName: Ref<string> = ref('');
    const previewData: Ref<string[][]> = ref([]);
    const columns: Ref<string[]> = ref([]);
    const showModal: Ref<boolean> = ref(false);

    const parseXLSXForPreview = async (file: File) => {
        console.log('Parsing XLSX file:', file.name);
        
        try {
            // Your existing XLSX parsing logic here
            // ...

            console.log('Parsed XLSX data:', previewData.value);
            console.log('Parsed XLSX columns:', columns.value);
        } catch (error) {
            console.error('Error parsing XLSX file:', error);
        }
    }

    watch(showModal, (newValue) => {
        console.log('showModal changed in useXlsxFiles:', newValue);
    });

    async function parseXLSXForFullProcessing(): Promise<void> {
        if (!file.value) {
            console.error('No file to process');
            return;
        }

        const arrayBuffer = await file.value.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Process the data based on columnRoles and startLine
        const processedData = jsonData.slice(startLine.value - 1).map(row => {
            return columnRoles.value.map(role => {
                const index = columns.value.indexOf(role);
                return index !== -1 ? row[index] : '';
            });
        });

        // Here you would typically save the processed data or emit an event with the data
        console.log('Processed XLSX data:', processedData);

        // Reset the state
        showModal.value = false;
        file.value = null;
        previewData.value = [];
        columns.value = [];
        columnRoles.value = [];
        startLine.value = 1;
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