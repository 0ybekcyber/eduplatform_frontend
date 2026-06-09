<template>
  <div class="space-y-4">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded border border-slate-200">
      <div>
        <h1 class="text-lg font-bold text-slate-800">{{ isStudent ? 'Mening topshiriqlarim' : 'Topshiriqlar boshqaruvi' }}</h1>
        <p class="text-slate-500 text-[12px] mt-0.5">Jami: {{ filteredAssignments.length }}</p>
      </div>
      <button v-if="!isStudent" @click="openCreateModal" class="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded text-[12px] font-bold hover:bg-teal-700">
        <span class="material-icons text-lg">add</span>
        <span>Yangi topshiriq</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-if="isLoading" class="col-span-full py-20 text-center text-slate-400 font-bold">Yuklanmoqda...</div>
      <div v-else-if="filteredAssignments.length === 0" class="col-span-full py-20 bg-white rounded border border-slate-200 text-center text-slate-400 font-bold">Topshiriqlar topilmadi</div>

      <div v-for="assignment in filteredAssignments" :key="assignment.id" class="bg-white rounded border border-slate-200 overflow-hidden flex flex-col">
        <div class="h-1" :class="isStudent && hasSubmitted(assignment.id) ? 'bg-emerald-500' : (isDeadlinePassed(assignment.deadline) ? 'bg-rose-500' : 'bg-teal-500')"></div>
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex justify-between items-center mb-3 text-[10px]">
            <span class="font-bold px-2 py-1 rounded border" :class="isDeadlinePassed(assignment.deadline) ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'">
              {{ isDeadlinePassed(assignment.deadline) ? "Muddati o'tgan" : "Faol" }}
            </span>
            <span class="text-slate-400">{{ formatDate(assignment.deadline) }}</span>
          </div>

          <h3 class="text-[15px] font-bold text-slate-800 mb-2">{{ assignment.name }}</h3>
          <p class="text-[12px] text-slate-500 mb-4 whitespace-pre-wrap line-clamp-4">{{ assignment.description || "Izohsiz topshiriq" }}</p>

          <div class="space-y-2 mb-4 text-[11px]">
            <div class="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded p-2">
              <span class="text-slate-500">O'qituvchi</span>
              <span class="font-bold text-slate-700">{{ assignment.teacher?.firstname }} {{ assignment.teacher?.lastname }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 bg-teal-50 border border-teal-100 rounded p-2">
              <span class="text-teal-700">Maksimal ball</span>
              <span class="font-black text-teal-700">{{ formatScore(assignment.maxScore || 100) }} ball</span>
            </div>
            <button v-if="assignment.attachment" @click="downloadFile(assignment.attachment)" class="w-full flex items-center justify-center gap-2 bg-teal-50 text-teal-700 border border-teal-100 rounded p-2 font-bold hover:bg-teal-100">
              <span class="material-icons text-base">download</span>
              <span>{{ assignment.attachment.fileName }}</span>
            </button>
          </div>

          <div v-if="isStudent && hasSubmitted(assignment.id)" class="bg-emerald-50 border border-emerald-100 rounded p-3 mb-4 text-[11px]">
            <div class="flex justify-between gap-2">
              <span class="font-bold text-emerald-700 uppercase">Topshirildi</span>
              <span class="text-slate-400">{{ formatDate(getSubmission(assignment.id)?.createdAt) }}</span>
            </div>
            <p class="text-slate-500 mt-1 line-clamp-2">{{ getSubmission(assignment.id)?.textAnswer || 'Fayl yuborilgan' }}</p>
            <p class="mt-2 font-black" :class="getSubmission(assignment.id)?.gradeScore === null || getSubmission(assignment.id)?.gradeScore === undefined ? 'text-amber-600' : 'text-emerald-700'">
              {{ getSubmission(assignment.id)?.gradeScore === null || getSubmission(assignment.id)?.gradeScore === undefined ? 'Hali baholanmagan' : `${formatScore(getSubmission(assignment.id)?.gradeScore)} / ${formatScore(assignment.maxScore || 100)} ball` }}
            </p>
          </div>

          <div class="mt-auto flex gap-2 pt-3 border-t border-slate-100">
            <template v-if="!isStudent">
              <button @click="openSubmissionsModal(assignment)" class="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded text-[11px] font-bold hover:bg-slate-200">Javoblar</button>
              <button @click="openEditModal(assignment)" class="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-amber-100 hover:text-amber-600 border border-slate-100"><span class="material-icons text-[18px]">edit</span></button>
              <button @click="confirmDelete(assignment)" class="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-red-100 hover:text-red-600 border border-slate-100"><span class="material-icons text-[18px]">delete_outline</span></button>
            </template>
            <template v-else>
              <button v-if="hasSubmitted(assignment.id)" @click="openMySubmissionModal(assignment)" class="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded text-[11px] font-bold hover:bg-slate-50">Ko'rish</button>
              <button v-else @click="openSubmitModal(assignment)" :disabled="isDeadlinePassed(assignment.deadline)" class="w-full py-2 bg-teal-600 text-white rounded text-[11px] font-bold hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400">
                {{ isDeadlinePassed(assignment.deadline) ? "Muddati o'tgan" : "Topshirish" }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 z-[9999] bg-[#F8FAFC] overflow-y-auto p-6">
          <div class="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800">{{ editing.id ? 'Topshiriqni tahrirlash' : 'Yangi topshiriq yaratish' }}</h3>
              <div class="flex gap-2">
                <button @click="showEditModal = false" class="px-4 py-2 text-xs font-bold text-slate-500">Bekor qilish</button>
                <button @click="submitAssignment" class="px-5 py-2 bg-teal-600 text-white text-xs font-bold rounded hover:bg-teal-700">Saqlash</button>
              </div>
            </div>
            <div class="grid lg:grid-cols-2 gap-6 p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Nomi</label>
                  <input v-model="editing.name" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Tavsif</label>
                  <textarea v-model="editing.description" rows="10" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-teal-500 outline-none"></textarea>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Topshiriq bali</label>
                  <input v-model.number="editing.maxScore" type="number" min="1" step="0.1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">DOC, DOCX yoki PDF</label>
                  <div class="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                    <div v-if="editing.attachment" class="flex items-center justify-between gap-4">
                      <div>
                        <p class="text-sm font-bold text-slate-700">{{ editing.attachment.fileName }}</p>
                        <p class="text-[11px] text-slate-400">{{ formatFileSize(editing.attachment.size) }}</p>
                      </div>
                      <div class="flex gap-2">
                        <button @click="downloadFile(editing.attachment)" type="button" class="px-3 py-2 text-[11px] font-bold bg-white border border-slate-200 rounded">Ko'rish</button>
                        <button @click="editing.attachment = null" type="button" class="px-3 py-2 text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 rounded">Olib tashlash</button>
                      </div>
                    </div>
                    <label v-else class="flex items-center justify-center gap-2 px-4 py-6 text-[12px] font-bold text-teal-600 cursor-pointer">
                      <span class="material-icons">upload_file</span>
                      <span>Fayl yuklash</span>
                      <input type="file" accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" class="hidden" @change="handleTeacherFileUpload" />
                    </label>
                    <p class="mt-2 text-[11px] text-slate-400 text-center">Maksimal hajm: 3 MB</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Sana</label>
                    <input v-model="editing.deadlineDate" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-teal-500 outline-none" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Vaqt</label>
                    <input v-model="editing.deadlineTime" type="time" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-teal-500 outline-none" />
                  </div>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-slate-400 uppercase mb-2">Fakultetlar</p>
                  <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    <label v-for="f in faculties" :key="f.id" class="flex items-center gap-2 text-xs">
                      <input type="checkbox" :value="f.id" v-model="editing.facultyIds" />
                      <span>{{ f.name }}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] font-bold text-slate-400 uppercase">Guruhlar</p>
                    <button v-if="groupsOfSelectedFaculties.length" @click="selectAllGroups" type="button" class="text-[10px] font-bold text-teal-500">Barchasi</button>
                  </div>
                  <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2">
                    <label v-for="g in groupsOfSelectedFaculties" :key="g.id" class="flex items-center gap-2 text-xs">
                      <input type="checkbox" :value="g.id" v-model="editing.groupIds" />
                      <span>{{ g.name }}</span>
                    </label>
                    <p v-if="!groupsOfSelectedFaculties.length" class="text-[11px] text-slate-400">Avval fakultet tanlang</p>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] font-bold text-slate-400 uppercase">O'quvchilar</p>
                    <button v-if="studentsOfSelectedGroups.length" @click="selectAllStudents" type="button" class="text-[10px] font-bold text-teal-500">Barchasi</button>
                  </div>
                  <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2">
                    <label v-for="student in studentsOfSelectedGroups" :key="student.id" class="flex items-center gap-2 text-xs">
                      <input type="checkbox" :value="student.id" v-model="editing.studentIds" />
                      <span>{{ student.firstname }} {{ student.lastname }}</span>
                    </label>
                    <p v-if="!studentsOfSelectedGroups.length" class="text-[11px] text-slate-400">Avval guruh tanlang</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="showSubmitModal" class="fixed inset-0 z-[9999] bg-slate-900/50 flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-2xl rounded-2xl p-6">
            <div class="flex justify-between items-start gap-4 mb-5">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-widest text-teal-500">Topshirish</p>
                <h3 class="text-xl font-black text-slate-800 mt-1">{{ submittingAssignment?.name }}</h3>
              </div>
              <button @click="showSubmitModal = false" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><span class="material-icons">close</span></button>
            </div>
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 whitespace-pre-wrap">{{ submittingAssignment?.description || 'Topshiriq tavsifi kiritilmagan' }}</div>
              <textarea v-model="submissionForm.textAnswer" rows="8" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-teal-500 outline-none" placeholder="Javob matnini yozing..."></textarea>
              <div class="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50">
                <div v-if="submissionForm.attachment" class="flex items-center justify-between gap-4">
                  <div>
                    <p class="text-sm font-bold text-slate-700">{{ submissionForm.attachment.fileName }}</p>
                    <p class="text-[11px] text-slate-400">{{ formatFileSize(submissionForm.attachment.size) }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button @click="downloadFile(submissionForm.attachment)" type="button" class="px-3 py-2 text-[11px] font-bold bg-white border border-slate-200 rounded">Ko'rish</button>
                    <button @click="submissionForm.attachment = null" type="button" class="px-3 py-2 text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 rounded">Olib tashlash</button>
                  </div>
                </div>
                <label v-else class="flex items-center justify-center gap-2 px-4 py-6 text-[12px] font-bold text-teal-600 cursor-pointer">
                  <span class="material-icons">upload_file</span>
                  <span>Fayl yuklash</span>
                  <input type="file" accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" class="hidden" @change="handleStudentFileUpload" />
                </label>
                <p class="mt-2 text-[11px] text-slate-400 text-center">Maksimal hajm: 3 MB</p>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button @click="showSubmitModal = false" class="px-5 py-3 text-xs font-bold text-slate-500">Bekor qilish</button>
              <button @click="submitAnswer" class="px-6 py-3 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700">Topshirish</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="showSubmissionsModal" class="fixed inset-0 z-[9999] bg-[#F1F5F9] overflow-y-auto p-6">
          <div class="max-w-5xl mx-auto">
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 class="text-lg font-black text-slate-800">{{ viewingAssignment?.name }}</h3>
                <div class="flex items-center gap-2">
                  <button @click="refreshPlagiarism" :disabled="plagiarismLoading" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[11px] font-black hover:bg-blue-100 disabled:opacity-60">
                    <span class="material-icons text-base">verified_user</span>
                    {{ plagiarismLoading ? 'Tekshirilmoqda...' : 'Plagiatni tekshirish' }}
                  </button>
                  <button @click="showSubmissionsModal = false" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><span class="material-icons">close</span></button>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <div v-if="submissionsLoading" class="py-12 text-center text-slate-400 font-bold">Yuklanmoqda...</div>
                <div v-else-if="viewingSubmissions.length === 0" class="py-12 text-center text-slate-400 font-bold">Javoblar hali yo'q</div>
                <div v-for="submission in viewingSubmissions" :key="submission.id" class="border border-slate-200 rounded-2xl p-4">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 class="font-bold text-slate-800">{{ submission.student?.firstname }} {{ submission.student?.lastname }}</h4>
                      <p class="text-[11px] text-slate-400">{{ submission.student?.phone || 'Telefon yo`q' }}</p>
                      <p class="text-[11px] text-slate-400 mt-1">{{ submission.student?.FacultyModel?.name || 'Fakultet yo`q' }} / {{ submission.student?.GroupModel?.name || 'Guruh yo`q' }}</p>
                    </div>
                    <span class="text-[11px] font-bold text-slate-500">{{ formatDate(submission.createdAt) }}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 whitespace-pre-wrap">{{ submission.textAnswer || 'Matn yuborilmagan' }}</div>
                  <button v-if="submission.attachment" @click="downloadFile(submission.attachment)" class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-[11px] font-bold">
                    <span class="material-icons text-base">download</span>
                    <span>{{ submission.attachment.fileName }}</span>
                  </button>
                  <div class="mt-4 rounded-xl border p-4" :class="getPlagiarismBoxClass(submission.plagiarismScore)">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p class="text-[11px] font-black uppercase tracking-widest">Plagiat tekshiruvi</p>
                        <p class="mt-1 text-[12px] font-medium opacity-80">{{ getPlagiarismHint(submission) }}</p>
                      </div>
                      <div class="text-left sm:text-right">
                        <p class="text-2xl font-black">{{ Math.round(submission.plagiarismScore || 0) }}%</p>
                        <p class="text-[10px] font-bold uppercase tracking-widest opacity-70">{{ getPlagiarismLevel(submission.plagiarismScore) }}</p>
                      </div>
                    </div>
                    <div v-if="submission.plagiarismReport?.matches?.length" class="mt-3 space-y-2">
                      <div v-for="match in submission.plagiarismReport.matches.slice(0, 3)" :key="match.submissionId" class="flex items-center justify-between gap-3 rounded bg-white/70 px-3 py-2 text-[11px]">
                        <span class="font-bold">{{ match.studentName }}</span>
                        <span class="font-black">{{ match.score }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Baholash</label>
                      <div class="flex items-center gap-2">
                        <input v-model.number="submission.gradeScore" type="number" min="0" :max="viewingAssignment?.maxScore || 100" step="0.1" class="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold outline-none focus:bg-white focus:border-teal-500" />
                        <span class="text-xs font-bold text-slate-400">/ {{ formatScore(viewingAssignment?.maxScore || 100) }} ball</span>
                      </div>
                    </div>
                    <button @click="gradeSubmission(submission)" class="px-5 py-2 bg-teal-600 text-white rounded text-[11px] font-black hover:bg-teal-700">
                      Ballni saqlash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="showMySubmissionModal" class="fixed inset-0 z-[9999] bg-slate-900/50 flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-2xl rounded-2xl p-6">
            <div class="flex justify-between items-start gap-4 mb-5">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-widest text-emerald-500">Yuborilgan javob</p>
                <h3 class="text-xl font-black text-slate-800 mt-1">{{ selectedAssignment?.name }}</h3>
              </div>
              <button @click="showMySubmissionModal = false" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><span class="material-icons">close</span></button>
            </div>
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p class="text-[11px] text-slate-400 mb-2">{{ formatDate(selectedSubmission?.createdAt) }}</p>
                <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ selectedSubmission?.textAnswer || 'Matn yuborilmagan' }}</p>
              </div>
              <div class="p-4 rounded-xl border" :class="selectedSubmission?.gradeScore === null || selectedSubmission?.gradeScore === undefined ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'">
                <p class="text-[11px] font-black uppercase tracking-widest">Baho</p>
                <p class="mt-1 text-lg font-black">
                  {{ selectedSubmission?.gradeScore === null || selectedSubmission?.gradeScore === undefined ? 'Hali baholanmagan' : `${formatScore(selectedSubmission?.gradeScore)} / ${formatScore(selectedAssignment?.maxScore || 100)} ball` }}
                </p>
              </div>
              <button v-if="selectedSubmission?.attachment" @click="downloadFile(selectedSubmission.attachment)" class="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-[11px] font-bold">
                <span class="material-icons text-base">download</span>
                <span>{{ selectedSubmission.attachment.fileName }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] bg-slate-900/50 flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 class="text-lg font-black text-slate-800">Topshiriq o'chirilsinmi?</h3>
            <p class="text-sm text-slate-500 mt-2">Bu amal bilan topshiriqqa tegishli javoblar ham o'chadi.</p>
            <div class="mt-6 flex gap-3">
              <button @click="showDeleteModal = false" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold">Bekor qilish</button>
              <button @click="deleteAssignment" class="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold">Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../api'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const isStudent = computed(() => userStore.user?.role === 'Student')
const MAX_FILE_SIZE = 3 * 1024 * 1024
const MAX_FILE_SIZE_MB = 3
const ALLOWED_FILE_TYPES = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf']

const assignments = ref([])
const faculties = ref([])
const groups = ref([])
const students = ref([])
const mySubmissions = ref([])
const isLoading = ref(true)
const showEditModal = ref(false)
const showSubmitModal = ref(false)
const showSubmissionsModal = ref(false)
const showMySubmissionModal = ref(false)
const showDeleteModal = ref(false)
const submissionsLoading = ref(false)
const plagiarismLoading = ref(false)
const viewingAssignment = ref(null)
const viewingSubmissions = ref([])
const submittingAssignment = ref(null)
const selectedSubmission = ref(null)
const selectedAssignment = ref(null)
const deletingAssignment = ref(null)
const editing = ref({ name: '', description: '', maxScore: 100, facultyIds: [], groupIds: [], studentIds: [], deadlineDate: '', deadlineTime: '', attachment: null })
const submissionForm = ref({ textAnswer: '', attachment: null })

const parseIds = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(Number).filter(n => !isNaN(n) && n > 0)
  if (typeof val === 'string' && val.startsWith('[')) { try { return JSON.parse(val).map(Number).filter(n => !isNaN(n) && n > 0) } catch (e) { return [] } }
  const num = Number(val)
  return (!isNaN(num) && num > 0) ? [num] : []
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [assignmentsRes, facultiesRes, groupsRes] = await Promise.all([api.get('/assignments'), api.get('/faculties'), api.get('/groups')])
    assignments.value = assignmentsRes.data
    faculties.value = facultiesRes.data
    groups.value = groupsRes.data
    if (!isStudent.value) {
      const usersRes = await api.get('/users')
      students.value = usersRes.data.filter(user => user.role === 'Student')
    } else {
      students.value = []
    }
    if (isStudent.value) {
      const mySubmissionsRes = await api.get('/assignment-submissions/my')
      mySubmissions.value = mySubmissionsRes.data
    }
  } catch (e) {
    alert('Ma`lumotlarni yuklashda xatolik yuz berdi')
  } finally {
    isLoading.value = false
  }
}

