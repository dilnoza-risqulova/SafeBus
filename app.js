// EduBus Safe — Professional Role-Based Engine

const state = {
    currentRole: "device", // 'device', 'parent', 'admin'
    students: [],
    currentPage: 1,
    pageSize: 5,
    jwtAccessToken: null,
    jwtRefreshToken: null,
    bus: {
        id: 5,
        number: "05 | 01 777 BAA",
        driver: "Anvar Qodirov",
        route: "Chilonzor -> Maktab №110",
        speed: 42,
        lat: 41.2850,
        lng: 69.2050
    },
    logs: [],
    soundEnabled: true,
    parentMap: null,
    parentMarker: null,
    scanTimeout: null,
    activeParentId: null,
    currentLang: "uz",
    tgBotToken: "",
    tgChatId: ""
};

// Route Coordinates (Tashkent Route)
const routeCoordinates = [
    [41.2850, 69.2050],
    [41.2910, 69.2150],
    [41.2970, 69.2280],
    [41.3020, 69.2410],
    [41.3080, 69.2550],
    [41.3120, 69.2680]
];

// Initial Clean Database (Empty by default for manual registration)
const sampleStudentsData = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPersistentData();
    initClock();
    initRoleSwitcher();
    initRegistrationForm();
    initAudio();
    initLanguageSwitcher();
    initTelegramBotIntegration();
    renderAllViews();
});

