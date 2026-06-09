<template>
    <div class="space-y-4 animate-in fade-in duration-500">
        
        <!-- Header Section (Skromni) -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded border border-slate-200">
            <div>
                <h1 class="text-lg font-bold text-slate-800">Foydalanuvchilar boshqaruvi</h1>
                <p class="text-slate-500 text-[12px] mt-0.5">Tizimga kirish huquqiga ega barcha foydalanuvchilar (Jami: {{ users.length }})</p>
            </div>
            
            <button @click="openCreateModal" 
                class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded text-[13px] font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95">
                <span class="material-icons text-lg">person_add</span>
                <span>Yangi foydalanuvchi</span>
            </button>
        </div>

        <!-- Search & Filter Section -->
        <div class="bg-white p-4 rounded border border-slate-200">
            <div class="relative w-full max-w-md">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input v-model="search" type="text" placeholder="Qidirish (Ism, email, telefon)..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-[13px] focus:outline-none focus:border-blue-500 transition-all font-medium" />
            </div>
        </div>

        <!-- Users List Header (Removed duplicate) -->

        <!-- Users List Content -->
        <div class="space-y-2">
            <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                <span class="text-[11px] font-medium uppercase tracking-wider">Yuklanmoqda...</span>
            </div>

            <!-- List Header (Compact) -->
            <div v-else class="grid grid-cols-7 px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight border-b border-slate-200">
                <div class="col-span-2">Foydalanuvchi</div>
                <div>Telefon</div>
                <div>Rol</div>
                <div>Guruh/Fakultet</div>
                <div>Sana</div>
                <div class="text-right pr-4">Amallar</div>
            </div>

            <div v-for="user in filteredUsers" :key="user.id" 
                 class="grid grid-cols-7 items-center bg-white p-3 px-5 rounded border border-slate-200 hover:border-blue-300 transition-all group shadow-sm">
                
                <!-- User Info -->
                <div class="col-span-2 flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-400 shrink-0">
                        <img v-if="user.image" :src="user.image" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full bg-slate-200 flex items-center justify-center text-[13px]">
                            {{ user.firstname?.charAt(0).toUpperCase() }}
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase leading-tight">{{ user.firstname }} {{ user.lastname }}</span>
                        <span class="text-[11px] text-slate-400">{{ user.email }}</span>
                    </div>
                </div>

                <!-- Phone -->
                <div class="text-[12px] font-medium text-slate-600 tracking-tight">
                    {{ user.phone || '—' }}
                </div>

                <!-- Role -->
                <div>
                    <span :class="getRoleBadgeClass(user.role)" class="px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-tight">
                        {{ user.role === 'Student' ? 'Talaba' : (user.role === 'Teacher' ? 'O\'qituvchi' : user.role) }}
                    </span>
                </div>

                <!-- Group -->
                <div class="flex flex-col">
                    <span v-if="user.GroupModel" class="text-[12px] font-bold text-slate-700 leading-none">{{ user.GroupModel.name }}</span>
                    <span v-if="user.FacultyModel" class="text-[10px] text-slate-400 mt-0.5">{{ user.FacultyModel.name }}</span>
                    <span v-if="!user.GroupModel && !user.FacultyModel" class="text-slate-300">—</span>
                </div>

                <!-- Date -->
                <div class="text-[11px] text-slate-500 font-medium">
                    {{ formatDate(user.createdAt) }}
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-1">
                    <button @click="openEditModal(user)" class="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 border border-slate-100 transition-all" title="Tahrirlash">
                        <span class="material-icons text-[18px]">edit</span>
                    </button>
                    <button @click="confirmDelete(user)" class="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-slate-100 transition-all" title="O'chirish">
                        <span class="material-icons text-[18px]">delete_outline</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal (Skromni) -->
        <transition name="modal">
            <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" @click="closeModal"></div>
                
                <div class="relative bg-white rounded shadow-2xl w-full max-w-4xl overflow-hidden animate-modal border border-slate-300">
                    <!-- Modal Header -->
                    <div class="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                            <span class="material-icons text-blue-500">{{ editing.id ? 'edit' : 'person_add' }}</span>
                            {{ editing.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qo\'shish' }}
                        </h3>
                        <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
                            <span class="material-icons">close</span>
                        </button>
                    </div>

                    <form @submit.prevent="submitForm" class="p-6 space-y-5" autocomplete="off">
                        <div class="flex flex-col md:flex-row gap-6">
                            <!-- Image Section -->
                            <div class="flex flex-col items-center gap-3 shrink-0">
                                <div class="relative">
                                    <div class="w-28 h-28 rounded bg-slate-50 border-2 border-slate-100 overflow-hidden flex items-center justify-center">
                                        <img v-if="editing.image" :src="editing.image" class="w-full h-full object-cover" />
                                        <span v-else class="material-icons text-4xl text-slate-200">person</span>
                                    </div>
                                    <label class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                                        <span class="material-icons text-sm">photo_camera</span>
                                        <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
                                    </label>
                                </div>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profil rasmi</span>
                            </div>

                            <!-- Main Fields -->
                            <div class="flex-1 grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ism</label>
                                    <input v-model="editing.firstname" type="text" autocomplete="off" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2563EB] focus:bg-white outline-none font-bold text-slate-700 transition-all" required />
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Familiya</label>
                                    <input v-model="editing.lastname" type="text" autocomplete="off" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2563EB] focus:bg-white outline-none font-bold text-slate-700 transition-all" required />
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <input v-model="editing.email" type="email" autocomplete="off" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2563EB] focus:bg-white outline-none font-bold text-slate-700 transition-all" required />
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon</label>
                                    <input v-model="editing.phone" type="text" placeholder="+998" autocomplete="off" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2563EB] focus:bg-white outline-none font-bold text-slate-700 transition-all" />
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                                    <div class="relative custom-multiselect">
                                            <multiselect
                                                v-model="editing.role"
                                                :options="['Admin', 'Teacher', 'Student']"
                                                :searchable="false"
                                                :close-on-select="true"
                                                :show-labels="false"
                                                placeholder="Rolni tanlang"
                                                open-direction="bottom"
                                            />
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol</label>
                                    <div class="relative group">
                                        <input v-model="editing.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2563EB] focus:bg-white outline-none font-bold text-slate-700 transition-all" :required="!editing.id" />
                                        <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            <span class="material-icons text-sm">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Student Fields -->
                                <template v-if="editing.role === 'Student'">
                                    <div class="space-y-1">
                                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fakultet</label>
                                        <div class="relative custom-multiselect">
                                            <multiselect
                                                v-model="selectedFaculty"
                                                :options="faculties"
                                                label="name"
                                                track-by="id"
                                                :searchable="true"
                                                :close-on-select="true"
                                                :show-labels="false"
                                                placeholder="Fakultetni tanlang"
                                                open-direction="bottom"
                                            />
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Guruh</label>
                                        <div class="relative custom-multiselect">
                                            <multiselect
                                                v-model="selectedGroup"
                                                :options="filteredGroups"
                                                label="name"
                                                track-by="id"
                                                :searchable="true"
                                                :close-on-select="true"
                                                :show-labels="false"
                                                placeholder="Guruhni tanlang"
                                                open-direction="bottom"
                                            />
                                        </div>
                                    </div>
                                </template>

                                <!-- Gender Section -->
                                <div class="col-span-2 space-y-3 pt-2">
                                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Jinsi</label>
                                    <div class="flex gap-6">
                                        <label class="flex items-center gap-3 cursor-pointer group">
                                            <div class="relative flex items-center justify-center">
                                                <input type="radio" v-model="editing.gender" value="Erkak" class="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-full checked:border-[#2563EB] transition-all" />
                                                <div class="absolute w-3 h-3 bg-[#2563EB] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <span class="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Erkak</span>
                                        </label>
                                        <label class="flex items-center gap-3 cursor-pointer group">
                                            <div class="relative flex items-center justify-center">
                                                <input type="radio" v-model="editing.gender" value="Ayol" class="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-full checked:border-[#2563EB] transition-all" />
                                                <div class="absolute w-3 h-3 bg-[#2563EB] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <span class="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Ayol</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 mt-8">
                            <button @click="closeModal" type="button" class="px-6 py-2 bg-slate-100 text-slate-600 rounded text-[13px] font-bold hover:bg-slate-200 transition-all">Bekor qilish</button>
                            <button type="submit" class="px-8 py-2 bg-blue-600 text-white rounded text-[13px] font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">Saqlash</button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Delete Modal -->
        <transition name="modal">
            <div v-if="showDeleteModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" @click="showDeleteModal = false"></div>
                <div class="relative bg-white p-6 rounded shadow-2xl w-full max-w-sm text-center border border-slate-200">
                    <div class="w-12 h-12 bg-red-50 text-red-500 rounded flex items-center justify-center mx-auto mb-3">
                        <span class="material-icons">delete_forever</span>
                    </div>
                    <h3 class="text-base font-bold text-slate-800 uppercase tracking-tight">O'chirishni tasdiqlang</h3>
                    <p class="text-slate-500 text-[13px] mt-1">Ushbu foydalanuvchi ma'lumotlari butunlay o'chiriladi.</p>
                    <div class="flex gap-2 mt-6">
                        <button @click="showDeleteModal = false" class="flex-1 py-2 bg-slate-100 text-slate-600 rounded text-[12px] font-bold">Yo'q</button>
                        <button @click="deleteUser" class="flex-1 py-2 bg-red-500 text-white rounded text-[12px] font-bold shadow-lg shadow-red-100">Ha, o'chirilsin</button>
                    </div>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import api from '../api'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const users = ref([])
