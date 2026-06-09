import { defineStore } from 'pinia'

const LANGUAGE_KEY = 'portal_language'

export const languages = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' }
]

const dictionary = {
  uz: {
    home: 'Bosh sahifa',
    users: 'Foydalanuvchilar',
    structure: 'Tizim tuzilmasi',
    tests: 'Testlar',
    testBank: 'Testlar bazasi',
    tasks: 'Topshiriqlar',
    analysis: 'Umumiy tahlil',
    reports: 'Hisobotlar',
    settings: 'Sozlamalar',
    logout: 'Chiqish',
    language: 'Til',
    notifications: 'Bildirishnomalar',
    markRead: "O'qildi",
    noMessages: "Xabarlar yo'q",
    new: 'Yangi',
    welcomeNotification: 'Tizimga xush kelibsiz!',
    newTest: 'Yangi test',
    newAssignment: 'Yangi topshiriq',
    newNotificationTitle: 'Sizda yangi bildirishnoma bor',
    newNotificationBody: "Yangi test yoki topshiriq biriktirilgan. Bildirishnomalar bo'limidan ko'rishingiz mumkin.",
    currentLanguage: "O'zbekcha",
    lightMode: 'Kunduzgi',
    darkMode: 'Tungi',
    version: 'Dastur versiyasi',
    date: 'Sana',
    page: 'Sahifa',
    confirmLogout: 'Rostdan ham tizimdan chiqmoqchimisiz?',
    now: 'Hozir',
    administrator: 'Administrator'
  },
  ru: {
    home: 'Главная',
    users: 'Пользователи',
    structure: 'Структура системы',
    tests: 'Тесты',
    testBank: 'База тестов',
    tasks: 'Задания',
    analysis: 'Общий анализ',
    reports: 'Отчеты',
    settings: 'Настройки',
    logout: 'Выход',
    language: 'Язык',
    notifications: 'Уведомления',
    markRead: 'Прочитано',
    noMessages: 'Нет сообщений',
    new: 'Новое',
    welcomeNotification: 'Добро пожаловать в систему!',
    newTest: 'Новый тест',
    newAssignment: 'Новое задание',
    newNotificationTitle: 'У вас новое уведомление',
    newNotificationBody: 'Назначен новый тест или задание. Его можно посмотреть в разделе уведомлений.',
    currentLanguage: 'Русский',
    lightMode: 'Светлая',
    darkMode: 'Темная',
    version: 'Версия программы',
    date: 'Дата',
    page: 'Страница',
    confirmLogout: 'Вы действительно хотите выйти из системы?',
    now: 'Сейчас',
    administrator: 'Администратор'
  },
  en: {
    home: 'Home',
    users: 'Users',
    structure: 'System structure',
    tests: 'Tests',
    testBank: 'Test bank',
    tasks: 'Assignments',
    analysis: 'Overview',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    notifications: 'Notifications',
    markRead: 'Read',
    noMessages: 'No messages',
    new: 'New',
    welcomeNotification: 'Welcome to the system!',
    newTest: 'New test',
    newAssignment: 'New assignment',
    newNotificationTitle: 'You have a new notification',
    newNotificationBody: 'A new test or assignment has been assigned. You can view it in notifications.',
    currentLanguage: 'English',
    lightMode: 'Light',
    darkMode: 'Dark',
    version: 'App version',
    date: 'Date',
    page: 'Page',
    confirmLogout: 'Do you really want to log out?',
    now: 'Now',
    administrator: 'Administrator'
  }
}

