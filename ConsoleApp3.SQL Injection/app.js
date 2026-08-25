/* ==========================================================================
   UIT Student Management Portal & Security Gatekeeper JavaScript
   ========================================================================== */

const API_BASE = '/api';

// Database default accounts matching dapperservice.cs
const FALLBACK_USERS = [
    { username: 'admin', password_hash: 'admin123', role: 'Admin' },
    { username: 'user1', password_hash: 'pass123', role: 'User' }
];

const FALLBACK_STUDENTS = [
    {
        STUDENT_ID: 'TNT-2608',
        STUDENT_NAME: 'L Sun Jar Nue',
        FATHER_NAME: 'U Yaw Sat',
        ENROLL_DATE: '2007-03-25',
        city: 'Naypyitaw',
        age: '21',
        Mother_Name: 'Daw Hla'
    },
    {
        STUDENT_ID: 'TNT-0201',
        STUDENT_NAME: 'Phoe La Min',
        FATHER_NAME: 'U Myint',
        ENROLL_DATE: '2024-01-15',
        city: 'Yangon',
        age: '20',
        Mother_Name: 'Daw Hla'
    },
    {
        STUDENT_ID: 'TNT-0204',
        STUDENT_NAME: 'Aung Aung',
        FATHER_NAME: 'U Kyaw',
        ENROLL_DATE: '2023-09-10',
        city: 'Mandalay',
        age: '19',
        Mother_Name: 'Daw Aye'
    },
    {
        STUDENT_ID: 'TNT-2534',
        STUDENT_NAME: 'Su Su',
        FATHER_NAME: 'U Win',
        ENROLL_DATE: '2022-11-05',
        city: 'Taunggyi',
        age: '22',
        Mother_Name: 'Daw Mya'
    }
];

let appState = {
    isAuthenticated: false,
    currentUser: null, // { username, role }
    users: FALLBACK_USERS,
    students: FALLBACK_STUDENTS,
    currentTab: 'dashboard',
    searchQuery: '',
    selectedCity: ''
};

// Initialize Application on page load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchStudentsFromApi();
    renderViewState();
});

// Fetch Students from C# ASP.NET Core API if running live server
async function fetchStudentsFromApi() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                appState.students = data.map(s => ({
                    ...s,
                    ENROLL_DATE: typeof s.enroll_DATE === 'string' ? s.enroll_DATE.split('T')[0] : (s.ENROLL_DATE ? s.ENROLL_DATE.split('T')[0] : '2024-01-01')
                }));
            }
        }
    } catch (err) {
        console.log('Using local client state (C# API backend offline or direct file view)');
    }
}

// Render View State (Gatekeeper Login vs System Management)
function renderViewState() {
    const gkSection = document.getElementById('gatekeeper-login-section');
    const appContainer = document.getElementById('main-app-container');

    if (!appState.isAuthenticated) {
        gkSection.style.display = 'flex';
        appContainer.style.display = 'none';
    } else {
        gkSection.style.display = 'none';
        appContainer.style.display = 'flex';
        renderAll();
    }
}

// Quick Fill Demo Credentials into Gatekeeper Login
function fillCredentials(username, password) {
    document.getElementById('gk-username').value = username;
    document.getElementById('gk-password').value = password;
    showToast(`Loaded demo credentials: ${username}`, 'info');
}

// Handle Login Submission from Gatekeeper Form
async function handleGatekeeperLogin(e) {
    e.preventDefault();
    const u = document.getElementById('gk-username').value.trim();
    const p = document.getElementById('gk-password').value.trim();

    if (!u || !p) {
        showToast('Please enter both Username and Password', 'error');
        return;
    }

    // Check for C# API Login endpoint first
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Username: u, Password: p })
        });

        if (res.ok) {
            const data = await res.json();
            const isAdminUser = u.toLowerCase() === 'admin';
            appState.isAuthenticated = true;
            appState.currentUser = {
                username: data.username || u,
                role: isAdminUser ? 'Admin' : 'User'
            };
            renderViewState();
            showToast(`Login Successful! Welcome to UIT Portal (${appState.currentUser.role})`, 'success');
            return;
        }
    } catch (err) {
        console.log('API login offline - evaluating client authentication logic');
    }

    // Fallback Authentication & SQL Injection simulation check
    let authenticatedUser = appState.users.find(user => user.username === u && user.password_hash === p);
    let isSqliBypass = false;

    // Check SQL Injection bypass condition (e.g. admin' OR '1'='1)
    if (u.includes("' OR '1'='1") || u.includes("' OR 1=1") || p.includes("' OR '1'='1")) {
        isSqliBypass = true;
        authenticatedUser = { username: "admin (SQLi Bypass)", role: 'Admin' };
    }

    if (authenticatedUser) {
        appState.isAuthenticated = true;
        appState.currentUser = authenticatedUser;
        renderViewState();

        if (isSqliBypass) {
            showToast(`SQL INJECTION BYPASS SUCCESSFUL! System Management Unlocked as Admin.`, 'error');
        } else {
            showToast(`Login Successful! Welcome ${authenticatedUser.username}`, 'success');
        }
    } else {
        showToast('Login Failed: Invalid Username or Password', 'error');
    }
}