// Searchable Multi-Language Selector Engine (100+ Global Languages)
const globalLanguagesList = [
    // Central Asia & Turkic Languages
    { code: "uz", name: "O'zbekcha", flag: "🇺🇿", region: "O'zbekiston" },
    { code: "kaa", name: "Qaraqalpaqsha", flag: "🇲🇿", region: "Qoraqalpog'iston" },
    { code: "kk", name: "Қазақша", flag: "🇰🇿", region: "Qozog'iston" },
    { code: "ky", name: "Кыргызча", flag: "🇰🇬", region: "Qirg'iziston" },
    { code: "tg", name: "Тоҷикӣ", flag: "🇹🇯", region: "Tojikiston" },
    { code: "tk", name: "Türkmençe", flag: "🇹🇲", region: "Turkmaniston" },
    { code: "az", name: "Azərbaycanca", flag: "🇦🇿", region: "Ozarbayjon" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷", region: "Turkiya" },
    { code: "ug", name: "Уйғурчә", flag: "🇨🇳", region: "Sintszyan" },
    { code: "tt", name: "Татарча", flag: "🇷🇺", region: "Tatariston" },
    { code: "ba", name: "Башҡортса", flag: "🇷🇺", region: "Boshqirdiston" },
    
    // International Majors & Europe
    { code: "en", name: "English (US)", flag: "🇺🇸", region: "United States" },
    { code: "en-gb", name: "English (UK)", flag: "🇬🇧", region: "United Kingdom" },
    { code: "ru", name: "Русский", flag: "🇷🇺", region: "Россия" },
    { code: "de", name: "Deutsch", flag: "🇩🇪", region: "Germany" },
    { code: "fr", name: "Français", flag: "🇫🇷", region: "France" },
    { code: "es", name: "Español", flag: "🇪🇸", region: "Spain" },
    { code: "it", name: "Italiano", flag: "🇮🇹", region: "Italy" },
    { code: "pt", name: "Português", flag: "🇵🇹", region: "Portugal" },
    { code: "pt-br", name: "Português (Brasil)", flag: "🇧🇷", region: "Brazil" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱", region: "Netherlands" },
    { code: "pl", name: "Polski", flag: "🇵🇱", region: "Poland" },
    { code: "uk", name: "Українська", flag: "🇺🇦", region: "Ukraine" },
    { code: "be", name: "Беларуская", flag: "🇧🇾", region: "Belarus" },

    // Middle East & North Africa
    { code: "ar", name: "العربية", flag: "🇸🇦", region: "Saudi Arabia" },
    { code: "ar-ae", name: "العربية (الإمارات)", flag: "🇦🇪", region: "UAE" },
    { code: "ar-eg", name: "العربية (مصر)", flag: "🇪🇬", region: "Egypt" },
    { code: "fa", name: "فارسی", flag: "🇮🇷", region: "Iran" },
    { code: "he", name: "עברית", flag: "🇮🇱", region: "Israel" },
    { code: "ps", name: "پښتو", flag: "🇦🇫", region: "Afghanistan" },

    // Asia & East Asia
    { code: "zh", name: "中文 (简体)", flag: "🇨🇳", region: "China" },
    { code: "zh-tw", name: "中文 (繁體)", flag: "🇹🇼", region: "Taiwan" },
    { code: "ja", name: "日本語", flag: "🇯🇵", region: "Japan" },
    { code: "ko", name: "한국어", flag: "🇰🇷", region: "South Korea" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳", region: "India" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩", region: "Bangladesh" },
    { code: "ur", name: "اردو", flag: "🇵🇰", region: "Pakistan" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳", region: "Vietnam" },
    { code: "th", name: "ไทย", flag: "🇹🇭", region: "Thailand" },
    { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾", region: "Malaysia" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩", region: "Indonesia" },
    { code: "fil", name: "Filipino", flag: "🇵🇭", region: "Philippines" },
    { code: "km", name: "ភាសាខ្មែរ", flag: "🇰🇭", region: "Cambodia" },
    { code: "my", name: "မြန်မာစာ", flag: "🇲🇲", region: "Myanmar" },

    // Europe & Balkans
    { code: "sv", name: "Svenska", flag: "🇸🇪", region: "Sweden" },
    { code: "no", name: "Norsk", flag: "🇳🇴", region: "Norway" },
    { code: "da", name: "Dansk", flag: "🇩🇰", region: "Denmark" },
    { code: "fi", name: "Suomi", flag: "🇫🇮", region: "Finland" },
    { code: "el", name: "Ελληνικά", flag: "🇬🇷", region: "Greece" },
    { code: "cs", name: "Čeština", flag: "🇨🇿", region: "Czechia" },
    { code: "sk", name: "Slovenčina", flag: "🇸🇰", region: "Slovakia" },
    { code: "hu", name: "Magyar", flag: "🇭🇺", region: "Hungary" },
    { code: "ro", name: "Română", flag: "🇷🇴", region: "Romania" },
    { code: "bg", name: "Български", flag: "🇧🇬", region: "Bulgaria" },
    { code: "hr", name: "Hrvatski", flag: "🇭🇷", region: "Croatia" },
    { code: "sr", name: "Српски", flag: "🇷🇸", region: "Serbia" },
    { code: "bs", name: "Bosanski", flag: "🇧🇦", region: "Bosnia" },
    { code: "sl", name: "Slovenščina", flag: "🇸🇮", region: "Slovenia" },
    { code: "sq", name: "Shqip", flag: "🇦🇱", region: "Albania" },
    { code: "mk", name: "Македонски", flag: "🇲К", region: "North Macedonia" },
    { code: "lt", name: "Lietuvių", flag: "🇱🇹", region: "Lithuania" },
    { code: "lv", name: "Latviešu", flag: "🇱🇻", region: "Latvia" },
    { code: "et", name: "Eesti", flag: "🇪🇪", region: "Estonia" },
    { code: "is", name: "Íslenska", flag: "🇮🇸", region: "Iceland" },
    { code: "hy", name: "Հայերեն", flag: "🇦🇲", region: "Armenia" },
    { code: "ka", name: "ქართული", flag: "🇬🇪", region: "Georgia" },

    // South Asia & Americas & Africa
    { code: "ta", name: "தமிழ்", flag: "🇮🇳", region: "Tamil Nadu / Sri Lanka" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳", region: "Andhra Pradesh" },
    { code: "mr", name: "मराठी", flag: "🇮🇳", region: "Maharashtra" },
    { code: "gu", name: "ગુજરાતી", flag: "🇮🇳", region: "Gujarat" },
    { code: "sw", name: "Kiswahili", flag: "🇰🇪", region: "Kenya / Tanzania" },
    { code: "ha", name: "Hausa", flag: "🇳🇬", region: "Nigeria" },
    { code: "yo", name: "Yorùbá", flag: "🇳🇬", region: "Nigeria" },
    { code: "am", name: "አማርኛ", flag: "🇪🇹", region: "Ethiopia" },
    { code: "zu", name: "isiZulu", flag: "🇿🇦", region: "South Africa" },
    { code: "af", name: "Afrikaans", flag: "🇿🇦", region: "South Africa" },
    { code: "mn", name: "Монгол", flag: "🇲🇳", region: "Mongolia" },
    { code: "ne", name: "नेपाली", flag: "🇳🇵", region: "Nepal" },
    { code: "si", name: "සිංහල", flag: "🇱🇰", region: "Sri Lanka" }
];

function initLanguageSwitcher() {
    const openBtn = document.getElementById("openLangModalBtn");
    const closeBtn = document.getElementById("closeLangModalBtn");
    const modal = document.getElementById("languageSearchModal");
    const searchInput = document.getElementById("langSearchInput");
    const grid = document.getElementById("globalLangGrid");
    const currentLangText = document.getElementById("currentLangText");

    if (!openBtn || !modal) return;

    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        searchInput.value = "";
        renderLanguageGrid(globalLanguagesList);
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = globalLanguagesList.filter(l => 
            l.name.toLowerCase().includes(query) || 
            l.region.toLowerCase().includes(query) || 
            l.code.toLowerCase().includes(query)
        );
        renderLanguageGrid(filtered);
    });

    function renderLanguageGrid(list) {
        grid.innerHTML = "";
        if (list.length === 0) {
            grid.innerHTML = `<p class="text-muted" style="grid-column: span 2; padding: 20px;">Topilmadi. 100+ tillar ro'yxati bazada mavjud.</p>`;
            return;
        }

        list.forEach(l => {
            const card = document.createElement("div");
            card.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s ease;";
            card.innerHTML = `<span style="font-size: 22px;">${l.flag}</span><div><div style="font-weight: 700; font-size: 14px;">${l.name}</div><div style="font-size: 11px; color: var(--text-muted);">${l.region}</div></div>`;

            card.addEventListener("click", () => {
                currentLangText.textContent = `${l.flag} ${l.name}`;
                modal.classList.add("hidden");
                playBeepSound("beep");
                applyLanguage(l.code);
                alert(`✅ SafeBus platformasi tili "${l.flag} ${l.name} (${l.region})" tiliga o'zgartirildi!`);
            });

            grid.appendChild(card);
        });
    }
}

// Dynamic Translation Dictionary for UI
const i18nDict = {
    uz: {
        roleBtn: "Rolni O'zgartirish",
        roleBadgePrefix: "Joriy Rol:",
        roleNameDevice: "Avtobus Skaner Qurilmasi",
        roleNameParent: "Ota-ona Portali",
        roleNameAdmin: "Maktab Admin Paneli",
        soundOn: "Tovush: YOQILGAN",
        soundOff: "Tovush: O'CHIRILGAN",
        terminalHeaderTag: "№110-Maktab • SafeBus №05 Terminali (Chilonzor yo'nalishi)",
        terminalBusCountText: "Avtobusdagi Bolalar:",
        terminalUnit: "ta",
        scanHeading: "Barmoq Izingizni Tekkizing",
        scanSubtext: "Barmog'ingizni biometrik skanerga bosib turing",
        simTitle: "Biometrik Skanerlash Simulyatsiyasi (Barmoq izi bosish):",
        scanBtn: "Barmoq Izini Skanerlash",
        childStatusTitle: "Farzandingiz Holati",
        pushStreamTitle: "SafeBus Push-Xabarnomalar Streami",
        regTitle: "Ro'yxatdan o'tkazish",
        lblFullName: "O'quvchi F.I.SH *",
        lblClassName: "Sinfi yoki Bog'cha Guruhi *",
        lblParentName: "Ota-onasi F.I.SH *",
        lblParentPhone: "Ota-onasi Telefoni *",
        lblFingerprint: "Biometrik Barmoq Izi ID *",
        lblOrg: "Tashkilot (Maktab / Bog'cha) *",
        lblBus: "Biriktirilgan Avtobus va Yo'nalish *",
        btnRegSubmit: "SafeBus Ro'yxatidan O'tkazish",
        lblTotalKids: "Jami Bolalar",
        lblOnBusKids: "Avtobusdagi Bolalar",
        lblAtSchoolKids: "Guruhga Kelganlar",
        lblAlerts: "Xavfsizlik Sinovlari",
        lblTableTitle: "SafeBus Baza Ro'yxati",
        parentLoginLabel: "Ota-ona Akkauntiga Kirish (Telefon raqam orqali):",
        parentOtpBadge: "4-xonalik SMS Kodi (OTP) Bilan Tasdiqlangan",
        mapTitle: "SafeBus №05 Live Xaritasi",
        mapRouteLabel: "Marshrut:",
        mapSpeedLabel: "Tezlik:",
        subTotal: "Ro'yxatdan o'tgan",
        subBus: "Faol qatnovda",
        subSchool: "Manzil binosida",
        phFullName: "Masalan: Ali Rahimov",
        phClass: "Masalan: 3-A sinf yoki Katta guruh",
        phParent: "Masalan: Farhod Rahimov",
        statusHome: "Uyda",
        statusBus: "Avtobusda",
        statusSchool: "Maktabda",
        lastTapLabel: "So'nggi barmoq izi skanerlash:",
        adminScanBtn: "Skanerlash",
        tableThId: "ID",
        tableThName: "F.I.SH",
        tableThClass: "Sinf / Guruh",
        tableThParent: "Ota-onasi",
        tableThPhone: "Telefon",
        tableThUid: "Biometrik ID",
        tableThStatus: "Joriy Holati",
        tableThActions: "Amallar",
        roleModalTitle: "SafeBus Tizimiga Kirish — Rolni Tanlang",
        roleModalDesc: "Foydalanuvchi turiga qarab mos interfeysga kiring:",
        roleCard1Title: "1. Avtobus Skaner Qurilmasi",
        roleCard1Desc: "Avtobus eshigi oldidagi planshet terminali. Barmoq izi rejimi.",
        roleCard1Btn: "Terminalni Ochish",
        roleCard2Title: "2. Ota-ona Portali",
        roleCard2Desc: "Farzandingiz holati, avtobus xaritasi va xabarnomalar.",
        roleCard2Btn: "Portalga Kirish",
        roleCard3Title: "3. SafeBus Admin Paneli",
        roleCard3Desc: "Ro'yxatdan o'tkazish, kartalar ulash va flotni boshqarish.",
        roleCard3Btn: "Admin Panelni Ochish"
    },
    kaa: {
        roleBtn: "Roldi O'zgertiw",
        roleBadgePrefix: "A'g'ımdag'ı Rol:",
        roleNameDevice: "Avtobus Skaner Qurılması",
        roleNameParent: "Ata-ana Portalı",
        roleNameAdmin: "Mektep Admin Paneli",
        soundOn: "Dawys: JAQAN",
        soundOff: "Dawys: O'SHIRILGAN",
        terminalHeaderTag: "№110-Mektep • SafeBus №05 Terminalı (Chilonzor bag'ıtı)",
        terminalBusCountText: "Avtobustag'ı Balalar:",
        terminalUnit: "bala",
        scanHeading: "Barmoq İzinizdi Tiygizin'",
        scanSubtext: "Barmog'in'izdi biometrik skanerge basip turin'",
        simTitle: "Skanerlew Simulyatsiyasi (Barmoq izin basiw):",
        scanBtn: "Barmoq İzin Skanerlew",
        childStatusTitle: "Peryentin'iz Halati",
        pushStreamTitle: "SafeBus Push-xabarnamalar Ag'imi",
        regTitle: "Rizimnan O'tkiziw",
        lblFullName: "O'quwshi F.I.SH *",
        lblClassName: "Sinti yaki Bog'sha Topari *",
        lblParentName: "Ata-anasinin' F.I.SH *",
        lblParentPhone: "Ata-anasinin' Telefoni *",
        lblFingerprint: "Biometrik Barmoq İz ID *",
        lblOrg: "Sholkem (Mektep / Bog'sha) *",
        lblBus: "Biriktirilgen Avtobus *",
        btnRegSubmit: "SafeBus Dizimine O'tkiziw",
        lblTotalKids: "Barlıq Balalar",
        lblOnBusKids: "Avtobustag'ı Balalar",
        lblAtSchoolKids: "Mektepke Kelgenler",
        lblAlerts: "Qawipsizlik Sinawları",
        lblTableTitle: "SafeBus Baza Dizimi",
        parentLoginLabel: "Ata-ana Akkauntına Kiriw (Telefon nomer arqalı):",
        parentOtpBadge: "4-xonalı SMS Kodı (OTP) Bilan Tasiyqlang'an",
        mapTitle: "SafeBus №05 Canlı Kartası",
        mapRouteLabel: "Marshrut:",
        mapSpeedLabel: "Tezlik:",
        subTotal: "Dizimnen o'tken",
        subBus: "Jolda",
        subSchool: "Mektep imaratında",
        phFullName: "Misal: Ali Rahimov",
        phClass: "Misal: 3-A klass",
        phParent: "Misal: Farhod Rahimov",
        statusHome: "U'yde",
        statusBus: "Avtobusta",
        statusSchool: "Mektepte",
        lastTapLabel: "Son'g'ı barmoq izin skanerlew:",
        adminScanBtn: "Skanerlew",
        tableThId: "ID",
        tableThName: "F.I.SH",
        tableThClass: "Sint / Topar",
        tableThParent: "Ata-anası",
        tableThPhone: "Telefon",
        tableThUid: "Biometrik ID",
        tableThStatus: "Halatı",
        tableThActions: "Amallar",
        roleModalTitle: "SafeBus Dizimine Kiriw — Roldi Saylan'",
        roleModalDesc: "Paydalanıwshı tu'rine qaray tiyisli interfeyske kirin':",
        roleCard1Title: "1. Avtobus Skaner Qurılması",
        roleCard1Desc: "Avtobus esigi aldındag'ı planshet terminalı. Barmoq izin skanerlew.",
        roleCard1Btn: "Terminaldı Ashıw",
        roleCard2Title: "2. Ata-ana Portalı",
        roleCard2Desc: "Peryentin'iz halatı, avtobus kartası ha'm xabarnamalar.",
        roleCard2Btn: "Portalga Kiriw",
        roleCard3Title: "3. SafeBus Admin Paneli",
        roleCard3Desc: "Dizimnen o'tkiziw, kartalardı biriktiriw ha'm flotı basqarıw.",
        roleCard3Btn: "Admin Paneldi Ashıw"
    },
    en: {
        roleBtn: "Switch Role",
        roleBadgePrefix: "Current Role:",
        roleNameDevice: "Bus Scanner Terminal",
        roleNameParent: "Parent Portal",
        roleNameAdmin: "School Admin Panel",
        soundOn: "Sound: ON",
        soundOff: "Sound: OFF",
        terminalHeaderTag: "School №110 • SafeBus Terminal №05 (Chilonzor Route)",
        terminalBusCountText: "Children on Bus:",
        terminalUnit: "kids",
        scanHeading: "Scan Your Fingerprint",
        scanSubtext: "Hold your finger on the biometric scanner",
        simTitle: "Biometric Scanning Simulation (Touch Fingerprint):",
        scanBtn: "Scan Fingerprint",
        childStatusTitle: "Child Status",
        pushStreamTitle: "SafeBus Push Notifications Stream",
        regTitle: "Student Registration",
        lblFullName: "Student Full Name *",
        lblClassName: "Class or Kindergarten Group *",
        lblParentName: "Parent Full Name *",
        lblParentPhone: "Parent Phone Number *",
        lblFingerprint: "Biometric Fingerprint ID *",
        lblOrg: "Organization (School / Kindergarten) *",
        lblBus: "Assigned Bus & Route *",
        btnRegSubmit: "Register to SafeBus",
        lblTotalKids: "Total Students",
        lblOnBusKids: "Students on Bus",
        lblAtSchoolKids: "Arrived at School",
        lblAlerts: "Safety Tests",
        lblTableTitle: "SafeBus Database List",
        parentLoginLabel: "Parent Account Login (via Phone Number):",
        parentOtpBadge: "Verified via 4-digit SMS OTP Code",
        mapTitle: "SafeBus №05 Live Map",
        mapRouteLabel: "Route:",
        mapSpeedLabel: "Speed:",
        subTotal: "Registered",
        subBus: "On active route",
        subSchool: "At destination",
        phFullName: "E.g.: John Smith",
        phClass: "E.g.: Grade 3-A",
        phParent: "E.g.: Robert Smith",
        statusHome: "At Home",
        statusBus: "On Bus",
        statusSchool: "At School",
        lastTapLabel: "Last Fingerprint Scan:",
        adminScanBtn: "Scan",
        tableThId: "ID",
        tableThName: "Full Name",
        tableThClass: "Class / Group",
        tableThParent: "Parent",
        tableThPhone: "Phone",
        tableThUid: "Biometric ID",
        tableThStatus: "Status",
        tableThActions: "Actions",
        roleModalTitle: "SafeBus Login — Select Your Role",
        roleModalDesc: "Select your interface based on user role:",
        roleCard1Title: "1. Bus Scanner Terminal",
        roleCard1Desc: "Tablet terminal at bus door. Biometric scan mode.",
        roleCard1Btn: "Open Terminal",
        roleCard2Title: "2. Parent Portal",
        roleCard2Desc: "Track your child status, live map, and alerts.",
        roleCard2Btn: "Enter Portal",
        roleCard3Title: "3. School Admin Panel",
        roleCard3Desc: "Register students/parents, link biometric IDs.",
        roleCard3Btn: "Open Admin Panel"
    },
    ru: {
        roleBtn: "Сменить Роль",
        roleBadgePrefix: "Текущая Роль:",
        roleNameDevice: "Терминал Сканера Автобуса",
        roleNameParent: "Портал Родителя",
        roleNameAdmin: "Панель Админа Школы",
        soundOn: "Звук: ВКЛ",
        soundOff: "Звук: ВЫКЛ",
        terminalHeaderTag: "Школа №110 • Терминал SafeBus №05 (Маршрут Чиланзар)",
        terminalBusCountText: "Дети в автобусе:",
        terminalUnit: "чел",
        scanHeading: "Приложите Отпечаток Пальца",
        scanSubtext: "Удерживайте палец на биометрическом сканере",
        simTitle: "Симуляция сканирования (Нажмите на отпечаток):",
        scanBtn: "Сканировать отпечаток",
        childStatusTitle: "Статус Ребенка",
        pushStreamTitle: "Лента Push-уведомлений SafeBus",
        regTitle: "Регистрация ученика",
        lblFullName: "Ф.И.О Ученика *",
        lblClassName: "Класс или Группа Сада *",
        lblParentName: "Ф.И.О Родителя *",
        lblParentPhone: "Телефон Родителя *",
        lblFingerprint: "Биометрический ID отпечатка *",
        lblOrg: "Организация (Школа / Сад) *",
        lblBus: "Закрепленный Автобус и Маршрут *",
        btnRegSubmit: "Зарегистрировать в SafeBus",
        lblTotalKids: "Всего Учеников",
        lblOnBusKids: "Дети в Автобусе",
        lblAtSchoolKids: "Прибыли в Школу",
        lblAlerts: "Тесты Безопасности",
        lblTableTitle: "База Данных SafeBus",
        parentLoginLabel: "Вход для Родителя (по номеру телефона):",
        parentOtpBadge: "Подтверждено через 4-значный SMS-код",
        mapTitle: "Живая Карта SafeBus №05",
        mapRouteLabel: "Маршрут:",
        mapSpeedLabel: "Скорость:",
        subTotal: "Зарегистрировано",
        subBus: "В пути",
        subSchool: "В здании",
        phFullName: "Например: Али Рахимов",
        phClass: "Например: 3-А класс",
        phParent: "Например: Фарход Рахимов",
        statusHome: "Дома",
        statusBus: "В автобусе",
        statusSchool: "В школе",
        lastTapLabel: "Последнее биометрическое сканирование:",
        adminScanBtn: "Сканировать",
        tableThId: "ID",
        tableThName: "Ф.И.О",
        tableThClass: "Класс / Группа",
        tableThParent: "Родитель",
        tableThPhone: "Телефон",
        tableThUid: "Биометрический ID",
        tableThStatus: "Статус",
        tableThActions: "Действия",
        roleModalTitle: "Вход в SafeBus — Выберите Роль",
        roleModalDesc: "Выберите интерфейс в зависимости от вашей роли:",
        roleCard1Title: "1. Терминал Сканера Автобуса",
        roleCard1Desc: "Планшетный терминал у двери. Режим биометрического сканирования.",
        roleCard1Btn: "Открыть Терминал",
        roleCard2Title: "2. Портал Родителя",
        roleCard2Desc: "Отслеживание статуса ребенка, карты и уведомлений.",
        roleCard2Btn: "Войти в Портал",
        roleCard3Title: "3. Панель Админа Школы",
        roleCard3Desc: "Регистрация учеников/родителей и управление автопарком.",
        roleCard3Btn: "Открыть Админ Панель"
    },
    kk: {
        roleBtn: "Рөлді Өзгерту",
        roleBadgePrefix: "Ағымдағы Рөл:",
        roleNameDevice: "Автобус Сканері Терминалы",
        roleNameParent: "Ата-ана Порталы",
        roleNameAdmin: "Мектеп Админ Панелі",
        soundOn: "Дыбыс: ҚОСУЛЫ",
        soundOff: "Дыбыс: ӨШІРУЛІ",
        terminalHeaderTag: "№110-Мектеп • SafeBus №05 Терминалы (Чилонзор бағыты)",
        terminalBusCountText: "Автобустағы балалар:",
        terminalUnit: "бала",
        scanHeading: "Саусақ Изін Тигізіңіз",
        scanSubtext: "Саусағыңызды биометриялық сканерде ұстаңыз",
        simTitle: "Сканерлеу симуляциясы (Саусақ изін басыңыз):",
        scanBtn: "Саусақ изін сканерлеу",
        childStatusTitle: "Баланың Мартебесі",
        pushStreamTitle: "SafeBus Push-хабарламалар ағыны",
        regTitle: "Тіркеу",
        lblFullName: "Оқушының Аты-жөні *",
        lblClassName: "Сынып немесе Балабақша Тобы *",
        lblParentName: "Ата-ананың Аты-жөні *",
        lblParentPhone: "Ата-ана Телефоны *",
        lblFingerprint: "Биометриялық Саусақ Изі ID *",
        lblOrg: "Ұйым (Мектеп / Балабақша) *",
        lblBus: "Бекітілген Автобус пен Бағыт *",
        btnRegSubmit: "SafeBus жүйесіне тіркеу",
        lblTotalKids: "Барлық Оқушылар",
        lblOnBusKids: "Автобустағы Балалар",
        lblAtSchoolKids: "Мектепке Келгендер",
        lblAlerts: "Қауіпсіздік Сынақтары",
        lblTableTitle: "SafeBus Деректер Базасы",
        parentLoginLabel: "Ата-ананың Тіркелгісіне Кіру (Телефон нөмірі арқылы):",
        parentOtpBadge: "4 таңбалы SMS OTP арқылы расталған",
        mapTitle: "SafeBus №05 Тікелей Картасы",
        mapRouteLabel: "Бағыт:",
        mapSpeedLabel: "Жылдамдық:",
        subTotal: "Тіркелді",
        subBus: "Жолда",
        subSchool: "Ғимаратта",
        phFullName: "Мысалы: Әли Рахимов",
        phClass: "Мысалы: 3-А сыныбы",
        phParent: "Мысалы: Фарход Рахимов",
        statusHome: "Үйде",
        statusBus: "Автобуста",
        statusSchool: "Мектепте",
        lastTapLabel: "Соңғы саусақ изін сканерлеу:",
        adminScanBtn: "Сканерлеу",
        tableThId: "ID",
        tableThName: "Аты-жөні",
        tableThClass: "Сынып / Топ",
        tableThParent: "Ата-анасы",
        tableThPhone: "Телефон",
        tableThUid: "Биометриялық ID",
        tableThStatus: "Мартебесі",
        tableThActions: "Әрекеттер",
        roleModalTitle: "SafeBus Жүйесіне Кіру — Рөлді Таңдаңыз",
        roleModalDesc: "Пайдаланушы түріне қарай тиісті интерфейске кіріңіз:",
        roleCard1Title: "1. Автобус Сканері Терминалы",
        roleCard1Desc: "Есік алдындағы планшет терминалы. Саусақ изін сканерлеу.",
        roleCard1Btn: "Терминалды Ашу",
        roleCard2Title: "2. Ата-ана Порталы",
        roleCard2Desc: "Баланың мартебесі, автобус картасы және хабарламалар.",
        roleCard2Btn: "Порталға Кіру",
        roleCard3Title: "3. Мектеп Админ Панелі",
        roleCard3Desc: "Оқушыларды тіркеу және флотты басқару.",
        roleCard3Btn: "Админ Панелді Ашу"
    },
    ky: {
        roleBtn: "Рөлдү Өзгөртүү",
        roleBadgePrefix: "Учурдагы Рөл:",
        roleNameDevice: "Автобус Сканери Терминалы",
        roleNameParent: "Ата-эне Порталы",
        roleNameAdmin: "Мектеп Админ Панели",
        soundOn: "Үн: КҮЙГҮЗҮЛГӨН",
        soundOff: "Үн: ӨЧҮРҮЛГӨН",
        terminalHeaderTag: "№110-Мектеп • SafeBus №05 Терминалы",
        terminalBusCountText: "Автобустагы балдар:",
        terminalUnit: "бала",
        scanHeading: "Манжа Изди Басыңыз",
        scanSubtext: "Манжаңызды биометрикалык сканерде кармаңыз",
        simTitle: "Сканерлөө симуляциясы (Манжа изин басыңыз):",
        scanBtn: "Манжа изин сканерлөө",
        childStatusTitle: "Баланын Статусу",
        pushStreamTitle: "SafeBus Push-кабарлоолор агымы",
        regTitle: "Катоо",
        lblFullName: "Окуучунун Аты-жөнү *",
        lblClassName: "Класс же Бала бакча тобу *",
        lblParentName: "Ата-эненин Аты-жөнү *",
        lblParentPhone: "Ата-эненин Телефону *",
        lblFingerprint: "Биометрикалык Манжа Из ID *",
        lblOrg: "Уюм (Мектеп / Бакча) *",
        lblBus: "Бириктирилген Автобус *",
        btnRegSubmit: "SafeBus тутумуна каттоо",
        lblTotalKids: "Бардык Окуучулар",
        lblOnBusKids: "Автобустагы Балдар",
        lblAtSchoolKids: "Мектепке Келгендер",
        lblAlerts: "Коопсуздук Сыноолору",
        lblTableTitle: "SafeBus Маалымат Базасы",
        parentLoginLabel: "Ата-эненин Аккаунтуна Кирүү (Телефон аркылуу):",
        parentOtpBadge: "4 орундуу SMS OTP аркылуу тастыкталган",
        mapTitle: "SafeBus №05 Картасы",
        mapRouteLabel: "Маршрут:",
        mapSpeedLabel: "Ылдамдык:",
        subTotal: "Катталды",
        subBus: "Жолдо",
        subSchool: "Имаратта",
        phFullName: "Мисалы: Али Рахимов",
        phClass: "Мисалы: 3-А класс",
        phParent: "Мисалы: Фарход Рахимов",
        statusHome: "Үйдө",
        statusBus: "Автобуста",
        statusSchool: "Мектепте",
        lastTapLabel: "Акыркы манжа изин сканерлөө:",
        adminScanBtn: "Сканерлөө",
        tableThId: "ID",
        tableThName: "Аты-жөнү",
        tableThClass: "Класс / Топ",
        tableThParent: "Ата-энеси",
        tableThPhone: "Телефон",
        tableThUid: "Биометрикалык ID",
        tableThStatus: "Статусу",
        tableThActions: "Аракеттер",
        roleModalTitle: "SafeBus Тутумуна Кирүү — Рөлдү Тандаңыз",
        roleModalDesc: "Колдонуучунун түрүнө жараша интерфейске кириңиз:",
        roleCard1Title: "1. Автобус Сканери Терминалы",
        roleCard1Desc: "Эшиктин алдындагы планшет терминалы.",
        roleCard1Btn: "Терминалды Ачуу",
        roleCard2Title: "2. Ата-эне Порталы",
        roleCard2Desc: "Баланын статусу жана карта.",
        roleCard2Btn: "Порталга Кирүү",
        roleCard3Title: "3. Мектеп Админ Панели",
        roleCard3Desc: "Окуучуларды каттоо.",
        roleCard3Btn: "Админ Панелди Ачуу"
    },
    tg: {
        roleBtn: "Иваз кардани нақш",
        roleBadgePrefix: "Нақши ҷорӣ:",
        roleNameDevice: "Терминали Сканери Автобус",
        roleNameParent: "Портали Валидон",
        roleNameAdmin: "Панели Админи Мактаб",
        soundOn: "Садо: ФАЪОЛ",
        soundOff: "Садо: ҒАЙРИФАЪОЛ",
        terminalHeaderTag: "Мактаби №110 • Терминали SafeBus №05",
        terminalBusCountText: "Кӯдакон дар автобус:",
        terminalUnit: "нафар",
        scanHeading: "Изди ангуштро гузоред",
        scanSubtext: "Ангушти худро дар сканери биометрӣ нигоҳ доред",
        simTitle: "Симулятсияи сканеркунӣ:",
        scanBtn: "Сканери изди ангушт",
        childStatusTitle: "Статуси кӯдак",
        pushStreamTitle: "Олбоми паёмҳои SafeBus",
        regTitle: "Рӯйхатгирӣ",
        lblFullName: "Н.Н.О. Талаба *",
        lblClassName: "Синф ё Гурӯҳ *",
        lblParentName: "Н.Н.О. Падар/Модар *",
        lblParentPhone: "Телефони Падар/Модар *",
        lblFingerprint: "ID Биометрии изди ангушт *",
        lblOrg: "Танзимгоҳ (Мактаб / Боғча) *",
        lblBus: "Автобуси пайвастшуда *",
        btnRegSubmit: "Ба SafeBus дохил кардан",
        lblTotalKids: "Ҷамъи кӯдакон",
        lblOnBusKids: "Кӯдакон дар автобус",
        lblAtSchoolKids: "Омадагон ба мактаб",
        lblAlerts: "Санҷиши бехатарӣ",
        lblTableTitle: "Рӯйхати пойгоҳи SafeBus",
        parentLoginLabel: "Воридшавӣ барои Валидон (тавассути телефон):",
        parentOtpBadge: "Бо коди SMS-и 4-рақама тасдиқ шудааст",
        mapTitle: "Харитаи SafeBus №05",
        mapRouteLabel: "Маршрут:",
        mapSpeedLabel: "Суръат:",
        subTotal: "Рӯйхат гирифта шуд",
        subBus: "Дар роҳ",
        subSchool: "Дар бино",
        phFullName: "Масалан: Алӣ Раҳимов",
        phClass: "Масалан: Синфи 3-А",
        phParent: "Масалан: Фарҳод Раҳимов",
        statusHome: "Дар хона",
        statusBus: "Дар автобус",
        statusSchool: "Дар мактаб",
        lastTapLabel: "Охирин сканери изди ангушт:",
        adminScanBtn: "Сканеркунӣ",
        tableThId: "ID",
        tableThName: "Н.Н.О",
        tableThClass: "Синф / Гурӯҳ",
        tableThParent: "Валидайн",
        tableThPhone: "Телефон",
        tableThUid: "Биометрика",
        tableThStatus: "Статус",
        tableThActions: "Амалҳо",
        roleModalTitle: "Воридшавӣ ба SafeBus — Нақшро интихоб кунед",
        roleModalDesc: "Интерфейсро интихоб кунед:",
        roleCard1Title: "1. Терминали Сканери Автобус",
        roleCard1Desc: "Терминали планшетӣ дар назди дари автобус.",
        roleCard1Btn: "Оғози Терминал",
        roleCard2Title: "2. Портали Валидон",
        roleCard2Desc: "Статуси кӯдак ва харита.",
        roleCard2Btn: "Ворид шудан",
        roleCard3Title: "3. Панели Админи Мактаб",
        roleCard3Desc: "Рӯйхатгирии талабагон.",
        roleCard3Btn: "Кушодани Панел"
    },
    tr: {
        roleBtn: "Rol Değiştir",
        roleBadgePrefix: "Mevcut Rol:",
        roleNameDevice: "Otobüs Tarayıcı Terminali",
        roleNameParent: "Veli Portalı",
        roleNameAdmin: "Okul Yönetim Paneli",
        soundOn: "Ses: AÇIK",
        soundOff: "Ses: KAPALI",
        terminalHeaderTag: "110 Nolu Okul • SafeBus №05 Terminali",
        terminalBusCountText: "Otobüsteki Çocuklar:",
        terminalUnit: "kisi",
        scanHeading: "Parmak İzinizi Okutun",
        scanSubtext: "Parmağınızı biyometrik tarayıcıda tutun",
        simTitle: "Tarama Simülasyonu (Parmak izine basın):",
        scanBtn: "Parmak İzi Tara",
        childStatusTitle: "Çocuğun Durumu",
        pushStreamTitle: "SafeBus Bildirim Akışı",
        regTitle: "Öğrenci Kaydı",
        lblFullName: "Öğrenci Adı Soyadı *",
        lblClassName: "Sınıf veya Anaokulu Grubu *",
        lblParentName: "Veli Adı Soyadı *",
        lblParentPhone: "Veli Telefonu *",
        lblFingerprint: "Biyometrik Parmak İzi ID *",
        lblOrg: "Kurum (Okul / Anaokulu) *",
        lblBus: "Atanan Otobüs ve Güzergah *",
        btnRegSubmit: "SafeBus'a Kaydet",
        lblTotalKids: "Toplam Öğrenci",
        lblOnBusKids: "Otobüsteki Öğrenciler",
        lblAtSchoolKids: "Okula Ulaşanlar",
        lblAlerts: "Güvenlik Testleri",
        lblTableTitle: "SafeBus Veritabanı Listesi",
        parentLoginLabel: "Veli Girişi (Telefon Numarası ile):",
        parentOtpBadge: "4 Haneli SMS OTP Kodu ile Doğrulandı",
        mapTitle: "SafeBus №05 Canlı Haritası",
        mapRouteLabel: "Güzergah:",
        mapSpeedLabel: "Hız:",
        subTotal: "Kayıtlı",
        subBus: "Yolda",
        subSchool: "Okulda",
        phFullName: "Örn: Ali Rahimov",
        phClass: "Örn: 3-A Sınıfı",
        phParent: "Örn: Farhod Rahimov",
        statusHome: "Evde",
        statusBus: "Otobüste",
        statusSchool: "Okulda",
        lastTapLabel: "Son Parmak İzi Taraması:",
        adminScanBtn: "Tarama",
        tableThId: "ID",
        tableThName: "Adı Soyadı",
        tableThClass: "Sınıf / Grup",
        tableThParent: "Velisi",
        tableThPhone: "Telefon",
        tableThUid: "Biyometrik ID",
        tableThStatus: "Durum",
        tableThActions: "İşlemler",
        roleModalTitle: "SafeBus Girişi — Rolünüzü Seçin",
        roleModalDesc: "Kullanıcı türüne göre arayüz seçin:",
        roleCard1Title: "1. Otobüs Tarayıcı Terminali",
        roleCard1Desc: "Otobüs kapısındaki tablet terminali.",
        roleCard1Btn: "Terminali Aç",
        roleCard2Title: "2. Veli Portalı",
        roleCard2Desc: "Çocuğun durumu ve canlı harita.",
        roleCard2Btn: "Portale Giriş",
        roleCard3Title: "3. Okul Yönetim Paneli",
        roleCard3Desc: "Öğrenci kaydı ve filo yönetimi.",
        roleCard3Btn: "Paneli Aç"
    }
};

function applyLanguage(code) {
    state.currentLang = code;
    const dict = i18nDict[code] || i18nDict["en"] || i18nDict["uz"];

    // 1. Role Indicator Badge & Role Button
    const prefix = dict.roleBadgePrefix || "Joriy Rol:";
    let roleName = dict.roleNameDevice || "Avtobus Skaner Qurilmasi";
    if (state.currentRole === "parent") roleName = dict.roleNameParent || "Ota-ona Portali";
    if (state.currentRole === "admin") roleName = dict.roleNameAdmin || "Maktab Admin Paneli";

    const roleIndicator = document.querySelector(".current-role-indicator span");
    if (roleIndicator) roleIndicator.innerHTML = `${prefix} <strong id="currentRoleText">${roleName}</strong>`;

    const openRoleSelectorBtn = document.getElementById("openRoleSelectorBtn");
    if (openRoleSelectorBtn) openRoleSelectorBtn.innerHTML = `<i class="fa-solid fa-repeat"></i> ${dict.roleBtn}`;

    // 2. Sound Button
    const soundBtn = document.getElementById("soundToggleBtn");
    if (soundBtn) {
        if (state.soundEnabled) {
            soundBtn.innerHTML = `<i class="fa-solid fa-volume-high" id="soundIcon"></i> ${dict.soundOn || "Tovush: YOQILGAN"}`;
        } else {
            soundBtn.innerHTML = `<i class="fa-solid fa-volume-xmark" id="soundIcon"></i> ${dict.soundOff || "Tovush: O'CHIRILGAN"}`;
        }
    }

    // 3. Terminal Header & Count Tag
    const busInfoTag = document.querySelector(".bus-info-tag span");
    if (busInfoTag && dict.terminalHeaderTag) busInfoTag.textContent = dict.terminalHeaderTag;

    const liveCountEl = document.querySelector(".terminal-live-count");
    if (liveCountEl && dict.terminalBusCountText) {
        const count = document.getElementById("terminalOnBusCount")?.textContent || "0";
        liveCountEl.innerHTML = `<i class="fa-solid fa-children"></i> ${dict.terminalBusCountText} <strong id="terminalOnBusCount">${count}</strong> ${dict.terminalUnit || 'ta'}`;
    }

    // 4. Scanner Heading & Buttons
    const scannerHeading = document.querySelector("#scannerReadyState h2");
    if (scannerHeading) scannerHeading.textContent = dict.scanHeading;

    const scannerSubtext = document.querySelector("#scannerReadyState .scan-subtext");
    if (scannerSubtext) scannerSubtext.textContent = dict.scanSubtext;

    const simTitle = document.querySelector(".terminal-simulation-bar h3");
    if (simTitle) simTitle.innerHTML = `<i class="fa-solid fa-fingerprint text-accent"></i> ${dict.simTitle}`;

    const manualScanBtn = document.getElementById("manualScanBtn");
    if (manualScanBtn) manualScanBtn.innerHTML = `<i class="fa-solid fa-fingerprint"></i> ${dict.scanBtn}`;

    // 5. Parent Portal Headers & Badges
    const childStatusTitle = document.querySelector("#viewParentPortal h2");
    if (childStatusTitle) childStatusTitle.innerHTML = `<i class="fa-solid fa-child-reaching text-accent"></i> ${dict.childStatusTitle}`;

    const pushStreamTitle = document.querySelector("#viewParentPortal .section-subheading");
    if (pushStreamTitle) pushStreamTitle.innerHTML = `<i class="fa-solid fa-bell"></i> ${dict.pushStreamTitle}`;

    const parentFilterLabel = document.querySelector(".parent-filter-card label");
    if (parentFilterLabel && dict.parentLoginLabel) parentFilterLabel.innerHTML = `<i class="fa-solid fa-mobile-screen-button text-accent"></i> ${dict.parentLoginLabel}`;

    const parentBadge = document.querySelector(".parent-filter-card .badge");
    if (parentBadge && dict.parentOtpBadge) parentBadge.innerHTML = `<i class="fa-solid fa-comment-sms"></i> ${dict.parentOtpBadge}`;

    const mapHeaderTitle = document.querySelector(".map-panel .panel-header h2");
    if (mapHeaderTitle && dict.mapTitle) mapHeaderTitle.innerHTML = `<i class="fa-solid fa-map-location-dot text-accent"></i> ${dict.mapTitle}`;

    // Admin Registration Form Labels & Placeholders
    const labels = document.querySelectorAll("#registerStudentForm label");
    if (labels && labels.length >= 7) {
        if (dict.lblFullName) labels[0].textContent = dict.lblFullName;
        if (dict.lblClassName) labels[1].textContent = dict.lblClassName;
        if (dict.lblParentName) labels[2].textContent = dict.lblParentName;
        if (dict.lblParentPhone) labels[3].textContent = dict.lblParentPhone;
        if (dict.lblFingerprint) labels[4].innerHTML = `<i class="fa-solid fa-fingerprint text-accent"></i> ${dict.lblFingerprint}`;
        if (dict.lblOrg) labels[5].textContent = dict.lblOrg;
        if (dict.lblBus) labels[6].textContent = dict.lblBus;
    }

    const regInputs = document.querySelectorAll("#registerStudentForm input");
    if (regInputs && regInputs.length >= 4) {
        if (dict.phFullName) regInputs[0].placeholder = dict.phFullName;
        if (dict.phClass) regInputs[1].placeholder = dict.phClass;
        if (dict.phParent) regInputs[2].placeholder = dict.phParent;
    }

    const regBtn = document.querySelector("#registerStudentForm button[type='submit']");
    if (regBtn && dict.btnRegSubmit) regBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> ${dict.btnRegSubmit}`;

    // Metrics Stats Titles & Subtexts
    const metricTitles = document.querySelectorAll(".metric-card h3");
    const metricSubs = document.querySelectorAll(".metric-card .metric-sub");
    if (metricTitles && metricTitles.length >= 4) {
        if (dict.lblTotalKids) metricTitles[0].textContent = dict.lblTotalKids;
        if (dict.lblOnBusKids) metricTitles[1].textContent = dict.lblOnBusKids;
        if (dict.lblAtSchoolKids) metricTitles[2].textContent = dict.lblAtSchoolKids;
        if (dict.lblAlerts) metricTitles[3].textContent = dict.lblAlerts;
    }
    if (metricSubs && metricSubs.length >= 3) {
        if (dict.subTotal) metricSubs[0].textContent = dict.subTotal;
        if (dict.subBus) metricSubs[1].textContent = dict.subBus;
        if (dict.subSchool) metricSubs[2].textContent = dict.subSchool;
    }

    const tableTitle = document.querySelector(".table-card .panel-header h2");
    if (tableTitle && dict.lblTableTitle) tableTitle.innerHTML = `<i class="fa-solid fa-users"></i> ${dict.lblTableTitle}`;

    renderParentPortal();
}

// Load persistent data from localStorage
function loadPersistentData() {
    try {
        const savedStudents = localStorage.getItem("safebus_students");
        if (savedStudents) {
            state.students = JSON.parse(savedStudents);
        }
        const savedLogs = localStorage.getItem("safebus_logs");
        if (savedLogs) {
            state.logs = JSON.parse(savedLogs);
        }
        state.tgBotToken = localStorage.getItem("safebus_tg_token") || "";
        state.tgChatId = localStorage.getItem("safebus_tg_chatid") || "";

        const tokenInput = document.getElementById("tgBotTokenInput");
        const chatIdInput = document.getElementById("tgChatIdInput");
        if (tokenInput && state.tgBotToken) tokenInput.value = state.tgBotToken;
        if (chatIdInput && state.tgChatId) chatIdInput.value = state.tgChatId;
    } catch (e) {
        console.error("Storage error", e);
    }
}

// Save persistent data to localStorage
function savePersistentData() {
    try {
        localStorage.setItem("safebus_students", JSON.stringify(state.students));
        localStorage.setItem("safebus_logs", JSON.stringify(state.logs));
        if (state.tgBotToken) localStorage.setItem("safebus_tg_token", state.tgBotToken);
        if (state.tgChatId) localStorage.setItem("safebus_tg_chatid", state.tgChatId);
    } catch (e) {
        console.error("Storage error", e);
    }
}

function sendRealTelegramMessage(textMessage, parentPhone = "") {
    fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            parentPhone: parentPhone,
            text: textMessage
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Telegram Real Notification Result:", data);
    })
    .catch(err => console.error("Telegram fetch error:", err));
}

function initTelegramBotIntegration() {
    const testBtn = document.getElementById("btnTestTelegram");
    if (!testBtn) return;

    testBtn.addEventListener("click", () => {
        const token = document.getElementById("tgBotTokenInput").value.trim();
        const chatId = document.getElementById("tgChatIdInput").value.trim();

        if (!token || !chatId) {
            alert("⚠️ Iltimos, Telegram Bot Token va Chat ID-ni kiriting!\n\n(Masalan BotFather bergan token va @userinfobot bergan Chat ID)");
            return;
        }

        state.tgBotToken = token;
        state.tgChatId = chatId;
        savePersistentData();

        const testMessage = `🚀 <b>SafeBus Telegram Bot Tizimi Ishga Tushdi!</b>\n\n✅ Bot muvaffaqiyatli ulindi!\nEndi farzandingiz avtobusda barmog'ini skanerga bosganda bu yerga lahzalik bildirishnomalar keladi!`;

        testBtn.disabled = true;
        testBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yuborilmoqda...`;

        fetch("/api/send-telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ botToken: token, chatId: chatId, text: testMessage })
        })
        .then(r => r.json())
        .then(res => {
            testBtn.disabled = false;
            testBtn.innerHTML = `<i class="fa-brands fa-telegram"></i> Botni Sinash (Test Message)`;
            if (res.success) {
                alert("✅ TEST XABARI TELEGRAMINGIZGA MUVAFFAQIYATLI YUBORILDI!\n\nTelegram ilovangizni tekshiring!");
            } else {
                alert("❌ Telegram API Xatosi: " + (res.error || "Token yoki Chat ID noto'g'ri. Botingizga /start bosganingizga ishonch hosil qiling."));
            }
        })
        .catch(err => {
            testBtn.disabled = false;
            testBtn.innerHTML = `<i class="fa-brands fa-telegram"></i> Botni Sinash (Test Message)`;
            alert("❌ Xatolik yuz berdi: " + err.message);
        });
    });
}

// Clock Engine
function initClock() {
    const clockEl = document.getElementById("liveClock");
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toTimeString().split(" ")[0];
    }, 1000);
}

// Sound Synthesis using Web Audio API
let audioCtx = null;
function initAudio() {
    document.getElementById("soundToggleBtn").addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;
        const dict = i18nDict[state.currentLang] || i18nDict["en"] || i18nDict["uz"];
        const btn = document.getElementById("soundToggleBtn");
        if (state.soundEnabled) {
            btn.innerHTML = `<i class="fa-solid fa-volume-high" id="soundIcon"></i> ${dict.soundOn || "Tovush: YOQILGAN"}`;
        } else {
            btn.innerHTML = `<i class="fa-solid fa-volume-xmark" id="soundIcon"></i> ${dict.soundOff || "Tovush: O'CHIRILGAN"}`;
        }
    });
}

function playBeepSound(type = "beep") {
    if (!state.soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === "beep") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // High C6 beep
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } else if (type === "alarm") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) { console.log(e); }
}

window.openRoleModal = function() {
    const modal = document.getElementById("roleModal");
    if (modal) modal.classList.remove("hidden");
};

window.openLanguageModal = function() {
    const modal = document.getElementById("languageSearchModal");
    if (modal) modal.classList.remove("hidden");
};

// Role Switcher Modal Logic
function initRoleSwitcher() {
    const modal = document.getElementById("roleModal");
    const openBtn = document.getElementById("openRoleSelectorBtn");

    if (openBtn) openBtn.addEventListener("click", openRoleModal);

    document.getElementById("selectRoleDevice").addEventListener("click", () => switchRole("device"));
    document.getElementById("selectRoleParent").addEventListener("click", () => switchRole("parent"));
    document.getElementById("selectRoleAdmin").addEventListener("click", () => switchRole("admin"));
}

function switchRole(role) {
    state.currentRole = role;
    document.getElementById("roleModal").classList.add("hidden");

    const dict = i18nDict[state.currentLang] || i18nDict["en"] || i18nDict["uz"];
    const prefix = dict.roleBadgePrefix || "Joriy Rol:";
    let roleName = dict.roleNameDevice || "Avtobus Skaner Qurilmasi";
    if (role === "parent") roleName = dict.roleNameParent || "Ota-ona Portali";
    if (role === "admin") roleName = dict.roleNameAdmin || "Maktab Admin Paneli";

    const roleIndicator = document.querySelector(".current-role-indicator span");
    if (roleIndicator) roleIndicator.innerHTML = `${prefix} <strong id="currentRoleText">${roleName}</strong>`;

    const drawerRoleLbl = document.getElementById("drawerRoleLabel");
    if (drawerRoleLbl) drawerRoleLbl.textContent = roleName;

    // Toggle Role Views
    document.getElementById("viewBusDevice").classList.toggle("active", role === "device");
    document.getElementById("viewParentPortal").classList.toggle("active", role === "parent");
    document.getElementById("viewAdminPanel").classList.toggle("active", role === "admin");

    if (role === "parent" && !state.parentMap) {
        setTimeout(initParentMap, 200);
    }
}

// Student Registration Logic
function initRegistrationForm() {
    const form = document.getElementById("registerStudentForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const fullName = document.getElementById("regFullName").value.trim();
        const className = document.getElementById("regClassName").value.trim();
        const parentName = document.getElementById("regParentName").value.trim();
        const parentPhone = document.getElementById("regParentPhone").value.trim();
        const cardUid = document.getElementById("regCardUid").value.trim().toUpperCase();
        const busId = parseInt(document.getElementById("regBusId").value);

        if (!fullName || !cardUid) return;

        // Check UID duplicate
        if (state.students.some(s => s.cardUid.toUpperCase() === cardUid)) {
            alert("Ushbu RFID Karta UID raqami allaqachon boshqa o'quvchiga biriktirilgan!");
            return;
        }

        const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

        const newStudent = {
            id: Date.now(),
            name: fullName,
            class: className,
            parent: parentName,
            phone: parentPhone,
            cardUid: cardUid,
            busId: busId,
            status: "home",
            avatar: initials || "ST"
        };

        state.students.push(newStudent);
        form.reset();
        alert(`O'quvchi "${fullName}" (Biometrik ID: ${cardUid}) muvaffaqiyatli ro'yxatdan o'tkazildi!`);

        renderAllViews();
    });

    // Admin Fingerprint Scanner Simulation Modal Logic
    const adminScanBtn = document.getElementById("adminScanFingerprintBtn");
    const adminModal = document.getElementById("adminScanModal");
    const adminScanBox = document.getElementById("adminModalScanBox");
    const adminScanIcon = document.getElementById("adminModalScanIcon");
    const adminScanStatus = document.getElementById("adminModalScanStatus");
    const closeAdminModalBtn = document.getElementById("closeAdminScanModalBtn");

    if (adminScanBtn && adminModal) {
        adminScanBtn.addEventListener("click", () => {
            adminModal.classList.remove("hidden");
            adminScanIcon.className = "fa-solid fa-fingerprint sensor-pulse-icon";
            adminScanIcon.style.color = "var(--accent-cyan)";
            adminScanStatus.textContent = "👇 Skanerlash uchun barmoq izini bosing!";
            adminScanStatus.style.color = "var(--text-muted)";
        });

        closeAdminModalBtn.addEventListener("click", () => {
            adminModal.classList.add("hidden");
        });

        adminScanBox.addEventListener("click", () => {
            playBeepSound("beep");
            adminScanStatus.textContent = "⏳ Barmoq izi tahlil qilinmoqda...";
            adminScanStatus.style.color = "var(--accent-yellow)";

            setTimeout(() => {
                const generatedFpId = "FP-" + Math.floor(1000 + Math.random() * 9000);
                document.getElementById("regCardUid").value = generatedFpId;

                adminScanIcon.className = "fa-solid fa-circle-check";
                adminScanIcon.style.color = "var(--accent-green)";
                adminScanStatus.textContent = `✅ Barmoq izi o'qildi! Biometrik ID: ${generatedFpId}`;
                adminScanStatus.style.color = "var(--accent-green)";

                setTimeout(() => {
                    adminModal.classList.add("hidden");
                }, 1200);
            }, 800);
        });
    }

    // Manual Scan Btn on Device View
    document.getElementById("manualScanBtn").addEventListener("click", () => {
        const uid = document.getElementById("manualCardUidInput").value.trim();
        if (uid) {
            processCardTapByUid(uid);
            document.getElementById("manualCardUidInput").value = "";
        }
    });

    // Emergency Alerts on Admin View
    document.getElementById("adminTriggerForgottenBtn").addEventListener("click", triggerForgottenChildAlarm);
    document.getElementById("adminTriggerSpeedBtn").addEventListener("click", triggerSpeedingAlarm);
    document.getElementById("adminDismissAlertBtn").addEventListener("click", () => {
        document.getElementById("adminAlertBanner").classList.add("hidden");
    });
}

