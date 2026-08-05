/* ==========================================================================
   EduGrade 360 - Teacher View Component (Project Capstone Evaluation)
   ========================================================================== */

window.TeacherView = {
  activeTeacherId: 't1',
  activeExamId: null,
  activeStudentId: null,

  render(container) {
    const teachers = window.store.getUsersByRole('teacher');
    const exams = window.store.getExams();
    const teacherExams = exams.filter(e => e.teacherId === this.activeTeacherId);
    const activeExam = this.activeExamId ? window.store.getExamById(this.activeExamId) : null;

    container.innerHTML = `
      <div class="teacher-wrapper">
        ${activeExam ? this.renderExamProjectConsole(activeExam) : this.renderTeacherExamsQueue(teacherExams)}
      </div>
    `;

    this.bindEvents(container);
  },

  renderTeacherExamsQueue(exams) {
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${window.Icons.get('project', 18, 'icon-title')} Sizga Biriktirilgan Imtihon Xonalari</h3>
          <span class="badge badge-success">${exams.length} Seans</span>
        </div>

        ${exams.length === 0 ? `
          <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
            <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.3;">${window.Icons.get('clipboard', 52)}</div>
            <p style="font-weight: 700; color: var(--text-main);">Hozircha biriktirilgan imtihon seanslari yo'q.</p>
            <p style="font-size: 0.83rem; margin-top: 0.4rem;">Administrator sizni imtihonga mas'ul o'qituvchi qilib tayinlagach, seanslar bu yerda ko'rinadi.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${exams.map(e => {
              const track    = window.store.getTrackById(e.trackId);
              const examiners = window.store.getUsersByRole('examiner');
              const examiner  = examiners.find(ex => ex.id === e.examinerId);
              const gradedCount = e.joinedStudents.filter(s => s.teacherProjectGrade).length;
              const isActive  = e.status === 'step1_active' || e.status === 'step2_active';
              const allGraded = gradedCount === e.joinedStudents.length && e.joinedStudents.length > 0;

              return `
                <div style="background: rgba(0,0,0,0.2); border: 1px solid ${isActive ? 'var(--accent-emerald)' : 'var(--border-color)'}; padding: 1.2rem 1.3rem; border-radius: var(--radius-md); ${isActive ? 'box-shadow: 0 0 0 1px rgba(16,185,129,0.12);' : ''}">

                  <!-- Top row: title + status -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.9rem;">
                    <div>
                      <h4 style="font-family:var(--font-heading); font-size:1.1rem; font-weight:800; color:var(--accent-emerald); display:flex; align-items:center; gap:0.5rem;">
                        ${window.Icons.get('project', 15)} ${e.title}
                      </h4>
                      <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
                        <strong>${e.groupName}</strong> &nbsp;·&nbsp; ${track ? track.title : e.trackId} &nbsp;·&nbsp;
                        Key: <code style="font-size:0.82rem; color:var(--accent-cyan);">${e.uniqueKey}</code>
                      </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.3rem; flex-shrink:0;">
                      ${isActive
                        ? '<span class="badge badge-success" style="font-size:0.72rem;">● EXAM LIVE</span>'
                        : '<span class="badge badge-secondary" style="font-size:0.72rem;">' + e.status.replace('_',' ').toUpperCase() + '</span>'}
                      <span class="badge ${allGraded ? 'badge-success' : 'badge-info'}" style="font-size:0.7rem;">
                        ${gradedCount}/${e.joinedStudents.length} Projects Graded
                      </span>
                    </div>
                  </div>

                  <!-- Unique Key & Quick Phase Actions -->
                    <div style="background:rgba(0,0,0,0.3); border:1px dashed var(--accent-cyan); padding:0.65rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.9rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.6rem;">
                      <div>
                        <span style="font-size:0.68rem; color:var(--text-muted); display:block; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;">Yagona Imtihon Kaliti — Show Code</span>
                        <strong style="font-family:var(--font-mono); font-size:1.4rem; color:var(--accent-cyan);">${e.uniqueKey}</strong>
                      </div>
                      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                        <button class="btn btn-ghost btn-sm teacher-show-big-key-btn" data-exam-id="${e.id}" style="color:var(--accent-cyan); font-weight:700; display:flex; align-items:center; gap:0.3rem;">
                          ${window.Icons.get('refresh', 13)} Show Code (Fullscreen)
                        </button>
                        ${e.status === 'created' ? `
                          <button class="btn btn-primary btn-sm teacher-quick-open-room-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.3rem;">
                            ${window.Icons.get('users', 13)} Open Room
                          </button>
                        ` : ''}
                        ${e.status === 'room_open' ? `
                          <button class="btn btn-success btn-sm teacher-quick-start-step1-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.3rem;">
                            ${window.Icons.get('quiz', 13)} Start Step 1
                          </button>
                        ` : ''}
                        ${e.status === 'step1_active' ? `
                          <button class="btn btn-amber btn-sm teacher-quick-proceed-step2-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.3rem;">
                            ${window.Icons.get('mic', 13)} Proceed to Step 2
                          </button>
                        ` : ''}
                      </div>
                    </div>

                  <!-- Counterpart info: who is the examiner? -->
                  <div style="background:rgba(6,182,212,0.06); border:1px solid rgba(6,182,212,0.18); border-radius:var(--radius-sm); padding:0.6rem 0.85rem; margin-bottom:0.9rem; display:flex; align-items:center; gap:0.6rem; font-size:0.82rem;">
                    ${window.Icons.get('examiner', 14)}
                    <span style="color:var(--text-muted);">1 va 2-Bosqich imtihonchisi:</span>
                    <strong style="color:var(--accent-cyan);">${examiner ? examiner.name : '—'}</strong>
                    <span style="font-size:0.72rem; color:var(--text-subtle); margin-left:auto;">${window.Icons.get('users', 12)} ${e.joinedStudents.length} ta talaba kirdi</span>
                  </div>

                  <!-- Action -->
                  <div style="display:flex; gap:0.5rem; width:100%;">
                    <button class="btn ${isActive ? 'btn-success' : 'btn-primary'} btn-sm open-exam-projects-btn" data-exam-id="${e.id}" style="flex:1; display:flex; align-items:center; gap:0.4rem; justify-content:center;">
                      ${window.Icons.get('project', 14)}
                      ${allGraded ? 'Loyiha Baholarini Ko\'rish / Tahrirlash' : 'Amaliy Loyihalarni Tekshirish va Baholash'}
                    </button>
                    <button class="btn btn-outline-danger end-exam-card-btn" data-exam-id="${e.id}" style="gap:0.35rem; display:flex; align-items:center; font-size:0.8rem; flex-shrink:0;">
                      ${window.Icons.get('exit', 14)} Imtihonni Yakunlash
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  renderExamProjectConsole(exam) {
    const track = window.store.getTrackById(exam.trackId);
    const joinedStudents = exam.joinedStudents;
    const activeStudent = this.activeStudentId ? joinedStudents.find(s => s.id === this.activeStudentId) : null;

    return `
      <div style="margin-bottom: 1rem;">
        <button id="backToExamsQueueBtn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
          ${window.Icons.get('exit', 14)} Back to Assigned Exams
        </button>
      </div>

      <!-- Exam Room Banner & Controls -->
      <div class="card" style="margin-bottom: 1.5rem; border-color: var(--accent-cyan); background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(6, 182, 212, 0.08));">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
              <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800;">
                Project Evaluation: <span style="color: var(--accent-emerald);">${exam.title}</span>
              </h3>
              <span class="badge badge-info" style="text-transform: uppercase;">${exam.status.replace('_',' ')}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Group: <strong>${exam.groupName}</strong> &nbsp;|&nbsp; Track: <strong>${track ? track.title : exam.trackId}</strong>
            </p>
          </div>

          <!-- Key Display & Quick Action Buttons -->
          <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
            <div style="background: rgba(0,0,0,0.4); padding: 0.5rem 1.1rem; border-radius: var(--radius-md); border: 2px solid var(--accent-cyan); text-align: center;">
              <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Unique Exam Key — Show Code</div>
              <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 2px;">
                ${exam.uniqueKey}
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
              <button id="teacherShowBigKeyBtn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
                ${window.Icons.get('refresh', 14)} Show Code (Fullscreen)
              </button>

              ${exam.status === 'created' ? `
                <button id="teacherOpenRoomBtn" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
                  ${window.Icons.get('users', 14)} Open Room & Display Key
                </button>
              ` : ''}

              ${exam.status === 'room_open' ? `
                <button id="teacherStartStep1Btn" class="btn btn-success btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
                  ${window.Icons.get('quiz', 14)} Start Step 1: Quiz
                </button>
              ` : ''}

              ${exam.status === 'step1_active' ? `
                <button id="teacherProceedStep2Btn" class="btn btn-amber btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
                  ${window.Icons.get('mic', 14)} Proceed to Step 2: Oral
                </button>
              ` : ''}

              ${exam.status === 'step2_active' ? `
                <button id="teacherFinishExamBtn" class="btn btn-success btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
                  ${window.Icons.get('trophy', 14)} Complete Exam
                </button>
              ` : ''}

              <span id="teacherLiveTimerBadge" class="badge badge-warning" style="font-family: var(--font-mono); font-size: 0.85rem; padding: 0.4rem 0.75rem; display: flex; align-items: center; gap: 0.3rem; background: rgba(16,185,129,0.15); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); font-weight: 800;">
                ${window.Icons.get('clock', 13)} ⏱️ <span id="teacherTimerDigits">01h 59m 59s</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 2rem;">
        <!-- Student Roster -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${window.Icons.get('users', 18, 'icon-title')} Candidate Projects</h3>
            <span class="badge badge-info">${joinedStudents.length} Candidates</span>
          </div>

          ${joinedStudents.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.4;">${window.Icons.get('users', 40)}</div>
              <p>No candidates have joined this exam room yet.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              ${joinedStudents.map(std => {
                const isGraded = !!std.teacherProjectGrade;
                const isOralGraded = !!std.l2TechnicalGrade;
                const isSelected = this.activeStudentId === std.id;
                return `
                  <div style="background: rgba(0,0,0,0.3); border: 1px solid ${isSelected ? 'var(--accent-emerald)' : 'var(--border-color)'}; padding: 0.85rem 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                      <strong style="font-size: 0.95rem; color: var(--text-main);">${std.name}</strong>
                      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <span>Loyiha: <strong style="color:${isGraded ? 'var(--accent-emerald)' : 'var(--accent-amber)'}">${isGraded ? std.teacherProjectGrade.totalL3Pct + '%' : '—'}</strong></span>
                        <span>Og'zaki: <strong style="color:${isOralGraded ? 'var(--accent-purple)' : 'var(--accent-amber)'}">${isOralGraded ? std.l2TechnicalGrade.speakingScorePct + '%' : '—'}</strong></span>
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                      <button class="btn ${isSelected && this.activeMode !== 'oral' ? 'btn-emerald' : 'btn-primary'} btn-sm select-project-btn" data-std-id="${std.id}" style="display: flex; align-items: center; gap: 0.3rem;">
                        ${window.Icons.get('project', 13)} ${isGraded ? `Loyiha (${std.teacherProjectGrade.totalL3Pct}%)` : 'Loyiha Baholash'}
                      </button>
                      <button class="btn ${isSelected && this.activeMode === 'oral' ? 'btn-purple' : 'btn-amber'} btn-sm select-oral-btn" data-std-id="${std.id}" style="display: flex; align-items: center; gap: 0.3rem;">
                        ${window.Icons.get('mic', 13)} ${isOralGraded ? `Og'zaki (${std.l2TechnicalGrade.speakingScorePct}%)` : 'Og\'zaki Imtihon'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Rubric & Oral Grader Console -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${window.Icons.get('trophy', 18, 'icon-title')} ${this.activeMode === 'oral' ? '2-Bosqich: Texnik Og\'zaki Imtihon Baholash' : '3-Bosqich: Amaliy Loyihani Baholash'}</h3>
            <span class="badge" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.3);">Baholash Konsoli</span>
          </div>

          ${activeStudent ? (this.activeMode === 'oral' ? this.renderTeacherOralForm(exam, track, activeStudent) : this.renderRubricForm(exam, track, activeStudent)) : `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 0.75rem; opacity: 0.35;">${window.Icons.get('project', 44)}</div>
              <p style="font-weight: 700; color: var(--text-main);">Nomzodni va Baholash Turini Tanlang</p>
              <p style="font-size: 0.85rem; margin-top: 0.3rem;">Loyiha yoki Og'zaki imtihon baholash uchun chap tarafdagi nomzod tugmalarini bosing.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  renderRubricForm(exam, track, student) {
    const rubric = track.level3.rubric;

    return `
      <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid var(--accent-emerald); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
        <h4 style="color: var(--accent-emerald); font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
          ${window.Icons.get('student', 16)} Nomzod: ${student.name}
        </h4>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 0.2rem;">
          Nomzodning amaliy loyihasini quyidagi rubrikalar bo'yicha baholang.
        </p>
      </div>

      <form id="teacherRubricForm">
        <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.25rem;">
          ${rubric.map(r => `
            <div class="question-card" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <strong style="color: var(--accent-emerald); font-size: 0.88rem;">${r.label}</strong>
                <span class="score-val" id="rubric_disp_${r.id}">${r.max} / ${r.max} ball</span>
              </div>
              <div class="score-control">
                <input type="range" class="score-slider teacher-rubric-slider" data-rubric-id="${r.id}" min="0" max="${r.max}" value="${r.max}">
              </div>
            </div>
          `).join('')}
        </div>

        <div class="form-group">
          <label class="form-label">O'qituvchi Xulosasi va Izohlari *</label>
          <textarea id="teacherNotesInput" class="form-textarea" required style="min-height: 80px;" placeholder="Loyiha bo'yicha bildirilgan taklif va izohlar..."></textarea>
        </div>

        <button type="submit" class="btn btn-success btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          ${window.Icons.get('check', 16)} Finalize &amp; Save Project Grade for ${student.name}
        </button>
      </form>
    `;
  },

  renderTeacherOralForm(exam, track, student) {
    const oralQs = window.store.getStudentOralQuestions(exam.id, student.id);
    const existingGraded = student.l2TechnicalGrade;

    return `
      <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid var(--accent-purple); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="color: var(--accent-purple); font-weight: 800; display: flex; align-items: center; gap: 0.5rem; font-size: 1.05rem;">
            ${window.Icons.get('mic', 18)} 2-Bosqich: Texnik Og'zaki Imtihon — Nomzod: ${student.name}
          </h4>
          <span class="badge ${existingGraded ? 'badge-success' : 'badge-info'}">
            ${existingGraded ? `Baholangan (${existingGraded.speakingScorePct}%)` : 'Kutilmoqda'}
          </span>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 0.3rem;">
          Nomzodga 5 ta og'zaki savol bering (0-10 ball) hamda izoh qoldiring.
        </p>
      </div>

      <form id="teacherOralForm">
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem;">
          ${oralQs.map((q, idx) => {
            const existingScore = existingGraded?.scores?.[q.id]?.score ?? 8;
            const existingNotes = existingGraded?.scores?.[q.id]?.notes ?? '';
            return `
              <div class="question-card" style="margin-bottom: 0; border-color: rgba(168,85,247,0.3);">
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                  Savol ${idx + 1}: ${window.escapeHTML(q.prompt || q.question)}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Nomzod javob balli (0 - 10)</span>
                  <strong id="oral_disp_${q.id}" style="color: var(--accent-purple); font-size: 0.95rem;">${existingScore} / 10 ball</strong>
                </div>
                <div class="score-control" style="margin-bottom: 0.5rem;">
                  <input type="range" class="score-slider teacher-oral-slider" data-q-id="${q.id}" min="0" max="10" value="${existingScore}">
                </div>
                <input type="text" class="form-input teacher-oral-notes" data-q-id="${q.id}" value="${existingNotes}" placeholder="Izoh yoki talaba javobi tushuntirishi..." style="font-size: 0.85rem;">
              </div>
            `;
          }).join('')}
        </div>

        <div class="form-group">
          <label class="form-label">Og'zaki Imtihonchi / O'qituvchi Umumiy Izohi *</label>
          <textarea id="teacherOralOverallNotes" class="form-textarea" required style="min-height: 75px;" placeholder="Og'zaki imtihon bo'yicha umumiy bilim va xulosa...">${existingGraded?.examinerNotes || ''}</textarea>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button type="submit" class="btn btn-primary btn-lg" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ${window.Icons.get('check', 16)} 💾 Og'zaki Imtihon Bahosini Saqlash
          </button>
        </div>
      </form>
    `;
  },

  startTeacherCountdown(container, exam) {
    if (this.teacherTimerInterval) clearInterval(this.teacherTimerInterval);
    const span = container.querySelector('#teacherTimerDigits');
    if (!span) return;

    const windowMs = 2 * 60 * 60 * 1000; // 2 hours
    const startMs = exam.step1StartedAt ? new Date(exam.step1StartedAt).getTime() : (exam.createdAt ? new Date(exam.createdAt).getTime() : Date.now());

    const update = () => {
      const elapsedMs = Date.now() - startMs;
      const remainingMs = Math.max(0, windowMs - elapsedMs);

      const h = Math.floor(remainingMs / (1000 * 60 * 60));
      const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

      const text = `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
      if (span) span.textContent = text;
    };

    update();
    this.teacherTimerInterval = setInterval(update, 1000);
  },

  bindEvents(container) {
    if (this.activeExamId) {
      const exam = window.store.getExamById(this.activeExamId);
      if (exam) this.startTeacherCountdown(container, exam);
    }

    // Show Fullscreen Code Key modal
    const teacherShowBigKeyBtn = container.querySelector('#teacherShowBigKeyBtn');
    if (teacherShowBigKeyBtn) {
      teacherShowBigKeyBtn.addEventListener('click', () => {
        const exam = window.store.getExamById(this.activeExamId);
        if (exam && window.ExaminerView) window.ExaminerView.showFullscreenKeyModal(exam);
      });
    }

    container.querySelectorAll('.teacher-show-big-key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const exam = window.store.getExamById(btn.dataset.examId);
        if (exam && window.ExaminerView) window.ExaminerView.showFullscreenKeyModal(exam);
      });
    });

    // Quick phase controls in Teacher View
    const teacherOpenRoomBtn = container.querySelector('#teacherOpenRoomBtn');
    if (teacherOpenRoomBtn) {
      teacherOpenRoomBtn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'room_open');
        window.toast('Exam Room opened! Students can now join using the unique key.', 'success');
        this.render(container);
      });
    }

    container.querySelectorAll('.teacher-quick-open-room-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.store.updateExamStatus(btn.dataset.examId, 'room_open');
        window.toast('Exam Room opened! Students can now join using the unique key.', 'success');
        this.render(container);
      });
    });

    const teacherStartStep1Btn = container.querySelector('#teacherStartStep1Btn');
    if (teacherStartStep1Btn) {
      teacherStartStep1Btn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'step1_active');
        window.toast('Step 1 started! Student quiz and project access are now active.', 'success');
        this.render(container);
      });
    }

    container.querySelectorAll('.teacher-quick-start-step1-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.store.updateExamStatus(btn.dataset.examId, 'step1_active');
        window.toast('Step 1 started! Student quiz and project access are now active.', 'success');
        this.render(container);
      });
    });

    const teacherProceedStep2Btn = container.querySelector('#teacherProceedStep2Btn');
    if (teacherProceedStep2Btn) {
      teacherProceedStep2Btn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'step2_active');
        window.toast('Step 2 active! Technical oral defense started.', 'info');
        this.render(container);
      });
    }

    container.querySelectorAll('.teacher-quick-proceed-step2-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.store.updateExamStatus(btn.dataset.examId, 'step2_active');
        window.toast('Step 2 active! Technical oral defense started.', 'info');
        this.render(container);
      });
    });

    const teacherFinishExamBtn = container.querySelector('#teacherFinishExamBtn');
    if (teacherFinishExamBtn) {
      teacherFinishExamBtn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'completed');
        window.toast('Exam session completed and archived!', 'success');
        this.activeExamId = null;
        this.render(container);
      });
    }
    container.querySelectorAll('.open-exam-projects-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeExamId = btn.dataset.examId;
        this.render(container);
      });
    });

    container.querySelectorAll('.end-exam-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        const res = window.store.endExam(examId);
        if (res.success) {
          window.toast(res.message, 'success');
          this.activeExamId = null;
          this.activeStudentId = null;
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    });

    const backBtn = container.querySelector('#backToExamsQueueBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.activeExamId = null;
        this.activeStudentId = null;
        this.render(container);
      });
    }

    container.querySelectorAll('.select-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStudentId = btn.dataset.stdId;
        this.activeMode = 'project';
        this.render(container);
      });
    });

    container.querySelectorAll('.select-oral-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStudentId = btn.dataset.stdId;
        this.activeMode = 'oral';
        this.render(container);
      });
    });

    container.querySelectorAll('.teacher-oral-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const qId = e.target.dataset.qId;
        const val = e.target.value;
        const disp = container.querySelector(`#oral_disp_${qId}`);
        if (disp) disp.textContent = `${val} / 10 ball`;
      });
    });

    const oralForm = container.querySelector('#teacherOralForm');
    if (oralForm) {
      oralForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const exam = window.store.getExamById(this.activeExamId);
        const oralQs = window.store.getStudentOralQuestions(exam.id, this.activeStudentId);

        const questionsAsked = oralQs.map(q => {
          const slider = container.querySelector(`.teacher-oral-slider[data-q-id="${q.id}"]`);
          const notesInput = container.querySelector(`.teacher-oral-notes[data-q-id="${q.id}"]`);
          return {
            id: q.id,
            question: q.prompt || q.question,
            score: Number(slider ? slider.value : 8),
            notes: notesInput ? notesInput.value : ''
          };
        });

        const examinerNotes = container.querySelector('#teacherOralOverallNotes').value;

        window.store.saveExaminerTechnicalGrade(exam.id, this.activeStudentId, {
          questionsAsked,
          examinerNotes
        });

        window.toast('Og\'zaki imtihon bahosi muvaffaqiyatli saqlandi!', 'success');
        this.activeStudentId = null;
        this.render(container);
      });
    }

    container.querySelectorAll('.teacher-rubric-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const rId = e.target.dataset.rubricId;
        const val = e.target.value;
        const max = e.target.max;
        const disp = container.querySelector(`#rubric_disp_${rId}`);
        if (disp) disp.textContent = `${val} / ${max} pts`;
      });
    });

    const form = container.querySelector('#teacherRubricForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const exam = window.store.getExamById(this.activeExamId);
        const track = window.store.getTrackById(exam.trackId);

        const rubricScores = {};
        track.level3.rubric.forEach(r => {
          const slider = container.querySelector(`.teacher-rubric-slider[data-rubric-id="${r.id}"]`);
          rubricScores[r.id] = Number(slider ? slider.value : r.max);
        });

        const teacherNotes = container.querySelector('#teacherNotesInput').value;

        window.store.saveTeacherProjectGrade(exam.id, this.activeStudentId, {
          rubricScores,
          teacherNotes
        });

        window.toast('Project grade saved!', 'success');
        this.activeStudentId = null;
        this.render(container);
      });
    }
  }
};