// Handle Logout
function handleLogout() {
    appState.isAuthenticated = false;
    appState.currentUser = null;
    document.getElementById('gk-form')?.reset();
    renderViewState();
    showToast('Logged out of system', 'info');
}

// Helper: Check if active user is Admin
function isAdmin() {
    return appState.currentUser && (appState.currentUser.role === 'Admin' || appState.currentUser.username.toLowerCase().includes('admin'));
}

// Render All System Components
function renderAll() {
    renderUserHeader();
    renderStats();
    renderRecentStudents();
    renderStudentsTable();
    setupFilters();
}

// Render Active User Header & Privileges UI
function renderUserHeader() {
    if (!appState.currentUser) return;

    const displayName = document.getElementById('user-display-name');
    const roleBadge = document.getElementById('user-role-badge');
    const accessPill = document.getElementById('access-pill');
    const alertBanner = document.getElementById('non-admin-alert');
    const specRole = document.getElementById('spec-current-role');
    const btnAddStudent = document.getElementById('btn-add-student');

    displayName.innerText = appState.currentUser.username;
    
    if (isAdmin()) {
        roleBadge.innerText = 'ADMINISTRATOR';
        roleBadge.style.color = '#34d399';
        accessPill.className = 'access-pill';
        accessPill.innerHTML = `<i class="fa-solid fa-shield-check"></i> Admin Privileges Active`;
        if (alertBanner) alertBanner.style.display = 'none';
        if (specRole) specRole.innerText = 'Admin (Full CRUD)';
        if (btnAddStudent) btnAddStudent.disabled = false;
    } else {
        roleBadge.innerText = 'REGULAR USER';
        roleBadge.style.color = '#2dd4bf';
        accessPill.className = 'access-pill user-access';
        accessPill.innerHTML = `<i class="fa-solid fa-user"></i> Regular User (Read-Only)`;
        if (alertBanner) alertBanner.style.display = 'flex';
        if (specRole) specRole.innerText = 'User (Read Only)';
    }
}

// Tab Navigation Switching
function switchTab(tabId) {
    appState.currentTab = tabId;
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    const titleMap = {
        'dashboard': 'UIT System Management Dashboard',
        'students': '[dbo].[data_UIT] Records Table',
        'security': 'C# SQL Injection Security Analysis',
        'db-schema': 'C# & T-SQL Source Code'
    };
    document.getElementById('page-title').innerText = titleMap[tabId] || 'UIT Portal';

    renderAll();
}

function renderStats() {
    document.getElementById('stat-total-students').innerText = appState.students.length;
    
    const uniqueCities = new Set(appState.students.map(s => s.city).filter(Boolean));
    document.getElementById('stat-cities-count').innerText = uniqueCities.size;
    
    document.getElementById('stat-users-count').innerText = appState.users.length;
}

function renderRecentStudents() {
    const tbody = document.getElementById('recent-students-tbody');
    if (!tbody) return;

    const recent = [...appState.students].slice(-4).reverse();
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No records available</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(s => `
        <tr>
            <td class="text-mono">${escapeHtml(s.STUDENT_ID)}</td>
            <td><strong>${escapeHtml(s.STUDENT_NAME)}</strong></td>
            <td>${escapeHtml(s.FATHER_NAME)}</td>
            <td class="text-mono">${escapeHtml(s.ENROLL_DATE)}</td>
            <td><span class="badge badge-success">${escapeHtml(s.city)}</span></td>
        </tr>
    `).join('');
}

