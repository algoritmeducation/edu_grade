/* ==========================================================================
   EduGrade 360 – Exam Security Monitor
   Activated only during Part 1 quiz. Detects and penalises cheating attempts.
   ========================================================================== */

window.ExamSecurity = (function () {

  /* ── Internal State ──────────────────────────────────────────────── */
  let _active       = false;
  let _examId       = null;
  let _studentId    = null;
  let _warnings     = 0;        // blur/focus-loss warnings before hard fail
  const MAX_WARN    = 1;        // 1 warning, then fail
  let _overlayEl    = null;
  let _blurTimeout  = null;

  /* ── Violation catalogue ──────────────────────────────────────────── */
  const VIOLATIONS = {
    TAB_SWITCH:   { msg: 'Brauzer varag\'ini almashtirdingiz (Tab switch).', immediate: true  },
    WINDOW_BLUR:  { msg: 'Imtihon oynasidan boshqa joyga o\'tdingiz (Window blur).', immediate: false },
    COPY_ATTEMPT: { msg: 'Imtihon matnini nusxalashga harakat qildingiz (Copy).', immediate: true  },
    CUT_ATTEMPT:  { msg: 'Imtihon matnini kesib olishga harakat qildingiz (Cut).', immediate: true  },
    SCREENSHOT:   { msg: 'Skrinshot tugmasi (PrintScreen) bosildi.', immediate: true  },
    SHORTCUT:     { msg: 'Taqiqlangan klaviatura tugmalari birikmasi ishlatildi.', immediate: true  },
    BROWSER_CLOSE:{ msg: 'Imtihon brauzerini yopishga harakat qildingiz.', immediate: false },
    RIGHTCLICK:   { msg: 'Imtihon davomida sichqonchaning o\'ng tugmasi taqiqlangan.', immediate: false },
  };

  /* ── Event Handlers (stored so we can remove them on deactivate) ── */
  const _handlers = {};

  /* ── Public API ───────────────────────────────────────────────────── */
  return {

    activate(examId, studentId) {
      if (_active) return;
      _active    = true;
      _examId    = examId;
      _studentId = studentId;
      _warnings  = 0;

      _buildOverlay();
      _attachEvents();
    },

    deactivate() {
      if (!_active) return;
      _active = false;
      _detachEvents();
      _removeOverlay();
      document.body.classList.remove('exam-blur-active');
    },

    isActive() { return _active; },
  };

  /* ── Overlay DOM ──────────────────────────────────────────────────── */
  function _buildOverlay() {
    if (document.getElementById('securityOverlay')) return;
    const el = document.createElement('div');
    el.id = 'securityOverlay';
    el.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.92);
      display: none; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #f1f5f9; text-align: center; padding: 2rem;
    `;
    document.body.appendChild(el);
    _overlayEl = el;
  }

  function _removeOverlay() {
    if (_overlayEl) { _overlayEl.remove(); _overlayEl = null; }
  }

  function _showOverlay(title, detail, isFinal) {
    if (!_overlayEl) return;

    const color   = isFinal ? '#f43f5e' : '#f59e0b';
    const icon    = isFinal
      ? `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
         </svg>`
      : `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
         </svg>`;

    _overlayEl.innerHTML = `
      <div style="max-width: 560px; width: 100%;">
        <div style="margin-bottom: 1.5rem;">${icon}</div>

        <div style="font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800;
                    color: ${color}; margin-bottom: 0.5rem;">${title}</div>

        <p style="font-size: 1rem; color: #94a3b8; margin-bottom: 2rem; line-height: 1.6;">${detail}</p>

        ${!isFinal ? `
          <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.4);
                      border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1.5rem;
                      font-size: 0.9rem; color: #fbbf24;">
            <strong>Bu sizning yagona ogohlantirishingiz.</strong><br>
            Keyingi har qanday qoidabuzarlik 1-bosqich imtihoningizni avtomatik ravishda yakunlaydi.
          </div>
          <button id="securityAcknowledgeBtn"
            style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff;
                   border: none; padding: 0.85rem 2.5rem; border-radius: 12px;
                   font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit;">
            Tushundim — Imtihonga qaytish
          </button>
        ` : `
          <div style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.4);
                      border-radius: 12px; padding: 1rem 1.5rem; font-size: 0.9rem; color: #fb7185;">
            Sizning 1-bosqich nazariy imtihoningiz qoidabuzarlik sababli <strong>0%</strong> baho bilan to'xtatildi.<br>
            Ushbu holat tizimda qayd etildi. Iltimos, og'zaki imtihonchingizga murojaat qiling.
          </div>
        `}
      </div>
    `;

    _overlayEl.style.display = 'flex';

    if (!isFinal) {
      const btn = document.getElementById('securityAcknowledgeBtn');
      if (btn) btn.addEventListener('click', () => {
        _overlayEl.style.display = 'none';
        document.body.classList.remove('exam-blur-active');
      });
    }
  }

  /* ── Violation Handler ──────────────────────────────────────────── */
  function _triggerViolation(type) {
    if (!_active) return;

    const v = VIOLATIONS[type];
    if (!v) return;

    // Log alert to store live for examiner alert feed
    if (window.store && window.store.logSecurityViolation) {
      window.store.logSecurityViolation(_examId, _studentId, { type, reason: v.msg });
    }

    if (v.immediate) {
      _failExam(v.msg, type);
      return;
    }

    // Non-immediate: give one warning first
    _warnings++;
    if (_warnings >= MAX_WARN + 1) {
      _failExam(v.msg, type);
    } else {
      _showOverlay('Xavfsizlik Ogohlantirishi', v.msg, false);
    }
  }

  function _failExam(reason, type) {
    if (!_active) return;

    // Deactivate monitoring first (prevent re-triggering)
    _active = false;
    _detachEvents();
    document.body.classList.remove('exam-blur-active');

    // Save disqualification to store
    window.store.disqualifyStudentQuiz(_examId, _studentId, { reason, type, at: new Date().toISOString() });

    // Show final overlay
    _showOverlay(
      'Imtihon To\'xtatildi (Chetlashtirildi)',
      `<strong>${reason}</strong><br><br>Qoidabuzarlik turi: <code style="color:#fb7185;">${type}</code>`,
      true
    );

    // Re-render student view to reflect new status
    setTimeout(() => {
      const main = document.getElementById('mainContent');
      if (window.StudentView && main) window.StudentView.render(main);
    }, 3000);
  }

  /* ── Event Attachment ─────────────────────────────────────────────── */
  function _attachEvents() {

    // 1. Tab switch — document becomes hidden (highest priority)
    _handlers.visibility = () => {
      if (document.hidden) _triggerViolation('TAB_SWITCH');
    };
    document.addEventListener('visibilitychange', _handlers.visibility);

    // 2. Window loses focus (Alt+Tab, clicking taskbar, etc.)
    _handlers.blur = () => {
      // Small delay to avoid false positives from focus transitions
      _blurTimeout = setTimeout(() => {
        if (_active && !document.hidden) {
          document.body.classList.add('exam-blur-active');
          _triggerViolation('WINDOW_BLUR');
        }
      }, 400);
    };
    _handlers.focus = () => {
      clearTimeout(_blurTimeout);
      document.body.classList.remove('exam-blur-active');
    };
    window.addEventListener('blur',  _handlers.blur);
    window.addEventListener('focus', _handlers.focus);

    // 3. Copy / Cut events
    _handlers.copy = (e) => { e.preventDefault(); _triggerViolation('COPY_ATTEMPT'); };
    _handlers.cut  = (e) => { e.preventDefault(); _triggerViolation('CUT_ATTEMPT');  };
    document.addEventListener('copy', _handlers.copy);
    document.addEventListener('cut',  _handlers.cut);

    // 4. Keyboard shortcuts
    _handlers.keydown = (e) => {
      const key  = e.key  || '';
      const code = e.code || '';

      // PrintScreen / F13
      if (key === 'PrintScreen' || code === 'PrintScreen' || key === 'F13') {
        e.preventDefault();
        _triggerViolation('SCREENSHOT');
        return;
      }

      // Ctrl / Cmd combos
      if (e.ctrlKey || e.metaKey) {
        const blocked = ['c', 'x', 'a', 'p', 'u', 's', 'j', 'i'];
        if (blocked.includes(key.toLowerCase())) {
          e.preventDefault();
          if (['c','x'].includes(key.toLowerCase())) {
            _triggerViolation('COPY_ATTEMPT');
          } else if (key.toLowerCase() === 'p') {
            _triggerViolation('SCREENSHOT');
          } else {
            _triggerViolation('SHORTCUT');
          }
          return;
        }
      }

      // F12 (DevTools)
      if (key === 'F12') {
        e.preventDefault();
        _triggerViolation('SHORTCUT');
        return;
      }
    };
    document.addEventListener('keydown', _handlers.keydown, { capture: true });

    // 5. Right-click context menu
    _handlers.contextmenu = (e) => {
      // Only block inside the quiz area
      const quiz = document.getElementById('examQuizZone');
      if (quiz && quiz.contains(e.target)) {
        e.preventDefault();
        _triggerViolation('RIGHTCLICK');
      }
    };
    document.addEventListener('contextmenu', _handlers.contextmenu);

    // 6. Before unload — mark as violation (best-effort)
    _handlers.beforeunload = (e) => {
      if (_active) {
        window.store.recordSecurityViolation(_examId, _studentId, 'BROWSER_CLOSE');
        e.preventDefault();
        e.returnValue = 'Leaving this page will fail your Part 1 exam. Are you sure?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', _handlers.beforeunload);

    // 7. Disable text selection via pointer
    _handlers.selectstart = (e) => {
      const quiz = document.getElementById('examQuizZone');
      if (quiz && quiz.contains(e.target)) e.preventDefault();
    };
    document.addEventListener('selectstart', _handlers.selectstart);
  }

  function _detachEvents() {
    if (_handlers.visibility)  document.removeEventListener('visibilitychange', _handlers.visibility);
    if (_handlers.blur)        window.removeEventListener('blur',  _handlers.blur);
    if (_handlers.focus)       window.removeEventListener('focus', _handlers.focus);
    if (_handlers.copy)        document.removeEventListener('copy', _handlers.copy);
    if (_handlers.cut)         document.removeEventListener('cut',  _handlers.cut);
    if (_handlers.keydown)     document.removeEventListener('keydown', _handlers.keydown, { capture: true });
    if (_handlers.contextmenu) document.removeEventListener('contextmenu', _handlers.contextmenu);
    if (_handlers.beforeunload)window.removeEventListener('beforeunload', _handlers.beforeunload);
    if (_handlers.selectstart) document.removeEventListener('selectstart', _handlers.selectstart);
    clearTimeout(_blurTimeout);

    // Clear handler refs
    Object.keys(_handlers).forEach(k => delete _handlers[k]);
  }

}());
