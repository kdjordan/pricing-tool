<template>
	<div
		class="bg-background rounded-lg py-6 px-20 flex flex-col items-center justify-center"
		id="us-file-uploads"
	>
		<div class="mb-4 text-center">
			<h1
				class="text-5xl font-bold text-foreground uppercase inline-block mb-4"
			>
				{{ !dbStore.getIsUSfull ? 'US PRICING' : 'FILES UPLOADED' }}
			</h1>
			<p
				v-if="!dbStore.getIsUSfull"
				class="text-muted-foreground mb-4"
			>
				Upload
				<span class="font-bold uppercase text-accent">your</span>
				current rates and the rates of your
				<span class="font-bold uppercase text-accent"
					>prospective carrier.</span
				>
				<br />
				We will generate you a report showing the best opportunities
				for you to buy and sell.
			</p>
		</div>
		<div class="flex flex-col bg-muted rounded-xl p-8 w-full">
			<div class="flex justify-center space-x-6 flex-grow h-full">
        <UploadComponent
					typeOfComponent="owner"
					:DBname="DBName.US"
					:componentName="component1"
					:disabled="dbStore.isComponentDisabled('us1')"
					:columnRoleOptions="columnRoleOptions"
					class="flex-1 flex flex-col"
          @fileUploaded="handleFileUploaded"
				/>
				<UploadComponent
					typeOfComponent="client"
					:DBname="DBName.US"
					:componentName="component2"
					:disabled="dbStore.isComponentDisabled('us2')"
					:columnRoleOptions="columnRoleOptions"
					class="flex-1 flex flex-col"
          @fileUploaded="handleFileUploaded"
				/>
			</div>
			</div>
			<div class="mt-6 flex justify-center items-center gborder">
				<button
					v-if="!dbStore.getUsReportsGenerated"
					@click="handleReportsAction"
					:disabled="!dbStore.getIsUSfull || isGeneratingReports"
					:class="{
						'bg-blue-500 hover:bg-blue-600 text-white':
							dbStore.getIsUSfull && !isGeneratingReports,
						'bg-gray-500 text-gray-300 cursor-not-allowed':
							!dbStore.getIsUSfull || isGeneratingReports,
						pulse: isGeneratingReports,
					}"
					class="btn font-bold py-2 p-4 rounded-lg shadow-md"
				>
					<span v-if="isGeneratingReports">GENERATING REPORTS</span>
					<span v-else>Get Reports</span>
				</button>
			</div>
			<!-- Debug info -->
			<div class="mt-4 text-sm text-gray-500">
				Reports generated: {{ dbStore }}
			</div>
		</div>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue';
	import {
		USColumnRole,
		type USStandardizedData,
	} from '../../../types/us-types';
	import { DBName } from '../../../types/app-types';
	import UploadComponent from '../UploadComponent.vue';
	import useIndexedDB from '../../composables/useIndexDB';
	import { makeUsReportsApi } from '@/API/api';
	import { useDBstate } from '@/stores/usDBstore';

	const dbStore = useDBstate();
	const { loadFromIndexedDB } = useIndexedDB();

	const theDb = ref<DBName>(DBName.US);
	const component1 = ref<string>('us1');
	const component2 = ref<string>('us2');
	const isGeneratingReports = ref<boolean>(false);

  const columnRoleOptions =  [
		{ value: 'NPANXX', label: 'NPANXX' },
		{ value: 'NPA', label: 'NPA' },
		{ value: 'NXX', label: 'NXX' },
		{ value: 'inter', label: 'InterState Rate' },
		{ value: 'intra', label: 'IntraState Rate' },
		{ value: 'indeterm', label: 'Indeterminate Rate' },
	];

	const uploadedFiles = ref<Record<string, string>>({});

	watch(
		() => [dbStore.getUsPricingReport, dbStore.getUsCodeReport],
		([newPricing, newCode]) => {
			dbStore.setUsReportsGenerated(!!newPricing && !!newCode);
		},
		{ immediate: true }
	);

	async function handleFileUploaded(
		componentName: string,
		fileName: string
	) {
		uploadedFiles.value[componentName] = fileName;
		console.log(`File uploaded for ${componentName}: ${fileName}`);
	}

	async function handleReportsAction() {
		if (dbStore.getUsReportsGenerated) {
			dbStore.setShowUsUploadComponents(false);
		} else {
			await generateReports();
		}
	}

	
	async function generateReports() {
		isGeneratingReports.value = true;
		console.log('generateReports called');
		try {
			const fileName1 = dbStore
				.getStoreNameByComponent(component1.value)
				.split('.')[0];
			const fileName2 = dbStore
				.getStoreNameByComponent(component2.value)
				.split('.')[0];

			const file1Data = await getFilesFromIndexDB(
				theDb.value,
				dbStore.getStoreNameByComponent(component1.value),
				dbStore.globalDBVersion
			);
			const file2Data = await getFilesFromIndexDB(
				theDb.value,
				dbStore.getStoreNameByComponent(component2.value),
				dbStore.globalDBVersion
			);

			if (fileName1 && fileName2 && file1Data && file2Data) {
				console.log('generateReports: got file data');
				const {
					pricingReport: pricingReportData,
					codeReport: codeReportData,
				} = await makeUsReportsApi({
					fileName1,
					fileName2,
					file1Data: file1Data as USStandardizedData[],
					file2Data: file2Data as USStandardizedData[],
				});

				if (pricingReportData && codeReportData) {
					console.log('generateReports: got reports data', {
						pricingReportData,
						codeReportData,
					});
					dbStore.setUsPricingReport(pricingReportData);
					dbStore.setUsCodeReport(codeReportData);
					dbStore.setUsReportsGenerated(true);
					dbStore.setShowUsUploadComponents(false);
					console.log(
						'Reports set in store, showUsUploadComponents:',
						dbStore.showUsUploadComponents
					);
				} else {
					console.error('Error: Reports data is null or undefined');
				}
			} else {
				console.error('Error getting files from DB for reports');
			}
		} catch (error) {
			console.error('Error generating reports:', error);
		} finally {
			isGeneratingReports.value = false;
		}
	}

	async function getFilesFromIndexDB(
		dbName: DBName,
		store: string,
		dbVersion: number
	) {
		try {
			const result = await loadFromIndexedDB(
				dbName,
				store,
				dbVersion
			);
			return result;
		} catch (e) {
			isGeneratingReports.value = false;
			console.error(`got an error getting ${store} out of DB`);
		}
	}
</script>