// Render All Views Engine
function renderAllViews() {
    savePersistentData();
    renderTerminalQuickCards();
    renderParentDropdown();
    renderParentPortal();
    renderAdminTable();
    updateStats();
}

// DEDICATED BUS TERMINAL SCANNER LOGIC
function renderTerminalQuickCards() {
    const container = document.getElementById("terminalQuickCards");
    container.innerHTML = "";

    if (state.students.length === 0) {
        container.innerHTML = `<p class="text-muted" style="font-size:13px;">Hali birorta ham o'quvchi ro'yxatdan o'tmagan. Admin panelida o'quvchi qo'shing yoki Demo tugmasini bosing.</p>`;
        return;
    }

    state.students.forEach(s => {
        const btn = document.createElement("button");
        btn.className = "btn-quick-card";
        btn.innerHTML = `<i class="fa-solid fa-fingerprint"></i> <strong>${s.name}</strong> (${s.cardUid})`;
        btn.addEventListener("click", () => processCardTapByUid(s.cardUid));
        container.appendChild(btn);
    });
}

function processCardTapByUid(cardUid) {
    const student = state.students.find(s => s.cardUid.toUpperCase() === cardUid.toUpperCase());

    if (!student) {
        playBeepSound("alarm");
        alert(`NOMA'LUM BARMOQ IZI (${cardUid})! Ushbu o'quvchi biometrik bazada ro'yxatdan o'tmagan.`);
        return;
    }

    playBeepSound("beep");

    // Toggle Status
    const isBoarding = (student.status !== "bus");
    student.status = isBoarding ? "bus" : "school";
    const nowStr = new Date().toTimeString().split(" ")[0];
    student.lastTapTime = nowStr;

    // Terminal Hardware Animation
    const readyState = document.getElementById("scannerReadyState");
    const successState = document.getElementById("scannerSuccessState");

    readyState.classList.add("hidden");
    successState.classList.remove("hidden");

    document.getElementById("scanAvatarCircle").textContent = student.avatar;
    document.getElementById("terminalStudentName").textContent = student.name;
    document.getElementById("terminalStudentClass").textContent = `${student.class} Sinf • Biometrik ID: ${student.cardUid}`;
    
    // Check Subscription Payment Status
    if (student.subPaid === false) {
        pill.className = "status-action-pill pill-out";
        pill.style.background = "rgba(239, 68, 68, 0.2)";
        pill.style.borderColor = "#ef4444";
        pill.style.color = "#ef4444";
        pill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> OBUNA KUTILMOQDA (Obuna Tugagan)`;
        document.getElementById("terminalScanTime").textContent = `Xizmat obunasini uzaytirish lozim. Ota-onangizga xabar yuborildi.`;

        // Send Telegram Unpaid Warning to Parent
        const tgUnpaidMsg = `⚠️ <b>SafeBus Obuna Ogohlantirishi!</b>\n\nFarzandingiz <b>${student.name}</b> (${student.class}) biometrik skanerdan o'tdi.\n\n❌ <b>Holat:</b> Oylik xizmat obunasi muddati tugagan.\n📱 Telegram va GPS xabarnomalarini davom ettirish uchun Parent Portaldan Click yoki Payme orqali obunani uzaytiring.`;
        sendRealTelegramMessage(tgUnpaidMsg, student.phone);
        
        renderAllViews();
        return;
    }

    const pill = document.getElementById("terminalActionPill");
    pill.style.background = ""; pill.style.borderColor = ""; pill.style.color = "";
    if (isBoarding) {
        pill.className = "status-action-pill pill-in";
        pill.innerHTML = `<i class="fa-solid fa-circle-check"></i> CHECK-IN (Avtobusga Chiqdi)`;
    } else {
        pill.className = "status-action-pill pill-out";
        pill.innerHTML = `<i class="fa-solid fa-circle-check"></i> CHECK-OUT (Maktabda Tushdi)`;
    }

    document.getElementById("terminalScanTime").textContent = `${nowStr} • Bekat: Chilonzor`;

    // Progress Bar Reset Timer (Auto Reset in 2.5s for Next Student)
    const fill = document.getElementById("resetProgressFill");
    fill.style.transition = "none";
    fill.style.width = "100%";
    setTimeout(() => {
        fill.style.transition = "width 2.5s linear";
        fill.style.width = "0%";
    }, 50);

    clearTimeout(state.scanTimeout);
    state.scanTimeout = setTimeout(() => {
        successState.classList.add("hidden");
        readyState.classList.remove("hidden");
    }, 2500);

    // Push Notification stream update for Parent
    addPushNotification(student, isBoarding, nowStr);

    // Send Real Telegram Bot Notification (Dynamic Multi-Lingual Engine)
    const tgMsg = getMultiLingualTgMessage(student, isBoarding, nowStr);
    sendRealTelegramMessage(tgMsg, student.phone);

    renderAllViews();
}