const staticDictionary = {
  "Testlar boshqaruvi": { ru: 'Управление тестами', en: 'Test management' },
  "Mening testlarim": { ru: 'Мои тесты', en: 'My tests' },
  "Yangi test yaratish": { ru: 'Создать тест', en: 'Create test' },
  "Yangi Test Yaratish": { ru: 'Создать тест', en: 'Create Test' },
  "Testni Tahrirlash": { ru: 'Редактировать тест', en: 'Edit Test' },
  "Test Nomi": { ru: 'Название теста', en: 'Test name' },
  "Tavsif (Ixtiyoriy)": { ru: 'Описание (необязательно)', en: 'Description (optional)' },
  "Davomiyligi": { ru: 'Длительность', en: 'Duration' },
  "Test bali": { ru: 'Балл теста', en: 'Test score' },
  "Muddati": { ru: 'Срок', en: 'Deadline' },
  "Fakultet va Guruhlar": { ru: 'Факультеты и группы', en: 'Faculties and groups' },
  "Fakultetlarni tanlang:": { ru: 'Выберите факультеты:', en: 'Select faculties:' },
  "Guruhlarni tanlang:": { ru: 'Выберите группы:', en: 'Select groups:' },
  "O'quvchilarni tanlang:": { ru: 'Выберите студентов:', en: 'Select students:' },
  "Barchasini tanlash": { ru: 'Выбрать все', en: 'Select all' },
  "Avval fakultetni tanlang": { ru: 'Сначала выберите факультет', en: 'Select a faculty first' },
  "Avval guruhni tanlang": { ru: 'Сначала выберите группу', en: 'Select a group first' },
  "Savollar": { ru: 'Вопросы', en: 'Questions' },
  "Excel Yuklash": { ru: 'Загрузить Excel', en: 'Upload Excel' },
  "Savol Qo'shish": { ru: 'Добавить вопрос', en: 'Add question' },
  "Format Yo'riqnomasi": { ru: 'Инструкция по формату', en: 'Format guide' },
  "Namunani yuklab olish": { ru: 'Скачать шаблон', en: 'Download sample' },
  "Fan bazasidan test tuzish": { ru: 'Составить тест из базы предмета', en: 'Create test from subject bank' },
  "Bazani boshqarish": { ru: 'Управление базой', en: 'Manage bank' },
  "Fan bazasini tanlang": { ru: 'Выберите базу предмета', en: 'Select subject bank' },
  "Random olish": { ru: 'Получить случайно', en: 'Get random' },
  "Olinmoqda...": { ru: 'Загрузка...', en: 'Loading...' },
  "Savollar qo'shilmagan": { ru: 'Вопросы не добавлены', en: 'No questions added' },
  "Saqlash": { ru: 'Сохранить', en: 'Save' },
  "Bekor qilish": { ru: 'Отмена', en: 'Cancel' },
  "Yuklanmoqda...": { ru: 'Загрузка...', en: 'Loading...' },
  "Ma'lumotlar topilmadi": { ru: 'Данные не найдены', en: 'No data found' },
  "Natijalar": { ru: 'Результаты', en: 'Results' },
  "Batafsil": { ru: 'Подробнее', en: 'Details' },
  "Topshirish": { ru: 'Пройти', en: 'Start' },
  "Muddati o'tgan": { ru: 'Срок истек', en: 'Expired' },
  "Faol": { ru: 'Активно', en: 'Active' },
  "Yakunlangan": { ru: 'Завершено', en: 'Finished' },
  "Izohsiz": { ru: 'Без описания', en: 'No description' },
  "Testlar bazasi": { ru: 'База тестов', en: 'Test bank' },
  "Excel orqali bazaga yuklash": { ru: 'Загрузка в базу через Excel', en: 'Upload to bank via Excel' },
  "Fan nomi": { ru: 'Название предмета', en: 'Subject name' },
  "Excelni bazaga yuklash": { ru: 'Загрузить Excel в базу', en: 'Upload Excel to bank' },
  "Hali fan bazasi yaratilmagan": { ru: 'База предметов еще не создана', en: 'No subject bank yet' },
  "Jami testlar": { ru: 'Всего тестов', en: 'Total tests' },
  "Bazadagi savollar": { ru: 'Вопросы в базе', en: 'Questions in bank' },
  "Fan bazalari": { ru: 'Базы предметов', en: 'Subject banks' },
  "Testlarga o'tish": { ru: 'Перейти к тестам', en: 'Go to tests' },
  "Foydalanuvchilar boshqaruvi": { ru: 'Управление пользователями', en: 'User management' },
  "Tizim tuzilmasi": { ru: 'Структура системы', en: 'System structure' },
  "Topshiriqlar boshqaruvi": { ru: 'Управление заданиями', en: 'Assignment management' },
  "Hisobotlar": { ru: 'Отчеты', en: 'Reports' },
  "Sozlamalar": { ru: 'Настройки', en: 'Settings' },
  "Umumiy tahlil": { ru: 'Общий анализ', en: 'Overview' },
  "Bosh sahifa": { ru: 'Главная', en: 'Home' },
  "Qolgan vaqt:": { ru: 'Оставшееся время:', en: 'Time left:' },
  "Oldingi": { ru: 'Предыдущий', en: 'Previous' },
  "Keyingi": { ru: 'Следующий', en: 'Next' },
  "Testni yakunlash": { ru: 'Завершить тест', en: 'Finish test' },
  "Tabriklaymiz!": { ru: 'Поздравляем!', en: 'Congratulations!' },
  "To'g'ri javoblar": { ru: 'Правильные ответы', en: 'Correct answers' },
  "Umumiy foiz": { ru: 'Общий процент', en: 'Total percent' },
  "Hisoblangan ball": { ru: 'Рассчитанный балл', en: 'Calculated score' },
  "Orqaga qaytish": { ru: 'Назад', en: 'Back' },
  "PDF yuklab olish": { ru: 'Скачать PDF', en: 'Download PDF' },
  "PDF tayyorlanmoqda...": { ru: 'PDF готовится...', en: 'Preparing PDF...' },
  "Profil rasmi": { ru: 'Фото профиля', en: 'Profile image' },
  "Ism": { ru: 'Имя', en: 'First name' },
  "Familiya": { ru: 'Фамилия', en: 'Last name' },
  "Email": { ru: 'Email', en: 'Email' },
  "Telefon": { ru: 'Телефон', en: 'Phone' },
  "Rol": { ru: 'Роль', en: 'Role' },
  "Parol": { ru: 'Пароль', en: 'Password' },
  "Fakultet": { ru: 'Факультет', en: 'Faculty' },
  "Guruh": { ru: 'Группа', en: 'Group' },
  "Jinsi": { ru: 'Пол', en: 'Gender' },
  "Erkak": { ru: 'Мужчина', en: 'Male' },
  "Ayol": { ru: 'Женщина', en: 'Female' },
  "O'chirishni tasdiqlang": { ru: 'Подтвердите удаление', en: 'Confirm deletion' },
  "Ha, o'chirilsin": { ru: 'Да, удалить', en: 'Yes, delete' },
  "Yo'q": { ru: 'Нет', en: 'No' },
  "Qidirish...": { ru: 'Поиск...', en: 'Search...' },
  "Masalan: Matematika": { ru: 'Например: Математика', en: 'For example: Mathematics' },
  "Masalan: Ona tili fanidan test...": { ru: 'Например: тест по родному языку...', en: 'Example: native language test...' },
  "Test haqida qisqacha ma'lumot...": { ru: 'Краткая информация о тесте...', en: 'Short information about the test...' },
  "Savol matni...": { ru: 'Текст вопроса...', en: 'Question text...' },
  "Soni": { ru: 'Кол-во', en: 'Count' }
}