const faculties = ref([])
const groups = ref([])
const search = ref('')
const isLoading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const showPassword = ref(false)
const editing = ref({})
const deleting = ref({})

const selectedFaculty = computed({
    get: () => faculties.value.find(f => f.id === editing.value.facultyId),
    set: (val) => {
        editing.value.facultyId = val ? val.id : null
        editing.value.groupId = null // Reset group when faculty changes
    }
})

const selectedGroup = computed({
    get: () => groups.value.find(g => g.id === editing.value.groupId),
    set: (val) => {
        editing.value.groupId = val ? val.id : null
    }
})

const loadUsers = async () => {
    isLoading.value = true
    try {
        const { data } = await api.get('/users')
        users.value = data
    } finally {
        setTimeout(() => isLoading.value = false, 500)
    }
}

const loadFaculties = async () => {
    try {
        const { data } = await api.get('/faculties')
        faculties.value = data
    } catch (e) {
        console.error('Load faculties errors:', e)
    }
}

const loadGroups = async () => {
    try {
        const { data } = await api.get('/groups')
        groups.value = data
    } catch (e) {
        console.error('Load groups errors:', e)
    }
}

const filteredUsers = computed(() => {
    return users.value.filter(u => {
        const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
        const searchTerm = search.value.toLowerCase();
        return fullName.includes(searchTerm) || 
               (u.email && u.email.toLowerCase().includes(searchTerm)) ||
               (u.phone && u.phone.includes(searchTerm));
    })
})