function getMultiLingualTgMessage(student, isBoarding, nowStr) {
    const lang = student.lang || state.currentLang || "uz";
    const statusIcon = isBoarding ? "🟢" : "🔴";

    const templates = {
        uz: {
            title: "SafeBus Telegram Ogohlantirishi!",
            child: "Farzand:",
            time: "Vaqt:",
            status: "Holat:",
            boarding: "№05-Avtobusga chiqdi (Check-in)",
            unboarding: "Avtobusdan tushdi va Maktab №110 binosiga kirdi (Check-out)",
            footer: "📱 Ushbu xabar SafeBus Biometrik Skaneri tomonidan avtomatik yuborildi."
        },
        qq: {
            title: "SafeBus Telegram Eseptemesi!",
            child: "Bala:",
            time: "Vaqty:",
            status: "Jag'dayı:",
            boarding: "№05-Avtobusqa mindi (Check-in)",
            unboarding: "Avtobustan tu'sti ha'm Mektep bınasına kirdi (Check-out)",
            footer: "📱 Bul xabar SafeBus Biometrik Skaneri ta'repinen avtomatika jiberildi."
        },
        kk: {
            title: "SafeBus Telegram Хабарламасы!",
            child: "Бала:",
            time: "Уақыты:",
            status: "Күйі:",
            boarding: "№05-Автобусқа отырды (Check-in)",
            unboarding: "Автобустан түсіп, Мектеп ғимаратына кірді (Check-out)",
            footer: "📱 Бұл хабарлама SafeBus Биометрикалық Сканерімен жіберілді."
        },
        ru: {
            title: "Уведомление SafeBus!",
            child: "Ребенок:",
            time: "Время:",
            status: "Статус:",
            boarding: "Сел в Автобус №05 (Check-in)",
            unboarding: "Вышел из автобуса и вошел в Школу №110 (Check-out)",
            footer: "📱 Сообщение отправлено автоматически Биометрическим Сканером SafeBus."
        },
        en: {
            title: "SafeBus Telegram Alert!",
            child: "Child:",
            time: "Time:",
            status: "Status:",
            boarding: "Boarded Bus №05 (Check-in)",
            unboarding: "Disembarked bus and entered School №110 (Check-out)",
            footer: "📱 Automated notification by SafeBus Biometric Terminal."
        },
        tr: {
            title: "SafeBus Telegram Bildirimi!",
            child: "Çocuk:",
            time: "Zaman:",
            status: "Durum:",
            boarding: "№05 Otobüsüne Bindi (Check-in)",
            unboarding: "Otobüsten indi ve Okul №110 binasına girdi (Check-out)",
            footer: "📱 Bu mesaj SafeBus Biyometrik Taraması tarafından otomatik gönderildi."
        },
        tg: {
            title: "Огоҳии SafeBus Telegram!",
            child: "Фарзанд:",
            time: "Вақт:",
            status: "Ҳолат:",
            boarding: "Ба Автобуси №05 нишаст (Check-in)",
            unboarding: "Аз автобус фаромад ва ба Мактаби №110 даромад (Check-out)",
            footer: "📱 Ин паём тавассути Сканери Биометрикии SafeBus фиристода шуд."
        }
    };

    const t = templates[lang] || templates["uz"];
    const actionTxt = isBoarding ? t.boarding : t.unboarding;

    return `${statusIcon} <b>${t.title}</b>\n\n👤 <b>${t.child}</b> ${student.name} (${student.class})\n⏰ <b>${t.time}</b> ${nowStr}\n📍 <b>${t.status}</b> ${actionTxt}\n\n<i>${t.footer}</i>`;
}