const staticPatterns = [
  {
    uz: /^Tizimdagi barcha faol testlar ro'yxati \(Jami: (.+)\)$/,
    ru: value => `Список всех активных тестов (Всего: ${value})`,
    en: value => `List of all active tests (Total: ${value})`
  },
  {
    uz: /^Savollar \((.+)\)$/,
    ru: value => `Вопросы (${value})`,
    en: value => `Questions (${value})`
  },
  {
    uz: /^Savol (.+) \/ (.+)$/,
    ru: (current, total) => `Вопрос ${current} / ${total}`,
    en: (current, total) => `Question ${current} / ${total}`
  },
  {
    uz: /^(.+) ta savol$/,
    ru: value => `${value} вопросов`,
    en: value => `${value} questions`
  },
  {
    uz: /^(.+) min$/,
    ru: value => `${value} мин`,
    en: value => `${value} min`
  },
  {
    uz: /^(.+) ballik test$/,
    ru: value => `Тест на ${value} баллов`,
    en: value => `${value}-point test`
  }
]

const preserveWhitespace = (original, translated) => {
  const start = original.match(/^\s*/)?.[0] || ''
  const end = original.match(/\s*$/)?.[0] || ''
  return `${start}${translated}${end}`
}

export const translateStaticText = (text, locale = localStorage.getItem(LANGUAGE_KEY) || 'uz') => {
  if (!text || locale === 'uz') return text

  const raw = text.toString()
  const compact = raw.trim().replace(/\s+/g, ' ')
  if (!compact) return text

  const exact = staticDictionary[compact]?.[locale]
  if (exact) return preserveWhitespace(raw, exact)

  for (const pattern of staticPatterns) {
    const match = compact.match(pattern.uz)
    if (match) {
      const formatter = pattern[locale]
      if (formatter) return preserveWhitespace(raw, formatter(...match.slice(1)))
    }
  }

  return text
}

export const useLanguageStore = defineStore('language', {
  state: () => ({
    locale: localStorage.getItem(LANGUAGE_KEY) || 'uz'
  }),
  getters: {
    currentLanguage: (state) => languages.find(item => item.code === state.locale) || languages[0],
    t: (state) => (key) => dictionary[state.locale]?.[key] || dictionary.uz[key] || key,
    translateStatic: (state) => (text) => translateStaticText(text, state.locale)
  },
  actions: {
    setLocale(locale) {
      const nextLocale = languages.some(item => item.code === locale) ? locale : 'uz'
      this.locale = nextLocale
      localStorage.setItem(LANGUAGE_KEY, nextLocale)
      document.documentElement.lang = nextLocale
      window.dispatchEvent(new CustomEvent('portal-language-change', { detail: { locale: nextLocale } }))
    }
  }
})
