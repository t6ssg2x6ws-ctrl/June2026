/* ==========================================================================
   UIT Student Portal & Database Management Application Logic
   Strictly derived from login_db & data_UIT schema in dapperservice.cs
   ========================================================================== */

// Initial Data matching C# DapperService methods and models
const INITIAL_USERS = [
    { username: 'admin', password_hash: 'admin123' },
    { username: 'user1', password_hash: 'pass123' }
];

const INITIAL_STUDENTS = [
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

// Application State
let appState = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('uit_users')) || INITIAL_USERS,
    students: JSON.parse(localStorage.getItem('uit_students')) || INITIAL_STUDENTS,
    currentTab: 'dashboard',
    searchQuery: '',
    selectedCity: ''
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    saveToStorage();
    renderAll();
    setupFilters();
});

// Storage Helper
function saveToStorage() {
    localStorage.setItem('uit_users', JSON.stringify(appState.users));
    localStorage.setItem('uit_students', JSON.stringify(appState.students));
}

// Tab Switching
function switchTab(tabId) {
    appState.currentTab = tabId;
    
    // Update nav links
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    // Update headers
    const titleMap = {
        'dashboard': 'UIT Student Management Dashboard',
        'students': '[dbo].[data_UIT] Records Table',
        'security': 'SQL Injection Security Analysis',
        'db-schema': 'Database Specs & T-SQL Definition'
    };
    document.getElementById('page-title').innerText = titleMap[tabId] || 'UIT Portal';

    renderAll();
}

// Render All Components
function renderAll() {
    renderStats();
    renderRecentStudents();
    renderStudentsTable();
    updateUserStatusUI();
}

// Render Dashboard Stats
function renderStats() {
    document.getElementById('stat-total-students').innerText = appState.students.length;
    
    const uniqueCities = new Set(appState.students.map(s => s.city).filter(Boolean));
    document.getElementById('stat-cities-count').innerText = uniqueCities.size;
    
    document.getElementById('stat-users-count').innerText = appState.users.length;
}

// Render Recent Students
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

// Render Main Students Table
function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    let filtered = appState.students.filter(s => {
        const matchesQuery = 
            s.STUDENT_ID.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            s.STUDENT_NAME.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            s.FATHER_NAME.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            s.Mother_Name.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            s.city.toLowerCase().includes(appState.searchQuery.toLowerCase());

        const matchesCity = !appState.selectedCity || s.city === appState.selectedCity;
        return matchesQuery && matchesCity;
    });

    document.getElementById('showing-count').innerText = `Showing ${filtered.length} of ${appState.students.length} entries`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">No matching student records found in [dbo].[data_UIT]</td></tr>`;
        return;
    }

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
                <button class="btn btn-sm btn-outline-light" onclick="openEditStudentModal('${escapeHtml(s.STUDENT_ID)}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-danger-soft" onclick="confirmDeleteStudent('${escapeHtml(s.STUDENT_ID)}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Setup Filters Options