// PARENT PORTAL ENGINE
function renderParentDropdown() {
    const select = document.getElementById("parentSelectDropdown");
    select.innerHTML = "";

    if (state.students.length === 0) {
        select.innerHTML = `<option value="">Ro'yxatda o'quvchilar yo'q</option>`;
        return;
    }

    state.students.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${s.parent} (Farzandi: ${s.name})`;
        select.appendChild(opt);
    });

    if (!state.activeParentId && state.students.length > 0) {
        state.activeParentId = state.students[0].id;
    }

    select.value = state.activeParentId;
    select.addEventListener("change", (e) => {
        state.activeParentId = parseInt(e.target.value);
        renderParentPortal();
    });
}

function renderParentPortal() {
    const student = state.students.find(s => s.id === state.activeParentId);
    if (!student) {
        const avatarEl = document.getElementById("parentChildAvatar");
        const nameEl = document.getElementById("parentChildName");
        const metaEl = document.getElementById("parentChildMeta");
        const badgeEl = document.getElementById("parentChildStatusBadge");
        const infoEl = document.getElementById("parentLastTapInfo");
        const stream = document.getElementById("parentPushStream");

        if (avatarEl) avatarEl.textContent = "--";
        if (nameEl) nameEl.textContent = "Hali o'quvchi kiritilmagan";
        if (metaEl) metaEl.textContent = "Admin panelidan o'quvchi ro'yxatdan o'tkazing";
        if (badgeEl) { badgeEl.textContent = "Kutilmoqda"; badgeEl.className = "badge badge-primary"; }
        if (infoEl) infoEl.innerHTML = `<i class="fa-solid fa-clock"></i> Skanerlashlar mavjud emas`;
        if (stream) stream.innerHTML = `<p class="text-muted" style="font-size:13px; padding:15px;">Hali birorta ham o'quvchi ro'yxatdan o'tkazilmagan.</p>`;
        return;
    }

    const dict = i18nDict[state.currentLang] || i18nDict["en"] || i18nDict["uz"];

    document.getElementById("parentChildAvatar").textContent = student.avatar;
    document.getElementById("parentChildName").textContent = student.name;
    document.getElementById("parentChildMeta").textContent = `${student.class} • №05 Avtobus`;
    
    let statusText = dict.statusHome || "Uyda";
    let badgeClass = "badge-primary";
    if (student.status === "bus") { statusText = dict.statusBus || "Avtobusda"; badgeClass = "badge-warning"; }
    if (student.status === "school") { statusText = dict.statusSchool || "Maktabda"; badgeClass = "badge-success"; }

    document.getElementById("parentChildStatusBadge").textContent = statusText;
    document.getElementById("parentChildStatusBadge").className = `badge ${badgeClass}`;

    const lastTime = student.lastTapTime || "--:--:--";
    const lastLabel = dict.lastTapLabel || "So'nggi barmoq izi skanerlash:";
    document.getElementById("parentLastTapInfo").innerHTML = `<i class="fa-solid fa-clock"></i> ${lastLabel} ${lastTime}`;

    // STRICT MULTI-PARENT ISOLATION: Render ONLY active parent's child notifications
    const stream = document.getElementById("parentPushStream");
    if (stream) {
        stream.innerHTML = "";
        const notifs = student.notifications || [];
        if (notifs.length === 0) {
            stream.innerHTML = `<p class="text-muted" style="font-size:13px; padding:15px;">Hali ${student.name} uchun bildirishnomalar mavjud emas.</p>`;
        } else {
            notifs.forEach(n => {
                const pushEl = document.createElement("div");
                pushEl.className = `push-card ${n.isBoarding ? 'push-primary' : 'push-success'}`;
                pushEl.innerHTML = `
                    <div class="push-header">
                        <span><i class="fa-solid fa-bus"></i> SafeBus Push</span>
                        <span>${n.time}</span>
                    </div>
                    <h4>${n.name} (${n.class})</h4>
                    <p>Farzandingiz soat ${n.time} da ${n.text}</p>
                `;
                stream.appendChild(pushEl);
            });
        }
    }
}

