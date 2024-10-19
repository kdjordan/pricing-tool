<template>
	<div
		id="az-pricing"
		class="flex flex-col items-center pt-8 h-full w-full"
	>
		<div
			v-if="dbStore.getUsReportsGenerated"
			class="flex justify-center mb-4"
		>
			<button
				@click="dbStore.setActiveReportUS('files')"
				:class="[
					'px-4 py-2 mx-2 rounded-lg transition-colors duration-200',
					dbStore.getActiveReportUS === 'files'
						? 'bg-blue-500 text-white'
						: 'bg-gray-500 text-gray-300 hover:bg-gray-600',
				]"
			>
				Files
			</button>
			<button
				@click="dbStore.setActiveReportUS('code')"
				:class="[
					'px-4 py-2 mx-2 rounded-lg transition-colors duration-200',
					dbStore.getActiveReportUS === 'code'
						? 'bg-blue-500 text-white'
						: 'bg-gray-500 text-gray-300 hover:bg-gray-600',
				]"
			>
				Code Report
			</button>
			<button
				@click="dbStore.setActiveReportUS('pricing')"
				:class="[
					'px-4 py-2 mx-2 rounded-lg transition-colors duration-200',
					dbStore.getActiveReportUS === 'pricing'
						? 'bg-blue-500 text-white'
						: 'bg-gray-500 text-gray-300 hover:bg-gray-600',
				]"
			>
				Pricing Report
			</button>
			<button
				@click="handleReset"
				class="px-4 py-2 mx-2 rounded-lg transition-colors duration-200 bg-red-500 text-white hover:bg-red-600"
			>
				Reset
			</button>
		</div>
		<div>
			<USFileUploads v-if="dbStore.getActiveReportUS === 'files'" />
			<CodeReportUS
				v-if="dbStore.getActiveReportUS === 'code'"
				:report="dbStore.getUsCodeReport"
			/>
			<PricingReportUS
				v-if="dbStore.getActiveReportUS === 'pricing'"
				:report="dbStore.getUsPricingReport"
			/>
			<div
				v-if="
					!dbStore.getUsCodeReport == null &&
					!dbStore.getUsPricingReport
				"
			>
				No reports available.
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import USFileUploads from '../components/US/USFileUploads.vue';
	import CodeReportUS from '../components/US/USCodeReport.vue';
	import PricingReportUS from '../components/US/USPricingReport.vue';
	import { resetReportApi } from '@/API/api';
	import { useDBstate } from '@/stores/usDBstore';

	const dbStore = useDBstate();

	async function handleReset() {
		console.log('Resetting the US report');
		dbStore.setActiveReportUS('files');
		await resetReportApi('us');
	}
</script>