function setupFilters() {
    const citySelect = document.getElementById('city-filter');
    if (!citySelect) return;

    const cities = Array.from(new Set(appState.students.map(s => s.city).filter(Boolean))).sort();
    
    citySelect.innerHTML = `<option value="">All Cities</option>` + 
        cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

// Handlers for Search & Filter
function handleSearch() {
    appState.searchQuery = document.getElementById('search-input').value;
    renderStudentsTable();
}

function handleFilter() {
    appState.selectedCity = document.getElementById('city-filter').value;
    renderStudentsTable();
}

// Modals Handling
function toggleAuthModal() {
    if (appState.currentUser) {
        // Logout
        appState.currentUser = null;
        updateUserStatusUI();
        showToast('Logged out successfully', 'info');
    } else {
        document.getElementById('auth-modal').classList.add('active');
    }
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();

    // Parameterized logic matching: select * from [dbo].[users] where username=@username and password_hash=@password_hash
    const foundUser = appState.users.find(user => user.username === u && user.password_hash === p);

    if (foundUser) {
        appState.currentUser = foundUser;
        updateUserStatusUI();
        closeAuthModal();
        showToast(`Login Success! Welcome ${foundUser.username}`, 'success');
    } else {
        showToast('Login Failed: Invalid username or password', 'error');
    }
}

function updateUserStatusUI() {
    const displayName = document.getElementById('user-display-name');
    const authBtn = document.getElementById('auth-action-btn');
    const avatar = document.getElementById('user-avatar-icon');

    if (appState.currentUser) {
        displayName.innerText = `${appState.currentUser.username} (Authenticated)`;
        authBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
        authBtn.className = 'btn btn-sm btn-danger-soft';
        avatar.innerHTML = `<i class="fa-solid fa-user-check"></i>`;
        avatar.style.color = 'var(--emerald)';
    } else {
        displayName.innerText = 'Guest (Not Logged In)';
        authBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
        authBtn.className = 'btn btn-sm btn-outline-light';
        avatar.innerHTML = `<i class="fa-solid fa-user-lock"></i>`;
        avatar.style.color = 'var(--teal)';
    }
}

// Student CRUD Operations
function openAddStudentModal() {
    document.getElementById('student-mode').value = 'create';
    document.getElementById('student-modal-title').innerHTML = `<i class="fa-solid fa-user-plus"></i> Add New Student ([dbo].[data_UIT])`;
    document.getElementById('field-student-id').readOnly = false;
    document.getElementById('student-form').reset();
    document.getElementById('student-modal').classList.add('active');
}

function openEditStudentModal(studentId) {
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

function handleStudentFormSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('student-mode').value;
    const studentId = document.getElementById('field-student-id').value.trim();
    const studentName = document.getElementById('field-student-name').value.trim();
    const fatherName = document.getElementById('field-father-name').value.trim();
    const enrollDate = document.getElementById('field-enroll-date').value;
    const city = document.getElementById('field-city').value.trim();
    const age = document.getElementById('field-age').value.trim();
    const motherName = document.getElementById('field-mother-name').value.trim();

    if (mode === 'create') {
        if (appState.students.some(s => s.STUDENT_ID === studentId)) {
            showToast(`Error: STUDENT_ID '${studentId}' already exists in [dbo].[data_UIT]`, 'error');
            return;
        }

        const newStudent = {
            STUDENT_ID: studentId,
            STUDENT_NAME: studentName,
            FATHER_NAME: fatherName,
            ENROLL_DATE: enrollDate,
            city: city,
            age: age,
            Mother_Name: motherName
        };

        appState.students.push(newStudent);
        showToast(`Student record '${studentId}' inserted successfully!`, 'success');
    } else {
        // Update
        const index = appState.students.findIndex(s => s.STUDENT_ID === studentId);
        if (index !== -1) {
            appState.students[index] = {
                STUDENT_ID: studentId,
                STUDENT_NAME: studentName,
                FATHER_NAME: fatherName,
                ENROLL_DATE: enrollDate,
                city: city,
                age: age,
                Mother_Name: motherName
            };
            showToast(`Student record '${studentId}' updated successfully!`, 'success');
        }
    }

    saveToStorage();
    setupFilters();
    renderAll();
    closeStudentModal();
}

function confirmDeleteStudent(studentId) {
    if (confirm(`Are you sure you want to delete student record '${studentId}' from [dbo].[data_UIT]?`)) {
        appState.students = appState.students.filter(s => s.STUDENT_ID !== studentId);
        saveToStorage();
        setupFilters();
        renderAll();
        showToast(`Student record '${studentId}' deleted!`, 'info');
    }
}

// SQL Security Simulator
function runSqlTest() {
    const userInput = document.getElementById('test-username').value;
    const passInput = document.getElementById('test-password').value;

    // Vulnerable string interpolation evaluation
    // $"select * from [dbo].[users] where username='{nae}' and password_hash='{psw}';"
    const vulnQuery = `select * from [dbo].[users] where username='${userInput}' and password_hash='${passInput}';`;
    
    // Simulate SQL injection attack bypass check
    let vulnBypass = false;
    if (userInput.includes("' OR '1'='1") || userInput.includes("' OR 1=1") || passInput.includes("' OR '1'='1")) {
        vulnBypass = true;
    }

    const vulnRes = document.getElementById('vulnerable-result');
    if (vulnBypass) {
        vulnRes.className = 'text-danger';
        vulnRes.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> AUTHENTICATION BYPASSED! SQL Query string: <code>${escapeHtml(vulnQuery)}</code>`;
    } else {
        vulnRes.className = 'text-muted';
        vulnRes.innerText = `Evaluated query: ${vulnQuery}`;
    }

    // Safe Parameterized Dapper Query simulation
    const paramRes = document.getElementById('parameterized-result');
    const safeMatch = appState.users.find(u => u.username === userInput && u.password_hash === passInput);

    if (safeMatch) {
        paramRes.className = 'text-success';
        paramRes.innerHTML = `<i class="fa-solid fa-check"></i> Valid User Match Found (@username='${escapeHtml(userInput)}')`;
    } else {
        paramRes.className = 'text-success';
        paramRes.innerHTML = `<i class="fa-solid fa-shield"></i> SECURE: Treated literally as username parameter. Input rejected cleanly.`;
    }
}

// Export SQL Script Generator
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
    showToast('SQL DDL and data script exported successfully!', 'success');
}

function copySqlScript() {
    const script = document.getElementById('sql-script-display').innerText;
    navigator.clipboard.writeText(script).then(() => {
        showToast('SQL Script copied to clipboard!', 'info');
    });
}

// Toast Notifications
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

// HTML Escaper Utility
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
