/* ==========================================================================
   EduGrade 360 - Main Application Orchestrator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const headerNavControl = document.getElementById('headerNavControl');
  const roleBanner = document.getElementById('roleBanner');
  const roleBannerIcon = document.getElementById('roleBannerIcon');
  const roleBannerTitle = document.getElementById('roleBannerTitle');
  const roleBannerDesc = document.getElementById('roleBannerDesc');
  const bannerQuickStats = document.getElementById('bannerQuickStats');
  const currentUserBadge = document.getElementById('currentUserBadge');
  const mainContent = document.getElementById('mainContent');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const resetDemoBtn = document.getElementById('resetDemoBtn');

  // Global Toast Helper
  window.toast = function (message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    
    let icon = window.Icons.get('alert', 16);
    if (type === 'success') icon = window.Icons.get('check', 16);
    if (type === 'warning') icon = window.Icons.get('warning', 16);
    if (type === 'danger') icon = window.Icons.get('alert', 16);

    toastEl.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(100%)';
      setTimeout(() => toastEl.remove(), 250);
    }, 3500);
  };

  // Global CSV Download Helper
  window.downloadCSV = function (csvContent, filename) {
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Role Configuration Dictionary
  const ROLE_CONFIGS = {
    student: {
      title: 'Talaba Portali',
      desc: 'Yagona Kalit orqali jonli imtihon xonasiga kiring, 1-bosqich nazariy testni topshiring, 2-bosqich og\'zaki imtihonga tayyor turing va yutuq sertifikatini oling.',
      iconName: 'student',
      bannerClass: 'banner-student',
      badge: `${window.Icons.get('student', 15)} Faol Talaba Portali`,
      render: (container) => window.StudentView.render(container)
    },
    admin: {
      title: 'Admin Portali',
      desc: 'Imtihon seanslarini yarating, Savollar va Yo\'nalishlar bazasini boshqaring, Imtihonchilar va O\'qituvchilarni biriktiring hamda jonli xonalarni kuzating.',
      iconName: 'admin',
      bannerClass: 'banner-admin',
      badge: `${window.Icons.get('admin', 15)} Tizim Administratori`,
      render: (container) => window.AdminView.render(container)
    },
    faculty: {
      title: 'O\'qituvchilar va Xodimlar Portali',
      get desc() {
        return `Akademik xodimlar portali. Amaliy loyihalarni rubrikalar bo'yicha baholang, jonli xonalarni boshqaring va 2-bosqich og'zaki imtihonni o'tkazing.`;
      },
      iconName: 'teacher',
      bannerClass: 'banner-teacher',
      get badge() {
        return `${window.Icons.get('teacher', 15)} Akademik Xodim Hisobi`;
      },
      render: (container) => window.FacultyView.render(container)
    }
  };

  // Sync role from URL (supports /student, /staff, #student, #staff)
  function syncRoleFromURL() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/staff') || hash.includes('#staff') || path.includes('/admin') || hash.includes('#admin')) {
      const authStaff = window.store.getAuthenticatedStaff();
      const role = authStaff ? (authStaff.role === 'admin' ? 'admin' : 'faculty') : 'admin';
      window.store.setCurrentRole(role);
    } else if (path.includes('/student') || hash.includes('#student')) {
      window.store.setCurrentRole('student');
    }
  }

  // Initial Route Check
  syncRoleFromURL();

  // Render current role view & header state
  function updateAppView() {
    const currentRole = window.store.getCurrentRole();
    const config = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.student;
    const authStaff = window.store.getAuthenticatedStaff();

    // Sync browser URL bar for direct linking
    try {
      if (currentRole === 'student') {
        if (!window.location.pathname.endsWith('/student') && window.location.hash !== '#student') {
          history.replaceState(null, '', '/student');
        }
      } else {
        if (!window.location.pathname.endsWith('/staff') && window.location.hash !== '#staff') {
          history.replaceState(null, '', '/staff');
        }
      }
    } catch (e) {
      // Fallback for strict browser origins
    }

    // Update Header Navigation Control Buttons
    if (headerNavControl) {
      if (authStaff) {
        // Authenticated Staff: Provide explicit Dashboard <-> Student View Switcher
        const staffDashboardRole = authStaff.role === 'admin' ? 'admin' : 'faculty';
        const isCurrentlyDashboard = currentRole === staffDashboardRole;

        headerNavControl.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.3rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); padding: 0.25rem; border-radius: var(--radius-md);">
            <button id="navDashboardBtn" class="btn btn-sm ${isCurrentlyDashboard ? 'btn-primary' : 'btn-ghost'}" style="font-size: 0.78rem; padding: 0.35rem 0.85rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              ${authStaff.role === 'admin' ? window.Icons.get('admin', 14) : window.Icons.get('teacher', 14)}
              ${authStaff.role === 'admin' ? 'Admin Boshqaruvi' : 'Xodimlar Boshqaruvi'}
            </button>
            <button id="navStudentBtn" class="btn btn-sm ${!isCurrentlyDashboard ? 'btn-primary' : 'btn-ghost'}" style="font-size: 0.78rem; padding: 0.35rem 0.85rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              ${window.Icons.get('student', 14)} Talaba Kirishi
            </button>
          </div>
        `;

        const dashBtn = headerNavControl.querySelector('#navDashboardBtn');
        if (dashBtn) {
          dashBtn.addEventListener('click', () => {
            window.store.setCurrentRole(staffDashboardRole);
            updateAppView();
          });
        }

        const stdBtn = headerNavControl.querySelector('#navStudentBtn');
        if (stdBtn) {
          stdBtn.addEventListener('click', () => {
            window.store.setCurrentRole('student');
            updateAppView();
          });
        }

      } else {
        // Unauthenticated Guest: Staff Sign-In or Student View
        if (currentRole === 'student') {
          headerNavControl.innerHTML = `
            <button id="navStaffLoginBtn" class="btn btn-primary btn-sm" style="font-size: 0.78rem; padding: 0.35rem 0.85rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              ${window.Icons.get('key', 14)} Xodimlar Kirishi
            </button>
          `;
          const staffBtn = headerNavControl.querySelector('#navStaffLoginBtn');
          if (staffBtn) {
            staffBtn.addEventListener('click', () => {
              const staff = window.store.getAuthenticatedStaff();
              const targetRole = staff?.role === 'admin' ? 'admin' : 'faculty';
              window.store.setCurrentRole(targetRole);
              updateAppView();
            });
          }
        } else {
          headerNavControl.innerHTML = `
            <button id="navReturnStudentBtn" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 0.35rem 0.85rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              ${window.Icons.get('student', 14)} Talaba Kirishi
            </button>
          `;
          const retBtn = headerNavControl.querySelector('#navReturnStudentBtn');
          if (retBtn) {
            retBtn.addEventListener('click', () => {
              window.store.setCurrentRole('student');
              updateAppView();
            });
          }
        }
      }
    }

    // Update role banner if exists
    if (roleBanner && roleBannerIcon && roleBannerTitle && roleBannerDesc) {
      roleBanner.className = `role-banner ${config.bannerClass}`;
      roleBannerIcon.innerHTML = window.Icons.get(config.iconName, 22);
      roleBannerTitle.textContent = config.title;
      roleBannerDesc.textContent = config.desc;
    }

    // Update User Badge & Staff Sign-Out Control
    if (authStaff) {
      currentUserBadge.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--accent-orange); display: inline-flex; align-items: center; gap: 0.35rem;">
            ${window.Icons.get('key', 13)} Kirilgan: <strong>${authStaff.name}</strong> (${authStaff.role.toUpperCase()})
          </span>
          <button id="staffSignOutBtn" class="btn btn-danger btn-xs" style="font-size: 0.74rem; padding: 0.25rem 0.65rem;">
            Chiqish
          </button>
        </div>
      `;
      const signOutBtn = currentUserBadge.querySelector('#staffSignOutBtn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
          window.store.logoutStaff();
          window.toast('Xodimlar portalidan chiqildi.', 'info');
          updateAppView();
        });
      }
    } else {
      currentUserBadge.innerHTML = config.badge;
    }

    // Update Banner Quick Stats
    const exams = window.store.getExams();
    const activeExams = exams.filter(e => e.status !== 'completed');
    const totalStudents = exams.reduce((acc, e) => acc + e.joinedStudents.length, 0);
    const completedExams = exams.filter(e => e.status === 'completed');

    if (bannerQuickStats) {
      bannerQuickStats.innerHTML = `
        <div class="stat-pill">
          <span>Faol Imtihon Xonalari:</span>
          <span class="val">${activeExams.length}</span>
        </div>
        <div class="stat-pill">
          <span>Qatnashayotgan Talabalar:</span>
          <span class="val">${totalStudents}</span>
        </div>
        <div class="stat-pill">
          <span>Yakunlangan Imtihonlar:</span>
          <span class="val" style="color: var(--accent-emerald);">${completedExams.length}</span>
        </div>
      `;
    }

    // Render active view (guard Staff views if unauthenticated)
    if ((currentRole === 'admin' || currentRole === 'faculty') && !authStaff) {
      window.LoginView.render(mainContent);
    } else {
      config.render(mainContent);
    }
  }

  window.updateAppView = updateAppView;

  // Reset Demo Data
  resetDemoBtn.addEventListener('click', () => {
    if (confirm('Barcha imtihon ma\'lumotlarini boshlang\'ich holatga tiklashni xohlaysizmi?')) {
      window.store.resetDefaults();
      window.toast('Demo ma\'lumotlar bazasi boshlang\'ich holatga tiklandi!', 'success');
      updateAppView();
    }
  });

  // Modal Close
  modalCloseBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add('hidden');
    }
  });

  // Route listeners for URL back/forward & hash updates
  window.addEventListener('popstate', () => {
    syncRoleFromURL();
    updateAppView();
  });

  window.addEventListener('hashchange', () => {
    syncRoleFromURL();
    updateAppView();
  });

  // Initial App Render
  updateAppView();
});
