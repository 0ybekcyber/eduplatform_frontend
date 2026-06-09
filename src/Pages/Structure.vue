<template>
    <div class="space-y-4 animate-in fade-in duration-500">
        
        <!-- Header Section (Skromni) -->
        <div class="bg-white rounded border border-slate-200 p-6 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-[#1e88e5]"></div>
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                    <span class="material-icons">account_tree</span>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-800">Tizim tuzilmasi</h1>
                    <p class="text-slate-500 text-[12px] font-medium mt-0.5">Fakultetlar va guruhlar iyerarxiyasini boshqarish</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Faculty Section -->
            <div class="space-y-3">
                <div class="flex items-center justify-between px-1">
                    <h2 class="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Fakultetlar</h2>
                    <button @click="openFacultyModal" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-sm">
                        <span class="material-icons text-sm">add</span> <span>Qo'shish</span>
                    </button>
                </div>

                <div class="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                    <div v-if="faculties.length === 0" class="p-10 text-center text-slate-400 italic text-[13px]">Fakultetlar topilmadi</div>
                    <div v-else class="divide-y divide-slate-100">
                        <div v-for="f in faculties" :key="f.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <span class="text-[14px] font-bold text-slate-700 uppercase tracking-tight">{{ f.name }}</span>
                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="editFaculty(f)" class="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded transition-all border border-transparent hover:border-blue-100" title="Tahrirlash">
                                    <span class="material-icons text-[16px]">edit</span>
                                </button>
                                <button @click="confirmDeleteFaculty(f)" class="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-all border border-transparent hover:border-red-100" title="O'chirish">
                                    <span class="material-icons text-[16px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Groups Section -->
            <div class="space-y-3">
                <div class="flex items-center justify-between px-1">
                    <h2 class="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Guruhlar</h2>
                    <button @click="editingGroup = { name: '', facultyId: faculties[0]?.id }; showGroupModal = true" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700 transition-all shadow-sm">
                        <span class="material-icons text-sm">add</span> <span>Qo'shish</span>
                    </button>
                </div>

                <div class="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                    <div v-if="groups.length === 0" class="p-10 text-center text-slate-400 italic text-[13px]">Guruhlar topilmadi</div>
                    <div v-else class="divide-y divide-slate-100">
                        <div v-for="g in groups" :key="g.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div class="flex flex-col">
                                <span class="text-[14px] font-bold text-slate-700">{{ g.name }}</span>
                                <span class="text-[10px] text-slate-400 uppercase font-bold">{{ faculties.find(f => f.id === g.facultyId)?.name || 'Noma\'lum' }}</span>
                            </div>
                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="editGroup(g)" class="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded transition-all border border-transparent hover:border-blue-100">
                                    <span class="material-icons text-[16px]">edit</span>
                                </button>
                                <button @click="confirmDeleteGroup(g)" class="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-all border border-transparent hover:border-red-100">
                                    <span class="material-icons text-[16px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Faculty Modal (Skromni) -->
        <transition name="modal">
            <div v-if="showFacultyModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" @click="showFacultyModal = false"></div>
                <div class="relative bg-white rounded shadow-2xl w-full max-w-sm animate-modal border border-slate-300">
                    <div class="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-tight">{{ editingFaculty.id ? 'Fakultetni tahrirlash' : 'Yangi fakultet' }}</h3>
                        <button @click="showFacultyModal = false" class="text-slate-400 hover:text-slate-600"><span class="material-icons text-sm">close</span></button>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fakultet nomi</label>
                            <input v-model="editingFaculty.name" type="text" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-[13px] focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" required />
                        </div>
                        <button @click="saveFaculty" class="w-full py-2.5 bg-blue-600 text-white rounded text-[11px] font-bold uppercase tracking-widest shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">Saqlash</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Group Modal (Skromni) -->
        <transition name="modal">
            <div v-if="showGroupModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" @click="showGroupModal = false"></div>
                <div class="relative bg-white rounded shadow-2xl w-full max-w-sm animate-modal border border-slate-300">
                    <div class="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-tight">{{ editingGroup.id ? 'Guruhni tahrirlash' : 'Yangi guruh' }}</h3>
                        <button @click="showGroupModal = false" class="text-slate-400 hover:text-slate-600"><span class="material-icons text-sm">close</span></button>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fakultetni tanlang</label>
                            <select v-model="editingGroup.facultyId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-[13px] focus:border-blue-500 outline-none font-bold text-slate-700 transition-all">
                                <option v-for="f in faculties" :key="f.id" :value="f.id">{{ f.name }}</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Guruh nomi</label>
                            <input v-model="editingGroup.name" type="text" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-[13px] focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" required />
                        </div>
                        <button @click="saveGroup" class="w-full py-2.5 bg-blue-600 text-white rounded text-[11px] font-bold uppercase tracking-widest shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">Saqlash</button>
                    </div>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const faculties = ref([])
const groups = ref([])

const showFacultyModal = ref(false)
const showGroupModal = ref(false)

const editingFaculty = ref({ name: '' })
const editingGroup = ref({ name: '', facultyId: null })

const loadData = async () => {
    try {
        const [fRes, gRes] = await Promise.all([
            api.get('/faculties'),
            api.get('/groups')
        ])
        faculties.value = fRes.data
        groups.value = gRes.data
    } catch (e) { console.error(e) }
}

const openFacultyModal = () => {
    editingFaculty.value = { name: '' }
    showFacultyModal.value = true
}

const editFaculty = (f) => {
    editingFaculty.value = { ...f }
    showFacultyModal.value = true
}

const saveFaculty = async () => {
    try {
        if (editingFaculty.value.id) {
            await api.patch(`/faculties/${editingFaculty.value.id}`, editingFaculty.value)
        } else {
            await api.post('/faculties', editingFaculty.value)
        }
        showFacultyModal.value = false
        loadData()
    } catch (e) {
        alert('Xatolik: ' + e.message)
    }
}

const confirmDeleteFaculty = async (f) => {
    if (confirm('Ishonchingiz komilmi?')) {
        await api.delete(`/faculties/${f.id}`)
        loadData()
    }
}

const openGroupModal = () => {
    editingGroup.value = { name: '', facultyId: faculties.value[0]?.id }
    showGroupModal.value = true
}

const editGroup = (g) => {
    editingGroup.value = { ...g }
    showGroupModal.value = true
}

const saveGroup = async () => {
    try {
        if (editingGroup.value.id) {
            await api.patch(`/groups/${editingGroup.value.id}`, editingGroup.value)
        } else {
            await api.post('/groups', editingGroup.value)
        }
        showGroupModal.value = false
        loadData()
    } catch (e) {
        alert('Xatolik: ' + e.message)
    }
}

const confirmDeleteGroup = async (g) => {
    if (confirm('Ishonchingiz komilmi?')) {
        await api.delete(`/groups/${g.id}`)
        loadData()
    }
}

onMounted(loadData)
</script>

<style scoped>
@keyframes modal {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal { animation: modal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