function addPushNotification(student, isBoarding, timeStr) {
    if (!student.notifications) student.notifications = [];
    
    const actionText = isBoarding 
        ? "№05-avtobusga chiqdi 🟢. Avtobus maktab tomonga yo'l oldi." 
        : "avtobusdan eson-omon tushdi 🔴 (Maktab №110 binosi).";

    const notifObj = {
        time: timeStr,
        name: student.name,
        class: student.class,
        isBoarding: isBoarding,
        text: actionText
    };

    student.notifications.unshift(notifObj);

    // STRICT MULTI-PARENT FILTER: Show push stream and Toast ONLY if active parent matches this child!
    if (student.id === state.activeParentId) {
        const stream = document.getElementById("parentPushStream");
        const pushEl = document.createElement("div");
        pushEl.className = `push-card ${isBoarding ? 'push-primary' : 'push-success'}`;
        pushEl.innerHTML = `
            <div class="push-header">
                <span><i class="fa-solid fa-bus"></i> SafeBus Push</span>
                <span>${timeStr}</span>
            </div>
            <h4>${student.name} (${student.class})</h4>
            <p>Farzandingiz soat ${timeStr} da ${actionText}</p>
        `;
        if (stream) stream.insertBefore(pushEl, stream.firstChild);

        showSmsToastNotification(student, isBoarding, timeStr);
    }
}

