<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Kommunestyremøter</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle møter i kommunestyret.</p>
        </div>
    </div>
    <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div class="flex flex-row-reverse mb-2">
                    <div class="ml-2">
                        <CouncilMeetingNew v-if="councilList?.selectedCouncil" :council="councilList?.selectedCouncil" button-label="Nytt møte" title="Nytt kommunstyremøte" />
                        <CouncilMeetingImport v-if="councilList?.selectedCouncil" :council="councilList?.selectedCouncil" button-label="Import" button-color="blue" title="Importer kommunestyremøter fra Acos" class="ml-2" />
                    </div>
                    <div class="basis-1/4">
                        <CouncilList ref="councilList" />
                    </div>
                </div>
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-[500px]">
                    <CouncilMeetingList :council="councilList?.selectedCouncil?.id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const councilList = ref(undefined)
</script>