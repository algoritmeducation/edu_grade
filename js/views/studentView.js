/* ==========================================================================
   EduGrade 360 - Student View Component (Key Entry, Lobby & Quiz Phase)
   ========================================================================== */

window.StudentView = {
  render(container) {
    const session = window.store.getActiveStudentSession();
    let currentExam = null;
    let currentStudent = null;

    if (session) {
      currentExam = window.store.getExamById(session.examId);
      if (currentExam) {
        currentStudent = currentExam.joinedStudents.find(s => s.id === session.studentId);
      }
    }

    // Manage Security Monitor state
    if (session && currentExam && currentStudent) {
      if (currentExam.status === 'step1_active' && !currentStudent.l1Answers) {
        window.ExamSecurity.activate(currentExam.id, currentStudent.id);
      } else {
        window.ExamSecurity.deactivate();
      }
    } else {
      window.ExamSecurity.deactivate();
    }

    container.innerHTML = `
      <div class="student-portal-wrapper">
        ${(!session || !currentExam || !currentStudent) ? this.renderKeyJoinForm() : this.renderStudentExamPortal(currentExam, currentStudent)}
      </div>
    `;

    this.bindEvents(container);
  },

  renderKeyJoinForm() {
    const exams = window.store.getExams().filter(e => e.status !== 'completed');
    return `
      <div class="card" style="max-width: 620px; margin: 2rem auto; border-color: var(--border-highlight);">
        <div class="card-header">
          <h2 class="card-title">
            ${window.Icons.get('student', 22, 'icon-title')} Talabalar Imtihon Xonasiga Kirish
          </h2>
          <span class="badge badge-info">Kirish</span>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Jonli imtihon xonasiga kirish uchun to'liq ism-sharifingizni va Imtihonchingiz bergan <strong>Yagona Imtihon Kalitini</strong> kiriting.
        </p>

        <div id="joinFormError" style="display:none; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.4); color:var(--accent-rose); padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.87rem; margin-bottom:1rem;"></div>

        <form id="joinExamKeyForm">
          <div class="form-group">
            <label class="form-label" for="studentNameInput">Ism va Familiyangiz *</label>
            <input type="text" id="studentNameInput" class="form-input" placeholder="masalan: Javohir Alimov" required autocomplete="name">
          </div>

          <div class="form-group">
            <label class="form-label" for="uniqueKeyInput">Yagona Imtihon Kaliti (Imtihonchi bergan kalit) *</label>
            <input type="text" id="uniqueKeyInput" class="form-input" placeholder="masalan: EX-9482" required
              style="font-family: var(--font-mono); font-size: 1.2rem; text-transform: uppercase; letter-spacing: 3px; color: var(--accent-cyan);">
          </div>

          ${exams.length > 0 ? `
            <div style="background: rgba(6,182,212,0.07); border: 1px dashed rgba(6,182,212,0.3); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.84rem; margin-bottom: 1.5rem;">
              ${window.Icons.get('key', 14)}
              <strong>Hozirda ochiq imtihon xona${exams.length > 1 ? 'lari' : 'si'}:</strong>
              ${exams.map(e => `
                <span style="display:inline-flex; align-items:center; gap:0.3rem; background:rgba(6,182,212,0.12); border:1px solid rgba(6,182,212,0.3); padding:0.2rem 0.6rem; border-radius:6px; margin:0.2rem; font-family:var(--font-mono); color:var(--accent-cyan); cursor:pointer;"
                  class="demo-key-fill" data-key="${e.uniqueKey}" title="Kalitni avto-to'ldirish uchun bosing">
                  ${e.uniqueKey}
                </span> <span style="color:var(--text-muted); font-size:0.78rem;">${e.title}</span>
              `).join(' &nbsp; ')}
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.4rem;">Toldirish uchun yuqoridagi kalitni bosing.</div>
            </div>
          ` : `
            <div style="background: rgba(245,158,11,0.08); border: 1px dashed rgba(245,158,11,0.3); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.84rem; margin-bottom: 1.5rem;">
              ${window.Icons.get('alert', 14)} Hozirda ochiq imtihon xonalari yo'q. Administratoringizdan xona yaratishni so'rang.
            </div>
          `}

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ${window.Icons.get('key', 18)} Jonli Imtihon Xonasiga Kirish
          </button>
        </form>
      </div>
    `;
  },

  renderStudentExamPortal(exam, student) {
    const track = window.store.getTrackById(exam.trackId);
    const examiners = window.store.getUsersByRole('examiner');
    const examiner = examiners.find(e => e.id === exam.examinerId);
    const teachers = window.store.getUsersByRole('teacher');
    const teacher = teachers.find(t => t.id === exam.teacherId);

    return `
      <!-- Student Header Banner -->
      <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800;">
              ${window.Icons.get('student', 20, 'icon-title')} ${student.name}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.2rem;">
              Room: <strong>${exam.title}</strong> (${exam.groupName}) &nbsp;|&nbsp; Key: <code>${exam.uniqueKey}</code>
            </p>
            <p style="font-size: 0.8rem; color: var(--text-subtle); margin-top: 0.15rem;">
              Examiner: <strong>${examiner ? examiner.name : ''}</strong> &nbsp;|&nbsp; Teacher: <strong>${teacher ? teacher.name : ''}</strong>
            </p>
          </div>
          <button id="leaveExamBtn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
            ${window.Icons.get('logout', 14)} Leave Room
          </button>
        </div>

        <!-- Progress Stepper -->
        <div class="exam-stepper" style="margin-top: 2rem;">
          <div class="step-item ${exam.status === 'created' || exam.status === 'room_open' ? 'active' : 'completed'}">
            <div class="step-circle">1</div>
            <div class="step-label">Join Room</div>
          </div>
          <div class="step-item ${exam.status === 'step1_active' ? 'active' : (student.l1Answers ? 'completed' : '')}">
            <div class="step-circle">2</div>
            <div class="step-label">Quiz</div>
          </div>
          <div class="step-item ${exam.status === 'step2_active' ? 'active' : (student.l2TechnicalGrade ? 'completed' : '')}">
            <div class="step-circle">3</div>
            <div class="step-label">Technical</div>
          </div>
          <div class="step-item ${exam.status === 'completed' ? 'completed' : ''}">
            <div class="step-circle">4</div>
            <div class="step-label">Scorecard</div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      ${this.renderStudentStepContent(exam, student, track)}
    `;
  },

  renderStudentStepContent(exam, student, track) {
    // Check if student was disqualified in Part 1
    if (student.l1Answers?.disqualified || student.status === 'quiz_disqualified') {
      const violation = student.l1Answers?.violation || { reason: 'Security violation detected during Part 1', type: 'SECURITY_VIOLATION' };
      return `
        <div class="card" style="border-color: var(--accent-rose); background: linear-gradient(145deg, rgba(15,23,42,0.95), rgba(239,68,68,0.08)); text-align: center; padding: 3rem 1.5rem;">
          <div style="display: inline-flex; padding: 1.2rem; background: rgba(239,68,68,0.15); border-radius: 50%; color: var(--accent-rose); margin-bottom: 1.25rem;">
            ${window.Icons.get('alert', 48)}
          </div>
          <span class="badge badge-danger" style="font-size: 0.85rem; padding: 0.4rem 1rem; margin-bottom: 1rem;">
            PART 1 DISQUALIFIED — SCORE: 0%
          </span>
          <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--accent-rose); margin-bottom: 0.5rem;">
            Part 1 Exam Automatically Failed
          </h3>
          <p style="color: var(--text-muted); max-width: 540px; margin: 0 auto 1.5rem; line-height: 1.6;">
            Your Part 1 exam was automatically terminated and submitted with <strong>0%</strong> due to an anti-cheat violation.
          </p>

          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--accent-rose); border-radius: var(--radius-md); padding: 1.25rem; max-width: 500px; margin: 0 auto 1.5rem; text-align: left;">
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Violation Log</div>
            <div style="font-size: 0.95rem; color: var(--text-main); font-weight: 700; margin-bottom: 0.25rem;">${violation.reason}</div>
            <div style="font-size: 0.8rem; color: var(--accent-rose); font-family: var(--font-mono);">Type: ${violation.type}</div>
            ${violation.at ? `<div style="font-size: 0.75rem; color: var(--text-subtle); margin-top: 0.3rem;">Recorded at: ${new Date(violation.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>` : ''}
          </div>

          <p style="font-size: 0.85rem; color: var(--text-subtle);">
            Please wait in the room for your examiner or teacher to complete remaining steps.
          </p>
        </div>
      `;
    }

    // Lobby — waiting for examiner to start
    if (exam.status === 'created' || exam.status === 'room_open') {
      return `
        <div class="card" style="text-align: center; padding: 4rem 1.5rem;">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.5;">${window.Icons.get('clock', 56)}</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.5rem;">
            Waiting in Exam Room Lobby
          </h3>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 1.5rem;">
            You have successfully joined <strong>${exam.title}</strong>. Your examiner is preparing the test.
          </p>
          <div style="background: rgba(6, 182, 212, 0.08); border: 1px dashed var(--accent-cyan); padding: 1.1rem; border-radius: var(--radius-md); max-width: 480px; margin: 0 auto; font-size: 0.85rem; display: flex; align-items: flex-start; gap: 0.5rem;">
            ${window.Icons.get('alert', 15)} <span><strong>Demo:</strong> Switch to the <strong>Examiner Portal</strong> and click <strong>"Start Step 1"</strong> to unlock the quiz.</span>
          </div>
        </div>
      `;
    }

    // Step 1 — Quiz active (Proctored)
    if (exam.status === 'step1_active' && !student.l1Answers) {
      const assignedQuestions = window.store.getStudentAssignedQuiz(exam.id, student.id);
      const draftKey = `edugrade_draft_${exam.id}_${student.id}`;
      let savedDraft = {};
      try {
        savedDraft = JSON.parse(localStorage.getItem(draftKey) || '{}');
      } catch (e) { savedDraft = {}; }

      // Check if student has passed system check
      if (!this.systemCheckPassed) {
        return `
          <div class="card" style="border-color: var(--accent-cyan); box-shadow: var(--shadow-glow); padding: 2.25rem 2rem;">
            <div style="text-align: center; margin-bottom: 1.75rem;">
              <div style="display: inline-flex; padding: 1rem; background: rgba(6, 182, 212, 0.15); border-radius: 50%; color: var(--accent-cyan); margin-bottom: 0.85rem;">
                ${window.Icons.get('shield', 36)}
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
                Pre-Exam System Readiness Check
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 520px; margin: 0 auto;">
                Please verify browser compatibility & accept anti-cheat proctoring terms before starting Part 1.
              </p>
            </div>

            <!-- Readiness Checklist -->
            <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; color: var(--text-main);">
                <span style="color: var(--accent-emerald); font-weight: 800; font-size: 1.1rem;">✓</span>
                <div>
                  <strong>Browser Lockdown Readiness:</strong> Screen resolution & focus monitoring active.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; color: var(--text-main);">
                <span style="color: var(--accent-emerald); font-weight: 800; font-size: 1.1rem;">✓</span>
                <div>
                  <strong>Auto-Save Recovery Engine:</strong> Draft answers auto-saved every 5s to prevent data loss.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; color: var(--text-main);">
                <span style="color: var(--accent-emerald); font-weight: 800; font-size: 1.1rem;">✓</span>
                <div>
                  <strong>Randomized Question Pool:</strong> ${assignedQuestions.length} technical written questions loaded for your session.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; color: var(--accent-rose);">
                <span style="color: var(--accent-rose); font-weight: 800; font-size: 1.1rem;">⚠️</span>
                <div>
                  <strong>Proctoring Notice:</strong> Tab switches, window blurs, or screenshot keys will automatically fail your exam with 0%.
                </div>
              </div>
            </div>

            <button id="startPreExamQuizBtn" class="btn btn-primary btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem;">
              ${window.Icons.get('check', 18)} Verify System &amp; Start ${assignedQuestions.length}-Question Quiz
            </button>
          </div>
        `;
      }

      const hasDraft = Object.keys(savedDraft).length > 0;

      return `
        <div class="card exam-quiz-protected" id="examQuizZone">
          <div class="card-header" style="flex-wrap: wrap; gap: 0.8rem;">
            <div>
              <h3 class="card-title">${window.Icons.get('quiz', 18, 'icon-title')} Part 1: Written Examination (${assignedQuestions.length} Questions)</h3>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>Live Anti-Cheat Proctoring Active</span>
                <span id="autoSaveIndicatorBadge" class="badge badge-success" style="font-size: 0.72rem; ${hasDraft ? '' : 'display: none;'}">
                  💾 Draft Auto-Restored
                </span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span class="security-live-badge">
                <span class="security-live-dot"></span> PROCTORED SESSION
              </span>
              <span id="studentLiveTimerBadge" class="badge badge-warning" style="font-family: var(--font-mono); font-size: 0.92rem; padding: 0.4rem 0.85rem; display: flex; align-items: center; gap: 0.4rem; background: rgba(245, 158, 11, 0.18); border: 1px solid var(--accent-amber); color: var(--accent-amber); font-weight: 800;">
                ${window.Icons.get('clock', 14)} ⏱️ Time Remaining: <span id="studentTimerDigits">60:00</span>
              </span>
            </div>
          </div>

          <!-- Security warning banner -->
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px dashed rgba(239, 68, 68, 0.4); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); font-size: 0.84rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 0.6rem; color: var(--accent-rose);">
            ${window.Icons.get('alert', 18)}
            <div>
              <strong style="display: block; font-size: 0.9rem; margin-bottom: 0.2rem;">Strict Anti-Cheat Policy Active</strong>
              Tab switches, window blurs, screenshot keys (PrintScreen), copying text (Ctrl+C), cutting, or right-clicking will <strong>automatically fail your Part 1 exam instantly with 0%</strong>.
            </div>
          </div>

          <form id="studentQuizForm">
            <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <h4 style="color: var(--accent-cyan); display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                  ${window.Icons.get('clipboard', 18)} Written Responses (${assignedQuestions.length} Randomized Questions)
                </h4>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Answer each question thoroughly in your own words. Answers auto-save as you type.
                </p>
              </div>
              <span id="draftSaveTime" style="font-size: 0.75rem; color: var(--text-subtle); font-family: var(--font-mono);">
                ${hasDraft ? 'Draft restored' : 'Auto-save active'}
              </span>
            </div>

            ${assignedQuestions.map((q, idx) => {
              const val = savedDraft[q.id] || '';
              return `
                <div class="question-card" style="margin-bottom: 1.25rem;">
                  <div class="question-prompt" style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.4rem;">
                    Question ${idx + 1} of ${assignedQuestions.length}: ${window.escapeHTML(q.prompt || q.question)}
                  </div>
                  ${q.hint ? `
                    <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.35rem;">
                      ${window.Icons.get('alert', 12)} Guidance: ${q.hint}
                    </p>
                  ` : ''}
                  <textarea class="form-textarea quiz-auto-save-textarea" data-q-id="${q.id}" name="written_${q.id}" placeholder="Type your detailed explanation here..." required minlength="10" style="min-height: 85px; font-size: 0.9rem;">${val}</textarea>
                </div>
              `;
            }).join('')}

            <div style="text-align: right; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary btn-lg" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                ${window.Icons.get('check', 16)} Submit All ${assignedQuestions.length} Written Responses
              </button>
            </div>
          </form>
        </div>
      `;
    }

    // Step 1 complete — waiting for step 2
    if (exam.status === 'step1_active' && student.l1Answers) {
      return `
        <div class="card" style="text-align: center; padding: 4rem 1.5rem;">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem; color: var(--accent-emerald); opacity: 0.8;">${window.Icons.get('check', 56)}</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--accent-emerald); margin-bottom: 0.5rem;">
            Part 1 Quiz Submitted!
          </h3>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 1.5rem;">
            Your quiz answers are recorded. Your teacher is grading your project while the examiner prepares Part 2.
          </p>
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed var(--accent-emerald); padding: 1.1rem; border-radius: var(--radius-md); max-width: 480px; margin: 0 auto; font-size: 0.85rem; display: flex; align-items: flex-start; gap: 0.5rem;">
            ${window.Icons.get('alert', 15)} <span><strong>Demo:</strong> Switch to the <strong>Examiner Portal</strong> and click <strong>"Proceed to Step 2"</strong>.</span>
          </div>
        </div>
      `;
    }

    // Step 2 — waiting to be called
    if (exam.status === 'step2_active' && !student.l2TechnicalGrade) {
      return `
        <div class="card" style="text-align: center; padding: 4rem 1.5rem; border-color: var(--accent-cyan);">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem; color: var(--accent-cyan); opacity: 0.7;">${window.Icons.get('mic', 56)}</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">
            Part 2: Technical Questions Active
          </h3>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 1.5rem;">
            The examiner is calling out candidates by name. Please listen for your name:
            <strong style="color: var(--text-main); font-size: 1.1rem; display: block; margin-top: 0.5rem;">${student.name}</strong>
          </p>
          <div style="background: rgba(6, 182, 212, 0.08); border: 1px dashed var(--accent-cyan); padding: 1.1rem; border-radius: var(--radius-md); max-width: 480px; margin: 0 auto; font-size: 0.85rem; display: flex; align-items: flex-start; gap: 0.5rem;">
            ${window.Icons.get('alert', 15)} <span><strong>Demo:</strong> In the <strong>Examiner Portal</strong>, click <strong>"Call Out &amp; Grade"</strong> for ${student.name}.</span>
          </div>
        </div>
      `;
    }

    // Completed — Final Scorecard
    const score = student.finalScorePct || 0;
    const tier = score >= 90 ? 'legend' : score >= 75 ? 'excellence' : score >= 60 ? 'merit' : 'achiever';
    const tierLabel = { legend: 'LEGEND', excellence: 'EXCELLENCE', merit: 'MERIT', achiever: 'ACHIEVER' }[tier];
    const tierColor = { legend: 'var(--accent-amber)', excellence: 'var(--accent-cyan)', merit: 'var(--accent-purple)', achiever: 'var(--accent-emerald)' }[tier];
    const tierDesc = {
      legend: 'Top-tier performance. Outstanding across all exam components.',
      excellence: 'Strong results demonstrating deep technical knowledge.',
      merit: 'Solid understanding across all exam sections.',
      achiever: 'Successfully completed all examination requirements.'
    }[tier];

    return `
      <div class="scorecard-hero">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); padding: 0.4rem 1rem; border-radius: 999px; border: 1px solid ${tierColor}; color: ${tierColor}; font-size: 0.8rem; font-weight: 700; letter-spacing: 1px;">
          ${window.Icons.get('trophy', 14)} ${tierLabel}
        </div>
        <div class="score-number" style="margin: 0.5rem 0;">${score ? score + '%' : '—'}</div>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 420px; margin: 0 auto;">${tierDesc}</p>

        <div class="level-breakdown-grid" style="margin-top: 1.5rem;">
          <div class="level-score-box">
            <div class="lbl">Nazariy Test</div>
            <div class="val" style="color: var(--accent-cyan);">${student.l1Grade ? student.l1Grade.totalL1Pct + '%' : '—'}</div>
          </div>
          <div class="level-score-box">
            <div class="lbl">Loyiha Bahosi</div>
            <div class="val" style="color: var(--accent-emerald);">${student.teacherProjectGrade ? student.teacherProjectGrade.totalL3Pct + '%' : '—'}</div>
          </div>
          <div class="level-score-box">
            <div class="lbl">Og'zaki Imtihon</div>
            <div class="val" style="color: var(--accent-purple);">${student.l2TechnicalGrade ? student.l2TechnicalGrade.speakingScorePct + '%' : '—'}</div>
          </div>
        </div>
      </div>

      <!-- Achievement Card Generator -->
      <div class="card" style="text-align: center; border-color: ${tierColor};">
        <h3 class="card-title" style="margin-bottom: 0.4rem; justify-content: center;">
          ${window.Icons.get('trophy', 18, 'icon-title')} Sizning Imtihon Sertifikatingiz va Yutuq Kartangiz
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 1.25rem;">Shaxsiy sertifikatingizni rasm yoki PDF ko'rinishida yuklab oling.</p>

        <!-- Canvas Preview -->
        <div style="display: flex; justify-content: center; margin-bottom: 1.25rem;">
          <canvas id="achievementCanvas" width="800" height="440"
            style="border-radius: var(--radius-md); max-width: 100%; box-shadow: 0 8px 30px rgba(0,0,0,0.5); border: 2px solid ${tierColor};"></canvas>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <button id="downloadCardBtn" class="btn btn-primary btn-lg" style="display: inline-flex; align-items: center; gap: 0.5rem;">
            ${window.Icons.get('refresh', 16)} Rasm Sifatida Yuklash
          </button>
          <button id="shareCardBtn" class="btn btn-secondary btn-lg" style="display: inline-flex; align-items: center; gap: 0.5rem;">
            ${window.Icons.get('copy', 16)} Ulashish / Nusxalash
          </button>
          <button id="printPdfCertificateBtn" class="btn btn-outline-cyan btn-lg" style="display: inline-flex; align-items: center; gap: 0.5rem;">
            🖨️ PDF Sertifikatni Saqlash / Chop Etish
          </button>
        </div>

        <!-- Topic Analytics & Mastery Breakdown -->
        <div style="margin-top: 1.75rem; text-align: left; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            📊 Topic Mastery Breakdown &amp; Skill Analytics
          </h4>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 0.3rem;">
                <span>HTML5 Semantic Markup &amp; Accessibility</span>
                <strong style="color: var(--accent-emerald);">92%</strong>
              </div>
              <div style="width: 100%; background: rgba(255,255,255,0.08); height: 8px; border-radius: 999px; overflow: hidden;">
                <div style="width: 92%; height: 100%; background: var(--accent-emerald); border-radius: 999px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 0.3rem;">
                <span>CSS Box Model, Specificity &amp; Cascade</span>
                <strong style="color: var(--accent-cyan);">88%</strong>
              </div>
              <div style="width: 100%; background: rgba(255,255,255,0.08); height: 8px; border-radius: 999px; overflow: hidden;">
                <div style="width: 88%; height: 100%; background: var(--accent-cyan); border-radius: 999px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 0.3rem;">
                <span>Flexbox &amp; Grid Layout Architecture</span>
                <strong style="color: var(--accent-purple);">95%</strong>
              </div>
              <div style="width: 100%; background: rgba(255,255,255,0.08); height: 8px; border-radius: 999px; overflow: hidden;">
                <div style="width: 95%; height: 100%; background: var(--accent-purple); border-radius: 999px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 0.3rem;">
                <span>Technical Oral Defense &amp; Speaking</span>
                <strong style="color: var(--accent-amber);">${student.l2TechnicalGrade ? student.l2TechnicalGrade.speakingScorePct + '%' : '90%'}</strong>
              </div>
              <div style="width: 100%; background: rgba(255,255,255,0.08); height: 8px; border-radius: 999px; overflow: hidden;">
                <div style="width: ${student.l2TechnicalGrade ? student.l2TechnicalGrade.speakingScorePct : 90}%; height: 100%; background: var(--accent-amber); border-radius: 999px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Detailed Review ────────────────────────── -->
      ${this.renderStudentDetailedReview(exam, student, track)}
    `;
  },

  renderStudentDetailedReview(exam, student, track) {
    const assignedQuestions = window.store.getStudentAssignedQuiz(exam.id, student.id);
    const oralQuestions     = window.store.getStudentOralQuestions(exam.id, student.id);
    const hasAny = student.l1Answers || student.l2TechnicalGrade || student.teacherProjectGrade;
    if (!hasAny) return '';

    return `
      <div class="card" style="margin-top: 2rem; border-color: rgba(99,102,241,0.3);">
        <div class="card-header" style="border-bottom: 1px solid var(--border-color); margin-bottom: 1.25rem; padding-bottom: 0.75rem;">
          <h3 class="card-title">${window.Icons.get('clipboard', 18, 'icon-title')} Detailed Question Review</h3>
          <span class="badge badge-info">Transparent Feedback</span>
        </div>

        <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:1.5rem;">
          Full breakdown of every question, your answer, and the examiner / teacher review. Use this to identify areas for improvement.
        </p>

        <!-- Part 1: Written Quiz -->
        ${student.l1Answers && !student.l1Answers.disqualified ? `
          <div style="margin-bottom:2rem;">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--accent-cyan); display:flex; align-items:center; gap:0.5rem; margin-bottom:0.9rem; border-bottom:1px solid rgba(6,182,212,0.15); padding-bottom:0.5rem;">
              ${window.Icons.get('quiz', 16)} Part 1 — Written Quiz
              <span class="badge badge-info" style="font-size:0.7rem; margin-left:auto;">${student.l1Grade ? student.l1Grade.totalL1Pct + '%' : '—'}</span>
            </h4>
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${assignedQuestions.map((q, idx) => {
                const answer = student.l1Answers?.writtenAnswers?.[q.id] || '';
                const review = student.l1Grade?.questionReviews?.[q.id] || '';
                return `
                  <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem 1.1rem;">
                    <div style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin-bottom:0.4rem;">Q${idx+1}. ${q.prompt || q.question}</div>
                    ${q.hint ? `<div style="font-size:0.75rem; color:var(--text-subtle); margin-bottom:0.5rem;">Hint: ${q.hint}</div>` : ''}
                    <div style="background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.15); border-radius:var(--radius-sm); padding:0.55rem 0.8rem; margin-bottom:0.45rem;">
                      <div style="font-size:0.68rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:0.2rem;">Your Answer</div>
                      <div style="font-size:0.84rem; color:var(--text-main);">${answer || '<em style="color:var(--text-subtle)">No answer submitted</em>'}</div>
                    </div>
                    ${review ? `
                      <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-sm); padding:0.55rem 0.8rem;">
                        <div style="font-size:0.68rem; color:var(--accent-emerald); font-weight:700; text-transform:uppercase; margin-bottom:0.2rem;">Examiner Review</div>
                        <div style="font-size:0.83rem; color:var(--text-main);">${review}</div>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
              ${student.l1Grade?.examinerNotes ? `
                <div style="background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.25); border-radius:var(--radius-sm); padding:0.65rem 0.9rem;">
                  <div style="font-size:0.72rem; color:var(--accent-amber); font-weight:700; text-transform:uppercase; margin-bottom:0.2rem;">Examiner Overall Notes</div>
                  <div style="font-size:0.84rem; color:var(--text-main);">${student.l1Grade.examinerNotes}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : student.l1Answers?.disqualified ? `
          <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:0.85rem 1rem; margin-bottom:2rem;">
            <strong style="color:var(--accent-rose);">Part 1 — Disqualified:</strong> ${student.l1Answers.violation?.reason || 'Security violation'}
          </div>
        ` : ''}

        <!-- Part 2: Oral Defense -->
        ${student.l2TechnicalGrade ? `
          <div style="margin-bottom:2rem;">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--accent-purple); display:flex; align-items:center; gap:0.5rem; margin-bottom:0.9rem; border-bottom:1px solid rgba(139,92,246,0.15); padding-bottom:0.5rem;">
              ${window.Icons.get('mic', 16)} Part 2 — Oral Defense Questions
              <span class="badge badge-info" style="font-size:0.7rem; margin-left:auto;">${student.l2TechnicalGrade.speakingScorePct}%</span>
            </h4>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${oralQuestions.map((q, idx) => {
                const sc = student.l2TechnicalGrade.scores?.[q.id] || {};
                return `
                  <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem 1rem; display:flex; gap:1rem; align-items:flex-start;">
                    <div style="flex:1; min-width:0;">
                      <div style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin-bottom:0.25rem;">Q${idx+1}. ${q.question}</div>
                      ${sc.notes ? `<div style="font-size:0.79rem; color:var(--text-muted); margin-top:0.25rem;"><em>Examiner notes:</em> ${sc.notes}</div>` : ''}
                    </div>
                    <div style="text-align:center; flex-shrink:0; min-width:56px;">
                      <div style="font-family:var(--font-mono); font-size:1.5rem; font-weight:800; color:${(sc.score || 0) >= 7 ? 'var(--accent-emerald)' : (sc.score || 0) >= 5 ? 'var(--accent-amber)' : 'var(--accent-rose)'};">
                        ${sc.score !== undefined ? sc.score : '—'}
                      </div>
                      <div style="font-size:0.65rem; color:var(--text-muted);">/ 10</div>
                    </div>
                  </div>
                `;
              }).join('')}
              ${student.l2TechnicalGrade.examinerNotes ? `
                <div style="background:rgba(139,92,246,0.07); border:1px solid rgba(139,92,246,0.25); border-radius:var(--radius-sm); padding:0.65rem 0.9rem;">
                  <div style="font-size:0.72rem; color:var(--accent-purple); font-weight:700; text-transform:uppercase; margin-bottom:0.2rem;">Examiner Overall Notes</div>
                  <div style="font-size:0.84rem; color:var(--text-main);">${student.l2TechnicalGrade.examinerNotes}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Part 3: Project Evaluation -->
        ${student.teacherProjectGrade ? `
          <div>
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--accent-emerald); display:flex; align-items:center; gap:0.5rem; margin-bottom:0.9rem; border-bottom:1px solid rgba(16,185,129,0.15); padding-bottom:0.5rem;">
              ${window.Icons.get('project', 16)} Part 3 — Capstone Project Evaluation
              <span class="badge badge-success" style="font-size:0.7rem; margin-left:auto;">${student.teacherProjectGrade.totalL3Pct}%</span>
            </h4>
            ${student.teacherProjectGrade.rubricBreakdown ? `
              <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.85rem;">
                ${student.teacherProjectGrade.rubricBreakdown.map(rb => `
                  <div style="display:flex; align-items:center; gap:0.75rem; background:rgba(0,0,0,0.2); padding:0.6rem 0.85rem; border-radius:var(--radius-sm);">
                    <div style="flex:1; font-size:0.84rem; color:var(--text-main);">${rb.label}</div>
                    <div style="font-family:var(--font-mono); font-size:0.9rem; font-weight:700; color:var(--accent-emerald);">${rb.score} / ${rb.max}</div>
                    <div style="width:80px; background:rgba(255,255,255,0.08); border-radius:999px; height:5px; overflow:hidden;">
                      <div style="width:${Math.round(rb.score/rb.max*100)}%; height:100%; background:var(--accent-emerald); border-radius:999px;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${student.teacherProjectGrade.teacherNotes ? `
              <div style="background:rgba(16,185,129,0.07); border:1px solid rgba(16,185,129,0.25); border-radius:var(--radius-sm); padding:0.65rem 0.9rem;">
                <div style="font-size:0.72rem; color:var(--accent-emerald); font-weight:700; text-transform:uppercase; margin-bottom:0.2rem;">Teacher Notes</div>
                <div style="font-size:0.84rem; color:var(--text-main);">${student.teacherProjectGrade.teacherNotes}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  },

  startQuizCountdown(container, exam) {
    if (this.quizTimerInterval) clearInterval(this.quizTimerInterval);

    const timerSpan = container.querySelector('#studentTimerDigits');
    if (!timerSpan) return;

    const durationSec = 60 * 60; // 60 minutes
    const startTime = exam.step1StartedAt ? new Date(exam.step1StartedAt).getTime() : Date.now();

    const updateTimer = () => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const remainingSec = Math.max(0, durationSec - elapsedSec);

      const m = Math.floor(remainingSec / 60);
      const s = remainingSec % 60;
      const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      if (timerSpan) timerSpan.textContent = formatted;

      if (remainingSec <= 0) {
        clearInterval(this.quizTimerInterval);
        const quizForm = container.querySelector('#studentQuizForm');
        if (quizForm) {
          window.toast('Time is up! Submitting your quiz automatically...', 'warning');
          quizForm.requestSubmit();
        }
      }
    };

    updateTimer();
    this.quizTimerInterval = setInterval(updateTimer, 1000);
  },

  bindEvents(container) {
    const session = window.store.getActiveStudentSession();
    if (session) {
      const exam = window.store.getExamById(session.examId);
      if (exam && exam.status === 'step1_active') {
        this.startQuizCountdown(container, exam);
      }
    }
    container.querySelectorAll('.demo-key-fill').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.key;
        const keyInput = container.querySelector('#uniqueKeyInput');
        if (keyInput) {
          keyInput.value = key;
          keyInput.focus();
        }
      });
    });

    const joinForm = container.querySelector('#joinExamKeyForm');
    if (joinForm) {
      joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const errDiv = container.querySelector('#joinFormError');
        if (errDiv) { errDiv.style.display = 'none'; errDiv.textContent = ''; }

        const studentName = container.querySelector('#studentNameInput').value.trim();
        const uniqueKey = container.querySelector('#uniqueKeyInput').value.trim();

        if (!studentName || !uniqueKey) {
          window.toast('Please enter both your name and the exam key.', 'warning');
          if (errDiv) {
            errDiv.textContent = 'Please enter both your name and the exam key.';
            errDiv.style.display = 'block';
          }
          return;
        }

        const res = window.store.joinExamAsStudent({ name: studentName, uniqueKey });
        if (!res.success) {
          window.toast(res.message, 'danger');
          if (errDiv) {
            errDiv.textContent = res.message;
            errDiv.style.display = 'block';
          }
          return;
        }

        window.toast(`Joined: ${res.exam.title}!`, 'success');
        this.render(container);
      });
    }

    const leaveBtn = container.querySelector('#leaveExamBtn');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        window.ExamSecurity.deactivate();
        window.store.clearActiveStudentSession();
        this.render(container);
      });
    }

    // Pre-Exam Readiness Check Button
    const startPreExamBtn = container.querySelector('#startPreExamQuizBtn');
    if (startPreExamBtn) {
      startPreExamBtn.addEventListener('click', () => {
        this.systemCheckPassed = true;
        window.toast('System readiness verified! Part 1 proctored quiz launched.', 'success');
        this.render(container);
      });
    }

    // Auto-Save Draft Handler
    if (session) {
      const draftKey = `edugrade_draft_${session.examId}_${session.studentId}`;
      let autoSaveTimer = null;

      container.querySelectorAll('.quiz-auto-save-textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
          if (autoSaveTimer) clearTimeout(autoSaveTimer);
          autoSaveTimer = setTimeout(() => {
            const formData = new FormData(container.querySelector('#studentQuizForm'));
            const writtenAnswers = {};
            for (let [key, val] of formData.entries()) {
              if (key.startsWith('written_')) {
                const qId = key.replace('written_', '');
                writtenAnswers[qId] = val.toString().trim();
              }
            }
            localStorage.setItem(draftKey, JSON.stringify(writtenAnswers));
            const saveTimeSpan = container.querySelector('#draftSaveTime');
            if (saveTimeSpan) {
              const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              saveTimeSpan.textContent = `Draft saved at ${nowStr}`;
            }
          }, 800);
        });
      });
    }

    const quizForm = container.querySelector('#studentQuizForm');
    if (quizForm) {
      quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.ExamSecurity.deactivate();
        const formData = new FormData(quizForm);
        const writtenAnswers = {};

        for (let [key, val] of formData.entries()) {
          if (key.startsWith('written_')) {
            const qId = key.replace('written_', '');
            writtenAnswers[qId] = val.toString().trim();
          }
        }

        if (session) {
          localStorage.removeItem(`edugrade_draft_${session.examId}_${session.studentId}`);
        }

        window.store.submitStudentQuiz(session.examId, session.studentId, writtenAnswers);
        window.toast('All written quiz answers submitted successfully!', 'success');
        this.render(container);
      });
    }

    // Draw achievement canvas after render
    requestAnimationFrame(() => {
      const session = window.store.getActiveStudentSession();
      if (!session) return;
      const exam = window.store.getExamById(session.examId);
      if (!exam) return;
      const student = exam.joinedStudents.find(s => s.id === session.studentId);
      if (!student) return;
      this.drawAchievementCanvas(exam, student);
    });

    const dlBtn = container.querySelector('#downloadCardBtn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const canvas = document.getElementById('achievementCanvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'EduGrade360-Achievement.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        window.toast('Achievement card downloaded!', 'success');
      });
    }

    const shareBtn = container.querySelector('#shareCardBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const canvas = document.getElementById('achievementCanvas');
        if (!canvas) return;
        try {
          canvas.toBlob(async (blob) => {
            if (navigator.share && navigator.canShare({ files: [new File([blob], 'achievement.png', { type: 'image/png' })] })) {
              const file = new File([blob], 'EduGrade360-Achievement.png', { type: 'image/png' });
              await navigator.share({ title: 'My EduGrade 360 Achievement', files: [file] });
            } else {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              window.toast('Achievement card copied to clipboard!', 'success');
            }
          }, 'image/png');
        } catch (err) {
          window.toast('Could not share — try Download instead.', 'warning');
        }
      });
    }

    const printPdfBtn = container.querySelector('#printPdfCertificateBtn');
    if (printPdfBtn) {
      printPdfBtn.addEventListener('click', () => {
        window.print();
      });
    }
  },

  drawAchievementCanvas(exam, student) {
    const canvas = document.getElementById('achievementCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 800, H = 440;
    const score = student.finalScorePct || 0;

    // Tier config
    const tiers = {
      legend:    { label: 'AFSONA',    min: 90, c1: '#f59e0b', c2: '#fbbf24', c3: '#78350f', glow: 'rgba(251,191,36,0.35)' },
      excellence:{ label: 'A\'LO',      min: 75, c1: '#06b6d4', c2: '#67e8f9', c3: '#164e63', glow: 'rgba(6,182,212,0.35)' },
      merit:     { label: 'YAXSHI',    min: 60, c1: '#a855f7', c2: '#d8b4fe', c3: '#3b0764', glow: 'rgba(168,85,247,0.35)' },
      achiever:  { label: 'QATNASHCHI',min: 0,  c1: '#10b981', c2: '#6ee7b7', c3: '#064e3b', glow: 'rgba(16,185,129,0.35)' }
    };
    const tier = score >= 90 ? tiers.legend : score >= 75 ? tiers.excellence : score >= 60 ? tiers.merit : tiers.achiever;

    // --- Background ---
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0a0f1e');
    bg.addColorStop(0.5, '#0d1528');
    bg.addColorStop(1, '#0a0f1e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Glow orbs
    const drawOrb = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    drawOrb(120, 100, 220, tier.glow);
    drawOrb(680, 340, 200, tier.glow.replace('0.35', '0.2'));

    // Border
    const borderGrad = ctx.createLinearGradient(0, 0, W, H);
    borderGrad.addColorStop(0, tier.c1);
    borderGrad.addColorStop(0.5, tier.c2);
    borderGrad.addColorStop(1, tier.c1);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 3;
    const r = 18;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(W - r, 0); ctx.quadraticCurveTo(W, 0, W, r);
    ctx.lineTo(W, H - r); ctx.quadraticCurveTo(W, H, W - r, H);
    ctx.lineTo(r, H); ctx.quadraticCurveTo(0, H, 0, H - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath(); ctx.stroke();

    // Inner accent line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 20); ctx.lineTo(W - 20, 20); ctx.lineTo(W - 20, H - 20);
    ctx.lineTo(20, H - 20); ctx.closePath(); ctx.stroke();

    // --- Left accent bar ---
    const barGrad = ctx.createLinearGradient(38, 60, 38, H - 60);
    barGrad.addColorStop(0, 'transparent');
    barGrad.addColorStop(0.3, tier.c1);
    barGrad.addColorStop(0.7, tier.c2);
    barGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = barGrad;
    ctx.fillRect(36, 60, 3, H - 120);

    // --- EDUGRADE 360 brand ---
    ctx.font = '700 12px \'Plus Jakarta Sans\', sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.letterSpacing = '3px';
    ctx.fillText('EDUGRADE 360 — RASMIY SERTIFIKAT', 56, 55);
    ctx.letterSpacing = '0px';

    // Tier badge pill
    const tierText = tier.label;
    ctx.font = '800 11px \'Plus Jakarta Sans\', sans-serif';
    const tierW = ctx.measureText(tierText).width + 24;
    const tierX = W - 56 - tierW;
    const pillGrad = ctx.createLinearGradient(tierX, 0, tierX + tierW, 0);
    pillGrad.addColorStop(0, tier.c1);
    pillGrad.addColorStop(1, tier.c2);
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(tierX, 34, tierW, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'middle';
    ctx.fillText(tierText, tierX + 12, 47);
    ctx.textBaseline = 'alphabetic';

    // --- Score circle ---
    const cx = 200, cy = 230, cr = 105;
    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, cr + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Arc progress
    const progress = (score / 100) * (Math.PI * 2);
    const arcGrad = ctx.createLinearGradient(cx - cr, cy - cr, cx + cr, cy + cr);
    arcGrad.addColorStop(0, tier.c1);
    arcGrad.addColorStop(1, tier.c2);
    ctx.beginPath();
    ctx.arc(cx, cy, cr, -Math.PI / 2, -Math.PI / 2 + progress);
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Inner circle fill
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr - 12);
    innerGrad.addColorStop(0, 'rgba(255,255,255,0.07)');
    innerGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.beginPath();
    ctx.arc(cx, cy, cr - 12, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();
    // Score number
    ctx.font = '800 52px \'Outfit\', sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score + '%', cx, cy - 6);
    ctx.font = '600 14px \'Plus Jakarta Sans\', sans-serif';
    ctx.fillStyle = tier.c2;
    ctx.fillText('YAKUNIY BAHO', cx, cy + 32);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // --- Right side content ---
    const rx = 360;

    // Student name
    ctx.font = '800 30px \'Outfit\', sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(student.name, rx, 110);

    // Divider line
    const divGrad = ctx.createLinearGradient(rx, 0, rx + 340, 0);
    divGrad.addColorStop(0, tier.c1);
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(rx, 120, 340, 1.5);

    // Exam title (word-wrapped)
    ctx.font = '500 14px \'Plus Jakarta Sans\', sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const examWords = exam.title.split(' ');
    let line = '', lineY = 145, maxW = 360;
    for (const word of examWords) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && line !== '') {
        ctx.fillText(line.trim(), rx, lineY);
        line = word + ' '; lineY += 22;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), rx, lineY);

    // Group
    ctx.font = '600 12px \'Plus Jakarta Sans\', sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(exam.groupName.toUpperCase(), rx, lineY + 22);

    // Score breakdown bars
    const bars = [
      { label: "1-Bosqich: Yozma Test Sinovi",   val: student.l1Grade ? student.l1Grade.totalL1Pct : 0,                        color: '#06b6d4' },
      { label: "3-Bosqich: Amaliy Loyiha Bahosi", val: student.teacherProjectGrade ? student.teacherProjectGrade.totalL3Pct : 0, color: '#10b981' },
      { label: "2-Bosqich: Texnik Og'zaki Sinov",  val: student.l2TechnicalGrade ? student.l2TechnicalGrade.speakingScorePct : 0, color: '#a855f7' }
    ];
    let barY = 225;
    const barX = rx, barW = 360, barH = 8, gap = 44;
    ctx.font = '600 12px \'Plus Jakarta Sans\', sans-serif';
    bars.forEach(b => {
      // Label + value
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(b.label, barX, barY);
      ctx.textAlign = 'right';
      ctx.fillStyle = b.color;
      ctx.fillText(b.val + '%', barX + barW, barY);
      ctx.textAlign = 'left';
      // Track
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.roundRect(barX, barY + 8, barW, barH, 4); ctx.fill();
      // Fill
      const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      fillGrad.addColorStop(0, b.color + 'aa');
      fillGrad.addColorStop(1, b.color);
      ctx.fillStyle = fillGrad;
      ctx.beginPath(); ctx.roundRect(barX, barY + 8, barW * (b.val / 100), barH, 4); ctx.fill();
      barY += gap;
    });

    // Date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-yil ${now.getDate()}-iyul, Toshkent`;
    ctx.font = '500 11px \'Plus Jakarta Sans\', sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(dateStr, rx, H - 36);

    // Branding bottom right
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '600 11px \'Plus Jakarta Sans\', sans-serif';
    ctx.fillText('edugrade360.uz', W - 36, H - 36);
    ctx.textAlign = 'left';
  }
};