const filteredGroups = computed(() => {
    if (!editing.value.facultyId) return []
    return groups.value.filter(g => g.facultyId === editing.value.facultyId)
})

const formatDate = (dateString) => {
    if(!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

const formatTime = (dateString) => {
    if(!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const getRoleIcon = (role) => {
    if (role === 'Admin') return 'shield';
    if (role === 'Teacher') return 'school';
    return 'person';
}

const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'bg-purple-100 text-purple-600';
    if (role === 'Teacher') return 'bg-blue-100 text-blue-600';
    return 'bg-emerald-100 text-emerald-600';
}

const openCreateModal = () => {
    editing.value = { firstname: '', lastname: '', email: '', role: 'Student', password: '', phone: '', image: '', gender: 'Erkak', facultyId: null, groupId: null }
    showPassword.value = false
    showModal.value = true
}

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Rasm hajmi 5MB dan kam bo\'lishi kerak')
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            editing.value.image = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const openEditModal = (user) => {
    editing.value = { ...user }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editing.value = {}
}

const submitForm = async () => {
    try {
        if (editing.value.id) {
            const { data } = await api.patch(`/users/id/${editing.value.id}`, editing.value)
            if (editing.value.id == userStore.user?.id) {
                const updatedUser = { ...userStore.user, ...data }
                userStore.setUser(updatedUser)
            }
        } else {
            await api.post('/users', editing.value)
        }
        closeModal()
        loadUsers()
    } catch (error) {
        console.error(error)
        alert('Xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
    }
}

const confirmDelete = (user) => {
    deleting.value = user
    showDeleteModal.value = true
}

const deleteUser = async () => {
    if (!deleting.value || !deleting.value.id) return;
    try {
        await api.delete(`/users/id/${deleting.value.id}`)
        showDeleteModal.value = false
        loadUsers()
    } catch (error) {
        console.error('Delete error:', error)
    }
}

onMounted(() => {
    loadUsers()
    loadFaculties()
    loadGroups()
})
</script>

<style scoped>
@keyframes modal {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal { animation: modal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Multiselect Custom Styling */
.custom-multiselect :deep(.multiselect__tags) {
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 8px 40px 0 12px;
    min-height: 48px;
}
.custom-multiselect :deep(.multiselect__single) {
    background: transparent;
    font-weight: 700;
    color: #334155;
    margin-bottom: 8px;
}
.custom-multiselect :deep(.multiselect__placeholder) {
    margin-bottom: 8px;
}
.custom-multiselect :deep(.multiselect__content-wrapper) {
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    margin-top: 4px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
.custom-multiselect :deep(.multiselect__option--highlight) {
    background: #2563EB;
}
</style>