const filteredAssignments = computed(() => {
  if (!isStudent.value) return assignments.value
  const studentFacultyId = userStore.user?.facultyId ? Number(userStore.user.facultyId) : null
  const studentGroupId = userStore.user?.groupId ? Number(userStore.user.groupId) : null
  return assignments.value.filter(item => {
    const fs = parseIds(item.facultyIds)
    const gs = parseIds(item.groupIds)
    const ss = parseIds(item.studentIds)
    if (!fs.length && !gs.length && !ss.length) return true
    const sameStudent = !ss.length || ss.includes(Number(userStore.user.id))
    const sameFaculty = !fs.length || (studentFacultyId !== null && fs.includes(studentFacultyId))
    const sameGroup = !gs.length || (studentGroupId !== null && gs.includes(studentGroupId))
    return sameStudent && sameFaculty && sameGroup
  })
})

const groupsOfSelectedFaculties = computed(() => {
  const ids = (editing.value.facultyIds || []).map(Number)
  return groups.value.filter(g => ids.includes(Number(g.facultyId)))
})

const studentsOfSelectedGroups = computed(() => {
  const ids = (editing.value.groupIds || []).map(Number)
  if (!ids.length) return []
  return students.value.filter(student => ids.includes(Number(student.groupId)))
})

watch(() => editing.value.facultyIds, (val) => {
  const selectedFacultyIds = (val || []).map(Number)
  editing.value.groupIds = (editing.value.groupIds || []).filter(id => {
    const group = groups.value.find(g => g.id === Number(id))
    return group && selectedFacultyIds.includes(Number(group.facultyId))
  })
  editing.value.studentIds = (editing.value.studentIds || []).filter(id => {
    const student = students.value.find(item => item.id === Number(id))
    return student && editing.value.groupIds.map(Number).includes(Number(student.groupId))
  })
}, { deep: true })

