// Kiểm tra nếu đã đăng nhập thì chuyển thẳng vào trang chủ
window.onload = function() {
    const session = sessionStorage.getItem('netflix_user') || localStorage.getItem('netflix_remember');
    if (session) {
        window.location.href = '../trang_chu/trang_chu.html';
    }
};

function showTab(tab) {
    document.getElementById('form-signin').style.display = tab === 'signin' ? 'block' : 'none';
    document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('tab-signin').classList.toggle('active', tab === 'signin');
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
    // Clear errors
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
    document.getElementById('signup-success').textContent = '';
}

function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Lấy danh sách users từ localStorage
function getUsers() {
    const data = localStorage.getItem('netflix_users');
    if (!data) {
        const defaultUsers = [{ name: 'Netflix User', email: 'user@netflix.com', password: '123456' }];
        localStorage.setItem('netflix_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(data);
}

// Lưu danh sách users
function saveUsers(users) {
    localStorage.setItem('netflix_users', JSON.stringify(users));
}

function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;
    const errEl = document.getElementById('login-error');

    if (!email || !password) {
        errEl.textContent = '⚠ Vui lòng nhập đầy đủ thông tin.';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        errEl.textContent = '✗ Email hoặc mật khẩu không đúng.';
        return;
    }

    // Lưu session
    const sessionData = JSON.stringify({ email: user.email, name: user.name });
    sessionStorage.setItem('netflix_user', sessionData);
    if (remember) {
        localStorage.setItem('netflix_remember', sessionData);
    }

    window.location.href = '../trang_chu/trang_chu.html';
}

function doSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errEl = document.getElementById('signup-error');
    const successEl = document.getElementById('signup-success');

    errEl.textContent = '';
    successEl.textContent = '';

    if (!name || !email || !password || !confirm) {
        errEl.textContent = '⚠ Vui lòng nhập đầy đủ thông tin.';
        return;
    }
    if (password.length < 6) {
        errEl.textContent = '✗ Mật khẩu phải có ít nhất 6 ký tự.';
        return;
    }
    if (password !== confirm) {
        errEl.textContent = '✗ Mật khẩu xác nhận không khớp.';
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        errEl.textContent = '✗ Email này đã được đăng ký.';
        return;
    }

    users.push({ name, email, password });
    saveUsers(users);

    successEl.textContent = '✓ Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
    setTimeout(() => {
        document.getElementById('login-email').value = email;
        showTab('signin');
    }, 1500);
}

// Cho phép nhấn Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const signinVisible = document.getElementById('form-signin').style.display !== 'none';
        if (signinVisible) doLogin();
        else doSignup();
    }
});