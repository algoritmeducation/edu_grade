/* ==========================================================================
   EduGrade 360 - Staff Login View Component
   Secures Admin & Faculty portals with role-based authentication.
   ========================================================================== */

window.LoginView = {
  selectedRole: 'admin', // 'admin' | 'teacher'

  render(container) {
    const demoAccounts = {
      admin: { name: 'Dr. Evelina Vance', email: 'evelyn.vance@edugrade360.edu', role: 'admin', title: 'Bosh Akademik Administrator', id: 'admin1' },
      teacher: { name: 'Aleks Mercer', email: 'alex.mercer@edugrade360.edu', role: 'teacher', title: 'Katta Imtihonchi va O\'qituvchi', id: 't3' }
    };

    const currentDemo = demoAccounts[this.selectedRole];

    container.innerHTML = `
      <div style="max-width: 520px; margin: 2rem auto; padding: 0 1rem;">
        <div class="card" style="border-color: var(--border-highlight); box-shadow: var(--shadow-glow); padding: 2.25rem 2rem;">
          
          <!-- Header info -->
          <div style="text-align: center; margin-bottom: 1.75rem;">
            <div style="display: inline-flex; padding: 0.85rem; background: linear-gradient(135deg, hsl(24, 100%, 52%), hsl(38, 100%, 50%)); border-radius: var(--radius-md); color: #000; margin-bottom: 1rem; box-shadow: var(--shadow-glow);">
              ${window.Icons.get('key', 32)}
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
              Xodimlar Portaliga Kirish
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Administrator yoki O'qituvchi (Og'zaki Imtihonchi) sifatida tizimga kiring.
            </p>
          </div>

          <!-- Role Selector Tabs -->
          <div style="display: flex; background: rgba(0,0,0,0.35); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.3rem; margin-bottom: 1.5rem; gap: 0.3rem;">
            <button class="role-tab-btn ${this.selectedRole === 'admin' ? 'active' : ''}" data-role="admin" style="flex: 1; padding: 0.65rem 0.4rem; border: none; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 800; cursor: pointer; transition: all 0.15s; ${this.selectedRole === 'admin' ? 'background: linear-gradient(135deg, hsl(24, 100%, 52%), hsl(38, 100%, 50%)); color: #000; box-shadow: 0 0 15px rgba(255,107,0,0.3);' : 'background: transparent; color: var(--text-muted);'} display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;">
              ${window.Icons.get('admin', 16)} Admin Portali
            </button>
            <button class="role-tab-btn ${this.selectedRole === 'teacher' ? 'active' : ''}" data-role="teacher" style="flex: 1; padding: 0.65rem 0.4rem; border: none; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 800; cursor: pointer; transition: all 0.15s; ${this.selectedRole === 'teacher' ? 'background: linear-gradient(135deg, var(--accent-emerald), #059669); color: #fff; box-shadow: 0 0 15px rgba(16,185,129,0.3);' : 'background: transparent; color: var(--text-muted);'} display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;">
              ${window.Icons.get('teacher', 16)} O'qituvchi / Imtihonchi
            </button>
          </div>

          <!-- Login Form -->
          <form id="staffLoginForm">
            <div class="form-group">
              <label class="form-label" for="loginEmail">Tashkiliy Elektron Pochta</label>
              <input type="email" id="loginEmail" class="form-input" value="${currentDemo.email}" required style="font-size: 0.9rem; padding: 0.65rem 0.9rem;">
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label" for="loginPassword">Kirish Paroli</label>
              <input type="password" id="loginPassword" class="form-input" value="edugrade360" required style="font-size: 0.9rem; padding: 0.65rem 0.9rem;">
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem;">
              ${window.Icons.get('key', 16)} ${this.selectedRole === 'admin' ? 'ADMIN' : 'O\'QITUVCHI / IMTIHONCHI'} Portaliga Kirish
            </button>
          </form>

          <!-- Quick Demo Sign-In Card -->
          <div style="margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color);">
            <div style="font-size: 0.72rem; color: var(--text-subtle); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.6rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
              ${window.Icons.get('key', 12)} Demo Hisobdan Avto-Kirish
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
              <div>
                <strong style="font-size: 0.88rem; color: var(--text-main); display: block;">${currentDemo.name}</strong>
                <span style="font-size: 0.76rem; color: var(--text-muted);">${currentDemo.title || currentDemo.department}</span>
              </div>
              <button type="button" id="quickFillBtn" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; flex-shrink: 0;">
                Tezkor Kirish
              </button>
            </div>
          </div>

          <!-- Return to student portal link -->
          <div style="text-align: center; margin-top: 1.25rem;">
            <button type="button" id="returnStudentBtn" class="btn btn-ghost btn-sm" style="font-size: 0.8rem; color: var(--text-muted);">
              ← Talaba Imtihon Kirish Sahifasiga Qaytish
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, demoAccounts);
  },

  bindEvents(container, demoAccounts) {
    // Role Tab Switcher
    container.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedRole = e.currentTarget.dataset.role;
        this.render(container);
      });
    });

    // Quick Fill Demo Button
    const quickFillBtn = container.querySelector('#quickFillBtn');
    if (quickFillBtn) {
      quickFillBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const roleKey = this.selectedRole || 'admin';
        const demo = demoAccounts[roleKey] || demoAccounts.admin;
        const res = window.store.authenticateStaff(demo.email, 'edugrade360', roleKey);
        if (res.success) {
          window.toast(`Xush kelibsiz, ${res.user.name}!`, 'success');
          const targetRole = res.user.role === 'admin' ? 'admin' : 'faculty';
          window.store.setCurrentRole(targetRole);
          if (targetRole === 'faculty' && window.FacultyView) {
            window.FacultyView.loggedInTeacherId = res.user.id;
            window.FacultyView.activeMode = (res.user.role === 'examiner' || this.selectedRole === 'examiner') ? 'examiner' : 'teacher';
          }
          if (window.updateAppView) window.updateAppView();
        }
      });
    }

    // Return to Student Portal
    const returnBtn = container.querySelector('#returnStudentBtn');
    if (returnBtn) {
      returnBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.store.setCurrentRole('student');
        if (window.updateAppView) window.updateAppView();
      });
    }

    // Form Submit
    const form = container.querySelector('#staffLoginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = container.querySelector('#loginEmail').value.trim();
        const password = container.querySelector('#loginPassword').value.trim();

        const res = window.store.authenticateStaff(email, password, this.selectedRole);
        if (res.success) {
          window.toast(`Xush kelibsiz, ${res.user.name}!`, 'success');
          const targetRole = res.user.role === 'admin' ? 'admin' : 'faculty';
          window.store.setCurrentRole(targetRole);
          if (targetRole === 'faculty' && window.FacultyView) {
            window.FacultyView.loggedInTeacherId = res.user.id;
            window.FacultyView.activeMode = (res.user.role === 'examiner' || this.selectedRole === 'examiner') ? 'examiner' : 'teacher';
          }
          if (window.updateAppView) window.updateAppView();
        } else {
          window.toast(res.message, 'danger');
        }
      });
    }
  }
};
