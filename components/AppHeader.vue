<template>
    <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
        <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div class="relative flex h-16 items-center justify-between">
                <h2 class="text-white">Lokaldemokratiet | Elverum</h2>
                <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <div class="hidden sm:ml-6 sm:block">
                        <div class="flex space-x-4">
                            <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href" :class="[isCurrentPath(item.href) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'rounded-md px-3 py-2 text-sm font-medium']" :aria-current="isCurrentPath(item.href) ? 'page' : undefined">{{ item.name }}</NuxtLink>
                        </div>
                    </div>
                </div>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <!-- Profile dropdown -->
                    <AuthProfile />
                </div>
            </div>
        </div>

        <DisclosurePanel class="sm:hidden">
            <div class="space-y-1 px-2 pb-3 pt-2">
                <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href" :class="[isCurrentPath(item.href) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium']" :aria-current="isCurrentPath(item.href) ? 'page' : undefined">{{ item.name }}</DisclosureButton>
            </div>
        </DisclosurePanel>
    </Disclosure>
</template>
  
<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

const route = useRoute()

const isCurrentPath = (path: string) => {
    return route.path === path
}

const navigation = ref([
    { name: 'Dashboard', href: '/' },
    { name: 'Kommunestyret', href: '/kommunestyret' },
    { name: 'Saker', href: '/saker' },
    { name: 'Partier', href: '/partier' },
    { name: 'Politikere', href: '/politikere' },
])
</script>