/* ==========================================================================
   EduGrade 360 - Examiner View Component (Exam Room, Key Display, Step Controls, Part 1 Written Review & Part 2 Oral Call-out)
   ========================================================================== */

window.ExaminerView = {
  activeExaminerId: 'ex1',
  activeExamId: null,
  activeStudentId: null,
  activeGraderTab: 'written', // 'written' | 'technical'
  activeTab: 'active',
  speakingSessionData: {},

  render(container) {
    const examiners = window.store.getUsersByRole('examiner');
    const exams = window.store.getExams();
    const assignedExams = exams.filter(e => e.examinerId === this.activeExaminerId);
    const activeExams = assignedExams.filter(e => e.status !== 'completed');
    const historyExams = assignedExams.filter(e => e.status === 'completed');
    const selectedExam = this.activeExamId ? window.store.getExamById(this.activeExamId) : null;

    container.innerHTML = `
      <div class="examiner-wrapper">
        ${selectedExam ? this.renderActiveExamRoom(selectedExam) : this.renderAssignedExamsList(activeExams, historyExams)}
      </div>
    `;

    this.bindEvents(container);
  },

  renderAssignedExamsList(activeExams, historyExams) {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
          <h3 class="card-title">
            ${window.Icons.get('alert', 18, 'icon-title')} Sizga Biriktirilgan Imtihon Xonalari
          </h3>
          <div style="display: flex; gap: 0.5rem;">
            <button id="tabExamsActiveBtn" class="btn ${this.activeTab === 'active' ? 'btn-primary' : 'btn-secondary'} btn-sm">Faol (${activeExams.length})</button>
            <button id="tabExamsHistoryBtn" class="btn ${this.activeTab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm">Tarix (${historyExams.length})</button>
          </div>
        </div>

        ${this.activeTab === 'active' ? `
          ${activeExams.length === 0 ? `
            <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.3;">${window.Icons.get('clipboard', 52)}</div>
              <p style="font-weight: 700; color: var(--text-main);">No exam rooms assigned yet.</p>
              <p style="font-size: 0.83rem; margin-top: 0.4rem;">The Admin will appoint you as Examiner when creating a session. Your rooms appear here instantly.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${activeExams.map(e => {
                const track    = window.store.getTrackById(e.trackId);
                const teachers = window.store.getUsersByRole('teacher');
                const teacher  = teachers.find(t => t.id === e.teacherId);
                return `
                  <div style="background: linear-gradient(145deg, rgba(18,26,44,0.9), rgba(6,182,212,0.06)); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 1.25rem;">

                    <!-- Title + status -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.9rem;">
                      <div>
                        <h4 style="font-family:var(--font-heading); font-size:1.1rem; font-weight:800; color:var(--text-main);">${e.title}</h4>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
                          <strong>${e.groupName}</strong> &nbsp;·&nbsp; ${track ? track.title : e.trackId}
                        </div>
                      </div>
                      ${this.renderStatusBadge(e.status)}
                    </div>

                    <!-- Unique Key -->
                    <div style="background:rgba(0,0,0,0.3); border:1px dashed var(--accent-cyan); padding:0.65rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.9rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                      <div>
                        <span style="font-size:0.68rem; color:var(--text-muted); display:block; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;">Yagona Imtihon Kaliti — Talabalarga Bering</span>
                        <strong style="font-family:var(--font-mono); font-size:1.4rem; color:var(--accent-cyan);">${e.uniqueKey}</strong>
                      </div>
                      <div style="display:flex; gap:0.5rem; align-items:center;">
                        <button class="btn btn-ghost btn-sm show-big-key-card-btn" data-exam-id="${e.id}" style="color:var(--accent-cyan); font-weight:700; display:flex; align-items:center; gap:0.3rem;">
                          ${window.Icons.get('refresh', 13)} Show Code (Fullscreen)
                        </button>
                        <button class="btn btn-ghost btn-sm copy-key-btn" data-key="${e.uniqueKey}" style="display:flex; align-items:center; gap:0.4rem; color:var(--accent-cyan);">
                          ${window.Icons.get('copy', 14)} Nusxa Olish
                        </button>
                      </div>
                    </div>

                    <!-- Quick Phase Actions Bar -->
                    <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); padding:0.65rem 1rem; border-radius:var(--radius-sm); margin-bottom:0.9rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.6rem;">
                      <div style="font-size:0.8rem; color:var(--text-muted);">
                        <strong>Bosqich:</strong> <span style="color:var(--accent-cyan); font-weight:700;">${e.status.replace('_',' ').toUpperCase()}</span>
                      </div>
                      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                        ${e.status === 'created' ? `
                          <button class="btn btn-primary btn-sm quick-open-room-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.35rem;">
                            ${window.Icons.get('users', 14)} Open Room & Display Key
                          </button>
                        ` : ''}
                        ${e.status === 'room_open' ? `
                          <button class="btn btn-success btn-sm quick-start-step1-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.35rem;">
                            ${window.Icons.get('quiz', 14)} Start Step 1: Quiz
                          </button>
                        ` : ''}
                        ${e.status === 'step1_active' ? `
                          <button class="btn btn-amber btn-sm quick-proceed-step2-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.35rem;">
                            ${window.Icons.get('mic', 14)} Proceed to Step 2: Oral
                          </button>
                        ` : ''}
                        ${e.status === 'step2_active' ? `
                          <button class="btn btn-success btn-sm quick-finish-exam-btn" data-exam-id="${e.id}" style="display:flex; align-items:center; gap:0.35rem;">
                            ${window.Icons.get('trophy', 14)} Complete Exam
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Counterpart: Teacher grading Part 3 -->
                    <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-sm); padding:0.6rem 0.85rem; margin-bottom:0.9rem; display:flex; align-items:center; gap:0.6rem; font-size:0.82rem;">
                      ${window.Icons.get('teacher', 14)}
                      <span style="color:var(--text-muted);">Loyihani baholovchi o'qituvchi:</span>
                      <strong style="color:var(--accent-emerald);">${teacher ? teacher.name : '—'}</strong>
                      <span style="font-size:0.72rem; color:var(--text-subtle); margin-left:auto;">${window.Icons.get('users', 12)} ${e.joinedStudents.length} ta talaba kirdi</span>
                    </div>

                    <div style="display:flex; gap:0.5rem; width:100%;">
                      <button class="btn btn-primary open-room-btn" data-exam-id="${e.id}" style="flex:1; gap:0.5rem; display:flex; align-items:center; justify-content:center;">
                        ${window.Icons.get('door', 16)} Imtihon Xonasiga Kirish va Boshqarish
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
        ` : `
          ${historyExams.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 1rem; opacity: 0.4;">${window.Icons.get('trophy', 48)}</div>
              <p>No completed exams in your examiner history yet.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${historyExams.map(e => {
                const track = window.store.getTrackById(e.trackId);
                return `
                  <div style="background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                      <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--accent-emerald); display: flex; align-items: center; gap: 0.5rem;">
                        ${window.Icons.get('trophy', 16)} ${e.title} (${e.groupName})
                      </h4>
                      <span class="badge badge-success">Completed</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">
                      Key: <code>${e.uniqueKey}</code> | Track: <strong>${track ? track.title : e.trackId}</strong> | Candidates: <strong>${e.joinedStudents.length}</strong>
                    </p>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        `}
      </div>
    `;
  },

  renderActiveExamRoom(exam) {
    const track = window.store.getTrackById(exam.trackId);
    const teachers = window.store.getUsersByRole('teacher');
    const teacher = teachers.find(t => t.id === exam.teacherId);

    const phaseLabel = {
      'created': 'Waiting — Key Generated',
      'room_open': 'Room Open — Students Joining',
      'step1_active': 'Step 1 Active — Quiz &amp; Teacher Project Access',
      'step2_active': 'Step 2 Active — Technical Oral Questions &amp; Manual Grading',
      'completed': 'Exam Completed &amp; Archived'
    }[exam.status] || exam.status;

    return `
      <div style="margin-bottom: 1rem;">
        <button id="exitRoomBtn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 0.4rem;">
          ${window.Icons.get('exit', 15)} Back to Examiner Dashboard
        </button>
      </div>

      <!-- Exam Room Banner -->
      <div class="card" style="margin-bottom: 1.5rem; border-color: var(--accent-cyan); background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(6, 182, 212, 0.1));">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
              <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800;">
                ${exam.title}
              </h2>
              ${this.renderStatusBadge(exam.status)}
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted);">
              Group: <strong>${exam.groupName}</strong> &nbsp;|&nbsp; Track: <strong>${track ? track.title : exam.trackId}</strong> &nbsp;|&nbsp; Teacher: <strong>${teacher ? teacher.name : exam.teacherId}</strong>
            </p>
          </div>

          <div style="text-align: right; background: rgba(0,0,0,0.4); padding: 0.8rem 1.5rem; border-radius: var(--radius-md); border: 2px solid var(--accent-cyan);">
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.2rem;">Unique Exam Key — Show Students</div>
            <div style="font-family: var(--font-mono); font-size: 2.2rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 2px;">
              ${exam.uniqueKey}
            </div>
            <button id="showBigKeyBtn" class="btn btn-ghost btn-sm" style="color: var(--accent-cyan); font-size: 0.75rem; margin-top: 0.3rem; display: inline-flex; align-items: center; gap: 0.3rem;">
              ${window.Icons.get('refresh', 13)} Show Fullscreen Key
            </button>
          </div>
        </div>

        <!-- Phase Controls & 12h Window Indicator -->
        <div style="margin-top: 1.5rem; background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Current Phase:</span>
              <span style="font-size: 0.95rem; color: var(--accent-cyan); font-weight: 700;">${phaseLabel}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--accent-amber); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-mono); font-weight: 700;">
              ${window.Icons.get('clock', 13)} ⏱️ 12-Hour Evaluation Deadline: <span id="examinerWindowCountdown">11h 59m 59s</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center;">
            ${exam.status === 'created' ? `
              <button id="openRoomStepBtn" class="btn btn-primary btn-lg" style="display: flex; align-items: center; gap: 0.5rem;">
                ${window.Icons.get('users', 16)} Open Room &amp; Display Key to Students
              </button>
            ` : ''}

            ${exam.status === 'room_open' ? `
              <button id="startStep1Btn" class="btn btn-success btn-lg" style="display: flex; align-items: center; gap: 0.5rem;">
                ${window.Icons.get('quiz', 16)} Start Step 1: Quiz &amp; Teacher Project Access
              </button>
            ` : ''}

            ${exam.status === 'step1_active' ? `
              <button id="proceedStep2Btn" class="btn btn-amber btn-lg" style="display: flex; align-items: center; gap: 0.5rem;">
                ${window.Icons.get('mic', 16)} Proceed to Step 2: Technical Oral Questions
              </button>
            ` : ''}

            ${exam.status === 'step2_active' ? `
              <button id="finishExamBtn" class="btn btn-success btn-lg" style="display: flex; align-items: center; gap: 0.5rem;">
                ${window.Icons.get('trophy', 16)} Complete Exam &amp; Archive to History
              </button>
            ` : ''}

            ${exam.status !== 'created' ? `
              <div style="display:flex; gap:0.5rem; margin-left:auto;">
                <button id="downloadExamResultsBtn" class="btn btn-secondary btn-sm" data-exam-id="${exam.id}"
                  style="display:flex; align-items:center; gap:0.4rem; border-color:var(--accent-emerald); color:var(--accent-emerald);">
                  ${window.Icons.get('clipboard', 14)} Download Results (.csv)
                </button>
                ${exam.status !== 'completed' ? `
                  <button id="endExamNowBtn" class="btn btn-danger btn-sm" data-exam-id="${exam.id}"
                    style="display:flex; align-items:center; gap:0.4rem;">
                    ${window.Icons.get('exit', 14)} End Exam Now
                  </button>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Live Proctoring Violation Feed -->
          <div style="background: rgba(239, 68, 68, 0.06); border: 1px dashed rgba(239, 68, 68, 0.3); padding: 0.85rem 1.1rem; border-radius: var(--radius-md); margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="font-size: 0.82rem; color: var(--accent-rose); font-family: var(--font-heading); display: flex; align-items: center; gap: 0.4rem;">
                🛡️ Live Anti-Cheat Violation Feed (${(exam.securityAlerts || []).length} Alerts Recorded)
              </strong>
            </div>
            ${(exam.securityAlerts || []).length === 0 ? `
              <div style="font-size: 0.78rem; color: var(--text-muted);">No proctoring violations recorded for this exam room yet.</div>
            ` : `
              <div style="max-height: 110px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.35rem; padding-right: 0.2rem;">
                ${exam.securityAlerts.map(a => `
                  <div style="font-size: 0.78rem; color: var(--text-main); background: rgba(0,0,0,0.35); padding: 0.4rem 0.75rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <span><strong style="color: var(--accent-rose);">${a.studentName}:</strong> ${a.reason}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
        </div>
      </div>

      <!-- Main Room Grid -->
      <div class="grid-2" style="margin-bottom: 2rem;">
        <!-- Joined Students Roster -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${window.Icons.get('users', 18, 'icon-title')} Joined Students Roster</h3>
            <span class="badge badge-info">${exam.joinedStudents.length} in Room</span>
          </div>

          ${exam.joinedStudents.length === 0 ? `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 0.75rem; opacity: 0.4;">${window.Icons.get('users', 40)}</div>
              <p>Waiting for students to join using key <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${exam.uniqueKey}</strong></p>
              <p style="font-size: 0.8rem; margin-top: 0.4rem;">Students enter their name and key in the <strong>Student Portal</strong>.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${exam.joinedStudents.map((std, idx) => {
                const isSelected = this.activeStudentId === std.id;
                const hasWritten = !!std.l1Answers;
                const isDisqualified = !!std.l1Answers?.disqualified;
                const writtenGraded = std.l1Grade?.manuallyGradedByExaminer;
                const hasTechGrade = !!std.l2TechnicalGrade;

                return `
                  <div style="background: rgba(0,0,0,0.3); border: 1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'}; padding: 0.85rem 1rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.6rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <strong style="font-size: 0.95rem; color: var(--text-main);">${idx + 1}. ${std.name}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">
                          Joined: ${new Date(std.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem;">
                        ${hasWritten ? `
                          <span class="badge ${isDisqualified ? 'badge-danger' : (writtenGraded ? 'badge-success' : 'badge-warning')}" style="font-size: 0.72rem;">
                            ${isDisqualified ? 'Part 1 Disqualified (0%)' : (writtenGraded ? `Part 1 Written Graded (${std.l1Grade.writtenScorePct}%)` : 'Part 1 Written Pending Review')}
                          </span>
                        ` : ''}
                        ${hasTechGrade ? `
                          <span class="badge badge-success" style="font-size: 0.72rem;">
                            Part 2 Oral Graded (${std.l2TechnicalGrade.speakingScorePct}%)
                          </span>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Action buttons per student -->
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
                      ${hasWritten ? `
                        <button class="btn btn-secondary btn-sm select-written-btn" data-std-id="${std.id}" style="font-size: 0.78rem; gap: 0.3rem;">
                          ${window.Icons.get('quiz', 13)} ${writtenGraded ? 'Edit Written Grade' : 'Review Part 1 Written'}
                        </button>
                      ` : ''}
                      <button class="btn ${hasTechGrade ? 'btn-secondary' : 'btn-primary'} btn-sm select-student-btn" data-std-id="${std.id}" style="font-size: 0.78rem; gap: 0.3rem;">
                        ${window.Icons.get('mic', 13)} ${hasTechGrade ? 'Edit Part 2 Oral' : 'Grade Part 2 Technical'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Right Side: Grader Console (Part 1 Written vs Part 2 Technical) -->
        <div class="card">
          <div class="card-header" style="padding-bottom: 0.5rem;">
            <div style="display: flex; gap: 0.5rem;">
              <button id="graderTabWrittenBtn" class="btn ${this.activeGraderTab === 'written' ? 'btn-primary' : 'btn-secondary'} btn-sm" style="font-size: 0.8rem; gap: 0.4rem;">
                ${window.Icons.get('quiz', 14)} Part 1: Written Review
              </button>
              <button id="graderTabTechBtn" class="btn ${this.activeGraderTab === 'technical' ? 'btn-primary' : 'btn-secondary'} btn-sm" style="font-size: 0.8rem; gap: 0.4rem;">
                ${window.Icons.get('mic', 14)} Part 2: Technical Oral
              </button>
            </div>
            <span class="badge badge-warning" style="font-size: 0.72rem;">Examiner Grader</span>
          </div>

          ${this.activeStudentId ? (
            this.activeGraderTab === 'written'
              ? this.renderStudentWrittenGrader(exam, track)
              : this.renderStudentTechnicalGrader(exam, track)
          ) : `
            <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 0.75rem; opacity: 0.35;">${window.Icons.get('users', 44)}</div>
              <p style="font-weight: 700; color: var(--text-main);">Select a Candidate from Roster</p>
              <p style="font-size: 0.85rem; margin-top: 0.3rem;">Choose a candidate above to review Part 1 written responses or grade Part 2 technical oral defense.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  /* ── Part 1 Written Response Grader ── */
  renderStudentWrittenGrader(exam, track) {
    const student = exam.joinedStudents.find(s => s.id === this.activeStudentId);
    if (!student) return '';

    const answers = student.l1Answers ? student.l1Answers.writtenAnswers || {} : {};
    const assignedQuestions = window.store.getStudentAssignedQuiz(exam.id, student.id);
    const existingScores = student.l1Grade?.questionScores || {};
    const existingReviews = student.l1Grade?.questionReviews || {};

    let initialSum = 0;
    assignedQuestions.forEach(q => {
      const saved = existingScores[q.id];
      const hasAns = !!answers[q.id];
      initialSum += (saved !== undefined ? Number(saved) : (hasAns ? 5 : 0));
    });
    const maxPts = assignedQuestions.length * 5;
    const initialPct = maxPts > 0 ? Math.round((initialSum / maxPts) * 100) : 0;
    const currentWrittenScore = student.l1Grade?.writtenScorePct ?? initialPct;

    const isDisqualified = !!student.l1Answers?.disqualified;
    const isGraded = !!student.l1Grade?.manuallyGradedByExaminer;

    return `
      <div style="background: rgba(6, 182, 212, 0.06); border: 1px solid var(--accent-cyan); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="color: var(--accent-cyan); font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            ${window.Icons.get('student', 16)} ${student.name} — Part 1 Per-Question Grader (${assignedQuestions.length} Questions)
          </h4>
          <span class="badge ${isDisqualified ? 'badge-danger' : (isGraded ? 'badge-success' : 'badge-warning')}">
            ${isDisqualified ? 'Disqualified (0%)' : (isGraded ? `Graded (${student.l1Grade.writtenScorePct}%)` : 'Pending Examiner Review')}
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
          Grade each written question individually (0–5 pts) and provide feedback remarks for each question.
        </p>
      </div>

      ${isDisqualified ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4); padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <strong style="color: var(--accent-rose); font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
            🛡️ Candidate Disqualified during Part 1 Quiz
          </strong>
          <div style="font-size: 0.82rem; color: var(--text-main); margin-top: 0.35rem;">
            <strong>Reason:</strong> ${window.escapeHTML(student.l1Answers.violation?.reason || 'Proctoring security violation detected.')}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">
            Part 1 score is locked to 0%. You can still review their submitted answers below for audit purposes.
          </div>
        </div>
      ` : ''}

      ${!student.l1Answers ? `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: center; margin-bottom: 0.75rem; opacity: 0.35;">${window.Icons.get('alert', 36)}</div>
          <p>Candidate has not submitted Part 1 quiz answers yet.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; flex-wrap: nowrap; gap: 1.1rem; max-height: 480px; overflow-y: auto; overflow-x: hidden; padding-right: 0.3rem; margin-bottom: 1.25rem;">
          ${assignedQuestions.map((q, idx) => {
            const ansText = answers[q.id] || '(No answer provided)';
            const savedScore = existingScores[q.id];
            const qScore = savedScore !== undefined ? Number(savedScore) : (answers[q.id] ? 5 : 0);
            const reviewVal = existingReviews[q.id] || '';

            return `
              <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-sm); flex-shrink: 0; width: 100%; box-sizing: border-box;">
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem;">
                  Q${idx + 1}. ${window.escapeHTML(q.prompt || q.question)}
                </div>
                ${q.hint ? `<div style="font-size:0.76rem; color:var(--text-subtle); margin-bottom:0.45rem;">Hint: ${window.escapeHTML(q.hint)}</div>` : ''}
                <div style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--accent-cyan); padding: 0.75rem 0.9rem; border-radius: 4px; font-size: 0.85rem; color: var(--text-main); line-height: 1.5; white-space: pre-wrap; margin-bottom: 0.75rem;">
                  <strong style="font-size:0.72rem; color:var(--text-muted); display:block; text-transform:uppercase; margin-bottom:0.25rem;">Student Answer:</strong>
                  ${ansText}
                </div>

                <div style="display: grid; grid-template-columns: 220px 1fr; gap: 1rem; align-items: end; background: rgba(6,182,212,0.04); padding: 0.75rem 0.9rem; border-radius: var(--radius-md); border: 1px solid rgba(6,182,212,0.18);">
                  <div>
                    <label class="form-label" style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700; margin-bottom:0.35rem; display:block;">Question Grade (0–5 pts):</label>
                    <div class="score-control">
                      <input type="range" class="score-slider part1-q-score-slider" data-q-id="${q.id}" min="0" max="5" value="${qScore}">
                      <span class="score-val" id="part1_q_disp_${q.id}">${qScore} / 5</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label" style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700; margin-bottom:0.35rem; display:block;">Question Feedback / Review:</label>
                    <input type="text" class="form-input q-review-input" data-q-id="${q.id}" placeholder="Remarks for Q${idx + 1}..." value="${reviewVal}" style="font-size:0.84rem; padding:0.5rem 0.85rem;">
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="background: rgba(6,182,212,0.08); border: 1px solid var(--accent-cyan); padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.25rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing:0.5px;">Auto-Calculated Part 1 Grade</div>
            <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--accent-cyan); margin-top:0.15rem;">
              <span id="part1TotalPctDisp">${currentWrittenScore}%</span>
              <span style="font-size:0.85rem; color:var(--text-muted); font-weight:400; margin-left:0.5rem;">(<span id="part1TotalPtsDisp">${initialSum}</span> / ${maxPts} pts)</span>
            </div>
          </div>

          <div style="flex:1; min-width:240px;">
            <label class="form-label" style="font-size: 0.78rem;">Examiner Overall Written Remarks:</label>
            <input type="text" id="examinerWrittenNotesInput" class="form-input" placeholder="Overall Part 1 evaluation summary..." value="${student.l1Grade?.examinerWrittenNotes || ''}">
          </div>
        </div>

        <button id="saveStudentWrittenGradeBtn" class="btn btn-success btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          ${window.Icons.get('check', 16)} Save All Part 1 Question Grades &amp; Reviews for ${student.name}
        </button>
      `}
    `;
  },

  /* ── Part 2 Technical Oral Grader ── */
  renderStudentTechnicalGrader(exam, track) {
    const student = exam.joinedStudents.find(s => s.id === this.activeStudentId);
    if (!student) return '';

    const questions = window.store.getStudentOralQuestions(exam.id, student.id);

    return `
      <div style="background: rgba(6, 182, 212, 0.06); border: 1px solid var(--accent-cyan); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h4 style="color: var(--accent-cyan); font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              ${window.Icons.get('student', 16)} Nomzod: ${student.name} — 2-Bosqich Og'zaki Texnik Imtihon
            </h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
              Talabaning og'zaki javobini baholang. Mavjud savollar: ${questions.length} ta (5 ta standart + qo'shimcha).
            </p>
          </div>
          <button id="addExtraOralQuestionModalBtn" class="btn btn-outline-cyan btn-sm" style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.88rem; padding: 0.4rem 0.85rem;">
            ${window.Icons.get('plus', 14)} + Qo'shimcha Savol Qo'shish
          </button>
        </div>
      </div>

      <!-- WebRTC Audio Recorder Control -->
      <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); padding: 0.85rem 1.1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-main); font-weight: 700;">
          <span>🎙️ Og'zaki Savol-Javob Audio Yozuvchisi:</span>
          <span id="audioRecStatus" class="badge badge-secondary" style="font-size: 0.7rem;">Kutilmoqda</span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button id="startAudioRecBtn" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; color: var(--accent-rose); border-color: rgba(239,68,68,0.4); display: flex; align-items: center; gap: 0.35rem;">
            🔴 Ovoz Yozishni Boshlash
          </button>
          <button id="stopAudioRecBtn" class="btn btn-secondary btn-sm" disabled style="font-size: 0.78rem; display: flex; align-items: center; gap: 0.35rem;">
            ⏹️ To'xtatish
          </button>
          <audio id="audioPlayback" controls style="height: 32px; display: none; border-radius: 4px;"></audio>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; flex-wrap: nowrap; gap: 1rem; max-height: 380px; overflow-y: auto; overflow-x: hidden; padding-right: 0.4rem; margin-bottom: 1.25rem;">
        ${questions.map((q, idx) => {
          const scoreData = this.speakingSessionData[q.id] || { score: 8, notes: '' };
          const isAsked = Object.prototype.hasOwnProperty.call(this.speakingSessionData, q.id);

          return `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid ${isAsked ? 'var(--accent-emerald)' : 'var(--border-color)'}; padding: 0.9rem; border-radius: var(--radius-sm); flex-shrink: 0; width: 100%; box-sizing: border-box;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div style="font-size: 0.88rem; font-weight: 700; flex: 1; padding-right: 0.5rem;">Q${idx + 1}: ${q.question || q.prompt}</div>
                <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; color: ${isAsked ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                  <input type="checkbox" class="toggle-tech-q" data-q-id="${q.id}" ${isAsked ? 'checked' : ''}> Ask
                </label>
              </div>

              ${isAsked ? `
                <div class="grid-2" style="margin-top: 0.6rem; align-items: center;">
                  <div>
                    <label class="form-label" style="font-size: 0.75rem;">Score (0–10):</label>
                    <div class="score-control">
                      <input type="range" class="score-slider tech-q-slider" data-q-id="${q.id}" min="0" max="10" value="${scoreData.score}">
                      <span class="score-val" id="tech_disp_${q.id}">${scoreData.score} / 10</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 0.75rem;">Notes:</label>
                    <input type="text" class="form-input tech-q-notes" data-q-id="${q.id}" placeholder="Remarks..." value="${scoreData.notes}">
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">Overall Technical Remarks for ${student.name}</label>
        <input type="text" id="techOverallNotes" class="form-input" placeholder="Overall remarks..." value="${student.l2TechnicalGrade?.examinerNotes || ''}">
      </div>

      <button id="saveStudentTechGradeBtn" class="btn btn-success btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
        ${window.Icons.get('check', 16)} Save Part 2 Technical Score for ${student.name}
      </button>
    `;
  },

  renderStatusBadge(status) {
    switch (status) {
      case 'created': return '<span class="badge badge-warning">Key Generated</span>';
      case 'room_open': return '<span class="badge badge-info">Room Open</span>';
      case 'step1_active': return '<span class="badge badge-warning">Step 1 Active</span>';
      case 'step2_active': return '<span class="badge badge-info">Step 2 Active</span>';
      case 'completed': return '<span class="badge badge-success">Completed</span>';
      default: return `<span class="badge badge-info">${status}</span>`;
    }
  },

  confirmPendingPart1Grading(examId) {
    const exam = window.store.getExamById(examId);
    if (!exam) return true;
    const pendingList = (exam.joinedStudents || []).filter(s => s.l1Answers && !s.l1Answers.disqualified && !s.l1Grade?.manuallyGradedByExaminer);
    if (pendingList.length > 0) {
      const names = pendingList.map(s => s.name).join(', ');
      return confirm(`⚠️ OGOHLANTIRISH: ${pendingList.length} ta talaba 1-bosqich yozma imtihonni topshirgan, lekin baholanmagan (${names}). Baribir imtihonni yakunlamoqchimisiz?`);
    }
    return true;
  },

  startExaminerCountdown(container, exam) {
    if (this.examinerTimerInterval) clearInterval(this.examinerTimerInterval);
    const span = container.querySelector('#examinerWindowCountdown');
    if (!span) return;

    const windowMs = 12 * 60 * 60 * 1000; // 12 hours
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
    this.examinerTimerInterval = setInterval(update, 1000);
  },

  bindEvents(container) {
    if (this.activeExamId) {
      const exam = window.store.getExamById(this.activeExamId);
      if (exam) this.startExaminerCountdown(container, exam);
    }
    container.querySelectorAll('.copy-key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.dataset.key;
        navigator.clipboard.writeText(key).catch(() => {});
        window.toast(`Key ${key} copied to clipboard`, 'info');
      });
    });

    container.querySelectorAll('.open-room-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeExamId = btn.dataset.examId;
        this.render(container);
      });
    });

    const exitBtn = container.querySelector('#exitRoomBtn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.activeExamId = null;
        this.activeStudentId = null;
        this.render(container);
      });
    }

    const tabActiveBtn = container.querySelector('#tabExamsActiveBtn');
    const tabHistoryBtn = container.querySelector('#tabExamsHistoryBtn');
    if (tabActiveBtn && tabHistoryBtn) {
      tabActiveBtn.addEventListener('click', () => { this.activeTab = 'active'; this.render(container); });
      tabHistoryBtn.addEventListener('click', () => { this.activeTab = 'history'; this.render(container); });
    }

    container.querySelectorAll('.show-big-key-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const exam = window.store.getExamById(btn.dataset.examId);
        if (exam) this.showFullscreenKeyModal(exam);
      });
    });

    container.querySelectorAll('.quick-open-room-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        window.store.updateExamStatus(examId, 'room_open');
        window.toast('Exam Room opened! Students can now join using the unique key.', 'success');
        this.render(container);
      });
    });

    container.querySelectorAll('.quick-start-step1-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        window.store.updateExamStatus(examId, 'step1_active');
        window.toast('Step 1 started! Student quiz and project access are active.', 'success');
        this.render(container);
      });
    });

    container.querySelectorAll('.quick-proceed-step2-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        window.store.updateExamStatus(examId, 'step2_active');
        window.toast('Step 2 active! Technical oral defense started.', 'info');
        this.render(container);
      });
    });

    container.querySelectorAll('.quick-finish-exam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        if (!this.confirmPendingPart1Grading(examId)) return;
        window.store.updateExamStatus(examId, 'completed');
        window.toast('Exam session completed!', 'success');
        this.render(container);
      });
    });

    const openRoomStepBtn = container.querySelector('#openRoomStepBtn');
    if (openRoomStepBtn) {
      openRoomStepBtn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'room_open');
        window.toast('Exam Room opened! Students can now join using the unique key.', 'success');
        this.render(container);
      });
    }

    const startStep1Btn = container.querySelector('#startStep1Btn');
    if (startStep1Btn) {
      startStep1Btn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'step1_active');
        window.toast('Step 1 started! Student quiz and teacher project access are now active.', 'success');
        this.render(container);
      });
    }

    const proceedStep2Btn = container.querySelector('#proceedStep2Btn');
    if (proceedStep2Btn) {
      proceedStep2Btn.addEventListener('click', () => {
        window.store.updateExamStatus(this.activeExamId, 'step2_active');
        window.toast('Step 2 active! Call out student names to grade technical oral defense.', 'info');
        this.render(container);
      });
    }

    const finishExamBtn = container.querySelector('#finishExamBtn');
    if (finishExamBtn) {
      finishExamBtn.addEventListener('click', () => {
        if (!this.confirmPendingPart1Grading(this.activeExamId)) return;
        window.store.updateExamStatus(this.activeExamId, 'completed');
        window.toast('Exam session completed and archived!', 'success');
        this.activeExamId = null;
        this.render(container);
      });
    }

    const endExamNowBtn = container.querySelector('#endExamNowBtn');
    if (endExamNowBtn) {
      endExamNowBtn.addEventListener('click', () => {
        const examId = endExamNowBtn.dataset.examId;
        if (!this.confirmPendingPart1Grading(examId)) return;
        const res = window.store.endExam(examId);
        if (res.success) {
          window.toast(res.message, 'success');
          this.activeExamId = null;
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    }

    container.querySelectorAll('.end-exam-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        if (!this.confirmPendingPart1Grading(examId)) return;
        const res = window.store.endExam(examId);
        if (res.success) {
          window.toast(res.message, 'success');
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    });

    const downloadResultsBtn = container.querySelector('#downloadExamResultsBtn');
    if (downloadResultsBtn) {
      downloadResultsBtn.addEventListener('click', () => {
        const examId = downloadResultsBtn.dataset.examId;
        const exam   = window.store.getExamById(examId);
        if (!exam) return;
        const csv = window.store.exportExamResultsCSV(examId);
        if (!csv) { window.toast('No data to export.', 'warning'); return; }
        const safeName = exam.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const date     = new Date().toISOString().split('T')[0];
        window.downloadCSV(csv, `EduGrade360_${safeName}_${date}.csv`);
        window.toast('Results downloaded as CSV (open in Excel).', 'success');
      });
    }

    const showBigKeyBtn = container.querySelector('#showBigKeyBtn');
    if (showBigKeyBtn) {
      showBigKeyBtn.addEventListener('click', () => {
        const exam = window.store.getExamById(this.activeExamId);
        this.showFullscreenKeyModal(exam);
      });
    }

    // Grader tab toggles
    const writtenTabBtn = container.querySelector('#graderTabWrittenBtn');
    const techTabBtn = container.querySelector('#graderTabTechBtn');
    if (writtenTabBtn && techTabBtn) {
      writtenTabBtn.addEventListener('click', () => {
        this.activeGraderTab = 'written';
        this.render(container);
      });
      techTabBtn.addEventListener('click', () => {
        this.activeGraderTab = 'technical';
        this.render(container);
      });
    }

    // Student selection for Part 1 Written Review
    container.querySelectorAll('.select-written-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStudentId = btn.dataset.stdId;
        this.activeGraderTab = 'written';
        this.render(container);
      });
    });

    // Student selection for Part 2 Technical Oral Defense
    container.querySelectorAll('.select-student-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStudentId = btn.dataset.stdId;
        this.activeGraderTab = 'technical';
        const exam = window.store.getExamById(this.activeExamId);
        const oralQs = window.store.getStudentOralQuestions(exam.id, this.activeStudentId);
        this.speakingSessionData = {};
        oralQs.forEach(q => {
          this.speakingSessionData[q.id] = { score: 8, notes: '' };
        });
        this.render(container);
      });
    });

    // Add Extra Oral Question button
    const addExtraQBtn = container.querySelector('#addExtraOralQuestionModalBtn');
    if (addExtraQBtn) {
      addExtraQBtn.addEventListener('click', () => {
        const exam = window.store.getExamById(this.activeExamId);
        const student = exam.joinedStudents.find(s => s.id === this.activeStudentId);
        if (exam && student) {
          this.showAddExtraOralQuestionModal(container, exam, student);
        }
      });
    }

    // Audio Recorder Handler
    const startAudioBtn = container.querySelector('#startAudioRecBtn');
    const stopAudioBtn = container.querySelector('#stopAudioRecBtn');
    const audioPlayback = container.querySelector('#audioPlayback');
    const audioRecStatus = container.querySelector('#audioRecStatus');

    if (startAudioBtn && stopAudioBtn) {
      startAudioBtn.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this._mediaRecorder = new MediaRecorder(stream);
          this._audioChunks = [];

          this._mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this._audioChunks.push(e.data);
          };

          this._mediaRecorder.onstop = () => {
            const blob = new Blob(this._audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(blob);
            if (audioPlayback) {
              audioPlayback.src = audioUrl;
              audioPlayback.style.display = 'inline-block';
            }
            if (audioRecStatus) {
              audioRecStatus.textContent = 'Recording Complete';
              audioRecStatus.className = 'badge badge-success';
            }
            stream.getTracks().forEach(track => track.stop());
          };

          this._mediaRecorder.start();
          startAudioBtn.disabled = true;
          stopAudioBtn.disabled = false;
          if (audioRecStatus) {
            audioRecStatus.textContent = '🔴 Recording...';
            audioRecStatus.className = 'badge badge-danger';
          }
          window.toast('Microphone recording started.', 'info');
        } catch (err) {
          window.toast('Microphone permission denied or unsupported.', 'warning');
        }
      });

      stopAudioBtn.addEventListener('click', () => {
        if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
          this._mediaRecorder.stop();
          startAudioBtn.disabled = false;
          stopAudioBtn.disabled = true;
          window.toast('Audio recording finished.', 'success');
        }
      });
    }

    // Part 1 per-question score slider live calculation
    container.querySelectorAll('.part1-q-score-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const qId = e.target.dataset.qId;
        const val = Number(e.target.value);
        const disp = container.querySelector(`#part1_q_disp_${qId}`);
        if (disp) disp.textContent = `${val} / 5`;

        let sum = 0;
        const allSliders = container.querySelectorAll('.part1-q-score-slider');
        allSliders.forEach(s => { sum += Number(s.value); });
        const maxPts = allSliders.length * 5;
        const totalPct = maxPts > 0 ? Math.round((sum / maxPts) * 100) : 0;

        const pctDisp = container.querySelector('#part1TotalPctDisp');
        const ptsDisp = container.querySelector('#part1TotalPtsDisp');
        if (pctDisp) pctDisp.textContent = `${totalPct}%`;
        if (ptsDisp) ptsDisp.textContent = `${sum}`;
      });
    });

    // Save Part 1 Written Grade
    const saveWrittenBtn = container.querySelector('#saveStudentWrittenGradeBtn');
    if (saveWrittenBtn) {
      saveWrittenBtn.addEventListener('click', () => {
        const exam = window.store.getExamById(this.activeExamId);
        const student = exam.joinedStudents.find(s => s.id === this.activeStudentId);

        const questionScores = {};
        let sum = 0;
        const sliders = container.querySelectorAll('.part1-q-score-slider');
        sliders.forEach(s => {
          const qId = s.dataset.qId;
          const val = Number(s.value);
          questionScores[qId] = val;
          sum += val;
        });

        const maxPts = sliders.length * 5;
        const writtenScorePct = maxPts > 0 ? Math.round((sum / maxPts) * 100) : 0;

        const questionReviews = {};
        container.querySelectorAll('.q-review-input').forEach(inp => {
          const qId = inp.dataset.qId;
          const val = inp.value.trim();
          if (val) questionReviews[qId] = val;
        });

        const notesVal = container.querySelector('#examinerWrittenNotesInput')?.value || '';

        window.store.saveExaminerPart1Grade(exam.id, this.activeStudentId, {
          writtenScorePct,
          examinerWrittenNotes: notesVal,
          questionScores,
          questionReviews
        });

        window.toast(`Part 1 grades (${writtenScorePct}%) & reviews saved for ${student.name}!`, 'success');
        this.render(container);
      });
    }

    // Technical question toggles and sliders
    container.querySelectorAll('.toggle-tech-q').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const qId = e.target.dataset.qId;
        if (e.target.checked) {
          this.speakingSessionData[qId] = { score: 8, notes: '' };
        } else {
          delete this.speakingSessionData[qId];
        }
        this.render(container);
      });
    });

    container.querySelectorAll('.tech-q-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const qId = e.target.dataset.qId;
        const val = e.target.value;
        const disp = container.querySelector(`#tech_disp_${qId}`);
        if (disp) disp.textContent = `${val} / 10`;
        if (this.speakingSessionData[qId]) {
          this.speakingSessionData[qId].score = Number(val);
        }
      });
    });

    container.querySelectorAll('.tech-q-notes').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const qId = e.target.dataset.qId;
        if (this.speakingSessionData[qId]) {
          this.speakingSessionData[qId].notes = e.target.value;
        }
      });
    });

    const saveTechBtn = container.querySelector('#saveStudentTechGradeBtn');
    if (saveTechBtn) {
      saveTechBtn.addEventListener('click', () => {
        const exam = window.store.getExamById(this.activeExamId);
        const track = window.store.getTrackById(exam.trackId);

        const questionsAsked = [];
        Object.keys(this.speakingSessionData).forEach(qId => {
          const qObj = track.level2.questions.find(q => q.id === qId);
          const scoreData = this.speakingSessionData[qId];
          questionsAsked.push({
            id: qId,
            question: qObj ? qObj.question : qId,
            score: scoreData.score,
            notes: scoreData.notes
          });
        });

        if (questionsAsked.length < 1) {
          window.toast('Please select at least one question to ask.', 'warning');
          return;
        }

        const overallNotes = container.querySelector('#techOverallNotes').value;

        window.store.saveExaminerTechnicalGrade(exam.id, this.activeStudentId, {
          questionsAsked,
          examinerNotes: overallNotes
        });

        window.toast('Part 2 Technical score saved!', 'success');
        this.render(container);
      });
    }
  },

  showFullscreenKeyModal(exam) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
          EduGrade 360 — Exam Room Access Key
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; margin: 0.5rem 0 1.5rem; color: var(--text-main);">
          ${exam.title} (${exam.groupName})
        </h2>

        <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2)); border: 3px solid var(--accent-cyan); padding: 2.5rem 1rem; border-radius: var(--radius-lg); margin-bottom: 2rem; box-shadow: 0 0 50px rgba(6, 182, 212, 0.2);">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">ENTER THIS KEY TO JOIN:</div>
          <div style="font-family: var(--font-mono); font-size: 4.5rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 8px;">
            ${exam.uniqueKey}
          </div>
        </div>

        <button class="btn btn-primary btn-lg" onclick="document.getElementById('modalOverlay').classList.add('hidden')" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          ${window.Icons.get('exit', 16)} Close Key Card
        </button>
      </div>
    `;
    document.getElementById('modalOverlay').classList.remove('hidden');
  },

  showAddExtraOralQuestionModal(container, exam, student) {
    const modalBody = document.getElementById('modalBody');
    const bankOral = window.store.getQuestionBank(exam.trackId, 'oral');
    const existing = window.store.getStudentOralQuestions(exam.id, student.id);
    const existingIds = new Set(existing.map(q => q.id));

    const remainingPool = bankOral.filter(q => !existingIds.has(q.id));

    modalBody.innerHTML = `
      <div style="padding: 0.5rem 0.5rem 1rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.6rem; background: rgba(6, 182, 212, 0.15); border-radius: 50%; color: var(--accent-cyan);">
            ${window.Icons.get('plus', 24)}
          </div>
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 0;">Add Extra Oral Question</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;">Extend evaluation for ${student.name}. Select from Question Bank or type a custom live question.</p>
          </div>
        </div>

        <form id="addExtraOralQuestionForm">
          <div class="form-group">
            <label class="form-label">Option A: Select From Question Bank (${remainingPool.length} Remaining)</label>
            <select id="modalBankOralSelect" class="form-select" style="font-size: 0.85rem;">
              <option value="">-- Choose from Question Bank --</option>
              ${remainingPool.map(q => `<option value="${q.id}">${q.question || q.prompt}</option>`).join('')}
            </select>
          </div>

          <div style="text-align: center; font-size: 0.78rem; color: var(--text-muted); margin: 0.75rem 0;">— OR TYPE CUSTOM QUESTION —</div>

          <div class="form-group">
            <label class="form-label">Option B: Type Custom Oral Question Live</label>
            <input type="text" id="modalCustomOralInput" class="form-input" placeholder="e.g. Explain how z-index creates a stacking context...">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modalOverlay').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-success" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              ${window.Icons.get('check', 16)} Add Question
            </button>
          </div>
        </form>
      </div>
    `;

    const form = modalBody.querySelector('#addExtraOralQuestionForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedId = modalBody.querySelector('#modalBankOralSelect').value;
        const customText = modalBody.querySelector('#modalCustomOralInput').value.trim();

        let questionObj = null;

        if (selectedId) {
          questionObj = remainingPool.find(q => q.id === selectedId);
        } else if (customText) {
          questionObj = {
            id: 'oq_live_' + Date.now(),
            question: customText,
            prompt: customText
          };
        }

        if (!questionObj) {
          window.toast('Please select a question from the bank or type a custom question.', 'warning');
          return;
        }

        const res = window.store.addLiveOralQuestionToExam(exam.id, student.id, questionObj);
        if (res.success) {
          this.speakingSessionData[res.question.id] = { score: 8, notes: '' };
          window.toast(res.message, 'success');
          document.getElementById('modalOverlay').classList.add('hidden');
          this.render(container);
        } else {
          window.toast(res.message, 'danger');
        }
      });
    }

    document.getElementById('modalOverlay').classList.remove('hidden');
  }
};
