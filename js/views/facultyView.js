/* ==========================================================================
   EduGrade 360 - Faculty View Component
   Login-first: pick your account once, see only your assigned exams.
   ========================================================================== */

window.FacultyView = {
  loggedInTeacherId: null,  // null = show login screen
  activeMode: 'teacher',    // 'teacher' | 'examiner'

  /* ── Main render ─────────────────────────────────── */
  render(container) {
    const authStaff = window.store ? window.store.getAuthenticatedStaff() : null;

    // Guard: Require authenticated Teacher or Examiner session
    if (!authStaff || (authStaff.role !== 'teacher' && authStaff.role !== 'examiner')) {
      if (window.LoginView) window.LoginView.render(container);
      return;
    }

    const teachers = window.store.getUsersByRole('teacher');
    let me = teachers.find(t => t.id === authStaff.id);
    if (!me) me = teachers.find(t => (authStaff.email && t.name.toLowerCase().includes(authStaff.name.toLowerCase())));
    if (!me && teachers.length > 0) me = teachers[0];

    if (!me) {
      if (window.LoginView) window.LoginView.render(container);
      return;
    }

    this.loggedInTeacherId = me.id;
    const isExaminer = Boolean(me.isExaminer);

    // Keep sub-views in sync
    window.TeacherView.activeTeacherId = me.id;
    if (isExaminer && me.examinerId) {
      window.ExaminerView.activeExaminerId = me.examinerId;
    }

    const effectiveMode = (this.activeMode === 'examiner' && !isExaminer) ? 'teacher' : this.activeMode;

    container.innerHTML = `
      <div class="faculty-wrapper">

        <!-- ── Slim account bar ── -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem 1.1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">

            <!-- Who is logged in -->
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="padding: 0.45rem; border-radius: 50%; background: rgba(99,102,241,0.18); color: var(--accent-cyan); display:flex;">
                ${effectiveMode === 'teacher' ? window.Icons.get('teacher', 18) : window.Icons.get('examiner', 18)}
              </span>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); display:flex; align-items:center; gap:0.5rem;">
                  ${me.name}
                  ${isExaminer ? `<span style="font-size:0.6rem; background:var(--accent-cyan); color:#000; padding:0.1rem 0.45rem; border-radius:999px; font-weight:800; font-family:var(--font-mono);">SERTIFIKATLANGAN IMTIHONCHI</span>` : ''}
                </div>
                <div style="font-size: 0.76rem; color: var(--text-muted);">${me.department || 'Akademik Xodim'}</div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
              <!-- Role toggle — only for certified examiners -->
              ${isExaminer ? `
                <div style="display:flex; gap:0; background:rgba(0,0,0,0.4); border-radius:var(--radius-md); border:1px solid var(--border-color); overflow:hidden;">
                  <button id="modeTeacherBtn" style="font-size:0.8rem; padding:0.35rem 0.9rem; border:none; cursor:pointer; font-weight:700; transition: background 0.15s; display:inline-flex; align-items:center; gap:0.35rem;
                    ${effectiveMode === 'teacher' ? 'background:var(--accent-emerald);color:#000;' : 'background:transparent;color:var(--text-muted);'}">
                    ${window.Icons.get('teacher', 14)} O'qituvchi
                  </button>
                  <button id="modeExaminerBtn" style="font-size:0.8rem; padding:0.35rem 0.9rem; border:none; cursor:pointer; font-weight:700; transition: background 0.15s; display:inline-flex; align-items:center; gap:0.35rem;
                    ${effectiveMode === 'examiner' ? 'background:var(--accent-cyan);color:#000;' : 'background:transparent;color:var(--text-muted);'}">
                    ${window.Icons.get('examiner', 14)} Imtihonchi
                  </button>
                </div>
              ` : ''}

              <button id="switchAccountBtn" style="font-size:0.76rem; color:var(--text-muted); background:none; border:1px dashed rgba(255,255,255,0.12); padding:0.3rem 0.75rem; border-radius:var(--radius-sm); cursor:pointer; display:flex; align-items:center; gap:0.35rem;">
                ${window.Icons.get('exit', 12)} Chiqish / Hisobni O'zgartirish
              </button>
            </div>
        </div>

        <!-- ── Mode content ── -->
        <div id="facultyModeContainer"></div>
      </div>
    `;

    const modeContainer = container.querySelector('#facultyModeContainer');
    if (effectiveMode === 'teacher') {
      window.TeacherView.render(modeContainer);
    } else {
      window.ExaminerView.render(modeContainer);
    }

    this._bindTopBarEvents(container);
  },

  /* ── Login / Account picker screen ──────────────── */
  _renderLoginScreen(container) {
    const teachers = window.store.getUsersByRole('teacher');

    // Separate certified examiners from regular teachers for display
    const certifiedList = teachers.filter(t => t.isExaminer);
    const regularList   = teachers.filter(t => !t.isExaminer);

    container.innerHTML = `
      <div style="max-width: 640px; margin: 2rem auto;">
        <div class="card" style="border-color: var(--border-highlight); background: linear-gradient(135deg, rgba(15,23,42,0.97), rgba(99,102,241,0.1));">

          <div style="text-align:center; padding: 1rem 0 1.5rem;">
            <div style="display:inline-flex; padding:0.9rem; background:rgba(99,102,241,0.15); border-radius:50%; color:var(--accent-cyan); margin-bottom:0.75rem;">
              ${window.Icons.get('teacher', 32)}
            </div>
            <h2 style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800;">Academic Staff Portal</h2>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.3rem;">Select your account to access your assigned exam rooms.</p>
          </div>

          <!-- How it works note -->
          <div style="background:rgba(6,182,212,0.07); border:1px solid rgba(6,182,212,0.2); border-radius:var(--radius-md); padding:0.85rem 1.1rem; margin-bottom:1.5rem; font-size:0.82rem; color:var(--text-muted); line-height:1.55;">
            <strong style="color:var(--accent-cyan); display:block; margin-bottom:0.3rem;">How exam assignments work:</strong>
            When the Admin creates an exam session and appoints you as Teacher or Examiner, the room instantly appears in your dashboard. You and your counterpart can see each other on every assigned exam.
          </div>

          <!-- Certified Examiners (dual-role) -->
          ${certifiedList.length > 0 ? `
            <div style="margin-bottom:1.25rem;">
              <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.7px; color:var(--accent-cyan); margin-bottom:0.6rem; display:flex; align-items:center; gap:0.4rem;">
                ${window.Icons.get('examiner', 12)} Certified Examiners (Teacher + Examiner)
              </div>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${certifiedList.map(t => `
                  <button class="faculty-login-btn" data-teacher-id="${t.id}"
                    style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1rem; background:rgba(6,182,212,0.06); border:1px solid rgba(6,182,212,0.25); border-radius:var(--radius-md); cursor:pointer; text-align:left; transition:all 0.15s; width:100%;">
                    <span style="padding:0.45rem; border-radius:50%; background:rgba(6,182,212,0.15); color:var(--accent-cyan); display:flex; flex-shrink:0;">
                      ${window.Icons.get('examiner', 16)}
                    </span>
                    <div style="flex:1; min-width:0;">
                      <div style="font-weight:700; color:var(--text-main); font-size:0.92rem;">${t.name}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${t.department || 'Academic Staff'}</div>
                    </div>
                    <span style="font-size:0.6rem; background:var(--accent-cyan); color:#000; padding:0.1rem 0.45rem; border-radius:999px; font-weight:800; font-family:var(--font-mono); flex-shrink:0;">EXAMINER</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Regular Teachers -->
          <div>
            <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.7px; color:var(--accent-emerald); margin-bottom:0.6rem; display:flex; align-items:center; gap:0.4rem;">
              ${window.Icons.get('teacher', 12)} Teachers (Project Evaluation)
            </div>
            <div style="max-height: 260px; overflow-y:auto; display:flex; flex-direction:column; gap:0.4rem; padding-right:0.25rem;">
              ${regularList.map(t => `
                <button class="faculty-login-btn" data-teacher-id="${t.id}"
                  style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 1rem; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.15); border-radius:var(--radius-md); cursor:pointer; text-align:left; transition:all 0.15s; width:100%;">
                  <span style="padding:0.4rem; border-radius:50%; background:rgba(16,185,129,0.12); color:var(--accent-emerald); display:flex; flex-shrink:0;">
                    ${window.Icons.get('teacher', 14)}
                  </span>
                  <div style="flex:1; min-width:0;">
                    <div style="font-weight:600; color:var(--text-main); font-size:0.88rem;">${t.name}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${t.department || 'Teacher'}</div>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    `;

    container.querySelectorAll('.faculty-login-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateX(3px)';
        btn.style.borderColor = btn.dataset.teacherId ? 'var(--accent-cyan)' : 'var(--accent-emerald)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.borderColor = '';
      });
      btn.addEventListener('click', () => {
        const teacherId = btn.getAttribute('data-teacher-id');
        const teachers  = window.store.getUsersByRole('teacher');
        const selected  = teachers.find(t => t.id === teacherId);
        this.loggedInTeacherId = teacherId;
        // Auto-set mode: certified examiners start in examiner mode; regular teachers in teacher mode
        this.activeMode = (selected && selected.isExaminer) ? 'examiner' : 'teacher';
        // Reset sub-navigation state
        window.TeacherView.activeExamId    = null;
        window.TeacherView.activeStudentId = null;
        window.ExaminerView.activeExamId    = null;
        window.ExaminerView.activeStudentId = null;
        this.render(container);
      });
    });
  },

  /* ── Top bar events ──────────────────────────────── */
  _bindTopBarEvents(container) {
    const teacherBtn  = container.querySelector('#modeTeacherBtn');
    const examinerBtn = container.querySelector('#modeExaminerBtn');
    const switchBtn   = container.querySelector('#switchAccountBtn');

    if (teacherBtn) {
      teacherBtn.addEventListener('click', () => {
        this.activeMode = 'teacher';
        this.render(container);
      });
    }
    if (examinerBtn) {
      examinerBtn.addEventListener('click', () => {
        this.activeMode = 'examiner';
        this.render(container);
      });
    }
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.loggedInTeacherId = null;
        // Reset sub-navigation too
        window.TeacherView.activeExamId    = null;
        window.TeacherView.activeStudentId = null;
        window.ExaminerView.activeExamId    = null;
        window.ExaminerView.activeStudentId = null;
        this.render(container);
      });
    }
  }
};