watch(() => editing.value.groupIds, (val) => {
  const selectedGroupIds = (val || []).map(Number)
  editing.value.studentIds = (editing.value.studentIds || []).filter(id => {
    const student = students.value.find(item => item.id === Number(id))
    return student && selectedGroupIds.includes(Number(student.groupId))
  })
}, { deep: true })

const selectAllGroups = () => { editing.value.groupIds = groupsOfSelectedFaculties.value.map(g => g.id) }
const selectAllStudents = () => { editing.value.studentIds = studentsOfSelectedGroups.value.map(student => student.id) }
const hasSubmitted = (assignmentId) => mySubmissions.value.some(item => item.assignmentId === assignmentId)
const getSubmission = (assignmentId) => mySubmissions.value.find(item => item.assignmentId === assignmentId)
const formatDate = (d) => d ? new Date(d).toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12: false }) : ''
const isDeadlinePassed = (d) => d ? new Date(d) < new Date() : false
const formatFileSize = (size) => !size ? '0 KB' : size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(2)} MB` : `${Math.ceil(size / 1024)} KB`
const openCreateModal = () => { editing.value = { name: '', description: '', maxScore: 100, facultyIds: [], groupIds: [], studentIds: [], deadlineDate: '', deadlineTime: '', attachment: null }; showEditModal.value = true }
const openEditModal = (assignment) => {
  const deadline = assignment.deadline ? new Date(assignment.deadline) : null
  editing.value = {
    ...assignment,
    maxScore: assignment.maxScore || 100,
    facultyIds: parseIds(assignment.facultyIds),
    groupIds: parseIds(assignment.groupIds),
    studentIds: parseIds(assignment.studentIds),
    deadlineDate: deadline ? `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}` : '',
    deadlineTime: deadline ? `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}` : '',
    attachment: assignment.attachment || null
  }
  showEditModal.value = true
}
const confirmDelete = (assignment) => { deletingAssignment.value = assignment; showDeleteModal.value = true }
const openSubmitModal = (assignment) => { submittingAssignment.value = assignment; submissionForm.value = { textAnswer: '', attachment: null }; showSubmitModal.value = true }
const openMySubmissionModal = (assignment) => { selectedAssignment.value = assignment; selectedSubmission.value = getSubmission(assignment.id); showMySubmissionModal.value = true }

const convertFileToPayload = (file) => new Promise((resolve, reject) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return reject(new Error('Faqat DOC, DOCX yoki PDF fayl yuklash mumkin'))
  if (file.size > MAX_FILE_SIZE) return reject(new Error(`Fayl hajmi ${MAX_FILE_SIZE_MB} MB dan oshmasligi kerak`))
  const reader = new FileReader()
  reader.onload = (e) => resolve({ fileName: file.name, mimeType: file.type, dataUrl: e.target.result, size: file.size })
  reader.onerror = () => reject(new Error('Faylni o`qishda xatolik yuz berdi'))
  reader.readAsDataURL(file)
})