function showSmsToastNotification(student, isBoarding, timeStr) {
    let toastContainer = document.getElementById("smsToastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "smsToastContainer";
        toastContainer.style.cssText = "position: fixed; top: 30px; right: 30px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.style.cssText = "background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 2px solid #0088cc; border-left: 6px solid #22c55e; border-radius: 14px; padding: 16px 20px; color: #fff; font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 12px 40px rgba(0,0,0,0.6); pointer-events: auto; max-width: 400px; transform: translateX(100px); opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);";
    
    const icon = isBoarding ? "🟢" : "🔴";
    const statusTxt = isBoarding ? "№05 Avtobusga chiqdi (Check-in)" : "Maktab №110 ga keldi (Check-out)";

    toast.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <strong style="color: #38bdf8; font-size: 13px; display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-comment-sms" style="font-size: 16px; color: #22c55e;"></i> REAL SMS XABARNOMASI</strong>
            <span style="font-size: 11px; opacity: 0.8; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px;">${timeStr}</span>
        </div>
        <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px; color: #f8fafc;">${icon} ${student.name} (${student.class})</div>
        <div style="font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">📱 Ota-ona telefoni (${student.phone}): Farzandingiz soat ${timeStr} da ${statusTxt}.</div>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ADMIN PANEL MANAGEMENT WITH PAGINATION
function renderAdminTable() {
    const tbody = document.getElementById("adminStudentsTableBody");
    tbody.innerHTML = "";

    const totalStudents = state.students.length;
    document.getElementById("adminTableCount").textContent = totalStudents;

    const infoText = document.getElementById("paginationInfoText");
    const pageNumbersSpan = document.getElementById("paginationPageNumbers");
    const btnPrev = document.getElementById("btnPagePrev");
    const btnNext = document.getElementById("btnPageNext");

    if (totalStudents === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:20px;">Ro'yxat bo'sh. Yuqoridagi formadan o'quvchi qo'shing.</td></tr>`;
        if (infoText) infoText.textContent = "Ko'rsatilmoqda: 0 - 0 (Jami 0 ta)";
        if (pageNumbersSpan) pageNumbersSpan.textContent = "Sahifa 1 / 1";
        if (btnPrev) btnPrev.disabled = true;
        if (btnNext) btnNext.disabled = true;
        return;
    }

    // Enterprise Pagination Slicing
    const pageSize = state.pageSize || 5;
    const totalPages = Math.ceil(totalStudents / pageSize);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIdx = (state.currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalStudents);
    const paginatedStudents = state.students.slice(startIdx, endIdx);

    if (infoText) infoText.textContent = `Ko'rsatilmoqda: ${startIdx + 1} - ${endIdx} (Jami ${totalStudents} ta)`;
    if (pageNumbersSpan) pageNumbersSpan.textContent = `Sahifa ${state.currentPage} / ${totalPages}`;

    if (btnPrev) {
        btnPrev.disabled = state.currentPage <= 1;
        btnPrev.onclick = () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderAdminTable();
            }
        };
    }

    if (btnNext) {
        btnNext.disabled = state.currentPage >= totalPages;
        btnNext.onclick = () => {
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderAdminTable();
            }
        };
    }

    paginatedStudents.forEach(s => {
        const tr = document.createElement("tr");
        let statusBadge = `<span class="badge badge-primary">Uyda</span>`;
        if (s.status === "bus") statusBadge = `<span class="badge badge-warning">Avtobusda</span>`;
        if (s.status === "school") statusBadge = `<span class="badge badge-success">Maktabda</span>`;

        tr.innerHTML = `
            <td>#${s.id}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.class}</td>
            <td>${s.parent}</td>
            <td>${s.phone}</td>
            <td><code>${s.cardUid}</code></td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-xs btn-danger" onclick="deleteStudent(${s.id})">
                    <i class="fa-solid fa-trash"></i> O'chirish
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteStudent = function(id) {
    if (confirm("Ushbu o'quvchini ro'yxatdan o'chirishni tasdiqlaysizmi?")) {
        state.students = state.students.filter(s => s.id !== id);
        renderAllViews();
    }
};

function updateStats() {
    const onBusCount = state.students.filter(s => s.status === "bus").length;
    const atSchoolCount = state.students.filter(s => s.status === "school").length;

    document.getElementById("terminalOnBusCount").textContent = onBusCount;
    document.getElementById("adminTotalStudents").textContent = state.students.length;
    document.getElementById("adminOnBusCount").textContent = onBusCount;
    document.getElementById("adminAtSchoolCount").textContent = atSchoolCount;
}

// Emergency Alarms
function triggerForgottenChildAlarm() {
    playBeepSound("alarm");

    const banner = document.getElementById("adminAlertBanner");
    banner.classList.remove("hidden");
    document.getElementById("adminAlertBannerTitle").textContent = "⚠️ SHOSHILINCH TREVOGA: Avtobusda Bola Qolib Ketishi Mumkin!";
    document.getElementById("adminAlertBannerBody").textContent = "№05 Avtobus maktabga yetib keldi, ammo o'quvchilardan biri tushishda barmoq izini skanerlamadi! Haydovchi avtobusni ko'zdan kechirishi shart.";
}

function triggerSpeedingAlarm() {
    playBeepSound("alarm");

    const banner = document.getElementById("adminAlertBanner");
    banner.classList.remove("hidden");
    document.getElementById("adminAlertBannerTitle").textContent = "⚠️ TEZLIK OSHIRILDI: №05 Avtobus Xavfsizlik Me'yoridan Oshdi!";
    document.getElementById("adminAlertBannerBody").textContent = "№05 Avtobus tezligi 64 km/soat ga yetdi (Me'yor: 50 km/s). Haydovchiga avtomatik ogohlantirish yuborildi.";
}

// Parent Live Map
let currentRouteIndex = 0;
let hasAlerted5MinEta = false;

function initParentMap() {
    state.parentMap = L.map("parentBusMap", {
        maxZoom: 19,
        minZoom: 3
    }).setView([41.2995, 69.2401], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
        minZoom: 3
    }).addTo(state.parentMap);

    const routePolyline = L.polyline(routeCoordinates, { color: "#06b6d4", weight: 5, opacity: 0.8 }).addTo(state.parentMap);
    state.parentMap.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });

    const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: `<div style="background:#06b6d4; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 15px #06b6d4; font-size:18px;"><i class="fa-solid fa-bus"></i></div>`,
        iconSize: [36, 36]
    });

    state.parentMarker = L.marker(routeCoordinates[0], { icon: busIcon }).addTo(state.parentMap)
        .bindPopup("<b>№05 Maktab Avtobusi</b>");

    setInterval(() => {
        currentRouteIndex = (currentRouteIndex + 1) % routeCoordinates.length;
        const newPos = routeCoordinates[currentRouteIndex];
        if (state.parentMarker) state.parentMarker.setLatLng(newPos);

        // 5-Minute Proximity Geofence Alert (Triggers when bus is 5 minutes from child's home)
        if (currentRouteIndex === 2 && !hasAlerted5MinEta) {
            hasAlerted5MinEta = true;
            const activeStudent = state.students.find(s => s.id === state.activeParentId) || state.students[0];
            const nowTimeStr = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
            
            const etaMsg = `🚏 <b>SafeBus Tezkor Ogohlantirishi!</b>\n\n👤 <b>Farzand:</b> ${activeStudent ? activeStudent.name : 'Ali Rahimov'}\n🚌 <b>Avtobus:</b> №05-Maktab Avtobusi\n⏱️ <b>Holat:</b> Taxminan <b>5 daqiqada</b> uyingiz bekatiga yetib keladi.\n\n<i>📍 Iltimos, farzandingizni kutib olish uchun bekatga chiqishga tayyorlaning!</i>`;
            
            if (activeStudent) {
                sendRealTelegramMessage(etaMsg, activeStudent.phone);
            }
        }
    }, 4000);

    initLiveAddressSearch();
}

function initLiveAddressSearch() {
    const input = document.getElementById("mapAddressSearchInput");
    const btn = document.getElementById("btnSearchAddressMap");

    const performGeocodeSearch = async () => {
        const query = input.value.trim();
        if (!query) return;

        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Qidirilmoqda...`;

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            const results = await res.json();

            if (results && results.length > 0) {
                const first = results[0];
                const lat = parseFloat(first.lat);
                const lon = parseFloat(first.lon);

                if (state.parentMap) {
                    state.parentMap.setView([lat, lon], 15);
                    if (state.parentMarker) {
                        state.parentMarker.setLatLng([lat, lon]);
                        state.parentMarker.bindPopup(`<b>📍 ${first.display_name}</b>`).openPopup();
                    }
                }
                btn.innerHTML = `<i class="fa-solid fa-check text-success"></i> Topildi!`;
                setTimeout(() => btn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Qidirish`, 1500);
            } else {
                alert(`Manzil topilmadi: "${query}". Iltimos, qayta kiriting (masalan: Guliston, Sirdaryo).`);
                btn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Qidirish`;
            }
        } catch (e) {
            btn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Qidirish`;
        }
    };

    if (btn) btn.addEventListener("click", performGeocodeSearch);
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") performGeocodeSearch();
        });
    }
}

// Click & Payme Merchant Subscription Payment Engine
function initPaymentHandlers() {
    const payModal = document.getElementById("paymentModal");
    const closeBtn = document.getElementById("closePayModal");
    const btnConfirm = document.getElementById("btnConfirmPayNow");
    const btnOpenModal = document.getElementById("btnOpenSubModal");

    if (btnOpenModal) {
        btnOpenModal.addEventListener("click", () => openPayModal("CLICK & PAYME CHECKOUT"));
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", () => payModal.style.display = "none");
    }
    if (btnConfirm) {
        btnConfirm.addEventListener("click", () => {
            const student = state.students.find(s => s.id === state.activeParentId);
            if (student) {
                student.subPaid = true;
                savePersistentData();
                renderParentPortal();
                alert(`✅ MUVAFFAQIYATLI TO'LOV!\n\n${student.name} uchun 20,000 UZS oylik obuna muvaffaqiyatli uzaytirildi (30 Kun Faol).`);
            }
            if (payModal) payModal.style.display = "none";
        });
    }
}

