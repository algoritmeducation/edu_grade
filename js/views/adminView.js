/* ==========================================================================
   EduGrade 360 - Admin View Component (Modular Tabbed Architecture)
   ========================================================================== */

window.AdminView = {
  activeAdminTab: 'dashboard', // 'dashboard' | 'create' | 'staff' | 'sessions' | 'questions'
  staffSubFilter: 'all',       // 'all' | 'teachers' | 'examiners' | 'admins'
  activeTab: 'active',         // 'active' | 'history' (sessions tab)
  selectedTrackId: null,      // selected track in Question Bank tab

  // History filter state
  historyFilter: {
    dateFrom: '',
    dateTo: '',
    examinerId: '',
    teacherId: ''
  },

  /* ── helpers ─────────────────────────────────────── */
  formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  },

  formatDateOnly(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  renderStatusBadge(status) {
    switch (status) {
      case 'created':
        return `<span class="badge badge-secondary" style="font-size: 0.72rem;">Waiting</span>`;
      case 'room_open':
        return `<span class="badge badge-info" style="font-size: 0.72rem;">Room Open</span>`;
      case 'step1_active':
        return `<span class="badge badge-warning" style="font-size: 0.72rem;">Step 1 Active</span>`;
      case 'step2_active':
        return `<span class="badge badge-warning" style="font-size: 0.72rem; background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3);">Step 2 Oral</span>`;
      case 'completed':
        return `<span class="badge badge-success" style="font-size: 0.72rem;">Completed</span>`;
      default:
        return `<span class="badge badge-secondary" style="font-size: 0.72rem;">${status || 'Active'}</span>`;
    }
  },

  applyHistoryFilters(completedExams) {
    let list = [...completedExams];
    const { dateFrom, dateTo, examinerId, teacherId } = this.historyFilter;

    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter(e => new Date(e.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(e => new Date(e.createdAt) <= to);
    }
    if (examinerId) list = list.filter(e => e.examinerId === examinerId);
    if (teacherId)  list = list.filter(e => e.teacherId  === teacherId);

    return list;
  },

  hasActiveFilters() {
    const f = this.historyFilter;
    return f.dateFrom || f.dateTo || f.examinerId || f.teacherId;
  },

  /* ── main render ─────────────────────────────────── */
  render(container) {
    const authStaff = window.store ? window.store.getAuthenticatedStaff() : null;
    if (!authStaff || authStaff.role !== 'admin') {
      if (window.LoginView) window.LoginView.render(container);
      return;
    }

    const exams     = window.store.getExams();
    const examiners = window.store.getUsersByRole('examiner');
    const teachers  = window.store.getUsersByRole('teacher');
    const admins    = window.store.getUsersByRole('admin');
    const tracks    = window.store.getTracks();

    const activeExams    = exams.filter(e => e.status !== 'completed');
    const completedExams = exams.filter(e => e.status === 'completed');

    container.innerHTML = `
      <div class="admin-wrapper">

        <!-- ── Top Admin Navigation Bar ── -->
        <div class="admin-nav-bar">
          <button class="admin-nav-tab ${this.activeAdminTab === 'dashboard' ? 'active' : ''}" data-admin-tab="dashboard">
            ${window.Icons.get('trophy', 16)} Boshqaruv Paneli
          </button>
          <button class="admin-nav-tab ${this.activeAdminTab === 'create' ? 'active' : ''}" data-admin-tab="create">
            ${window.Icons.get('key', 16)} Imtihon Seansini Yaratish
          </button>
          <button class="admin-nav-tab ${this.activeAdminTab === 'staff' ? 'active' : ''}" data-admin-tab="staff">
            ${window.Icons.get('users', 16)} O'qituvchilar va Xodimlar (${teachers.length + examiners.length + admins.length})
          </button>
          <button class="admin-nav-tab ${this.activeAdminTab === 'sessions' ? 'active' : ''}" data-admin-tab="sessions">
            ${window.Icons.get('quiz', 16)} Seanslar va Tarix (${exams.length})
          </button>
          <button class="admin-nav-tab ${this.activeAdminTab === 'questions' ? 'active' : ''}" data-admin-tab="questions">
            ${window.Icons.get('clipboard', 16)} Savollar Bazasi (60+)
          </button>
        </div>

        <!-- ── Tab Content Container ── -->
        <div id="adminTabContent">
          ${this.renderAdminTabContent(activeExams, completedExams, examiners, teachers, admins, tracks, exams)}
        </div>

      </div>
    `;

    this.bindEvents(container);
  },

  renderAdminTabContent(activeExams, completedExams, examiners, teachers, admins, tracks, exams) {
    switch (this.activeAdminTab) {
      case 'dashboard':
        return this.renderDashboardTab(activeExams, completedExams, examiners, teachers, admins, tracks, exams);
      case 'create':
        return this.renderCreateExamTab(examiners, teachers, tracks);
      case 'staff':
        return this.renderFacultyStaffTab(examiners, teachers, admins);
      case 'sessions':
        return this.renderSessionsTab(activeExams, completedExams, examiners, teachers);
      case 'questions':
        return this.renderQuestionBankTab(tracks);
      default:
        return this.renderDashboardTab(activeExams, completedExams, examiners, teachers, admins, tracks, exams);
    }
  },

  /* ── 1. Dashboard Tab ────────────────────────────── */
  renderDashboardTab(activeExams, completedExams, examiners, teachers, admins, tracks, exams) {
    const totalStudents = exams.reduce((acc, e) => acc + e.joinedStudents.length, 0);

    return `
      <!-- Stats Row -->
      <div class="grid-4" style="margin-bottom: 2rem;">
        <div class="card">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Jami Seanslar</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--text-main); margin: 0.15rem 0;">${exams.length}</div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan);">${tracks.length} ta yo'nalish bo'yicha</div>
        </div>

        <div class="card" style="border-color: var(--accent-cyan);">
          <div style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Faol Xonalar</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-cyan); margin: 0.15rem 0;">${activeExams.length}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Yagona kalitlar berilgan</div>
        </div>

        <div class="card" style="border-color: var(--accent-amber);">
          <div style="font-size: 0.78rem; color: var(--accent-amber); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Qatnashayotgan Talabalar</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-amber); margin: 0.15rem 0;">
            ${totalStudents}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Barcha xonalar bo'yicha</div>
        </div>

        <div class="card" style="border-color: var(--accent-emerald);">
          <div style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Yakunlangan Imtihonlar</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-emerald); margin: 0.15rem 0;">${completedExams.length}</div>
          <div style="font-size: 0.75rem; color: var(--accent-emerald);">Arxivda saqlangan</div>
        </div>
      </div>

      <!-- Quick Action Grid -->
      <div class="grid-2" style="margin-bottom: 2rem;">
        <div class="card" style="border-color: var(--border-highlight);">
          <div class="card-header">
            <h3 class="card-title">${window.Icons.get('key', 20, 'icon-title')} Tezkor Imtihon Yaratish</h3>
            <button class="btn btn-primary btn-sm switch-admin-tab-btn" data-target-tab="create">
              Imtihon Yaratish Paneli ${window.Icons.get('door', 14)}
            </button>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted);">
            Yangi baholash seansini yarating, mas'ul o'qituvchi va imtihonchini biriktiring va rasmiy yagona kalitni shakllantiring.
          </p>
        </div>

        <div class="card" style="border-color: var(--accent-cyan);">
          <div class="card-header">
            <h3 class="card-title">${window.Icons.get('users', 20, 'icon-title')} O'qituvchilarni Boshqarish</h3>
            <button class="btn btn-outline-cyan btn-sm switch-admin-tab-btn" data-target-tab="staff">
              Xodimlarni Boshqarish (${teachers.length} O'qituvchilar) ${window.Icons.get('door', 14)}
            </button>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted);">
            O'qituvchilarni qo'shing, imtihonchilik maqomini biriktiring yoki bekor qiling.
          </p>
        </div>
      </div>

      <!-- Active Rooms Monitor -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${window.Icons.get('quiz', 20, 'icon-title')} Faol Imtihon Xonalari (${activeExams.length})</h3>
          <button class="btn btn-secondary btn-sm switch-admin-tab-btn" data-target-tab="sessions">
            Barcha Seanslarni Ko'rish ${window.Icons.get('door', 14)}
          </button>
        </div>
        ${this.renderActiveExamsTable(activeExams, examiners, teachers)}
      </div>
    `;
  },

  /* ── 2. Create Exam Tab ──────────────────────────── */
  renderCreateExamTab(examiners, teachers, tracks) {
    return `
      <div class="card" style="border-color: var(--border-highlight); max-width: 900px; margin: 0 auto;">
        <div class="card-header">
          <h3 class="card-title">
            ${window.Icons.get('key', 22, 'icon-title')} Yangi Imtihon Seansini Yaratish va Yagona Kalit Generator
          </h3>
          <span class="badge badge-info">Admin Boshqaruvi</span>
        </div>

        <form id="createExamForm">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="examTitleInput">Imtihon Seansi Nomi *</label>
              <input type="text" id="examTitleInput" class="form-input" placeholder="masalan: Fullstack Oralik Imtihoni 2026" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="groupNameInput">Mo'ljallangan Talabalar Guruhi *</label>
              <input type="text" id="groupNameInput" class="form-input" placeholder="masalan: Guruh A – Veb Arxitektura" required>
            </div>
          </div>

          <div class="grid-3" style="margin-top: 0.5rem;">
            <div class="form-group">
              <label class="form-label" for="trackSelect">Imtihon Yo'nalishi *</label>
              <select id="trackSelect" class="form-select" required>
                ${tracks.map(t => `<option value="${t.id}">${t.title} (${t.category})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="examinerSelect">Biriktirilgan Og'zaki Imtihonchi *</label>
              <select id="examinerSelect" class="form-select" required>
                ${examiners.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="teacherSelect">Biriktirilgan Loyiha O'qituvchisi *</label>
              <select id="teacherSelect" class="form-select" required>
                ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="text-align: right; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary btn-lg" style="display: inline-flex; align-items: center; gap: 0.5rem;">
              ${window.Icons.get('key', 18)} Yagona Imtihon Kalitini Yaratish va Seansni Boshlash
            </button>
          </div>
        </form>
      </div>
    `;
  },

  /* ── 3. Faculty & Staff Tab (Spacious Full-Width) ── */
  renderFacultyStaffTab(examiners, teachers, admins) {
    const staffMap = new Map();

    teachers.forEach(t => {
      staffMap.set(t.id, {
        id: t.id,
        name: t.name,
        department: t.department || 'Academic Staff',
        isTeacher: true,
        isExaminer: Boolean(t.isExaminer),
        isAdmin: false,
        examinerId: t.examinerId || null
      });
    });

    examiners.forEach(e => {
      const linkedTeacher = teachers.find(t => t.examinerId === e.id || t.name === e.name);
      if (linkedTeacher) {
        const existing = staffMap.get(linkedTeacher.id);
        if (existing) {
          existing.isExaminer = true;
          existing.examinerId = e.id;
        }
      } else {
        staffMap.set(e.id, {
          id: e.id,
          name: e.name,
          department: e.title || 'Certified Examiner',
          isTeacher: false,
          isExaminer: true,
          isAdmin: false,
          examinerId: e.id
        });
      }
    });

    admins.forEach(a => {
      staffMap.set(a.id, {
        id: a.id,
        name: a.name,
        department: a.title || 'Platform Administrator',
        isTeacher: false,
        isExaminer: false,
        isAdmin: true
      });
    });

    const allStaff = Array.from(staffMap.values());
    const examinerCount = allStaff.filter(s => s.isExaminer).length;
    const teacherCount  = allStaff.filter(s => s.isTeacher).length;
    const adminCount    = allStaff.filter(s => s.isAdmin).length;

    let filterList = allStaff;
    if (this.staffSubFilter === 'teachers') {
      filterList = allStaff.filter(s => s.isTeacher);
    } else if (this.staffSubFilter === 'examiners') {
      filterList = allStaff.filter(s => s.isExaminer);
    } else if (this.staffSubFilter === 'admins') {
      filterList = allStaff.filter(s => s.isAdmin);
    }

    return `
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="card-title">
              ${window.Icons.get('users', 22, 'icon-title')} Faculty &amp; Staff Directory
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
              Manage academic staff, grant or revoke Examiner certifications, and remove accounts.
            </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button id="openAddAdminModalBtn" class="btn btn-outline-cyan">
              ${window.Icons.get('plus', 16)} Add New Admin
            </button>
            <button id="openAddTeacherModalBtn" class="btn btn-success">
              ${window.Icons.get('plus', 16)} Add New Teacher
            </button>
          </div>
        </div>

        <!-- Sub-filter Buttons -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <button class="btn ${this.staffSubFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm staff-subfilter-btn" data-filter="all">
            All Staff (${allStaff.length})
          </button>
          <button class="btn ${this.staffSubFilter === 'teachers' ? 'btn-primary' : 'btn-secondary'} btn-sm staff-subfilter-btn" data-filter="teachers">
            Teachers (${teacherCount})
          </button>
          <button class="btn ${this.staffSubFilter === 'examiners' ? 'btn-primary' : 'btn-secondary'} btn-sm staff-subfilter-btn" data-filter="examiners">
            Examiners (${examinerCount})
          </button>
          <button class="btn ${this.staffSubFilter === 'admins' ? 'btn-primary' : 'btn-secondary'} btn-sm staff-subfilter-btn" data-filter="admins">
            Admins (${adminCount})
          </button>
        </div>

        <!-- Staff List Container -->
        <div class="staff-list-container">
          ${filterList.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              ${window.Icons.get('users', 40)}
              <p style="margin-top: 0.5rem;">No staff accounts found in this category.</p>
            </div>
          ` : filterList.map(person => `
            <div class="staff-row-card">
              <div class="staff-row-main">
                <div class="staff-avatar">
                  ${person.isAdmin ? window.Icons.get('admin', 18) : person.isExaminer ? window.Icons.get('examiner', 18) : window.Icons.get('teacher', 18)}
                </div>
                <div class="staff-info">
                  <div class="staff-name" style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    ${person.name}
                    ${person.isAdmin ? '<span class="badge badge-info" style="font-size:0.65rem;">ADMIN</span>' : ''}
                    ${person.isExaminer ? '<span class="badge badge-success" style="font-size:0.65rem;">CERTIFIED EXAMINER</span>' : ''}
                    ${person.isTeacher && !person.isExaminer && !person.isAdmin ? '<span class="badge badge-warning" style="font-size:0.65rem;">TEACHER</span>' : ''}
                  </div>
                  <div class="staff-dept" style="font-size:0.78rem; color:var(--text-muted); margin-top:0.15rem;">
                    ${person.department}
                  </div>
                </div>
              </div>

              <div class="staff-actions" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                ${!person.isAdmin ? `
                  <button class="btn ${person.isExaminer ? 'btn-outline-cyan' : 'btn-outline-emerald'} btn-sm toggle-examiner-btn" data-staff-id="${person.id}">
                    ${person.isExaminer ? window.Icons.get('check', 13) + ' Revoke Examiner Certification' : window.Icons.get('plus', 13) + ' Grant Examiner Certification'}
                  </button>
                ` : ''}

                <button class="btn btn-outline-danger btn-sm remove-staff-btn" data-staff-id="${person.id}">
                  ${window.Icons.get('trash', 13)} Delete Account
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ── 4. Sessions & History Tab ───────────────────── */
  renderSessionsTab(activeExams, completedExams, examiners, teachers) {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <h3 class="card-title">
            ${window.Icons.get('quiz', 22, 'icon-title')} Exam Sessions Management
          </h3>
          <div style="display: flex; gap: 0.5rem;">
            <button id="tabActiveBtn" class="btn ${this.activeTab === 'active' ? 'btn-primary' : 'btn-secondary'} btn-sm">Active Rooms (${activeExams.length})</button>
            <button id="tabHistoryBtn" class="btn ${this.activeTab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm">History Archive (${completedExams.length})</button>
          </div>
        </div>

        ${this.activeTab === 'active'
          ? this.renderActiveExamsTable(activeExams, examiners, teachers)
          : `<div id="historyPane">${this.renderHistorySection(completedExams, examiners, teachers)}</div>`}
      </div>
    `;
  },

  /* ── 5. Question Bank Tab (Admin Only Manager) ────────────────────────── */
  renderQuestionBankTab(tracks) {
    if (!this.selectedTrackId) this.selectedTrackId = tracks[0].id;
    if (!this.selectedQuestionType) this.selectedQuestionType = 'all';
    if (this.questionSearchQuery === undefined) this.questionSearchQuery = '';

    const allBankQuestions = window.store.getQuestionBank(this.selectedTrackId, this.selectedQuestionType);
    const searchQuery = this.questionSearchQuery.toLowerCase().trim();

    const questions = allBankQuestions.filter(q => {
      if (!searchQuery) return true;
      const promptText = (q.prompt || q.question || '').toLowerCase();
      const hintText = (q.hint || '').toLowerCase();
      const idText = (q.id || '').toLowerCase();
      return promptText.includes(searchQuery) || hintText.includes(searchQuery) || idText.includes(searchQuery);
    });

    const writtenCount = window.store.getQuestionBank(this.selectedTrackId, 'written').length;
    const oralCount = window.store.getQuestionBank(this.selectedTrackId, 'oral').length;

    return `
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="card-title">
              ${window.Icons.get('clipboard', 22, 'icon-title')} Savollar Bazasini Boshqaruvchi Panel
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
              Imtihon savollarini ko'rish, qo'shish, tahrirlash, o'chirish yoki CSV shaklida yuklash.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button id="addNewTrackModalBtn" class="btn btn-outline-cyan btn-sm">
              ${window.Icons.get('plus', 14)} + Yo'nalish Qo'shish
            </button>
            <button id="exportQuestionBankCSVBtn" class="btn btn-outline-cyan btn-sm">
              ${window.Icons.get('copy', 14)} CSV Eksport
            </button>
            <button id="openImportModalBtn" class="btn btn-secondary btn-sm">
              ${window.Icons.get('plus', 14)} CSV / JSON Import
            </button>
            <button id="addQuestionBankModalBtn" class="btn btn-primary btn-sm">
              ${window.Icons.get('plus', 14)} + Savol Qo'shish
            </button>
          </div>
        </div>

        <!-- Track & Type Filter Bar -->
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; background: rgba(0,0,0,0.25); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label class="form-label" style="margin: 0; font-size: 0.82rem; white-space: nowrap;">Yo'nalish:</label>
            <select id="questionTrackSelect" class="form-select" style="max-width: 260px; padding: 0.45rem 0.75rem; font-size: 0.85rem;">
              <option value="all" ${this.selectedTrackId === 'all' ? 'selected' : ''}>Barcha Yo'nalishlar (Umumiy)</option>
              ${tracks.map(t => `<option value="${t.id}" ${t.id === this.selectedTrackId ? 'selected' : ''}>${t.title}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label class="form-label" style="margin: 0; font-size: 0.82rem; white-space: nowrap;">Turi:</label>
            <select id="questionTypeSelect" class="form-select" style="max-width: 200px; padding: 0.45rem 0.75rem; font-size: 0.85rem;">
              <option value="all" ${this.selectedQuestionType === 'all' ? 'selected' : ''}>Barcha Savollar (${writtenCount + oralCount})</option>
              <option value="written" ${this.selectedQuestionType === 'written' ? 'selected' : ''}>Nazariy Yozma Test (20 ta)</option>
              <option value="oral" ${this.selectedQuestionType === 'oral' ? 'selected' : ''}>Og'zaki Texnik Imtihon (5 ta)</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 220px;">
            <input type="text" id="questionSearchInput" class="form-input" placeholder="Savollarni qidirish..." value="${this.questionSearchQuery}" style="padding: 0.45rem 0.85rem; font-size: 0.85rem;">
          </div>

          <div style="display: flex; gap: 0.5rem; margin-left: auto;">
            <span class="badge badge-success" style="font-size: 0.78rem;">
              ${writtenCount} Yozma
            </span>
            <span class="badge badge-info" style="font-size: 0.78rem;">
              ${oralCount} Og'zaki
            </span>
          </div>
        </div>

        <!-- Question List View -->
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; gap: 0.5rem;">
              ${window.Icons.get('clipboard', 16)} Savollar Havzasi (${questions.length} ta savol ko'rsatilgan)
            </h4>
          </div>

          ${questions.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
              <p style="font-weight: 700; color: var(--text-main);">Filtrlarga mos keladigan savollar topilmadi.</p>
              <p style="font-size: 0.83rem; margin-top: 0.3rem;">Savol qo'shish uchun <strong>+ Savol Qo'shish</strong> tugmasini bosing.</p>
            </div>
          ` : `
            <div class="admin-question-pool-list">
              ${questions.map((q, idx) => {
                const isOral = q.type === 'oral';
                return `
                  <div class="admin-question-card-item">
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                        <span class="badge ${isOral ? 'badge-info' : 'badge-success'}" style="font-size: 0.68rem; text-transform: uppercase;">
                          ${isOral ? '🎙️ Og\'zaki Imtihon' : '📝 Yozma Test'}
                        </span>
                        <span class="badge badge-secondary" style="font-size: 0.68rem; font-family: var(--font-mono);">
                          Yo'nalish: ${q.trackId}
                        </span>
                      </div>
                      <strong style="font-size: 0.92rem; color: var(--text-main); line-height: 1.4; display: block;">
                        #${idx + 1}. ${window.escapeHTML(q.prompt || q.question)}
                      </strong>
                      ${q.hint ? `<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.3rem; font-style: italic;">Izoh: ${window.escapeHTML(q.hint)}</div>` : ''}
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;">
                      <button class="btn btn-ghost btn-sm edit-question-btn" data-q-id="${q.id}" title="Savolni Tahrirlash" style="color: var(--accent-cyan); padding: 0.25rem 0.55rem; font-size: 0.78rem;">
                        ✏️ Tahrirlash
                      </button>
                      <button class="btn btn-ghost btn-sm delete-question-btn" data-q-id="${q.id}" title="Savolni O'chirish" style="color: var(--accent-rose); padding: 0.25rem 0.55rem; font-size: 0.78rem;">
                        🗑️ O'chirish
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  /* ── Active Exams Table ──────────────────────────── */
  renderActiveExamsTable(exams, examiners, teachers) {
    if (exams.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.4;">${window.Icons.get('key', 48)}</div>
          <p>No active exams. Use the Create Exam tab to generate a unique key and launch a session.</p>
        </div>
      `;
    }

    return `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.7rem 1rem;">Exam Title</th>
              <th style="padding: 0.7rem 1rem;">Group</th>
              <th style="padding: 0.7rem 1rem;">Unique Key</th>
              <th style="padding: 0.7rem 1rem;">Examiner</th>
              <th style="padding: 0.7rem 1rem;">Teacher</th>
              <th style="padding: 0.7rem 1rem;">Students</th>
              <th style="padding: 0.7rem 1rem;">Created</th>
              <th style="padding: 0.7rem 1rem;">Status</th>
              <th style="padding: 0.7rem 1rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${exams.map(e => {
              const examiner = examiners.find(ex => ex.id === e.examinerId);
              const teacher  = teachers.find(t  => t.id  === e.teacherId);
              return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s;">
                  <td style="padding: 0.85rem 1rem; font-weight: 700;">${e.title}</td>
                  <td style="padding: 0.85rem 1rem; color: var(--text-main);">${e.groupName}</td>
                  <td style="padding: 0.85rem 1rem;">
                    <span style="font-family: var(--font-mono); font-size: 0.88rem; color: var(--accent-cyan); background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); padding: 0.25rem 0.6rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.35rem;">
                      ${window.Icons.get('key', 13)} ${e.uniqueKey}
                    </span>
                  </td>
                  <td style="padding: 0.85rem 1rem;">${examiner ? examiner.name : e.examinerId}</td>
                  <td style="padding: 0.85rem 1rem;">${teacher  ? teacher.name  : e.teacherId}</td>
                  <td style="padding: 0.85rem 1rem;"><strong style="color: var(--accent-amber);">${e.joinedStudents.length}</strong></td>
                  <td style="padding: 0.85rem 1rem; font-size: 0.8rem; color: var(--text-muted);">
                    ${this.formatDateTime(e.createdAt)}
                  </td>
                  <td style="padding: 0.85rem 1rem;">${this.renderStatusBadge(e.status)}</td>
                  <td style="padding: 0.85rem 1rem;">
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm admin-download-results-btn" data-exam-id="${e.id}"
                        style="display:flex; align-items:center; gap:0.35rem; border-color:var(--accent-emerald); color:var(--accent-emerald); font-size:0.75rem; padding:0.25rem 0.6rem;">
                        ${window.Icons.get('clipboard', 12)} Download
                      </button>
                      <button class="btn btn-danger btn-sm admin-end-exam-btn" data-exam-id="${e.id}"
                        style="font-size:0.75rem; padding:0.25rem 0.6rem; display:flex; align-items:center; gap:0.3rem;">
                        ${window.Icons.get('exit', 12)} End
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /* ── History Section (filters + cards) ──────────── */
  renderHistorySection(completedExams, examiners, teachers) {
    const filtered = this.applyHistoryFilters(completedExams);
    const active   = this.hasActiveFilters();

    return `
      <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.85rem;">
          ${window.Icons.get('clipboard', 15)}
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Filter History</span>
          ${active ? `
            <button id="clearHistoryFiltersBtn" class="btn btn-ghost btn-sm" style="margin-left: auto; color: var(--accent-rose); font-size: 0.78rem; display: flex; align-items: center; gap: 0.3rem;">
              ${window.Icons.get('alert', 13)} Clear Filters
            </button>
          ` : ''}
        </div>

        <div class="history-filter-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem;">
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Date From</label>
            <input type="date" id="filterDateFrom" class="form-input" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;"
              value="${this.historyFilter.dateFrom}">
          </div>
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Date To</label>
            <input type="date" id="filterDateTo" class="form-input" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;"
              value="${this.historyFilter.dateTo}">
          </div>
          <div>
            <label class="form-label" style="font-size: 0.75rem;">By Examiner</label>
            <select id="filterExaminer" class="form-select" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;">
              <option value="">All Examiners</option>
              ${examiners.map(e => `<option value="${e.id}" ${this.historyFilter.examinerId === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.75rem;">By Teacher</label>
            <select id="filterTeacher" class="form-select" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;">
              <option value="">All Teachers</option>
              ${teachers.map(t => `<option value="${t.id}" ${this.historyFilter.teacherId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>
        </div>

        ${active ? `
          <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
            ${window.Icons.get('check', 13)} Showing <strong style="color: var(--accent-cyan);">${filtered.length}</strong> of <strong>${completedExams.length}</strong> records matching your filters.
          </div>
        ` : ''}
      </div>

      ${this.renderExamHistoryCards(filtered, completedExams, examiners, teachers)}
    `;
  },

  /* ── History Cards ───────────────────────────────── */
  renderExamHistoryCards(filtered, all, examiners, teachers) {
    if (all.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.4;">${window.Icons.get('trophy', 48)}</div>
          <p>No completed exam history records yet.</p>
        </div>
      `;
    }

    if (filtered.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.4;">${window.Icons.get('alert', 44)}</div>
          <p style="font-weight: 700; color: var(--text-main);">No results match your filters</p>
          <p style="font-size: 0.85rem; margin-top: 0.4rem;">Try adjusting or clearing the filters above.</p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${filtered.map(e => {
          const examiner = examiners.find(ex => ex.id === e.examinerId);
          const teacher  = teachers.find(t  => t.id  === e.teacherId);
          const track    = window.store.getTrackById(e.trackId);
          const avgScore = e.joinedStudents.length
            ? Math.round(e.joinedStudents.reduce((s, st) => s + (st.finalScorePct || 0), 0) / e.joinedStudents.length)
            : null;

          const completedAt = e.joinedStudents.reduce((latest, st) => {
            const t = st.l2TechnicalGrade?.finishedAt || st.teacherProjectGrade?.gradedAt || null;
            if (!t) return latest;
            return (!latest || new Date(t) > new Date(latest)) ? t : latest;
          }, null);

          return `
            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.07); border-left: 3px solid var(--accent-emerald); border-radius: var(--radius-md); padding: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.85rem; margin-bottom: 1rem;">
                <div style="flex: 1; min-width: 0;">
                  <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    ${window.Icons.get('trophy', 16)} ${e.title}
                  </h4>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.6rem 1.5rem; margin-top: 0.5rem;">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${window.Icons.get('users', 13)} <strong style="color: var(--text-main);">${e.groupName}</strong></span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${window.Icons.get('key', 13)} <code style="color: var(--accent-cyan); font-size: 0.82rem;">${e.uniqueKey}</code></span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${window.Icons.get('clipboard', 13)} ${track ? track.title : e.trackId}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${window.Icons.get('examiner', 13)} <strong style="color: var(--text-main);">${examiner ? examiner.name : e.examinerId}</strong></span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${window.Icons.get('teacher', 13)} <strong style="color: var(--text-main);">${teacher ? teacher.name : e.teacherId}</strong></span>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0;">
                  <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
                    <span class="badge badge-success">${window.Icons.get('check', 11)} Completed &amp; Archived</span>
                    <button class="btn btn-secondary btn-sm admin-download-results-btn" data-exam-id="${e.id}"
                      style="display:flex; align-items:center; gap:0.35rem; border-color:var(--accent-emerald); color:var(--accent-emerald); font-size:0.74rem; padding:0.2rem 0.6rem;">
                      ${window.Icons.get('clipboard', 12)} Download Results
                    </button>
                    <button class="btn btn-outline-cyan btn-sm view-exam-audit-btn" data-exam-id="${e.id}"
                      style="display:flex; align-items:center; gap:0.35rem; font-size:0.74rem; padding:0.2rem 0.6rem;">
                      👁️ View Complete Audit Record
                    </button>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
                    <div>Created: <strong style="color: var(--text-main);">${this.formatDateTime(e.createdAt)}</strong></div>
                    ${completedAt ? `<div>Completed: <strong style="color: var(--accent-emerald);">${this.formatDateTime(completedAt)}</strong></div>` : ''}
                  </div>
                  ${avgScore !== null ? `
                    <div style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; color: var(--accent-emerald);">
                      Avg Score: ${avgScore}%
                    </div>
                  ` : ''}
                </div>
              </div>

              <h5 style="font-size: 0.82rem; color: var(--accent-emerald); font-weight: 700; margin-bottom: 0.6rem;">
                ${window.Icons.get('users', 13)} Student Score Breakdown (${e.joinedStudents.length} students)
              </h5>

              ${e.joinedStudents.length === 0 ? `
                <p style="font-size: 0.82rem; color: var(--text-subtle); font-style: italic;">No students joined this exam.</p>
              ` : `
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.83rem;">
                    <thead>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.07); color: var(--text-muted);">
                        <th style="padding: 0.45rem 0.7rem;">Student Name</th>
                        <th style="padding: 0.45rem 0.7rem;">Quiz &amp; Written</th>
                        <th style="padding: 0.45rem 0.7rem;">Project Eval</th>
                        <th style="padding: 0.45rem 0.7rem;">Technical Oral</th>
                        <th style="padding: 0.45rem 0.7rem;">Final Score</th>
                        <th style="padding: 0.45rem 0.7rem;">Joined At</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${e.joinedStudents.map(std => {
                        const final = std.finalScorePct;
                        const tier  = final >= 90 ? 'var(--accent-amber)' : final >= 75 ? 'var(--accent-cyan)' : final >= 60 ? 'var(--accent-purple)' : 'var(--text-muted)';
                        return `
                          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <td style="padding: 0.55rem 0.7rem; font-weight: 700;">${std.name}</td>
                            <td style="padding: 0.55rem 0.7rem; color: var(--accent-cyan);">${std.l1Grade ? std.l1Grade.totalL1Pct + '%' : '—'}</td>
                            <td style="padding: 0.55rem 0.7rem; color: var(--accent-emerald);">${std.teacherProjectGrade ? std.teacherProjectGrade.totalL3Pct + '%' : '—'}</td>
                            <td style="padding: 0.55rem 0.7rem; color: var(--accent-purple);">${std.l2TechnicalGrade ? std.l2TechnicalGrade.speakingScorePct + '%' : '—'}</td>
                            <td style="padding: 0.55rem 0.7rem; font-weight: 800; color: ${tier}; font-size: 0.92rem;">${final ? final + '%' : '—'}</td>
                            <td style="padding: 0.55rem 0.7rem; font-size: 0.77rem; color: var(--text-muted);">${this.formatDateTime(std.joinedAt)}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /* ── Bind Events ─────────────────────────────────── */
  bindEvents(container) {
    // Top Admin Navigation Tabs
    container.querySelectorAll('.admin-nav-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeAdminTab = e.currentTarget.getAttribute('data-admin-tab');
        this.render(container);
      });
    });

    // Quick switch tab buttons in Dashboard
    container.querySelectorAll('.switch-admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeAdminTab = e.currentTarget.getAttribute('data-target-tab');
        this.render(container);
      });
    });

    // Admin: Download Exam Results
    container.querySelectorAll('.admin-download-results-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const examId = btn.dataset.examId;
        const exam   = window.store.getExamById(examId);
        if (!exam) return;
        const csv = window.store.exportExamResultsCSV(examId);
        if (!csv) { window.toast('No data to export yet.', 'warning'); return; }
        const safeName = exam.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const date     = new Date().toISOString().split('T')[0];
        window.downloadCSV(csv, `EduGrade360_${safeName}_${date}.csv`);
        window.toast('Results downloaded (open in Excel).', 'success');
      });
    });

    // Admin: End Exam Now
    container.querySelectorAll('.admin-end-exam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const examId = btn.dataset.examId;
        const res = window.store.endExam(examId);
        if (res.success) {
          window.toast(res.message, 'success');
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    });

    // Staff Sub-filter buttons
    container.querySelectorAll('.staff-subfilter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.staffSubFilter = e.currentTarget.getAttribute('data-filter');
        this.render(container);
      });
    });

    // Toggle Examiner Certification
    container.querySelectorAll('.toggle-examiner-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const staffId = e.currentTarget.dataset.staffId;
        const res = window.store.toggleTeacherExaminerRole(staffId);
        if (res.success) {
          window.toast(res.message, 'success');
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    });

    // Delete Staff Account
    container.querySelectorAll('.remove-staff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const staffId = e.currentTarget.dataset.staffId;
        const res = window.store.removeStaff(staffId);
        if (res.success) {
          window.toast(res.message, 'success');
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    });

    // Question Bank Track select
    const qTrackSel = container.querySelector('#questionTrackSelect');
    if (qTrackSel) {
      qTrackSel.addEventListener('change', (e) => {
        this.selectedTrackId = e.target.value;
        this.render(container);
      });
    }

    // Question Bank Type select
    const qTypeSel = container.querySelector('#questionTypeSelect');
    if (qTypeSel) {
      qTypeSel.addEventListener('change', (e) => {
        this.selectedQuestionType = e.target.value;
        this.render(container);
      });
    }

    // Question Search Input
    const qSearchInput = container.querySelector('#questionSearchInput');
    if (qSearchInput) {
      qSearchInput.addEventListener('input', (e) => {
        this.questionSearchQuery = e.target.value;
        // Search without resetting cursor position
        const allBankQuestions = window.store.getQuestionBank(this.selectedTrackId, this.selectedQuestionType);
        const searchQuery = (this.questionSearchQuery || '').toLowerCase().trim();
        const questions = allBankQuestions.filter(q => {
          if (!searchQuery) return true;
          const promptText = (q.prompt || q.question || '').toLowerCase();
          const hintText = (q.hint || '').toLowerCase();
          const idText = (q.id || '').toLowerCase();
          return promptText.includes(searchQuery) || hintText.includes(searchQuery) || idText.includes(searchQuery);
        });
        
        const listWrap = container.querySelector('#adminTabContent');
        if (listWrap && this.activeAdminTab === 'questions') {
          this.render(container);
        }
      });
    }

    // Question Bank Export CSV button
    const exportCSVBtn = container.querySelector('#exportQuestionBankCSVBtn');
    if (exportCSVBtn) {
      exportCSVBtn.addEventListener('click', () => {
        const trackId = this.selectedTrackId || 'all';
        const csv = window.store.exportQuestionBankCSV(trackId);
        window.downloadCSV(csv, `QuestionBank_${trackId}_${new Date().toISOString().split('T')[0]}.csv`);
        window.toast('Question Bank exported to CSV!', 'success');
      });
    }
    // Question Bank Add Track button
    const addTrackBtn = container.querySelector('#addNewTrackModalBtn');
    if (addTrackBtn) {
      addTrackBtn.addEventListener('click', () => {
        this.showAddTrackModal(container);
      });
    }

    // Question Bank Import button
    const openImpBtn = container.querySelector('#openImportModalBtn');
    if (openImpBtn) {
      openImpBtn.addEventListener('click', () => {
        this.showImportDatabaseModal(container);
      });
    }

    // Question Bank Add Question button
    const addQBtn = container.querySelector('#addQuestionBankModalBtn');
    if (addQBtn) {
      addQBtn.addEventListener('click', () => {
        this.showAddEditQuestionModal(container);
      });
    }

    // Edit Question button
    container.querySelectorAll('.edit-question-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qId = e.currentTarget.dataset.qId;
        const all = window.store.getQuestionBank('all', 'all');
        const q = all.find(item => item.id === qId);
        if (q) {
          this.showAddEditQuestionModal(container, q);
        }
      });
    });

    // Delete Question button
    container.querySelectorAll('.delete-question-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qId = e.currentTarget.dataset.qId;
        if (confirm(`Are you sure you want to delete question "${qId}"?`)) {
          const res = window.store.deleteQuestionFromBank(qId);
          if (res.success) {
            window.toast(res.message, 'success');
            this.render(container);
          } else {
            window.toast(res.message, 'danger');
          }
        }
      });
    });

    // View Complete Audit Record button
    container.querySelectorAll('.view-exam-audit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const examId = e.currentTarget.dataset.examId;
        this.showExamAuditModal(examId);
      });
    });

    // Create Exam form
    const form = container.querySelector('#createExamForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title      = container.querySelector('#examTitleInput').value.trim();
        const groupName  = container.querySelector('#groupNameInput').value.trim();
        const trackId    = container.querySelector('#trackSelect').value;
        const examinerId = container.querySelector('#examinerSelect').value;
        const teacherId  = container.querySelector('#teacherSelect').value;

        if (!title || !groupName) {
          window.toast('Please fill in Exam Title and Group Name.', 'warning');
          return;
        }

        const newExam = window.store.createExam({ title, groupName, trackId, examinerId, teacherId });
        window.toast(`Exam created! Key: ${newExam.uniqueKey}`, 'success');
        this.showKeyGeneratedModal(newExam);
        this.activeAdminTab = 'sessions';
        this.render(container);
      });
    }

    // Sessions Sub-tab switchers
    const tabActiveBtn  = container.querySelector('#tabActiveBtn');
    const tabHistoryBtn = container.querySelector('#tabHistoryBtn');
    if (tabActiveBtn && tabHistoryBtn) {
      tabActiveBtn.addEventListener('click', () => { this.activeTab = 'active';  this.render(container); });
      tabHistoryBtn.addEventListener('click',() => { this.activeTab = 'history'; this.render(container); });
    }

    // History Filters
    this._bindFilterEvents(container);

    // Faculty & Staff Management Actions
    const addAdminBtn = container.querySelector('#openAddAdminModalBtn');
    if (addAdminBtn) {
      addAdminBtn.addEventListener('click', () => {
        this.showAddAdminModal(container);
      });
    }

    const addTeacherBtn = container.querySelector('#openAddTeacherModalBtn');
    if (addTeacherBtn) {
      addTeacherBtn.addEventListener('click', () => {
        this.showAddTeacherModal(container);
      });
    }

    container.querySelectorAll('.toggle-examiner-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const teacherId = target.getAttribute('data-teacher-id');
        const teacherName = target.getAttribute('data-teacher-name');
        const isExaminer = target.getAttribute('data-is-examiner') === 'true';

        if (isExaminer) {
          if (confirm(`Revoke Examiner role from ${teacherName}?`)) {
            const res = window.store.toggleTeacherExaminer(teacherId);
            if (res.success) {
              window.toast(res.message, 'info');
              this.render(container);
            } else {
              window.toast(res.message, 'warning');
            }
          }
        } else {
          const res = window.store.toggleTeacherExaminer(teacherId);
          if (res.success) {
            window.toast(res.message, 'success');
            this.render(container);
          } else {
            window.toast(res.message, 'warning');
          }
        }
      });
    });

    container.querySelectorAll('.remove-teacher-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const teacherId = target.getAttribute('data-teacher-id');
        const teacherName = target.getAttribute('data-teacher-name');

        if (confirm(`Are you sure you want to delete Teacher "${teacherName}"?`)) {
          const res = window.store.removeTeacher(teacherId);
          if (res.success) {
            window.toast(res.message, 'success');
            this.render(container);
          } else {
            window.toast(res.message, 'danger');
          }
        }
      });
    });

    container.querySelectorAll('.remove-examiner-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const examinerId = target.getAttribute('data-examiner-id');
        const examinerName = target.getAttribute('data-examiner-name');

        if (confirm(`Are you sure you want to delete Examiner "${examinerName}"?`)) {
          const res = window.store.removeExaminer(examinerId);
          if (res.success) {
            window.toast(res.message, 'success');
            this.render(container);
          } else {
            window.toast(res.message, 'danger');
          }
        }
      });
    });
  },

  /* Refresh only history pane */
  _refreshHistoryOnly(container) {
    const historyPane = container.querySelector('#historyPane');
    if (!historyPane) { this.render(container); return; }

    const exams          = window.store.getExams();
    const completedExams = exams.filter(e => e.status === 'completed');
    const examiners      = window.store.getUsersByRole('examiner');
    const teachers       = window.store.getUsersByRole('teacher');

    historyPane.innerHTML = this.renderHistorySection(completedExams, examiners, teachers);
    this._bindFilterEvents(container);
  },

  _bindFilterEvents(container) {
    const filterDateFrom = container.querySelector('#filterDateFrom');
    const filterDateTo   = container.querySelector('#filterDateTo');
    const filterExaminer = container.querySelector('#filterExaminer');
    const filterTeacher  = container.querySelector('#filterTeacher');
    const clearBtn       = container.querySelector('#clearHistoryFiltersBtn');

    if (filterDateFrom) filterDateFrom.addEventListener('change', (e) => { this.historyFilter.dateFrom   = e.target.value; this._refreshHistoryOnly(container); });
    if (filterDateTo)   filterDateTo.addEventListener('change',   (e) => { this.historyFilter.dateTo     = e.target.value; this._refreshHistoryOnly(container); });
    if (filterExaminer) filterExaminer.addEventListener('change', (e) => { this.historyFilter.examinerId = e.target.value; this._refreshHistoryOnly(container); });
    if (filterTeacher)  filterTeacher.addEventListener('change',  (e) => { this.historyFilter.teacherId  = e.target.value; this._refreshHistoryOnly(container); });
    if (clearBtn)       clearBtn.addEventListener('click', () => {
      this.historyFilter = { dateFrom: '', dateTo: '', examinerId: '', teacherId: '' };
      this._refreshHistoryOnly(container);
    });
  },

  /* ── Key Generated Modal ─────────────────────────── */
  showKeyGeneratedModal(exam) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 1.5rem;">
        <div style="display: inline-flex; padding: 1rem; background: var(--primary-light); border-radius: 50%; color: var(--accent-cyan); margin-bottom: 1rem;">
          ${window.Icons.get('key', 36)}
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800;">Exam Session Created!</h2>
        <p style="color: var(--text-muted); font-size: 0.92rem; margin: 0.5rem 0 1.5rem;">
          A unique key has been generated for <strong>${exam.title}</strong> (${exam.groupName}).
        </p>

        <div style="background: linear-gradient(135deg, rgba(6,182,212,0.12), rgba(99,102,241,0.12)); border: 1px solid var(--accent-cyan); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Official Unique Exam Key</div>
          <div style="font-family: var(--font-mono); font-size: 3rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 4px; margin: 0.4rem 0;">
            ${exam.uniqueKey}
          </div>
          <div style="font-size: 0.84rem; color: var(--text-main);">Share with the assigned Examiner so students can join the room.</div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
          ${window.Icons.get('clock', 13)} Created: ${this.formatDateTime(exam.createdAt)}
        </div>

        <button class="btn btn-primary btn-lg" onclick="document.getElementById('modalOverlay').classList.add('hidden')" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          ${window.Icons.get('door', 16)} Dismiss &amp; View Active Rooms
        </button>
      </div>
    `;
    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  /* ── Add Admin Modal ─────────────────────────────── */
  showAddAdminModal(container) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="padding: 0.5rem 0.5rem 1rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.6rem; background: rgba(99, 102, 241, 0.15); border-radius: 50%; color: var(--accent-cyan);">
            ${window.Icons.get('admin', 24)}
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 0;">Add New Administrator</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;">Register a new platform administrator account.</p>
          </div>
        </div>

        <form id="addAdminForm">
          <div class="form-group">
            <label class="form-label" for="newAdminName">Full Name *</label>
            <input type="text" id="newAdminName" class="form-input" placeholder="e.g. Dr. Marcus Vance" required style="font-size: 0.9rem;">
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="newAdminTitle">Official Title / Role</label>
            <input type="text" id="newAdminTitle" class="form-input" placeholder="e.g. Dean of Operations" value="Platform Administrator" style="font-size: 0.9rem;">
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.4rem;">
              ${window.Icons.get('check', 16)} Register Administrator
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('modalOverlay').classList.remove('hidden');

    const form = document.getElementById('addAdminForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newAdminName').value.trim();
        const title = document.getElementById('newAdminTitle').value.trim();

        const res = window.store.addAdmin({ name, title });
        if (res.success) {
          window.toast(res.message, 'success');
          document.getElementById('modalOverlay').classList.add('hidden');
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    }
  },

  /* ── Add Teacher Modal ──────────────────────────── */
  showAddTeacherModal(container) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="padding: 0.5rem 0.5rem 1rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.6rem; background: rgba(16, 185, 129, 0.15); border-radius: 50%; color: var(--accent-emerald);">
            ${window.Icons.get('teacher', 24)}
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 0;">Add New Teacher</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;">Register a new teacher &amp; optionally assign examiner role.</p>
          </div>
        </div>

        <form id="addTeacherModalForm">
          <div class="form-group">
            <label class="form-label" for="modalTeacherName">Teacher Full Name *</label>
            <input type="text" id="modalTeacherName" class="form-input" placeholder="e.g. Prof. Alan Turing" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="modalTeacherDept">Department / Specialization *</label>
            <input type="text" id="modalTeacherDept" class="form-input" placeholder="e.g. Computer Science &amp; Architecture" required>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
            <label class="mcq-option-label" style="background: transparent; border: none; padding: 0;">
              <input type="checkbox" id="modalIsExaminerCheck">
              <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">Certified Oral &amp; Technical Examiner?</span>
            </label>
            <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0.35rem 0 0 1.65rem;">
              Checking this will also register this teacher as a certified Examiner for Part 2 Technical Speaking assessments.
            </p>

            <div id="examinerTitleWrap" style="margin-top: 0.85rem; display: none;">
              <label class="form-label" for="modalExaminerTitle" style="font-size: 0.78rem;">Custom Examiner Title (Optional)</label>
              <input type="text" id="modalExaminerTitle" class="form-input" style="padding: 0.5rem 0.8rem; font-size: 0.85rem;" placeholder="e.g. Lead Technical Examiner">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-success" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              ${window.Icons.get('check', 16)} Add Teacher
            </button>
          </div>
        </form>
      </div>
    `;

    const check = modalBody.querySelector('#modalIsExaminerCheck');
    const titleWrap = modalBody.querySelector('#examinerTitleWrap');
    if (check && titleWrap) {
      check.addEventListener('change', (e) => {
        titleWrap.style.display = e.target.checked ? 'block' : 'none';
      });
    }

    const form = modalBody.querySelector('#addTeacherModalForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = modalBody.querySelector('#modalTeacherName').value.trim();
        const department = modalBody.querySelector('#modalTeacherDept').value.trim();
        const isExaminer = check ? check.checked : false;
        const title = modalBody.querySelector('#modalExaminerTitle')?.value.trim() || '';

        const res = window.store.addTeacher({ name, department, isExaminer, title });
        if (res.success) {
          window.toast(res.message, 'success');
          document.getElementById('modalOverlay').classList.add('hidden');
          this.render(container);
        } else {
          window.toast(res.message, 'warning');
        }
      });
    }

    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  /* ── Import Database Modal ───────────────────────── */
  showImportDatabaseModal(container) {
    const modalBody = document.getElementById('modalBody');
    const tracks = window.store.getTracks();
    const currentTrackId = this.selectedTrackId || tracks[0].id;

    modalBody.innerHTML = `
      <div style="padding: 0.5rem 0.5rem 1rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.6rem; background: rgba(99, 102, 241, 0.15); border-radius: 50%; color: var(--accent-cyan);">
            ${window.Icons.get('clipboard', 24)}
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 0;">Import Question Bank Database</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;">Upload or paste custom JSON/CSV question bank (min 60 questions per track level).</p>
          </div>
        </div>

        <form id="importQuestionBankForm">
          <div class="form-group">
            <label class="form-label">Target Exam Track Level *</label>
            <select id="importTrackSelect" class="form-select" required>
              ${tracks.map(t => `<option value="${t.id}" ${t.id === currentTrackId ? 'selected' : ''}>${t.title} (${t.category})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Upload JSON / CSV File (Optional)</label>
            <input type="file" id="importFileInput" accept=".json,.csv,.txt" class="form-input" style="padding: 0.5rem;">
          </div>

          <div class="form-group">
            <label class="form-label">Or Paste Question Bank JSON Array *</label>
            <textarea id="importJsonTextarea" class="form-textarea" placeholder='[\n  { "prompt": "Question text...", "hint": "Guidance hint..." },\n  ...\n]' style="min-height: 140px; font-family: var(--font-mono); font-size: 0.82rem;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              ${window.Icons.get('check', 16)} Import Database
            </button>
          </div>
        </form>
      </div>
    `;

    const fileInput = modalBody.querySelector('#importFileInput');
    const jsonArea  = modalBody.querySelector('#importJsonTextarea');

    if (fileInput && jsonArea) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          jsonArea.value = evt.target.result;
        };
        reader.readAsText(file);
      });
    }

    const form = modalBody.querySelector('#importQuestionBankForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const trackId = modalBody.querySelector('#importTrackSelect').value;
        const rawContent = jsonArea.value.trim();

        if (!rawContent) {
          window.toast('Please select a file or paste CSV/JSON content.', 'warning');
          return;
        }

        if (rawContent.startsWith('{') || rawContent.startsWith('[')) {
          try {
            const parsed = JSON.parse(rawContent);
            if (Array.isArray(parsed)) {
              let importedCount = 0;
              parsed.forEach(item => {
                const res = window.store.addQuestionToBank(
                  trackId,
                  item.type || 'written',
                  { prompt: item.prompt || item.question, hint: item.hint || '' }
                );
                if (res.success) importedCount++;
              });
              window.toast(`Successfully imported ${importedCount} question(s)!`, 'success');
              document.getElementById('modalOverlay').classList.add('hidden');
              this.selectedTrackId = trackId;
              this.render(container);
            }
          } catch (err) {
            window.toast('Failed to parse JSON content. Double check syntax.', 'danger');
          }
        } else {
          // Treat as CSV import
          const res = window.store.importQuestionBankCSV(rawContent);
          if (res.success) {
            window.toast(res.message, 'success');
            document.getElementById('modalOverlay').classList.add('hidden');
            this.selectedTrackId = trackId;
            this.render(container);
          } else {
            window.toast(res.message, 'danger');
          }
        }
      });
    }

    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  /* ── Add / Edit Question Modal ────────────────────── */
  showAddEditQuestionModal(container, questionToEdit = null) {
    const modalBody = document.getElementById('modalBody');
    const tracks = window.store.getTracks();
    const isEdit = Boolean(questionToEdit);

    const defaultTrack = questionToEdit ? questionToEdit.trackId : (this.selectedTrackId === 'all' ? tracks[0].id : this.selectedTrackId);
    const defaultType = questionToEdit ? questionToEdit.type : (this.selectedQuestionType === 'all' ? 'written' : this.selectedQuestionType);
    const defaultPrompt = questionToEdit ? (questionToEdit.prompt || questionToEdit.question || '') : '';
    const defaultHint = questionToEdit ? (questionToEdit.hint || '') : '';

    modalBody.innerHTML = `
      <div style="padding: 0.5rem 0.5rem 1rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.6rem; background: rgba(6, 182, 212, 0.15); border-radius: 50%; color: var(--accent-cyan);">
            ${window.Icons.get('clipboard', 24)}
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 0;">
              ${isEdit ? 'Edit Question' : 'Add New Question to Bank'}
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;">
              ${isEdit ? `Updating Question ID: ${questionToEdit.id}` : 'Create a question for Written Quiz or Oral Technical evaluation.'}
            </p>
          </div>
        </div>

        <form id="addEditQuestionModalForm">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Exam Track *</label>
              <select id="modalQTrack" class="form-select" required ${isEdit ? 'disabled' : ''}>
                ${tracks.map(t => `<option value="${t.id}" ${t.id === defaultTrack ? 'selected' : ''}>${t.title}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Question Type *</label>
              <select id="modalQType" class="form-select" required ${isEdit ? 'disabled' : ''}>
                <option value="written" ${defaultType === 'written' ? 'selected' : ''}>📝 Written Quiz (Part 1)</option>
                <option value="oral" ${defaultType === 'oral' ? 'selected' : ''}>🎙️ Oral Technical (Part 2)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Question Prompt / Text *</label>
            <textarea id="modalQPrompt" class="form-textarea" placeholder="Enter full question prompt..." style="min-height: 90px;" required>${defaultPrompt}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Guidance Hint / Reference Answer (Optional)</label>
            <input type="text" id="modalQHint" class="form-input" placeholder="Guidance for examiner or student..." value="${defaultHint}">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-success" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              ${window.Icons.get('check', 16)} ${isEdit ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    `;

    const form = modalBody.querySelector('#addEditQuestionModalForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const trackId = modalBody.querySelector('#modalQTrack').value;
        const type = modalBody.querySelector('#modalQType').value;
        const prompt = modalBody.querySelector('#modalQPrompt').value.trim();
        const hint = modalBody.querySelector('#modalQHint').value.trim();

        if (!prompt) {
          window.toast('Question prompt cannot be empty.', 'warning');
          return;
        }

        if (isEdit) {
          const res = window.store.updateQuestionInBank(questionToEdit.id, { prompt, hint });
          if (res.success) {
            window.toast(res.message, 'success');
            document.getElementById('modalOverlay').classList.add('hidden');
            this.render(container);
          } else {
            window.toast(res.message, 'danger');
          }
        } else {
          const res = window.store.addQuestionToBank(trackId, type, { prompt, hint });
          if (res.success) {
            window.toast(res.message, 'success');
            document.getElementById('modalOverlay').classList.add('hidden');
            this.selectedTrackId = trackId;
            this.render(container);
          } else {
            window.toast(res.message, 'danger');
          }
        }
      });
    }

    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  /* ── Add Track Modal ────────────────────────────── */
  showAddTrackModal(container) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="padding: 0.5rem 0.5rem 1rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.6rem; background: rgba(6, 182, 212, 0.15); border-radius: 50%; color: var(--accent-cyan);">
            ${window.Icons.get('clipboard', 24)}
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 0;">Add New Exam Track</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;">Create a new assessment track for written quizzes, oral exams, and capstones.</p>
          </div>
        </div>

        <form id="addTrackForm">
          <div class="form-group">
            <label class="form-label" for="newTrackTitle">Track Title *</label>
            <input type="text" id="newTrackTitle" class="form-input" placeholder="e.g. JavaScript & DOM Architecture" required style="font-size: 0.9rem;">
          </div>

          <div class="form-group">
            <label class="form-label" for="newTrackCategory">Category</label>
            <input type="text" id="newTrackCategory" class="form-input" placeholder="e.g. Frontend Engineering" value="Frontend Core" style="font-size: 0.9rem;">
          </div>

          <div class="form-group">
            <label class="form-label" for="newTrackDesc">Track Description</label>
            <textarea id="newTrackDesc" class="form-textarea" placeholder="Brief summary of technical skills assessed..." style="min-height: 70px; font-size: 0.88rem;"></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="newTrackCapstone">Level 3 Capstone Project Title</label>
            <input type="text" id="newTrackCapstone" class="form-input" placeholder="e.g. Interactive Web App with Async APIs" style="font-size: 0.9rem;">
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.4rem;">
              ${window.Icons.get('check', 16)} Create Exam Track
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('modalOverlay').classList.remove('hidden');

    const form = document.getElementById('addTrackForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('newTrackTitle').value.trim();
        const category = document.getElementById('newTrackCategory').value.trim();
        const description = document.getElementById('newTrackDesc').value.trim();
        const capstoneTitle = document.getElementById('newTrackCapstone').value.trim();

        const res = window.store.addTrack({ title, category, description, capstoneTitle });
        if (res.success) {
          window.toast(res.message, 'success');
          document.getElementById('modalOverlay').classList.add('hidden');
          this.selectedTrackId = res.track.id;
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    }
  },

  /* ── Read-Only Exam Audit Record Modal ──────────────── */
  showExamAuditModal(examId) {
    const exam = window.store.getExamById(examId);
    if (!exam) {
      window.toast('Exam record not found.', 'danger');
      return;
    }

    const track = window.store.getTrackById(exam.trackId);
    const examiners = window.store.getUsersByRole('examiner');
    const teachers = window.store.getUsersByRole('teacher');
    const examiner = examiners.find(ex => ex.id === exam.examinerId);
    const teacher = teachers.find(t => t.id === exam.teacherId);

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="padding: 0.5rem; max-height: 82vh; overflow-y: auto; text-align: left;">
        
        <!-- Header -->
        <div style="background: rgba(255, 85, 0, 0.08); border: 1px solid rgba(255, 85, 0, 0.3); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="badge badge-success" style="display:inline-flex; align-items:center; gap:0.3rem;">
                ${window.Icons.get('key', 12)} Official Read-Only Audit Record
              </span>
              <span class="badge badge-warning" style="font-family: var(--font-mono);">${exam.uniqueKey}</span>
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--accent-orange);">
              ${exam.title}
            </h2>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
              Group: <strong style="color: var(--text-main);">${exam.groupName}</strong> &nbsp;|&nbsp;
              Track: <strong style="color: var(--text-main);">${track ? track.title : exam.trackId}</strong>
            </div>
          </div>

          <div style="text-align: right; font-size: 0.82rem; color: var(--text-muted);">
            <div>Teacher: <strong style="color: var(--text-main);">${teacher ? teacher.name : exam.teacherId}</strong></div>
            <div>Examiner: <strong style="color: var(--text-main);">${examiner ? examiner.name : exam.examinerId}</strong></div>
            <div>Created: ${this.formatDateTime(exam.createdAt)}</div>
          </div>
        </div>

        <!-- Student Roster Answer Breakdown -->
        <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          ${window.Icons.get('users', 18)} Enrolled Candidates &amp; Answer Breakdown (${exam.joinedStudents.length} Students)
        </h3>

        ${exam.joinedStudents.length === 0 ? `
          <p style="color: var(--text-muted); font-style: italic;">No student data recorded for this exam session.</p>
        ` : exam.joinedStudents.map((st, idx) => {
          const score = st.finalScorePct || 0;
          const assignedQuiz = st.assignedQuizQuestions || window.store.getQuestionBank(exam.trackId, 'written');
          const writtenAns = st.l1Answers?.writtenAnswers || {};
          const isDisqualified = st.l1Answers?.disqualified;

          return `
            <div style="background: rgba(14, 15, 20, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">
                    ${idx + 1}. Candidate: ${st.name}
                  </h4>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Joined: ${this.formatDateTime(st.joinedAt)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 800; color: ${score >= 75 ? 'var(--accent-emerald)' : 'var(--accent-orange)'};">
                    ${score}% Final Grade
                  </div>
                  ${isDisqualified ? `<span class="badge badge-danger" style="display:inline-flex; align-items:center; gap:0.3rem;">${window.Icons.get('alert', 12)} DISQUALIFIED (Proctoring Violation)</span>` : ''}
                </div>
              </div>

              <!-- Part 1 Written Quiz Inspection (Read-Only) -->
              <div style="margin-bottom: 1.25rem;">
                <h5 style="font-size: 0.88rem; font-weight: 700; color: var(--accent-orange); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
                  ${window.Icons.get('clipboard', 14)} Part 1 — Written Quiz Responses (${assignedQuiz.length} Questions)
                </h5>

                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                  ${assignedQuiz.map((q, qIdx) => {
                    const studentAnswerText = writtenAns[q.id] || '(No written answer submitted)';
                    const qReview = st.l1Grade?.questionReviews?.[q.id] || st.l1Grade?.reviews?.[q.id] || '';
                    const qScore = st.l1Grade?.questionScores?.[q.id] !== undefined 
                      ? st.l1Grade.questionScores[q.id] 
                      : (st.l1Grade?.scores?.[q.id] !== undefined ? st.l1Grade.scores[q.id] : (isDisqualified ? 0 : (st.l1Grade?.manuallyGradedByExaminer ? 0 : 5)));

                    return `
                      <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); padding: 0.85rem 1rem; border-radius: var(--radius-sm);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem;">
                          <strong style="font-size: 0.88rem; color: var(--text-main);">
                            Q${qIdx + 1}: ${q.prompt || q.question}
                          </strong>
                          <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-orange); font-weight: 700; background: rgba(255,85,0,0.1); padding: 0.15rem 0.5rem; border-radius: 4px;">
                            ${qScore} / 5 pts
                          </span>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.04); border-left: 3px solid var(--accent-orange); padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.85rem; color: #e2e8f0; margin-bottom: 0.4rem; white-space: pre-wrap; font-family: inherit;">
                          ${studentAnswerText}
                        </div>

                        ${qReview ? `
                          <div style="font-size: 0.78rem; color: var(--accent-emerald); background: rgba(0,230,118,0.08); padding: 0.35rem 0.65rem; border-radius: 4px;">
                            <em>Examiner Review:</em> ${qReview}
                          </div>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Part 2 Technical Oral Defense Inspection -->
              ${st.l2TechnicalGrade ? `
                <div style="margin-bottom: 1.25rem;">
                  <h5 style="font-size: 0.88rem; font-weight: 700; color: var(--accent-amber); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                    ${window.Icons.get('examiner', 14)} Part 2 — Technical Oral Defense (${st.l2TechnicalGrade.speakingScorePct}%)
                  </h5>
                  <p style="font-size: 0.82rem; color: var(--text-muted);">
                    Examiner Overall Notes: <em>${st.l2TechnicalGrade.examinerNotes || 'No notes'}</em>
                  </p>
                </div>
              ` : ''}

              <!-- Part 3 Project Evaluation Inspection -->
              ${st.teacherProjectGrade ? `
                <div>
                  <h5 style="font-size: 0.88rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                    ${window.Icons.get('trophy', 14)} Part 3 — Capstone Project Evaluation (${st.teacherProjectGrade.totalL3Pct}%)
                  </h5>
                  <p style="font-size: 0.82rem; color: var(--text-muted);">
                    Teacher Notes: <em>${st.teacherProjectGrade.teacherNotes || 'No notes'}</em>
                  </p>
                </div>
              ` : ''}

            </div>
          `;
        }).join('')}

        <div style="text-align: right; margin-top: 1.5rem;">
          <button class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">
            Close Audit Inspector
          </button>
        </div>
      </div>
    `;

    document.getElementById('modalOverlay').classList.remove('hidden');
  }
};
