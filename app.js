const API_URL = 'http://localhost:3000/jobs';
let allJobs = []; // Stores jobs globally so we can edit them
let editingJobId = null; // Tracks if we are adding or editing

// Fetch and display jobs
async function loadJobs() {
    const response = await fetch(API_URL);
    allJobs = await response.json(); 
    
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = ''; 

    allJobs.forEach(job => {
        const date = new Date(job.date_applied).toLocaleDateString();
        const statusClass = `status-${job.application_status.toLowerCase()}`;
        
        const row = `
            <tr>
                <td>${job.company_name}</td>
                <td>${job.job_title}</td>
                <td><span class="status-badge ${statusClass}">${job.application_status}</span></td>
                <td>${date}</td>
                <td>
                    <button type="button" class="action-btn edit-btn" onclick="prepareEdit(${job.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="action-btn delete-btn" onclick="deleteJob(${job.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Function to put job data back into the form for editing
function prepareEdit(id) {
    const job = allJobs.find(j => j.id === id);
    if(!job) return;

    // Fill form with current data
    document.getElementById('company').value = job.company_name;
    document.getElementById('title').value = job.job_title;
    document.getElementById('status').value = job.application_status;
    
    // Set edit mode
    editingJobId = id;
    
    // Change submit button to look like an update button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Job';
    submitBtn.style.backgroundColor = '#23a6d5'; 
}

// Function to delete a job
async function deleteJob(id) {
    if(confirm('Are you sure you want to delete this job?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadJobs(); // Refresh table
    }
}

// Handle form submission (Both Add and Update)
document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const jobData = {
        company_name: document.getElementById('company').value,
        job_title: document.getElementById('title').value,
        application_status: document.getElementById('status').value
    };

    if (editingJobId) {
        // We are EDITING an existing job
        await fetch(`${API_URL}/${editingJobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        
        // Reset the button back to "Add Mode"
        editingJobId = null;
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Job';
        submitBtn.style.backgroundColor = ''; // Removes inline color to let CSS take over
    } else {
        // We are ADDING a new job
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
    }

    // Clear form and reload table
    document.getElementById('company').value = '';
    document.getElementById('title').value = '';
    document.getElementById('status').value = 'Applied';
    loadJobs();
});

// Load jobs on startup
loadJobs();