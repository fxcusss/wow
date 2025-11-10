let currentPage = 1;
let totalPages = 1;
let currentSearch = '';

function escapeHtml(unsafe) {
  const div = document.createElement('div');
  div.textContent = unsafe;
  return div.innerHTML;
}

async function checkAuth() {
  try {
    const response = await fetch('/api/check-auth');
    const data = await response.json();
    
    if (data.authenticated) {
      showDashboard();
      loadStats();
      loadLicenses(1);
    } else {
      showLogin();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('dashboard-container').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('dashboard-container').style.display = 'block';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (response.ok) {
      showDashboard();
      loadStats();
      loadLicenses(1);
      errorEl.classList.remove('show');
    } else {
      errorEl.textContent = 'Invalid password';
      errorEl.classList.add('show');
    }
  } catch (error) {
    errorEl.textContent = 'Login failed. Please try again.';
    errorEl.classList.add('show');
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await fetch('/api/logout', { method: 'POST' });
    showLogin();
    document.getElementById('password').value = '';
  } catch (error) {
    console.error('Logout failed:', error);
  }
});

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    document.getElementById('total-licenses').textContent = stats.total;
    document.getElementById('active-licenses').textContent = stats.active;
    document.getElementById('revoked-licenses').textContent = stats.revoked;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

async function loadLicenses(page, search = '') {
  currentPage = page;
  currentSearch = search;
  
  try {
    const url = new URL('/api/licenses', window.location.origin);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', 50);
    if (search) url.searchParams.set('search', search);
    
    const response = await fetch(url);
    const data = await response.json();
    
    totalPages = data.totalPages;
    
    const tbody = document.getElementById('licenses-tbody');
    
    if (data.licenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">No licenses found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.licenses.map(license => {
      const activatedDate = new Date(license.activated_at).toLocaleString();
      const revokedDate = license.revoked_at ? new Date(license.revoked_at).toLocaleString() : '-';
      const statusClass = license.status === 'active' ? 'active' : 'revoked';
      const revokeDisabled = license.status === 'revoked' ? 'disabled' : '';
      
      return `
        <tr>
          <td>${escapeHtml(license.username)}</td>
          <td><code class="license-key">${escapeHtml(license.license_key)}</code></td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(license.status)}</span></td>
          <td>${escapeHtml(activatedDate)}</td>
          <td>${escapeHtml(revokedDate)}</td>
          <td>
            <button 
              class="revoke-btn" 
              onclick="revokeLicense('${escapeHtml(license.user_id)}')"
              ${revokeDisabled}
            >
              Revoke
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    
  } catch (error) {
    console.error('Failed to load licenses:', error);
    document.getElementById('licenses-tbody').innerHTML = 
      '<tr><td colspan="6" class="no-data">Failed to load licenses</td></tr>';
  }
}

async function revokeLicense(userId) {
  if (!confirm('Are you sure you want to revoke this license?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/revoke/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'web-admin' })
    });
    
    if (response.ok) {
      loadStats();
      loadLicenses(currentPage);
    } else {
      const error = await response.json();
      alert(`Failed to revoke license: ${error.error}`);
    }
  } catch (error) {
    console.error('Failed to revoke license:', error);
    alert('Failed to revoke license. Please try again.');
  }
}

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    loadLicenses(currentPage - 1, currentSearch);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage < totalPages) {
    loadLicenses(currentPage + 1, currentSearch);
  }
});

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const search = e.target.value.trim();
    loadLicenses(1, search);
  });
}

checkAuth();