const handleTeacherFileUpload = async (e) => {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  try { editing.value.attachment = await convertFileToPayload(file) } catch (err) { alert(err.message) }
}

const handleStudentFileUpload = async (e) => {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  try { submissionForm.value.attachment = await convertFileToPayload(file) } catch (err) { alert(err.message) }
}

const submitAssignment = async () => {
  if (!editing.value.name?.trim()) return alert('Topshiriq nomini kiriting')
  if (!Number(editing.value.maxScore) || Number(editing.value.maxScore) <= 0) return alert('Topshiriq bali 0 dan katta bo`lishi kerak')
  const deadline = editing.value.deadlineDate
    ? `${editing.value.deadlineDate}T${editing.value.deadlineTime || '23:59'}:00`
    : null
  const payload = {
    ...editing.value,
    name: editing.value.name.trim(),
    description: editing.value.description?.trim() || '',
    maxScore: Number(editing.value.maxScore),
    facultyIds: (editing.value.facultyIds || []).map(Number).filter(n => !isNaN(n)),
    groupIds: (editing.value.groupIds || []).map(Number).filter(n => !isNaN(n)),
    studentIds: (editing.value.studentIds || []).map(Number).filter(n => !isNaN(n)),
    deadline,
    attachment: editing.value.attachment || null
  }
  try {
    if (editing.value.id) await api.patch(`/assignments/${editing.value.id}`, payload)
    else await api.post('/assignments', payload)
    showEditModal.value = false
    loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Saqlashda xatolik yuz berdi')
  }
}