function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    let filtered = appState.students.filter(s => {
        const matchesQuery = 
            (s.STUDENT_ID || '').toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            (s.STUDENT_NAME || '').toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            (s.FATHER_NAME || '').toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            (s.Mother_Name || '').toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            (s.city || '').toLowerCase().includes(appState.searchQuery.toLowerCase());

        const matchesCity = !appState.selectedCity || s.city === appState.selectedCity;
        return matchesQuery && matchesCity;
    });

    document.getElementById('showing-count').innerText = `Showing ${filtered.length} of ${appState.students.length} entries`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">No matching student records found in [dbo].[data_UIT]</td></tr>`;
        return;
    }

    const adminUser = isAdmin();

    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td class="text-mono">${escapeHtml(s.STUDENT_ID)}</td>
            <td><strong>${escapeHtml(s.STUDENT_NAME)}</strong></td>
            <td>${escapeHtml(s.FATHER_NAME)}</td>
            <td class="text-mono">${escapeHtml(s.ENROLL_DATE)}</td>
            <td><span class="badge badge-success">${escapeHtml(s.city)}</span></td>
            <td>${escapeHtml(s.age || '-')}</td>
            <td>${escapeHtml(s.Mother_Name || '-')}</td>
            <td class="text-right">
                <button class="btn btn-sm btn-outline-light" onclick="openEditStudentModal('${escapeHtml(s.STUDENT_ID)}')" ${adminUser ? '' : 'title="Admin required"'}>
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger-soft" onclick="confirmDeleteStudent('${escapeHtml(s.STUDENT_ID)}')" ${adminUser ? '' : 'title="Admin required"'}>
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function setupFilters() {
    const citySelect = document.getElementById('city-filter');
    if (!citySelect) return;

    const cities = Array.from(new Set(appState.students.map(s => s.city).filter(Boolean))).sort();
    citySelect.innerHTML = `<option value="">All Cities</option>` + 
        cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function handleSearch() {
    appState.searchQuery = document.getElementById('search-input').value;
    renderStudentsTable();
}

function handleFilter() {
    appState.selectedCity = document.getElementById('city-filter').value;
    renderStudentsTable();
}

function openAddStudentModal() {
    if (!isAdmin()) {
        showToast('Access Denied: Admin privileges required to add student records', 'error');
        return;
    }
    document.getElementById('student-mode').value = 'create';
    document.getElementById('student-modal-title').innerHTML = `<i class="fa-solid fa-user-plus"></i> Add New Student ([dbo].[data_UIT])`;
    document.getElementById('field-student-id').readOnly = false;
    document.getElementById('student-form').reset();
    document.getElementById('student-modal').classList.add('active');
}

function openEditStudentModal(studentId) {
    if (!isAdmin()) {
        showToast('Access Denied: Admin privileges required to edit student records', 'error');
        return;
    }
    const student = appState.students.find(s => s.STUDENT_ID === studentId);
    if (!student) return;

    document.getElementById('student-mode').value = 'update';
    document.getElementById('student-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Student Record (${studentId})`;
    
    const idInput = document.getElementById('field-student-id');
    idInput.value = student.STUDENT_ID;
    idInput.readOnly = true;

    document.getElementById('field-student-name').value = student.STUDENT_NAME;
    document.getElementById('field-father-name').value = student.FATHER_NAME;
    document.getElementById('field-enroll-date').value = student.ENROLL_DATE;
    document.getElementById('field-city').value = student.city;
    document.getElementById('field-age').value = student.age || '';
    document.getElementById('field-mother-name').value = student.Mother_Name || '';

    document.getElementById('student-modal').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('student-modal').classList.remove('active');
}

async function handleStudentFormSubmit(e) {
    e.preventDefault();
    if (!isAdmin()) {
        showToast('Access Denied: Admin privileges required', 'error');
        return;
    }

    const mode = document.getElementById('student-mode').value;
    const studentId = document.getElementById('field-student-id').value.trim();
    const studentName = document.getElementById('field-student-name').value.trim();
    const fatherName = document.getElementById('field-father-name').value.trim();
    const enrollDate = document.getElementById('field-enroll-date').value;
    const city = document.getElementById('field-city').value.trim();
    const age = document.getElementById('field-age').value.trim();
    const motherName = document.getElementById('field-mother-name').value.trim();

    const studentObj = {
        STUDENT_ID: studentId,
        STUDENT_NAME: studentName,
        FATHER_NAME: fatherName,
        ENROLL_DATE: enrollDate,
        city: city,
        age: age,
        Mother_Name: motherName
    };

    if (mode === 'create') {
        try {
            const res = await fetch(`${API_BASE}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentObj)
            });
            if (res.ok) {
                appState.students.push(studentObj);
                showToast(`Student record '${studentId}' created via C# Web API!`, 'success');
                finishSubmit();
                return;
            }
        } catch (err) {
            console.log('Falling back to local state update');
        }

        if (appState.students.some(s => s.STUDENT_ID === studentId)) {
            showToast(`Error: STUDENT_ID '${studentId}' already exists`, 'error');
            return;
        }
        appState.students.push(studentObj);
        showToast(`Student record '${studentId}' created successfully!`, 'success');
    } else {
        try {
            const res = await fetch(`${API_BASE}/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentObj)
            });
            if (res.ok) {
                const index = appState.students.findIndex(s => s.STUDENT_ID === studentId);
                if (index !== -1) appState.students[index] = studentObj;
                showToast(`Student record '${studentId}' updated via C# Web API!`, 'success');
                finishSubmit();
                return;
            }
        } catch (err) {
            console.log('Falling back to local update');
        }

        const index = appState.students.findIndex(s => s.STUDENT_ID === studentId);
        if (index !== -1) appState.students[index] = studentObj;
        showToast(`Student record '${studentId}' updated successfully!`, 'success');
    }

    finishSubmit();
}

function finishSubmit() {
    setupFilters();
    renderAll();
    closeStudentModal();
}

async function confirmDeleteStudent(studentId) {
    if (!isAdmin()) {
        showToast('Access Denied: Admin privileges required to delete records', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete student record '${studentId}' from [dbo].[data_UIT]?`)) {
        try {
            const res = await fetch(`${API_BASE}/students/${studentId}`, { method: 'DELETE' });
            if (res.ok) {
                appState.students = appState.students.filter(s => s.STUDENT_ID !== studentId);
                showToast(`Student '${studentId}' deleted via C# Web API!`, 'info');
                finishSubmit();
                return;
            }
        } catch (err) {
            console.log('Falling back to local deletion');
        }

        appState.students = appState.students.filter(s => s.STUDENT_ID !== studentId);
        showToast(`Student '${studentId}' deleted successfully!`, 'info');
        finishSubmit();
    }
}

// SQL Security Analysis Execution Simulation
function runSqlTest() {
    const userInput = document.getElementById('test-username').value;
    const passInput = document.getElementById('test-password').value;

    const vulnQuery = `select * from [dbo].[users] where username='${userInput}' and password_hash='${passInput}';`;
    
    let vulnBypass = false;
    if (userInput.includes("' OR '1'='1") || userInput.includes("' OR 1=1") || passInput.includes("' OR '1'='1")) {
        vulnBypass = true;
    }

    const vulnRes = document.getElementById('vulnerable-result');
    if (vulnBypass) {
        vulnRes.className = 'text-danger';
        vulnRes.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> AUTHENTICATION BYPASSED! Vulnerable query: <code>${escapeHtml(vulnQuery)}</code>`;
    } else {
        vulnRes.className = 'text-muted';
        vulnRes.innerText = `Evaluated query: ${vulnQuery}`;
    }

    const paramRes = document.getElementById('parameterized-result');
    const safeMatch = appState.users.find(u => u.username === userInput && u.password_hash === passInput);

    if (safeMatch) {
        paramRes.className = 'text-success';
        paramRes.innerHTML = `<i class="fa-solid fa-check"></i> Valid User Match Found (@username='${escapeHtml(userInput)}')`;
    } else {
        paramRes.className = 'text-success';
        paramRes.innerHTML = `<i class="fa-solid fa-shield"></i> SECURE: Treated strictly as literal parameters in C#. Input safely rejected.`;
    }
}

function exportSqlScript() {
    const script = document.getElementById('sql-script-display').innerText;
    const blob = new Blob([script], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'login_db_dapperservice.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('SQL DDL script exported successfully!', 'success');
}

function copySqlScript() {
    const script = document.getElementById('sql-script-display').innerText;
    navigator.clipboard.writeText(script).then(() => {
        showToast('SQL Script copied to clipboard!', 'info');
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
        'success': 'fa-circle-check',
        'error': 'fa-triangle-exclamation',
        'info': 'fa-circle-info'
    };

    toast.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-circle-info'}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