function openPayModal(providerName) {
    const student = state.students.find(s => s.id === state.activeParentId);
    const payModal = document.getElementById("paymentModal");
    if (!payModal) return;

    document.getElementById("payModalTitle").innerHTML = `<i class="fa-solid fa-qrcode"></i> ${providerName}`;
    document.getElementById("payModalLogo").textContent = providerName;
    document.getElementById("payModalLogo").style.color = providerName.includes("CLICK") ? "#0088cc" : "#00cccc";
    document.getElementById("payModalStudentName").textContent = `O'quvchi: ${student ? student.name : "Ali Rahimov"}`;
    document.getElementById("payTxCode").textContent = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    payModal.style.display = "flex";
}

document.addEventListener("DOMContentLoaded", () => {
    initPaymentHandlers();
    const btnDrawer = document.getElementById("btnOpenMobileDrawer");
    if (btnDrawer) btnDrawer.addEventListener("click", window.openMobileDrawer);
});

// Telegram-Style Side Drawer Menu Controllers
window.openMobileDrawer = function() {
    const overlay = document.getElementById("mobileDrawerOverlay");
    if (overlay) {
        let student = state.students.find(s => s.id === state.activeParentId);
        if (!student && state.students.length > 0) {
            student = state.students[0];
        }

        const nameEl = document.getElementById("drawerUserName");
        const phoneEl = document.getElementById("drawerUserPhone");
        const avatarEl = document.getElementById("drawerAvatar");

        if (student) {
            if (avatarEl) avatarEl.textContent = student.avatar || "SB";
            if (nameEl) nameEl.textContent = student.parent || student.name;
            if (phoneEl) phoneEl.textContent = `📱 ${student.phone || '+998 90 123 45 67'} (OTP Verified)`;
        } else {
            if (avatarEl) avatarEl.textContent = "SB";
            if (nameEl) nameEl.textContent = "SafeBus Profil";
            if (phoneEl) phoneEl.textContent = "📱 Tizimga Ulangan (OTP Verified)";
        }
        overlay.style.display = "flex";
    }
};

window.closeMobileDrawer = function() {
    const overlay = document.getElementById("mobileDrawerOverlay");
    if (overlay) overlay.style.display = "none";
};

window.openParentOtpModal = function() {
    const modal = document.getElementById("parentOtpModal");
    if (modal) {
        document.getElementById("otpStep1").style.display = "block";
        document.getElementById("otpStep2").style.display = "none";
        document.getElementById("otpStatusMsg").textContent = "";
        modal.classList.remove("hidden");
    }
};

let generatedOtpCode = "";

function initOtpAuth() {
    const btnSend = document.getElementById("btnSendOtpCode");
    const btnVerify = document.getElementById("btnVerifyOtpCode");

    if (btnSend) {
        btnSend.addEventListener("click", async () => {
            const phone = document.getElementById("otpPhoneInput").value.trim();
            const statusMsg = document.getElementById("otpStatusMsg");
            if (!phone) {
                statusMsg.style.color = "#ff2744";
                statusMsg.textContent = "Iltimos, telefon raqamingizni kiriting!";
                return;
            }

            const normEnteredPhone = phone.replace(/[^\d]/g, "");

            // STRICT CHECK: Verify if this phone number was registered by School Admin
            const matchingStudent = state.students.find(s => {
                const sPhone = (s.phone || "").replace(/[^\d]/g, "");
                return sPhone.includes(normEnteredPhone) || normEnteredPhone.includes(sPhone) || phone.includes(s.phone);
            });

            if (!matchingStudent) {
                statusMsg.style.color = "#ff2744";
                statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <b>TAQIQLANDI!</b> Sizning telefon raqamingiz (<b>${phone}</b>) maktab bazasida ro'yxatdan o'tmagan!<br><small style="color: #cbd5e1;">Akkount faqat Maktab Admini tomonidan yaratiladi.</small>`;
                return;
            }

            // Bind active parent to the matched student
            state.activeParentId = matchingStudent.id;
            renderParentPortal();

            statusMsg.style.color = "#38bdf8";
            statusMsg.textContent = "⏳ Telegram Botga 4-xonali tasdiqlash kodi yuborilmoqda...";

            try {
                const res = await fetch("/api/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ parentPhone: phone })
                });
                const data = await res.json();
                if (data.success) {
                    generatedOtpCode = data.otpCode;
                    document.getElementById("otpStep1").style.display = "none";
                    document.getElementById("otpStep2").style.display = "block";
                    statusMsg.style.color = "#00e676";
                    statusMsg.textContent = data.sentViaTelegram 
                        ? `✅ Kod Telegram Botingizga yuborildi! (Demo kod: ${data.otpCode})`
                        : `🔑 Telegram Botingizga kod yuborildi: ${data.otpCode}`;
                }
            } catch (e) {
                statusMsg.style.color = "#00e676";
                statusMsg.textContent = "Demo OTP SMS kod: 8492";
                generatedOtpCode = "8492";
                document.getElementById("otpStep1").style.display = "none";
                document.getElementById("otpStep2").style.display = "block";
            }
        });
    }

    if (btnVerify) {
        btnVerify.addEventListener("click", () => {
            const code = document.getElementById("otpCodeInput").value.trim();
            const statusMsg = document.getElementById("otpStatusMsg");
            if (code === generatedOtpCode || code === "8492") {
                statusMsg.style.color = "#00e676";
                statusMsg.textContent = "🎉 Muvaffaqiyatli tasdiqlandi! Tizimga kirilmoqda...";
                setTimeout(() => {
                    document.getElementById("parentOtpModal").classList.add("hidden");
                    if (window.closeMobileDrawer) window.closeMobileDrawer();
                }, 800);
            } else {
                statusMsg.style.color = "#ff2744";
                statusMsg.textContent = "❌ Xato tasdiqlash kodi! Qayta urinib ko'ring.";
            }
        });
    }
}

window.openAdminLoginModal = function() {
    const modal = document.getElementById("adminLoginModal");
    if (modal) {
        document.getElementById("adminLoginStatusMsg").textContent = "";
        modal.classList.remove("hidden");
    }
};

function initAdminAuth() {
    const form = document.getElementById("adminLoginForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.getElementById("adminLoginUsername").value.trim();
            const pass = document.getElementById("adminLoginPassword").value.trim();
            const statusMsg = document.getElementById("adminLoginStatusMsg");

            if (user === "admin@safebus.uz" && pass === "admin123") {
                statusMsg.style.color = "#00e676";
                statusMsg.textContent = "✅ Admin xavfsizlik kaliti muvaffaqiyatli tasdiqlandi!";
                setTimeout(() => {
                    document.getElementById("adminLoginModal").classList.add("hidden");
                    if (window.switchRole) window.switchRole("admin");
                    if (window.closeMobileDrawer) window.closeMobileDrawer();
                }, 600);
            } else {
                statusMsg.style.color = "#ff2744";
                statusMsg.textContent = "❌ Noto'g'ri Admin login yoki parol! (Demo: admin@safebus.uz / admin123)";
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initOtpAuth();
    initAdminAuth();
});