const submitAnswer = async () => {
  if (!submissionForm.value.textAnswer?.trim() && !submissionForm.value.attachment) return alert('Matn yoki fayl yuborilishi kerak')
  try {
    await api.post('/assignment-submissions', { assignmentId: submittingAssignment.value.id, textAnswer: submissionForm.value.textAnswer, attachment: submissionForm.value.attachment })
    showSubmitModal.value = false
    loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Topshirishda xatolik yuz berdi')
  }
}

const openSubmissionsModal = async (assignment) => {
  viewingAssignment.value = assignment
  showSubmissionsModal.value = true
  submissionsLoading.value = true
  try {
    const res = await api.get(`/assignment-submissions/assignment/${assignment.id}`)
    viewingSubmissions.value = res.data
    await refreshPlagiarism()
  } catch (e) {
    alert('Javoblarni yuklashda xatolik yuz berdi')
  } finally {
    submissionsLoading.value = false
  }
}

const mergePlagiarismReports = (reports) => {
  const reportMap = new Map((reports || []).map(item => [Number(item.id), item]))
  viewingSubmissions.value = viewingSubmissions.value.map(submission => {
    const report = reportMap.get(Number(submission.id))
    return report
      ? {
          ...submission,
          plagiarismScore: report.plagiarismScore,
          plagiarismReport: report.plagiarismReport
        }
      : submission
  })
}

