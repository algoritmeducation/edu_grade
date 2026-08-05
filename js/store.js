/* ==========================================================================
   EduGrade 360 - Store & Mock Database Engine
   ========================================================================== */

const STORAGE_KEY = 'edugrade360_db_v7';

window.escapeHTML = function (str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const DEFAULT_USERS = {
  admins: [
    { id: 'admin1', name: 'Dr. Evelina Vance', email: 'evelyn.vance@edugrade360.edu', title: 'Bosh Akademik Administrator', role: 'admin' },
    { id: 'admin2', name: 'Markus Sterling', email: 'marcus.sterling@edugrade360.edu', title: 'Operatsiyalar Dekani', role: 'admin' },
    { id: 'admin3', name: 'Elena Rostova', email: 'elena.rostova@edugrade360.edu', title: 'Baholash va Standartlar Direktori', role: 'admin' }
  ],
  examiners: [
    { id: 'ex1', name: 'Aleks Mercer', title: 'Katta Og\'zaki va Texnik Imtihonchi', role: 'examiner' },
    { id: 'ex2', name: 'Sofiya Chen', title: 'Frontend Tizimlari Eksperti', role: 'examiner' },
    { id: 'ex3', name: 'Dr. Aris Thorne', title: 'Algoritmlar va Tizimlar Imtihonchisi', role: 'examiner' },
    { id: 'ex4', name: 'Maya Lin', title: 'UI/UX va Unumdorlik Imtihonchisi', role: 'examiner' },
    { id: 'ex5', name: 'Robert Vance', title: 'Fullstack Bosh Imtihonchi', role: 'examiner' }
  ],
  teachers: [
    { id: 't1', name: 'Prof. Sara Connor', department: 'Web Dasturlash Rahbari', role: 'teacher' },
    { id: 't2', name: 'Dr. Markus Brody', department: 'Dasturiy Ta\'minot Arxitekturasi', role: 'teacher' },
    { id: 't3', name: 'Aleks Mercer', department: 'Katta Texnik O\'qituvchi', role: 'teacher', isExaminer: true, examinerId: 'ex1' },
    { id: 't4', name: 'Sofiya Chen', department: 'Frontend Muhandisligi', role: 'teacher', isExaminer: true, examinerId: 'ex2' },
    { id: 't5', name: 'Dr. Aris Thorne', department: 'Kompyuter Fanlari va Tizimlar', role: 'teacher', isExaminer: true, examinerId: 'ex3' },
    { id: 't6', name: 'Maya Lin', department: 'Dizayn va Inson-Kompyuter Aloqasi', role: 'teacher', isExaminer: true, examinerId: 'ex4' },
    { id: 't7', name: 'Robert Vance', department: 'Fullstack Web Ilovalar', role: 'teacher', isExaminer: true, examinerId: 'ex5' },
    { id: 't8', name: 'Prof. Alan Tyuring', department: 'Hisoblash Asoslari', role: 'teacher' },
    { id: 't9', name: 'Dr. Greys Hopper', department: 'Tizimlar va Kompilyatorlar', role: 'teacher' },
    { id: 't10', name: 'Prof. Ada Lovleys', department: 'Algoritmlar va Ma\'lumotlar Tuzilmalari', role: 'teacher' }
  ]
};

function generate60WrittenQuestions(trackId) {
  const topics = {
    'html-to-css1': [
      { prompt: 'HTML/CSS dagi Blokli (Block-level) va Satrli (Inline) elementlarning asosiy farqlarini tushuntiring. Har biriga 2 tadan misol keltiring.', hint: 'Qator ko\'chishi, kenglik/balandlik xususiyatlari va margin behavior haqida yozing.' },
      { prompt: 'Semantik HTML nima uchun veb-foydalanish imkoniyati (a11y) va Qidiruv Tizimlarini Optimallashtirish (SEO) uchun muhim?', hint: 'Ekran o\'quvchilari (screen readers) va qidiruv botlari haqida to\'xtaling.' },
      { prompt: 'CSS Box Model tarkibiy qismlarini tushuntiring: Content, Padding, Border va Margin.', hint: 'box-sizing: border-box xususiyati umumiy o\'lchamlarga qanday ta\'sir qilishini batafsil yozing.' },
      { prompt: 'CSS Sinf selektorlari (.class) va ID selektorlari (#id) o\'rtasidagi farqlarni aniqlik (specificity) va qayta ishlatish nuqtai nazaridan tasvirlab bering.', hint: 'Elementning unikal nishonlanishi hamda specificity ballari haqida yozing.' },
      { prompt: 'Elementga bir nechta zid qoidalar qo\'llanilganda CSS Specificity qanday hisoblanadi?', hint: 'Inline stillar (1000), IDlar (100), sinflar/atributlar (10) va elementlarni (1) taqqoslang.' },
      { prompt: 'HTML5 dagi &lt;main&gt;, &lt;header&gt;, &lt;footer&gt; va &lt;nav&gt; semantik teglarining vazifasi nimadan iborat?', hint: 'Nima uchun oddiy &lt;div&gt; teglarini semantik teglarga almashtirish qulaylikni oshirishini tushuntiring.' },
      { prompt: 'CSS Flexbox asosiy o\'qi (main-axis) va ko\'ndalang o\'qi (cross-axis) tekislanishini tushuntiring. justify-content va align-items qanday farqlanadi?', hint: 'flex-direction row va column holatlarini keltiring.' },
      { prompt: 'Vertikal oqim tartibida margin collapsing (chegaralar tutashuvi) qanday ishlaydi va uni qanday oldini olish mumkin?', hint: 'Padding, border, flexbox yoki BFC yaratish usullarini eslang.' },
      { prompt: 'Nisbiy shrift birliklari (em va rem) o\'rtasidagi farqni va har biridan qachon foydalanish kerakligini tushuntiring.', hint: 'em ota element shrift o\'lchamiga, rem esa ildiz (root html) o\'lchamiga bog\'liq.' },
      { prompt: 'HTML viewport meta tegi `<meta name="viewport" content="width=device-width, initial-scale=1.0">` qanday vazifani bajaradi?', hint: 'Mobil qurilmalarda ekran masshtabi va moslashuvchanlikni tushuntiring.' }
    ],
    'css1-to-css2': [
      { prompt: 'CSS Maxsus Xususiyatlari (O\'zgaruvchilar - Custom Properties) haqida yozing. Ular DOM bo\'ylab qanday meros olinadi va zaxira qiymatlar (fallbacks) qanday beriladi?', hint: 'var(--main-color, #fff) sintaksis misolidan foydalaning.' },
      { prompt: 'CSS Grid va Flexbox tartiblari o\'rtasidagi farqni hamda qachon qaysi birini tanlash kerakligini tushuntiring.', hint: 'Grid 2 o\'lchamli (satr + ustun), Flexbox 1 o mezonli tartibdir.' },
      { prompt: 'CSS o\'tishlari (transitions) CSS animatsiyalaridan (keyframe animations) ishga tushish mexanizmi bo\'yicha qanday farq qiladi?', hint: 'Transitions holat o\'zgarishini talab qiladi (:hover), keyframe esa avtomatik ishlaydi.' },
      { prompt: 'CSS Konteyner So\'rovlari (@container) nima va ular Ekran Media So\'rovlaridan (@media) qanday farqlanadi?', hint: 'Konteyner so\'rovlari ekran emas, balki komponent kengligini baholaydi.' },
      { prompt: 'CSS dagi Stacking Context (Qatlamlar Konteksti) nima va qaysi xususiyatlar yangi qatlam yaratadi?', hint: 'Positsiyalash, z-index, opacity, transform va filter xususiyatlarini keltiring.' }
    ]
  };

  const base = topics[trackId] || topics['html-to-css1'];
  const questions = [];
  const subjects = [
    'HTML5 Semantik Hujjat Tuzilishi', 'CSS Spesifiklik va Meros Olish', 'CSS Box Model va Border-Box',
    'CSS Flexbox Joylashuv Mexanikasi', 'CSS Grid Ustunlar va Minmax', 'Nisbiy va Absolyut Birliklar (rem, em, px)',
    'CSS Pozitsiyalash (static, relative, absolute, fixed, sticky)', 'CSS Psevdosinflar va Psevdoelementlar',
    'Moslashuvchan Media So\'rovlar', 'Veb Qulaylik (ARIA va Kontrast)',
    'Forma Kiritmalari va Validatsiya', 'Tipografika va Veb Shrift Unumdorligi',
    'CSS O\'zgaruvchilar va Dinamik Mavzular', 'CSS Animatsiyalar va Apparat Tezlatishi',
    'CSS Qatlamlar Konteksti va Z-Index', 'Konteyner So\'rovlari va Komponentlar',
    'Modulli CSS Arxitekturasi (BEM)', 'Toza HTML Markup va Validatsiya'
  ];

  for (let i = 0; i < 60; i++) {
    if (i < base.length) {
      questions.push({
        id: `wq_${trackId}_${i + 1}`,
        prompt: base[i].prompt,
        hint: base[i].hint
      });
    } else {
      const subject = subjects[(i - base.length) % subjects.length];
      const variation = Math.floor(i / subjects.length) + 1;
      questions.push({
        id: `wq_${trackId}_${i + 1}`,
        prompt: `[Savol ${i + 1}] Texnik Tahlil: ${subject} (${variation}-qism). Brauzer rendering jarayoni, sintaksis standartlari va ishlab chiqarish amaliyotini batafsil yoritib bering.`,
        hint: `Brauzer xatti-harakati, kod misollari va arxitektura bo'yicha batafsil yozma javob bering.`
      });
    }
  }

  return questions;
}

function generate15OralQuestions(trackId) {
  return [
    { id: 'sq1', question: 'CSS Specificity (Aniqlik ballari) qanday hisoblanadi va inline stillar ID, class hamda element selektorlari bilan qanday taqqoslanadi?' },
    { id: 'sq2', question: 'CSS Box Model (Content, Padding, Border, Margin) tuzilishini va nima uchun marja tutashuvi (margin collapsing) yuz berishini tushuntiring.' },
    { id: 'sq3', question: '`display: none`, `visibility: hidden` va `opacity: 0` xususiyatlarini taqqoslang. Ular DOM renderida qanday farq qiladi?' },
    { id: 'sq4', question: 'Flexbox dagi flex-grow, flex-shrink va flex-basis xususiyatlari moslashuvchan dizaynda qanday birgalikda ishlaydi?' },
    { id: 'sq5', question: 'Nima uchun `<meta name="viewport" content="width=device-width, initial-scale=1.0">` tegi mobil moslashuvchanlik uchun o\'ta muhim?' },
    { id: 'sq6', question: 'Nisbiy shrift birliklari (`em` va `rem`) o\'rtasidagi farqni va ulardan qachon foydalanish kerakligini tushuntiring.' },
    { id: 'sq7', question: 'CSS Grid dagi `auto-fit` va `auto-fill` `minmax()` bilan moslashuvchan maket yaratishda qanday farqlanadi?' },
    { id: 'sq8', question: 'CSS O\'zgaruvchilar (Custom Properties) DOM daraxti bo\'ylab qanday meros olinadi va zaxira qiymat qanday beriladi?' },
    { id: 'sq9', question: 'CSS animatsiyalarida apparat tezlanishini tushuntiring va nima uchun `transform` ni animatsiya qilish `margin` dan ko\'ra silliqroq ishlaydi?' },
    { id: 'sq10', question: 'BFC (Block Formatting Context) nima va u marjalar tutashuvi yoki suzuvchi (float) elementlarni tozalashda qanday yordam beradi?' },
    { id: 'sq11', question: 'Konteyner so\'rovlari (`@container`) haqida gapirib bering va ular modulli komponent dizaynini qanday ta\'minlaydi?' },
    { id: 'sq12', question: 'CSS Qatlamlar Kontekstini (Stacking Context) tushuntiring va nima uchun ba\'zan `z-index: 9999` ishlamay qoladi?' },
    { id: 'sq13', question: '`clamp(min, val, max)` funktsiyasini va matematik funktsiyalar yordamida suyuq tipografika qanday amalga oshirilishini tushuntiring.' },
    { id: 'sq14', question: 'Semantik HTML va Nonomantik HTML ni ekran o\'quvchilari va qulaylik API lari nuqtai nazaridan taqqoslang.' },
    { id: 'sq15', question: 'CSS Subgrid nima va u ichki elementlarni ota-ona grid to\'rlari bilan qanday sinxronlashtiradi?' }
  ];
}

const DEFAULT_TRACKS = [
  {
    id: 'html-to-css1',
    title: 'HTML dan CSS Level 1 gacha',
    category: 'Asoslar',
    description: 'HTML5 semantik teglari, hujjat tuzilishi, CSS asosiy stillari, selektorlar, box model va flexbox asoslarini mukammal egallang.',
    level1: {
      writtenPool: generate60WrittenQuestions('html-to-css1')
    },
    level2: {
      title: "Texnik Og'zaki Imtihon va Tushuntirish Sinovi",
      instructions: "Imtihon oluvchi quyidagi savollar bazasidan kamida 5 ta texnik og'zaki savol berishi, talabaning og'zaki javobini baholashi(0-10 ball) va izoh qoldirishi shart.",
      minQuestionsRequired: 5,
      questions: generate15OralQuestions('html-to-css1')
    },
    level3: {
      title: 'Loyiha Amaliy Imtihoni: Moslashuvchan Veb-Sayt Portfoliosi',
      instructions: "Semantik HTML, maxsus CSS flexbox tartiblari, aloqa formasi va media so'rovlarni o'z ichiga olgan to'liq moslashuvchan portfolio veb-saytini yarating.",
      rubric: [
        { id: 'r1', label: 'Semantik Tuzilish va Veb Qulaylik', max: 25 },
        { id: 'r2', label: 'CSS Flexbox va Tartib Aniqligi', max: 25 },
        { id: 'r3', label: 'Mobil Qurilmalarga Moslashuvchanlik', max: 25 },
        { id: 'r4', label: 'Kod Ozodaligi va Hujjatlashtirish', max: 25 }
      ]
    }
  },
{
  id: 'css1-to-css2',
    title: 'CSS 1 dan CSS Level 2 gacha',
      category: 'Murakkab CSS va Arxitektura',
        description: 'CSS Grid, Maxsus O\'zgaruvchilar, Animatsiyalar, O\'tishlar va Konteyner So\'rovlari bo\'yicha bilimlaringizni oshiring.',
          level1: {
    writtenPool: generate60WrittenQuestions('css1-to-css2')
  },
  level2: {
    title: 'Murakkab CSS Og\'zaki Imtihoni',
      minQuestionsRequired: 5,
        questions: generate15OralQuestions('css1-to-css2')
  },
  level3: {
    title: 'Loyiha Amaliy Imtihoni: Interaktiv Admin Boshqaruv Paneli',
      instructions: "CSS o\'zgaruvchilari yordamida to'q/yorug' rejim almashinuvi, CSS Grid vidjetlari va mikro-interaksiyalarga ega interaktiv panel yaratish.",
        rubric: [
          { id: 'r1', label: 'CSS Maxsus O\'zgaruvchilar Tizimi', max: 25 },
          { id: 'r2', label: 'CSS Grid va Zamonaviy Tartib Usullari', max: 25 },
          { id: 'r3', label: 'Animatsiyalar va Mikro-interaksiyalar', max: 25 },
          { id: 'r4', label: 'Loyiha Arxitekturasi va Hujjatlar', max: 25 }
        ]
  }
}
];

const DEFAULT_EXAMS = [
  {
    id: 'exam_demo_1',
    title: 'HTML va CSS Asoslari Imtihon Seansi',
    groupName: 'Alfa Guruhi 2026',
    trackId: 'html-to-css1',
    examinerId: 'ex1',
    teacherId: 't1',
    uniqueKey: 'EX-9482',
    status: 'completed',
    createdAt: '2026-07-22T09:00:00Z',
    joinedStudents: [
      {
        id: 'std_demo_1',
        name: 'Javohir Alimov',
        joinedAt: '2026-07-22T09:05:00Z',
        l1Answers: {
          writtenAnswers: { wq_1: 'Blokli elementlar yangi qatordan boshlanadi, satrli elementlar esa yo\'q.' },
          submittedAt: '2026-07-22T09:35:00Z'
        },
        l1Grade: {
          writtenScorePct: 90,
          totalL1Pct: 95,
          gradedAt: '2026-07-22T10:00:00Z'
        },
        teacherProjectGrade: {
          rubricScores: { r1: 24, r2: 23, r3: 25, r4: 22 },
          totalL3Pct: 94,
          teacherNotes: 'Ajoyib amaliy loyiha! Kodingiz juda toza, stillar mukammal va mobil ekranlarga to\'liq moslashgan.',
          gradedAt: '2026-07-22T10:30:00Z'
        },
        l2TechnicalGrade: {
          questionsAsked: [
            { id: 'sq1', question: "CSS Specificity hisobi", score: 9, notes: "ID vs Class vs Element ballarini aniq tushuntirdi." },
            { id: 'sq2', question: "CSS Box Model va Marjalar tutashuvi", score: 10, notes: "Border-box va vertikal tutashuvni a'lo darajada tushuntirib berdi." },
            { id: 'sq3', question: "display:none vs visibility:hidden", score: 8, notes: "DOM reflow hamda qulaylik mezonlarini ta'kidladi." },
            { id: 'sq4', question: "Flexbox o'qlari va tekislanishi", score: 9, notes: "Asosiy va ko'ndalang o'qlarni to'g'ri ko'rsatdi." },
            { id: 'sq5', question: "Viewport meta tegi", score: 9, notes: "Mobil ekran masshtabini to'g'ri tushuntirdi." }
          ],
          totalPoints: 45,
          maxPossible: 50,
          speakingScorePct: 90,
          examinerNotes: 'Juda bilimdon nomzod! Asosiy texnik tushunchalarni chuqur egallagan.',
          finishedAt: '2026-07-22T11:15:00Z'
        },
        finalScorePct: 93,
        status: 'completed'
      }
    ]
  },
  {
    id: 'exam_demo_2',
    title: 'Murakkab CSS Arxitekturasi Imtihoni',
    groupName: 'Beta Guruhi - Frontend Ustasi',
    trackId: 'css1-to-css2',
    examinerId: 'ex1',
    teacherId: 't1',
    uniqueKey: 'KEY-7392',
    status: 'room_open',
    createdAt: '2026-07-24T08:00:00Z',
    joinedStudents: []
  }
];

class Store {
  constructor() {
    this.init();
  }

  init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.data = {
        users: DEFAULT_USERS,
        tracks: DEFAULT_TRACKS,
        exams: DEFAULT_EXAMS,
        currentRole: 'student',
        currentUserId: 'student_active',
        activeStudentSession: null
      };
      this.ensureQuestionPools();
      this.save();
    } else {
      try {
        this.data = JSON.parse(raw);
        if (!this.data.tracks || this.data.tracks.length === 0) this.data.tracks = DEFAULT_TRACKS;
        if (!this.data.exams) this.data.exams = DEFAULT_EXAMS;
        this.ensureQuestionPools();
        this.ensureQuestionBank();
      } catch (e) {
        console.error('Failed to parse local storage, resetting to default', e);
        this.resetDefaults();
      }
    }
    this.loadFromBackend();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.syncWithBackend();
  }

  async syncWithBackend() {
    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.data)
        });
      }
    } catch (e) {
      // Backend sync fallback for offline/demo
    }
  }

  async loadFromBackend() {
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/store');
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && serverData.exams && serverData.exams.length > 0) {
            this.data.exams = serverData.exams;
            if (serverData.tracks) this.data.tracks = serverData.tracks;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
          }
        }
      }
    } catch (e) {
      // Backend sync fallback for offline/demo
    }
  }

  ensureQuestionPools() {
    if (!this.data.tracks) return;
    this.data.tracks.forEach(track => {
      if (!track.level1) track.level1 = {};
      if (!track.level1.writtenPool || track.level1.writtenPool.length < 60) {
        track.level1.writtenPool = generate60WrittenQuestions(track.id);
      }
      if (!track.level2) track.level2 = {};
      if (!track.level2.questions || track.level2.questions.length < 15) {
        track.level2.questions = generate15OralQuestions(track.id);
      }
    });
    this.ensureQuestionBank();
  }

  ensureQuestionBank() {
    if (!this.data.questionBank) {
      this.data.questionBank = {};
    }
    const tracks = this.getTracks();
    tracks.forEach(track => {
      if (!this.data.questionBank[track.id]) {
        this.data.questionBank[track.id] = { written: [], oral: [] };
      }
      const trackObj = this.data.questionBank[track.id];
      if (!trackObj.written || trackObj.written.length === 0) {
        const pool = track.level1?.writtenPool || generate60WrittenQuestions(track.id);
        trackObj.written = pool.map((q, idx) => ({
          id: q.id || `wq_${track.id}_${idx + 1}`,
          prompt: q.prompt || q.question || '',
          question: q.prompt || q.question || '',
          hint: q.hint || '',
          trackId: track.id,
          type: 'written'
        }));
      }
      if (!trackObj.oral || trackObj.oral.length === 0) {
        const pool = track.level2?.questions || generate15OralQuestions(track.id);
        trackObj.oral = pool.map((q, idx) => ({
          id: q.id || `oq_${track.id}_${idx + 1}`,
          question: q.question || q.prompt || '',
          prompt: q.question || q.prompt || '',
          hint: q.hint || '',
          trackId: track.id,
          type: 'oral'
        }));
      }
    });
  }

  // --- Admin Question Bank CRUD & CSV Operations ---
  getQuestionBank(trackId = null, type = null) {
    this.ensureQuestionBank();
    const result = [];
    Object.keys(this.data.questionBank).forEach(tId => {
      if (!trackId || trackId === 'all' || trackId === tId) {
        const trackObj = this.data.questionBank[tId];
        if (!type || type === 'all' || type === 'written') {
          (trackObj.written || []).forEach(q => result.push({ ...q, trackId: tId, type: 'written' }));
        }
        if (!type || type === 'all' || type === 'oral') {
          (trackObj.oral || []).forEach(q => result.push({ ...q, trackId: tId, type: 'oral' }));
        }
      }
    });
    return result;
  }

  addQuestionToBank(trackId, type, questionData) {
    this.ensureQuestionBank();
    if (!this.data.questionBank[trackId]) {
      this.data.questionBank[trackId] = { written: [], oral: [] };
    }
    const qType = type === 'oral' ? 'oral' : 'written';
    const idPrefix = qType === 'written' ? 'wq_cust_' : 'oq_cust_';
    const id = questionData.id || (idPrefix + Date.now() + '_' + Math.floor(Math.random() * 1000));

    const text = questionData.prompt || questionData.question || '';
    const newQ = {
      id,
      prompt: text,
      question: text,
      hint: questionData.hint || '',
      trackId,
      type: qType
    };

    this.data.questionBank[trackId][qType].unshift(newQ);
    this.save();
    return { success: true, question: newQ, message: 'Question added to Question Bank!' };
  }

  updateQuestionInBank(questionId, updatedData) {
    this.ensureQuestionBank();
    let found = false;
    Object.keys(this.data.questionBank).forEach(tId => {
      const trackObj = this.data.questionBank[tId];
      ['written', 'oral'].forEach(qType => {
        const idx = (trackObj[qType] || []).findIndex(q => q.id === questionId);
        if (idx !== -1) {
          const text = updatedData.prompt !== undefined ? updatedData.prompt : (updatedData.question !== undefined ? updatedData.question : trackObj[qType][idx].prompt);
          trackObj[qType][idx] = {
            ...trackObj[qType][idx],
            prompt: text,
            question: text,
            hint: updatedData.hint !== undefined ? updatedData.hint : trackObj[qType][idx].hint
          };
          found = true;
        }
      });
    });

    if (found) {
      this.save();
      return { success: true, message: 'Question updated successfully!' };
    }
    return { success: false, message: 'Question not found.' };
  }

  deleteQuestionFromBank(questionId) {
    this.ensureQuestionBank();
    let deleted = false;
    Object.keys(this.data.questionBank).forEach(tId => {
      const trackObj = this.data.questionBank[tId];
      ['written', 'oral'].forEach(qType => {
        if (!trackObj[qType]) return;
        const len = trackObj[qType].length;
        trackObj[qType] = trackObj[qType].filter(q => q.id !== questionId);
        if (trackObj[qType].length < len) deleted = true;
      });
    });

    if (deleted) {
      this.save();
      return { success: true, message: 'Question deleted from bank.' };
    }
    return { success: false, message: 'Question ID not found.' };
  }

  exportQuestionBankCSV(trackId = 'all') {
    const questions = this.getQuestionBank(trackId);
    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const rows = [
      ['TrackId', 'Type', 'QuestionID', 'PromptOrQuestion', 'Hint']
    ];
    questions.forEach(q => {
      rows.push([
        esc(q.trackId),
        esc(q.type),
        esc(q.id),
        esc(q.prompt || q.question),
        esc(q.hint)
      ]);
    });
    return rows.map(r => r.join(',')).join('\r\n');
  }

  importQuestionBankCSV(csvContent) {
    if (!csvContent || !csvContent.trim()) return { success: false, message: 'CSV content is empty.' };
    this.ensureQuestionBank();

    const lines = csvContent.split(/\r?\n/);
    let imported = 0;

    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes('track') || line.toLowerCase().includes('prompt') || line.toLowerCase().includes('type'))) {
        return; // skip header line
      }
      if (!line.trim()) return;

      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

      if (cleanCols.length < 3) return;

      let trackId = cleanCols[0] || 'html-to-css1';
      let type = (cleanCols[1] || '').toLowerCase() === 'oral' ? 'oral' : 'written';
      let promptText = cleanCols[2] || '';
      let hintText = cleanCols[3] || '';

      if (cleanCols.length >= 5) {
        promptText = cleanCols[3];
        hintText = cleanCols[4];
      }

      if (!promptText) return;

      if (!this.data.questionBank[trackId]) {
        this.data.questionBank[trackId] = { written: [], oral: [] };
      }

      const qObj = {
        id: (type === 'written' ? 'wq_imp_' : 'oq_imp_') + Date.now() + '_' + Math.floor(Math.random() * 1000),
        prompt: promptText,
        question: promptText,
        hint: hintText,
        trackId,
        type
      };

      this.data.questionBank[trackId][type].unshift(qObj);
      imported++;
    });

    this.save();
    return { success: true, imported, message: `Successfully imported ${imported} question(s) into Question Bank!` };
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  resetDefaults() {
    this.data = {
      users: DEFAULT_USERS,
      tracks: DEFAULT_TRACKS,
      exams: DEFAULT_EXAMS,
      currentRole: 'student',
      currentUserId: 'student_active',
      activeStudentSession: null
    };
    this.ensureQuestionPools();
    this.save();
  }

  // --- Role & Staff Authentication Engine ---
  authenticateStaff(email, password, role) {
    if (!email) return { success: false, message: 'Please enter institutional email.' };
    const cleanEmail = email.trim().toLowerCase();

    // Check known staff lists
    const users = this.getUsersByRole(role === 'admin' ? 'admin' : (role === 'examiner' ? 'examiner' : 'teacher'));
    let matched = users.find(u => (u.email && u.email.toLowerCase() === cleanEmail) || u.name.toLowerCase().includes(cleanEmail.split('@')[0].replace('.', ' ')));

    if (!matched) {
      // Fallback matching for demo accounts
      const allStaff = [...this.getUsersByRole('admin'), ...this.getUsersByRole('examiner'), ...this.getUsersByRole('teacher')];
      matched = allStaff.find(u => u.id === (role === 'admin' ? 'admin1' : (role === 'examiner' ? 'ex1' : 't1')));
    }

    if (!matched) {
      matched = { id: role + '_' + Date.now(), name: email.split('@')[0] || 'Staff User', role: role };
    }

    const effectiveRole = matched.role || role;

    const staffSession = {
      id: matched.id,
      name: matched.name,
      email: cleanEmail,
      role: effectiveRole,
      title: matched.title || matched.department || 'Academic Staff',
      loginTime: new Date().toISOString()
    };

    this.data.authenticatedStaff = staffSession;
    this.data.currentRole = effectiveRole === 'admin' ? 'admin' : 'faculty';
    this.save();
    return { success: true, user: staffSession, message: `Successfully authenticated as ${staffSession.name}` };
  }

  getAuthenticatedStaff() {
    return this.data.authenticatedStaff || null;
  }

  logoutStaff() {
    this.data.authenticatedStaff = null;
    this.setCurrentRole('student');
    this.save();
    return { success: true, message: 'Signed out of staff portal.' };
  }

  logSecurityViolation(examId, studentId, violation) {
    const exam = this.getExamById(examId);
    if (!exam) return false;
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return false;

    if (!exam.securityAlerts) exam.securityAlerts = [];
    if (!student.securityAlerts) student.securityAlerts = [];

    const alertItem = {
      id: 'alert_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      studentId: student.id,
      studentName: student.name,
      type: violation.type || 'PROCTORING_VIOLATION',
      reason: violation.reason || 'Anti-cheat violation detected',
      timestamp: new Date().toISOString()
    };

    exam.securityAlerts.unshift(alertItem);
    student.securityAlerts.unshift(alertItem);
    this.save();
    return true;
  }

  getCurrentRole() {
    return this.data.currentRole || 'student';
  }

  setCurrentRole(role) {
    this.data.currentRole = role;
    this.save();
  }

  getUsersByRole(role) {
    if (!this.data.users) return [];
    if (role === 'admin') return this.data.users.admins || [];
    if (role === 'examiner') return this.data.users.examiners || [];
    if (role === 'teacher') return this.data.users.teachers || [];
    return [];
  }

  getTracks() {
    return this.data.tracks || DEFAULT_TRACKS;
  }

  addTrack(trackData) {
    if (!trackData || !trackData.title) {
      return { success: false, message: 'Track title is required.' };
    }

    const cleanTitle = trackData.title.trim();
    const id = trackData.id || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('track_' + Date.now());

    if (!this.data.tracks) this.data.tracks = [...DEFAULT_TRACKS];

    const exists = this.data.tracks.find(t => t.id === id);
    if (exists) {
      return { success: false, message: `Track with ID "${id}" already exists.` };
    }

    const newTrack = {
      id: id,
      title: cleanTitle,
      category: trackData.category || 'Specialized Track',
      description: trackData.description || `Assessment track for ${cleanTitle}.`,
      level1: {
        writtenPool: generate60WrittenQuestions(id)
      },
      level2: {
        title: 'Technical Speaking & Explanation Test',
        instructions: 'Evaluate student verbal explanation live across assigned oral questions.',
        minQuestionsRequired: 5,
        questions: generate15OralQuestions(id)
      },
      level3: {
        title: trackData.capstoneTitle || `Capstone Project: ${cleanTitle}`,
        instructions: trackData.capstoneDesc || `Build a practical demonstration project applying ${cleanTitle} skills.`,
        rubric: trackData.rubric || [
          { id: 'r1', label: 'Technical Execution & Architecture', max: 25 },
          { id: 'r2', label: 'Code Quality & Best Practices', max: 25 },
          { id: 'r3', label: 'Project Functionality & Features', max: 25 },
          { id: 'r4', label: 'Documentation & Presentation', max: 25 }
        ]
      }
    };

    this.data.tracks.push(newTrack);
    this.ensureQuestionBank();
    this.save();
    return { success: true, track: newTrack, message: `Track "${cleanTitle}" created successfully!` };
  }

  getTrackById(id) {
    return this.getTracks().find(t => t.id === id) || this.getTracks()[0];
  }

  getExams() {
    return this.data.exams || [];
  }

  getExamById(id) {
    return this.getExams().find(e => e.id === id);
  }

  getExamByKey(key) {
    if (!key) return null;
    const cleanKey = key.trim().toUpperCase();
    return this.getExams().find(e => e.uniqueKey.toUpperCase() === cleanKey);
  }

  getActiveStudentSession() {
    return this.data.activeStudentSession;
  }

  setActiveStudentSession(session) {
    this.data.activeStudentSession = session;
    this.save();
  }

  clearActiveStudentSession() {
    this.data.activeStudentSession = null;
    this.save();
  }

  // --- Student Quiz & Oral Randomization Engine ---
  getStudentAssignedQuiz(examId, studentId) {
    const exam = this.getExamById(examId);
    if (!exam) return [];
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return [];

    if (student.assignedQuizQuestions && student.assignedQuizQuestions.length > 0) {
      return student.assignedQuizQuestions;
    }

    const bankQuestions = this.getQuestionBank(exam.trackId, 'written');
    let pool = bankQuestions.length > 0 ? bankQuestions : [];
    if (pool.length === 0) {
      const track = this.getTrackById(exam.trackId);
      pool = track?.level1?.writtenPool || [];
    }

    const seed = (examId + '_' + studentId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.abs(Math.sin(seed + i)) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, Math.min(20, shuffled.length));
    student.assignedQuizQuestions = selected;
    this.save();
    return selected;
  }

  getStudentOralQuestions(examId, studentId) {
    const exam = this.getExamById(examId);
    if (!exam) return [];
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return [];

    if (student.assignedOralQuestions && student.assignedOralQuestions.length > 0) {
      return student.assignedOralQuestions;
    }

    const bankOral = this.getQuestionBank(exam.trackId, 'oral');
    let pool = bankOral.length > 0 ? bankOral : [];
    if (pool.length === 0) {
      const track = this.getTrackById(exam.trackId);
      pool = track?.level2?.questions || [];
    }

    const seed = ('oral_' + examId + '_' + studentId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.abs(Math.sin(seed + i)) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, Math.min(5, shuffled.length));
    student.assignedOralQuestions = selected;
    this.save();
    return selected;
  }

  addLiveOralQuestionToExam(examId, studentId, questionObj) {
    const exam = this.getExamById(examId);
    if (!exam) return { success: false, message: 'Exam not found.' };
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found.' };

    if (!student.assignedOralQuestions) {
      student.assignedOralQuestions = this.getStudentOralQuestions(examId, studentId);
    }

    const newQuestion = {
      id: questionObj.id || ('oq_live_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      question: questionObj.question || questionObj.prompt || 'Custom Oral Question',
      prompt: questionObj.question || questionObj.prompt || 'Custom Oral Question',
      hint: questionObj.hint || ''
    };

    student.assignedOralQuestions.push(newQuestion);
    this.save();
    return { success: true, question: newQuestion, message: `Added extra oral question for ${student.name}!` };
  }

  // --- Admin & Exam Operations ---
  createExam({ title, groupName, trackId, examinerId, teacherId }) {
    const keyNum = Math.floor(1000 + Math.random() * 9000);
    const uniqueKey = `KEY-${keyNum}`;
    const newExam = {
      id: `exam_${Date.now()}`,
      title,
      groupName,
      trackId,
      examinerId,
      teacherId,
      uniqueKey,
      status: 'created',
      createdAt: new Date().toISOString(),
      joinedStudents: []
    };

    this.data.exams.unshift(newExam);
    this.save();
    return newExam;
  }

  updateExamStatus(examId, status) {
    const exam = this.getExamById(examId);
    if (exam) {
      exam.status = status;
      const now = new Date().toISOString();
      if (status === 'step1_active' && !exam.step1StartedAt) {
        exam.step1StartedAt = now;
      } else if (status === 'step2_active' && !exam.step2StartedAt) {
        exam.step2StartedAt = now;
      } else if (status === 'completed') {
        exam.endedAt = now;
      }
      this.save();
    }
  }

  joinExamAsStudent({ name, uniqueKey }) {
    if (!name || !name.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!uniqueKey || !uniqueKey.trim()) {
      return { success: false, message: 'Please enter the Unique Exam Key.' };
    }

    const exam = this.getExamByKey(uniqueKey.trim());
    if (!exam) {
      return { success: false, message: `Key "${uniqueKey.trim().toUpperCase()}" not found. Double-check the key shown by your Examiner.` };
    }

    if (exam.status === 'completed') {
      return { success: false, message: 'This exam has already been completed and is closed.' };
    }

    const trimmedName = name.trim();
    let student = exam.joinedStudents.find(s => s.name.toLowerCase() === trimmedName.toLowerCase());
    if (!student) {
      student = {
        id: `std_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
        name: trimmedName,
        joinedAt: new Date().toISOString(),
        status: 'joined'
      };
      exam.joinedStudents.push(student);
    }

    this.setActiveStudentSession({
      examId: exam.id,
      studentId: student.id,
      studentName: student.name
    });

    return { success: true, exam, student };
  }

  submitStudentQuiz(examId, studentId, writtenAnswers) {
    const exam = this.getExamById(examId);
    if (!exam) return false;
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return false;

    student.l1Answers = {
      writtenAnswers,
      submittedAt: new Date().toISOString()
    };

    student.l1Grade = {
      totalL1Pct: 0,
      writtenScorePct: null,
      manuallyGradedByExaminer: false,
      submittedAt: new Date().toISOString()
    };

    this.recalculateStudentFinalScore(student);
    this.save();
    return true;
  }

  failStudentQuiz(examId, studentId, violation) {
    return this.disqualifyStudentQuiz(examId, studentId, violation);
  }

  disqualifyStudentQuiz(examId, studentId, violation) {
    const exam = this.getExamById(examId);
    if (!exam) return false;
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return false;

    student.l1Answers = {
      writtenAnswers: {},
      disqualified: true,
      violation,
      submittedAt: new Date().toISOString()
    };

    student.l1Grade = {
      totalL1Pct: 0,
      disqualified: true,
      manuallyGradedByExaminer: true,
      gradedAt: new Date().toISOString()
    };

    student.finalScorePct = 0;
    student.status = 'quiz_disqualified';
    this.save();
    return true;
  }

  recalculateStudentFinalScore(student) {
    if (student.l1Answers?.disqualified) {
      student.finalScorePct = 0;
      return;
    }

    const l1Graded = Boolean(student.l1Grade && student.l1Grade.manuallyGradedByExaminer);
    let l1Pct = l1Graded ? Number(student.l1Grade.writtenScorePct ?? student.l1Grade.totalL1Pct ?? 0) : 0;
    let l2Pct = student.l2TechnicalGrade ? student.l2TechnicalGrade.speakingScorePct : 0;
    let l3Pct = student.teacherProjectGrade ? student.teacherProjectGrade.totalL3Pct : 0;

    let count = 0;
    let sum = 0;
    if (l1Graded) { sum += l1Pct; count++; }
    if (student.l2TechnicalGrade) { sum += l2Pct; count++; }
    if (student.teacherProjectGrade) { sum += l3Pct; count++; }

    student.finalScorePct = count > 0 ? Math.round(sum / count) : 0;

    if (l1Graded && student.l2TechnicalGrade && student.teacherProjectGrade) {
      student.status = 'completed';
    }
  }

  saveExaminerPart1Grade(examId, studentId, gradeData) {
    const exam = this.getExamById(examId);
    if (!exam) return;
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return;

    if (!student.l1Grade) student.l1Grade = {};

    const scorePct = Number(gradeData.writtenScorePct || 0);
    student.l1Grade.writtenScorePct = scorePct;
    student.l1Grade.totalL1Pct = scorePct;
    student.l1Grade.questionScores = gradeData.questionScores || {};
    student.l1Grade.questionReviews = gradeData.questionReviews || {};
    student.l1Grade.examinerWrittenNotes = gradeData.examinerWrittenNotes || '';
    student.l1Grade.manuallyGradedByExaminer = true;
    student.l1Grade.gradedAt = new Date().toISOString();

    this.recalculateStudentFinalScore(student);
    this.save();
  }

  saveTeacherProjectGrade(examId, studentId, gradeData) {
    const exam = this.getExamById(examId);
    if (!exam) return;
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return;

    const r = gradeData.rubricScores || {};
    const totalPoints = Object.values(r).reduce((acc, val) => acc + Number(val), 0);

    student.teacherProjectGrade = {
      rubricScores: r,
      totalL3Pct: totalPoints,
      teacherNotes: gradeData.teacherNotes || '',
      gradedAt: new Date().toISOString()
    };

    this.recalculateStudentFinalScore(student);
    if (student.status !== 'completed') {
      student.status = 'project_graded';
    }

    this.save();
  }

  saveExaminerTechnicalGrade(examId, studentId, speakingData) {
    const exam = this.getExamById(examId);
    if (!exam) return;
    const student = exam.joinedStudents.find(s => s.id === studentId);
    if (!student) return;

    const totalPoints = speakingData.questionsAsked.reduce((acc, q) => acc + Number(q.score), 0);
    const maxPossible = speakingData.questionsAsked.length * 10;
    const speakingScorePct = maxPossible > 0 ? Math.round((totalPoints / maxPossible) * 100) : 0;

    student.l2TechnicalGrade = {
      questionsAsked: speakingData.questionsAsked,
      totalPoints,
      maxPossible,
      speakingScorePct,
      examinerNotes: speakingData.examinerNotes || '',
      finishedAt: new Date().toISOString()
    };

    this.recalculateStudentFinalScore(student);
    if (student.status !== 'completed') {
      student.status = 'technical_graded';
    }

    this.save();
  }

  // --- Question Bank Import & Export ---
  importQuestionBank(trackId, questionsList) {
    const track = this.getTrackById(trackId);
    if (!track) return { success: false, message: 'Track not found.' };

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      return { success: false, message: 'Invalid question list. Provide a JSON array of question objects.' };
    }

    const formatted = questionsList.map((q, idx) => ({
      id: q.id || `imp_${Date.now()}_${idx}`,
      prompt: q.prompt || q.question || 'Untitled Question',
      hint: q.hint || 'Provide detailed explanation with syntax examples.'
    }));

    if (!track.level1) track.level1 = {};
    if (!track.level1.writtenPool) track.level1.writtenPool = [];

    track.level1.writtenPool = [...track.level1.writtenPool, ...formatted];
    this.save();

    return {
      success: true,
      message: `Successfully imported ${formatted.length} questions into "${track.title}"! Total pool: ${track.level1.writtenPool.length} questions.`
    };
  }

  exportQuestionBank(trackId) {
    const track = this.getTrackById(trackId);
    if (!track || !track.level1 || !track.level1.writtenPool) return [];
    return track.level1.writtenPool;
  }

  // --- Teacher & Examiner Management CRUD ---
  addTeacher(data) {
    if (!data.name || !data.name.trim()) return { success: false, message: 'Teacher name is required.' };
    if (!data.department || !data.department.trim()) return { success: false, message: 'Department is required.' };

    if (!this.data.users) this.data.users = DEFAULT_USERS;
    if (!this.data.users.teachers) this.data.users.teachers = [];
    if (!this.data.users.examiners) this.data.users.examiners = [];

    const teacherId = 't_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const teacher = {
      id: teacherId,
      name: data.name.trim(),
      department: data.department.trim(),
      role: 'teacher'
    };

    if (data.isExaminer) {
      const examinerId = 'ex_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const examinerTitle = (data.title && data.title.trim()) ? data.title.trim() : `${data.department.trim()} Examiner`;
      const examiner = {
        id: examinerId,
        name: data.name.trim(),
        title: examinerTitle,
        role: 'examiner'
      };
      this.data.users.examiners.push(examiner);

      teacher.isExaminer = true;
      teacher.examinerId = examinerId;
    }

    this.data.users.teachers.push(teacher);
    this.save();
    return { success: true, teacher, message: `Teacher "${teacher.name}" added successfully!` };
  }

  toggleTeacherExaminerRole(teacherId, customTitle) {
    return this.toggleTeacherExaminer(teacherId, customTitle);
  }

  toggleExaminerRole(teacherId, customTitle) {
    return this.toggleTeacherExaminer(teacherId, customTitle);
  }

  toggleTeacherExaminer(personId, customTitle) {
    if (!personId) return { success: false, message: 'Invalid staff ID.' };

    const teachers = this.getUsersByRole('teacher');
    const examiners = this.getUsersByRole('examiner');

    let teacher = teachers.find(t => t.id === personId || t.examinerId === personId);
    let examiner = examiners.find(ex => ex.id === personId || (teacher && teacher.examinerId === ex.id));

    if (!teacher && examiner) {
      teacher = teachers.find(t => t.name.toLowerCase() === examiner.name.toLowerCase());
    }

    if (!teacher && examiner) {
      teacher = {
        id: 't_' + Date.now(),
        name: examiner.name,
        department: examiner.title || 'Certified Examiner',
        role: 'teacher',
        isExaminer: true,
        examinerId: examiner.id
      };
      this.data.users.teachers.push(teacher);
    }

    if (!teacher) return { success: false, message: 'Staff member not found.' };

    if (!this.data.users.examiners) this.data.users.examiners = [];

    if (teacher.isExaminer) {
      const oldExaminerId = teacher.examinerId;
      if (oldExaminerId) {
        this.data.users.examiners = this.data.users.examiners.filter(ex => ex.id !== oldExaminerId);
        if (this.data.exams) {
          const remainingExaminers = this.getUsersByRole('examiner');
          const fallbackId = remainingExaminers.length > 0 ? remainingExaminers[0].id : '';
          this.data.exams.forEach(e => {
            if (e.examinerId === oldExaminerId) {
              e.examinerId = fallbackId;
            }
          });
        }
      }
      delete teacher.isExaminer;
      delete teacher.examinerId;
      this.save();
      return { success: true, isExaminer: false, message: `Revoked Examiner certification for ${teacher.name}.` };
    } else {
      const examinerId = 'ex_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const title = (customTitle && customTitle.trim()) ? customTitle.trim() : `${teacher.department || 'Academic Staff'} Examiner`;
      const newExaminer = {
        id: examinerId,
        name: teacher.name,
        title: title,
        role: 'examiner'
      };
      this.data.users.examiners.push(newExaminer);

      teacher.isExaminer = true;
      teacher.examinerId = examinerId;
      this.save();
      return { success: true, isExaminer: true, message: `${teacher.name} is now a certified Examiner!` };
    }
  }

  removeStaff(personId) {
    if (!personId) return { success: false, message: 'Invalid staff ID.' };

    const teachers = this.getUsersByRole('teacher');
    const examiners = this.getUsersByRole('examiner');
    const admins = this.getUsersByRole('admin');

    const teacher = teachers.find(t => t.id === personId || t.examinerId === personId);
    const examiner = examiners.find(ex => ex.id === personId || (teacher && teacher.examinerId === ex.id));
    const admin = admins.find(a => a.id === personId);

    if (admin) {
      if (admins.length <= 1) {
        return { success: false, message: 'Cannot delete the last remaining Administrator account.' };
      }
      this.data.users.admins = admins.filter(a => a.id !== admin.id);
    }

    const staffName = teacher ? teacher.name : (examiner ? examiner.name : (admin ? admin.name : 'Staff member'));

    if (teacher) {
      this.data.users.teachers = (this.data.users.teachers || []).filter(t => t.id !== teacher.id);
    }

    if (examiner || (teacher && teacher.examinerId)) {
      const exId = examiner ? examiner.id : teacher.examinerId;
      this.data.users.examiners = (this.data.users.examiners || []).filter(ex => ex.id !== exId);
    }

    const remainingTeachers = this.getUsersByRole('teacher');
    const remainingExaminers = this.getUsersByRole('examiner');
    const fallbackTeacherId = remainingTeachers.length > 0 ? remainingTeachers[0].id : '';
    const fallbackExaminerId = remainingExaminers.length > 0 ? remainingExaminers[0].id : '';

    if (this.data.exams) {
      this.data.exams.forEach(e => {
        if (teacher && e.teacherId === teacher.id) e.teacherId = fallbackTeacherId;
        if (examiner && e.examinerId === examiner.id) e.examinerId = fallbackExaminerId;
      });
    }

    this.save();
    return { success: true, message: `Account "${staffName}" deleted successfully.` };
  }

  removeTeacher(teacherId) {
    return this.removeStaff(teacherId);
  }

  removeExaminer(examinerId) {
    return this.removeStaff(examinerId);
  }

  // --- Admin CRUD Management ---
  addAdmin(data) {
    if (!data.name || !data.name.trim()) return { success: false, message: 'Admin name is required.' };
    if (!this.data.users) this.data.users = DEFAULT_USERS;
    if (!this.data.users.admins) this.data.users.admins = [];

    const adminId = 'admin_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newAdmin = {
      id: adminId,
      name: data.name.trim(),
      title: (data.title && data.title.trim()) ? data.title.trim() : 'Platform Administrator',
      role: 'admin'
    };

    this.data.users.admins.push(newAdmin);
    this.save();
    return { success: true, admin: newAdmin, message: `Administrator "${newAdmin.name}" registered successfully!` };
  }

  removeAdmin(adminId) {
    return this.removeStaff(adminId);
  }

  endExam(examId) {
    const exam = this.getExamById(examId);
    if (!exam) return { success: false, message: 'Exam not found.' };

    exam.status = 'completed';
    exam.endedAt = new Date().toISOString();

    if (exam.joinedStudents) {
      exam.joinedStudents.forEach(student => {
        this.recalculateStudentFinalScore(student);
        student.status = 'completed';
      });
    }

    this.save();
    return { success: true, message: `Exam "${exam.title}" ended and archived successfully.` };
  }

  exportExamResultsCSV(examId) {
    const exam = this.getExamById(examId);
    if (!exam) return null;

    const examiners = this.getUsersByRole('examiner');
    const teachers = this.getUsersByRole('teacher');
    const examiner = examiners.find(e => e.id === exam.examinerId);
    const teacher = teachers.find(t => t.id === exam.teacherId);
    const track = this.getTrackById(exam.trackId);
    const dateStr = new Date(exam.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;

    const rows = [];

    // ── Header meta ──────────────────────────────────
    rows.push(['EDUGRADE 360 — EXAM RESULTS REPORT']);
    rows.push(['Exam Title', esc(exam.title)]);
    rows.push(['Group / Class', esc(exam.groupName)]);
    rows.push(['Track', esc(track ? track.title : exam.trackId)]);
    rows.push(['Exam Key', esc(exam.uniqueKey)]);
    rows.push(['Date', esc(dateStr)]);
    rows.push(['Teacher (Part 3)', esc(teacher ? teacher.name : exam.teacherId)]);
    rows.push(['Examiner (Part 1 & 2)', esc(examiner ? examiner.name : exam.examinerId)]);
    rows.push(['Status', esc(exam.status)]);
    rows.push([]);

    // ── Student score summary ─────────────────────────
    rows.push(['--- STUDENT SCORE SUMMARY ---']);
    rows.push(['#', 'Student Name', 'Joined At', 'Part 1 Written %', 'Part 2 Oral %', 'Part 3 Project %', 'Final Score %', 'Status']);

    exam.joinedStudents.forEach((std, idx) => {
      rows.push([
        idx + 1,
        esc(std.name),
        esc(std.joinedAt ? new Date(std.joinedAt).toLocaleString() : '—'),
        std.l1Grade ? std.l1Grade.totalL1Pct : '—',
        std.l2TechnicalGrade ? std.l2TechnicalGrade.speakingScorePct : '—',
        std.teacherProjectGrade ? std.teacherProjectGrade.totalL3Pct : '—',
        std.finalScorePct || '—',
        esc(std.l1Answers?.disqualified ? 'DISQUALIFIED' : std.finalScorePct ? 'Complete' : 'Incomplete')
      ]);
    });
    rows.push([]);

    // ── Per-student question details ──────────────────
    rows.push(['--- DETAILED QUESTION RESPONSES & REVIEWS ---']);
    exam.joinedStudents.forEach((std) => {
      rows.push([]);
      rows.push([`Student: ${std.name}`]);
      rows.push(['Final Score', std.finalScorePct ? std.finalScorePct + '%' : '—']);

      // Part 1 written answers
      if (std.l1Answers && !std.l1Answers.disqualified) {
        rows.push([]);
        rows.push(['Part 1 — Written Quiz Answers']);
        rows.push(['Question ID', 'Question', 'Student Answer', 'Examiner Review / Score']);

        const assignedQuestions = this.getStudentAssignedQuiz(examId, std.id);
        assignedQuestions.forEach((q) => {
          const answer = std.l1Answers?.writtenAnswers?.[q.id] || '(no answer)';
          const review = std.l1Grade?.questionReviews?.[q.id] || '—';
          rows.push([esc(q.id), esc(q.prompt || q.question), esc(answer), esc(review)]);
        });
        rows.push(['Part 1 Grade', '', '', std.l1Grade ? std.l1Grade.totalL1Pct + '%' : '—']);
        if (std.l1Grade?.examinerNotes) rows.push(['Examiner Notes', '', '', esc(std.l1Grade.examinerNotes)]);
      } else if (std.l1Answers?.disqualified) {
        rows.push([]);
        rows.push(['Part 1', 'DISQUALIFIED', esc(std.l1Answers.violation?.reason || ''), '0%']);
      }

      // Part 2 oral questions
      if (std.l2TechnicalGrade) {
        rows.push([]);
        rows.push(['Part 2 — Oral Defense Questions']);
        rows.push(['Question ID', 'Question', 'Score (0-10)', 'Examiner Notes']);

        const oralQs = this.getStudentOralQuestions(examId, std.id);
        oralQs.forEach((q) => {
          const sd = std.l2TechnicalGrade.scores?.[q.id] || {};
          rows.push([esc(q.id), esc(q.question), sd.score !== undefined ? sd.score : '—', esc(sd.notes || '—')]);
        });
        rows.push(['Part 2 Grade', '', '', std.l2TechnicalGrade.speakingScorePct + '%']);
        if (std.l2TechnicalGrade.examinerNotes) rows.push(['Examiner Overall Notes', '', '', esc(std.l2TechnicalGrade.examinerNotes)]);
      }

      // Part 3 project rubric
      if (std.teacherProjectGrade) {
        rows.push([]);
        rows.push(['Part 3 — Capstone Project Evaluation']);
        rows.push(['Rubric Item', 'Score', 'Max', '']);

        if (std.teacherProjectGrade.rubricBreakdown) {
          std.teacherProjectGrade.rubricBreakdown.forEach(rb => {
            rows.push([esc(rb.label), rb.score, rb.max, '']);
          });
        }
        rows.push(['Part 3 Grade', '', '', std.teacherProjectGrade.totalL3Pct + '%']);
        if (std.teacherProjectGrade.teacherNotes) rows.push(['Teacher Notes', '', '', esc(std.teacherProjectGrade.teacherNotes)]);
      }

      rows.push(['─'.repeat(60)]);
    });

    // ── Convert rows to CSV string ────────────────────
    const csv = rows.map(row =>
      Array.isArray(row) ? row.join(',') : row
    ).join('\r\n');

    return csv;
  }
}

// Global Store singleton
window.store = new Store();
