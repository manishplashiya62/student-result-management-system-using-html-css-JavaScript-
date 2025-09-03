// -- Login --
const loginDiv = document.getElementById('loginPage'), mainApp = document.getElementById('mainApp');
const loginBtn = document.getElementById('loginBtn'), loginErr = document.getElementById('loginError');
loginBtn.addEventListener('click', () => {
  if (loginUser.value==='admin' && loginPass.value==='password') {
    loginDiv.classList.add('hidden'); mainApp.classList.remove('hidden');
    loadResults(); updateChart();
  } else loginErr.textContent = 'Invalid credentials!';
});

// -- CRUD & localStorage --
let results = [];

function loadResults(){
  results = JSON.parse(localStorage.getItem('results') || '[]');
  renderTable();
}

function saveResults(){
  localStorage.setItem('results', JSON.stringify(results));
}

function renderTable(){
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  results.forEach((r,i) => {
    const tr = document.createElement('tr');
    const status = (r.math>=40 && r.science>=40 && r.english>=40)?'Pass':'Fail';
    tr.innerHTML = `
      <td>${r.name}</td><td>${r.math}</td><td>${r.science}</td><td>${r.english}</td>
      <td>${r.total}</td><td>${r.average}</td>
      <td class="${status==='Pass'?'status-pass':'status-fail'}">${status}</td>
      <td>
        <button onclick="editEntry(${i})">✏️</button>
        <button onclick="deleteEntry(${i})">❌</button>
      </td>`;
    tbody.appendChild(tr);
  });
  updateChart();
}

function editEntry(i){
  const r = results[i];
  document.getElementById('editId').value = i;
  ['studentName','math','science','english'].forEach(id => document.getElementById(id).value = r[id]);
  document.getElementById('addBtn').textContent = 'Update';
  document.getElementById('cancelEdit').classList.remove('hidden');
}

function deleteEntry(i){
  if(confirm('Delete?')) { results.splice(i,1); saveResults(); renderTable(); }
}

// -- Add / Update --
document.getElementById('cancelEdit').addEventListener('click', () => {
  resetForm();
});

document.getElementById('resultForm').addEventListener('submit', e => {
  e.preventDefault();
  const i = document.getElementById('editId').value;
  const name = studentName.value.trim();
  const math = +mathInput.value, science = +scienceInput.value, english = +englishInput.value;
  const total = math + science + english;
  const avg = (total/3).toFixed(2);
  const entry = { name, math, science, english, total, average: avg };

  if (i==='') results.push(entry);
  else results[i] = entry;

  saveResults(); renderTable(); resetForm();
});

function resetForm(){
  resultForm.reset(); editId.value = ''; addBtn.textContent = 'Add Result';
  cancelEdit.classList.add('hidden');
}

// -- Charts using Chart.js --
const ctx = document.getElementById('performanceChart').getContext('2d');
let chart = new Chart(ctx, {
  type: 'bar',
  data: { labels: ['Math','Science','English'], datasets: [{ label:'Average Score', backgroundColor:['#007bff','#28a745','#dc3545'], data:[0,0,0] }] },
  options: { scales: { y:{beginAtZero:true, max:100} } }
});

function updateChart(){
  if (results.length===0) return;
  const avgs = ['math','science','english'].map(sub => {
    return (results.reduce((s,r)=>(s+r[sub]),0)/results.length).toFixed(2);
  });
  chart.data.datasets[0].data = avgs;
  chart.update();
}

// -- Print/Export --
printBtn.addEventListener('click', () => window.print());