const refreshPlagiarism = async () => {
  if (!viewingAssignment.value?.id || plagiarismLoading.value) return
  plagiarismLoading.value = true
  try {
    const res = await api.get(`/assignment-submissions/assignment/${viewingAssignment.value.id}/plagiarism`)
    mergePlagiarismReports(res.data)
  } catch (e) {
    alert(e.response?.data?.message || 'Plagiat tekshiruvini bajarishda xatolik yuz berdi')
  } finally {
    plagiarismLoading.value = false
  }
}

const getPlagiarismLevel = (score) => {
  const value = Number(score || 0)
  if (value >= 80) return 'Yuqori xavf'
  if (value >= 50) return "O'rta xavf"
  if (value >= 25) return 'Past xavf'
  return 'Toza'
}

const getPlagiarismBoxClass = (score) => {
  const value = Number(score || 0)
  if (value >= 80) return 'border-red-200 bg-red-50 text-red-700'
  if (value >= 50) return 'border-amber-200 bg-amber-50 text-amber-700'
  if (value >= 25) return 'border-blue-200 bg-blue-50 text-blue-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

const getPlagiarismHint = (submission) => {
  const report = submission.plagiarismReport
  if (!report) return 'Hali tekshiruv bajarilmagan'
  if (!report.checkedSubmissions) return 'Taqqoslash uchun boshqa javoblar yo`q'
  if (report.matches?.[0]?.sameFile) return 'Bir xil fayl aniqlangan'
  if (report.matches?.length) return `${report.matches.length} ta o'xshash javob topildi`
  return 'Jiddiy o`xshashlik topilmadi'
}

const gradeSubmission = async (submission) => {
  const maxScore = Number(viewingAssignment.value?.maxScore || 100)
  const gradeScore = Number(submission.gradeScore)
  if (Number.isNaN(gradeScore) || gradeScore < 0 || gradeScore > maxScore) {
    return alert(`Ball 0 dan ${formatScore(maxScore)} gacha bo'lishi kerak`)
  }
  try {
    const res = await api.patch(`/assignment-submissions/${submission.id}/grade`, { gradeScore })
    submission.gradeScore = res.data.gradeScore
    alert('Ball saqlandi')
  } catch (e) {
    alert(e.response?.data?.message || 'Ballni saqlashda xatolik yuz berdi')
  }
}

const deleteAssignment = async () => {
  try {
    await api.delete(`/assignments/${deletingAssignment.value.id}`)
    showDeleteModal.value = false
    loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'O`chirishda xatolik yuz berdi')
  }
}

const downloadFile = (file) => {
  if (!file) return
  if (file.url) {
    const link = document.createElement('a')
    link.href = new URL(file.url, api.defaults.baseURL).href
    link.target = '_blank'
    link.rel = 'noopener'
    link.download = file.fileName || 'file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }
  if (!file.dataUrl) return
  const link = document.createElement('a')
  link.href = file.dataUrl
  link.download = file.fileName || 'file'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatScore = (value) => {
  const num = Number(value || 0)
  return Number.isInteger(num) ? num.toString() : num.toFixed(1).replace(/\.0$/, '')
}

onMounted(loadData)
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .2s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
