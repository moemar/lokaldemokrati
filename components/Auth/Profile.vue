<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error)
    else navigateTo('/login')
}
</script>

<template>
    <Menu v-if="user" as="div" class="relative ml-3">
        <div>
            <MenuButton class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span class="absolute -inset-1.5" />
                <span class="sr-only">Open user menu</span>
                <UAvatar :alt="user.email" size="sm" />
            </MenuButton>
        </div>
        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
            <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-slot="{ active }">
                <NuxtLink @click="signOut" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 cursor-pointer']">Logg ut</NuxtLink>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>
