// -- Global Variables --
let results = [];
let sortConfig = { key: 'name', reverse: false };
let chart = null;

// -- Login Handler --
const loginDiv = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginBtn = document.getElementById('loginBtn');
const loginErr = document.getElementById('loginError');
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');

loginBtn.addEventListener('click', () => {
  const username = loginUser.value.trim();
  const password = loginPass.value.trim();

  if (username === 'admin' && password === 'password') {
    loginDiv.classList.add('hidden');
    mainApp.classList.remove('hidden');
    loginErr.textContent = '';
    loadResults();
    initChart();
    updateChart();
  } else {
    loginErr.textContent = '❌ Invalid credentials! Try admin/password';
  }
});

// -- Logout Handler --
document.getElementById('logoutBtn').addEventListener('click', () => {
  loginDiv.classList.remove('hidden');
  mainApp.classList.add('hidden');
  loginUser.value = '';
  loginPass.value = '';
  loginErr.textContent = '';
});

// -- CRUD & localStorage --
function loadResults() {
  try {
    results = JSON.parse(localStorage.getItem('results') || '[]');
  } catch (e) {
    console.error('Error loading results:', e);
    results = [];
  }
  renderTable();
}

function saveResults() {
  try {
    localStorage.setItem('results', JSON.stringify(results));
  } catch (e) {
    console.error('Error saving results:', e);
    alert('Error saving data. Storage might be full.');
  }
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  
  if (results.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-data">No data added yet. Add a student result to get started!</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  results.forEach((r, i) => {
    const tr = document.createElement('tr');
    const status = (r.math >= 40 && r.science >= 40 && r.english >= 40) ? 'Pass' : 'Fail';
    const statusClass = status === 'Pass' ? 'status-pass' : 'status-fail';
    
    tr.innerHTML = `
      <td>${escapeHtml(r.name)}</td>
      <td>${r.math}</td>
      <td>${r.science}</td>
      <td>${r.english}</td>
      <td><strong>${r.total}</strong></td>
      <td><strong>${r.average}</strong></td>
      <td><span class="status-badge ${statusClass}">${status}</span></td>
      <td>
        <button class="edit-btn" onclick="editEntry(${i})" title="Edit">✏️</button>
        <button class="delete-btn" onclick="deleteEntry(${i})" title="Delete">❌</button>
      </td>`;
    tbody.appendChild(tr);
  });
  updateChart();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function editEntry(i) {
  if (i < 0 || i >= results.length) {
    alert('Invalid entry!');
    return;
  }
  
  const r = results[i];
  document.getElementById('editId').value = i;
  document.getElementById('studentName').value = r.name;
  document.getElementById('math').value = r.math;
  document.getElementById('science').value = r.science;
  document.getElementById('english').value = r.english;
  document.getElementById('addBtn').textContent = '✏️ Update Result';
  document.getElementById('cancelEdit').classList.remove('hidden');
  
  // Scroll to form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function deleteEntry(i) {
  if (i < 0 || i >= results.length) {
    alert('Invalid entry!');
    return;
  }
  
  const r = results[i];
  if (confirm(`Delete result for ${escapeHtml(r.name)}?`)) {
    results.splice(i, 1);
    saveResults();
    renderTable();
  }
}

// -- Add / Update Handler --
document.getElementById('cancelEdit').addEventListener('click', () => {
  resetForm();
});

document.getElementById('resultForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const editId = document.getElementById('editId').value;
  const name = document.getElementById('studentName').value.trim();
  const math = parseFloat(document.getElementById('math').value);
  const science = parseFloat(document.getElementById('science').value);
  const english = parseFloat(document.getElementById('english').value);

  // Validation
  if (!name) {
    alert('⚠️ Please enter student name');
    return;
  }

  if (isNaN(math) || isNaN(science) || isNaN(english)) {
    alert('⚠️ All marks must be valid numbers');
    return;
  }

  if (math < 0 || math > 100 || science < 0 || science > 100 || english < 0 || english > 100) {
    alert('⚠️ Marks must be between 0 and 100');
    return;
  }

  const total = math + science + english;
  const avg = (total / 3).toFixed(2);
  const entry = { name, math, science, english, total, average: avg };

  if (editId === '') {
    results.push(entry);
  } else {
    results[parseInt(editId)] = entry;
  }

  saveResults();
  renderTable();
  resetForm();
  alert('✅ Result saved successfully!');
});

function resetForm() {
  document.getElementById('resultForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('addBtn').textContent = '➕ Add Result';
  document.getElementById('cancelEdit').classList.add('hidden');
}

// -- Search Functionality --
document.getElementById('searchBox').addEventListener('keyup', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const tbody = document.getElementById('tableBody');
  const rows = tbody.querySelectorAll('tr');

  if (searchTerm === '') {
    renderTable();
    return;
  }

  rows.forEach((row) => {
    const name = row.cells[0].textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});

// -- Sorting Functionality --
function sortTable(key) {
  if (sortConfig.key === key) {
    sortConfig.reverse = !sortConfig.reverse;
  } else {
    sortConfig.key = key;
    sortConfig.reverse = false;
  }

  results.sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    // Handle numeric vs string comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
      return sortConfig.reverse ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    } else {
      return sortConfig.reverse ? bVal - aVal : aVal - bVal;
    }
  });

  renderTable();
}

// -- Charts using Chart.js --
function initChart() {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Math', 'Science', 'English'],
      datasets: [
        {
          label: 'Average Score',
          backgroundColor: ['#007bff', '#28a745', '#dc3545'],
          borderColor: ['#0056b3', '#1e7e34', '#c82333'],
          borderWidth: 2,
          data: [0, 0, 0],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
    },
  });
}

function updateChart() {
  if (!chart || results.length === 0) return;

  const avgs = ['math', 'science', 'english'].map((sub) => {
    return (results.reduce((sum, r) => sum + r[sub], 0) / results.length).toFixed(2);
  });

  chart.data.datasets[0].data = avgs;
  chart.update();
}

// -- Export/Print --
document.getElementById('printBtn').addEventListener('click', () => {
  if (results.length === 0) {
    alert('⚠️ No data to export!');
    return;
  }

  // Create CSV
  let csv = 'Name,Math,Science,English,Total,Average,Status\n';
  results.forEach((r) => {
    const status = (r.math >= 40 && r.science >= 40 && r.english >= 40) ? 'Pass' : 'Fail';
    csv += `${r.name},${r.math},${r.science},${r.english},${r.total},${r.average},${status}\n`;
  });

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `student_results_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert('✅ Data exported as CSV!');
});

// -- Clear All Data --
document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (results.length === 0) {
    alert('⚠️ No data to clear!');
    return;
  }

  if (confirm('⚠️ Are you sure? This will delete ALL student results. This action cannot be undone!')) {
    results = [];
    saveResults();
    renderTable();
    alert('✅ All data cleared!');
  }
});