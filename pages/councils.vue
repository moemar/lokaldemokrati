<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Kommunestyret</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle medlemmer i kommunestyret, med partitilhørighet.</p>
        </div>
    </div>
    <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <CouncilNew />
                <div class="flex flex-row-reverse mb-2">
                    <div class="ml-2">
                        <CouncilMemberNew v-if="councilList?.selectedCouncil" :council="councilList?.selectedCouncil" />
                    </div>
                    <div>
                        <CouncilEdit v-if="councilList?.selectedCouncil" class="ml-2" :council="councilList?.selectedCouncil" />
                    </div>
                    <div class="basis-1/4">
                        <CouncilList ref="councilList" />
                    </div>
                </div>
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-[500px]">
                    <CouncilMemberList :council="councilList?.selectedCouncil?.id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const councilList = ref(undefined)
</script>