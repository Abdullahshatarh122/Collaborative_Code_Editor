// scripts.js

window.projects = [];
let currentRenameIndex = null;

const openProjectsButton = document.getElementById('openProjectsButton');
const projectsPanel = document.getElementById('projectsPanel');
const projectsList = document.getElementById('projectsList');
const branchesList = document.getElementById('branchesList');

const createProjectButton = document.getElementById('createProjectButton');

const renameModal = document.getElementById('renameModal');
const renameProjectInput = document.getElementById('renameProjectInput');
const renameProjectConfirm = document.getElementById('renameProjectConfirm');
const closeRenameProjectModal = document.getElementById('closeRenameModal');


const createProjectModal = document.getElementById('createProjectModal');
const newProjectNameInput = document.getElementById('newProjectNameInput');
const newProjectLanguageSelect = document.getElementById('newProjectLanguageSelect');
const createProjectConfirm = document.getElementById('createProjectConfirm');
const closeCreateProjectModal = document.getElementById('closeCreateProjectModal');

document.addEventListener('DOMContentLoaded', function () {
    const closeProjectsPanelButton = document.getElementById('closeProjectsPanel');

    openProjectsButton.addEventListener('click', function () {
        projectsPanel.style.display = 'block';
        loadProjects();
    });

    closeProjectsPanelButton.addEventListener('click', function () {
        projectsPanel.style.display = 'none';
    });

    closeCreateProjectModal.addEventListener('click', () => {
        createProjectModal.style.display = 'none';
    });
    closeRenameProjectModal.addEventListener('click', () => {
        renameModal.style.display = 'none';
    });
});

window.loadProjects = function () {
    fetch(`/api/projects/userProjects`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            projects = data;
            renderProjects();
        })
        .catch(error => console.error('Error loading projects:', error));
}


function renderProjects() {
    projectsList.innerHTML = '';
    branchesList.innerHTML = '';
    projects.forEach((project, index) => {
        const li = document.createElement('li');
        let fullProjectName = project.name;
        if (project.language === "java") {
            fullProjectName += ".java";
        } else if (project.language === "python") {
            fullProjectName += ".py";
        }
        li.innerHTML = `
            <a href="#" onclick="openProjectInIDE(${index})">${fullProjectName}</a> 
            <div>
                <button onclick="renameProject(${index})">Rename</button>
                <button onclick="deleteProject(${index})">Delete</button>
            </div>
        `;
        if(project.isBranch){
            branchesList.appendChild(li);
        }
        else {
            projectsList.appendChild(li);
        }
    });
}

createProjectButton.addEventListener('click', () => {
    createProjectModal.style.display = 'flex';
});

createProjectConfirm.addEventListener('click', () => {
    const newProjectName = newProjectNameInput.value;
    const selectedLanguage = newProjectLanguageSelect.value;

    if (newProjectName) {
        fetch('/api/projects/createNewProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newProjectName, language: selectedLanguage
            })
        })
            .then(response => response.json())
            .then(project => {
                projects.push(project);
                loadProjects();
                createProjectModal.style.display = 'none';
            })
            .catch(error => console.error('Error creating project:', error));
    } else {
        alert("Please provide the project name.");
    }
});




window.renameProject = (index) => {
    currentRenameIndex = index;
    renameProjectInput.value = projects[index].name;
    renameModal.style.display = 'flex';
};

renameProjectConfirm.addEventListener('click', () => {
    const newName = renameProjectInput.value;
    if (newName) {
        const projectId = projects[currentRenameIndex].id;
        fetch(`/api/projects/rename/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newName })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json()
                        .then(errorData => {
                            throw new Error(errorData.message);
                        });
                }
                renameModal.style.display = 'none';
                loadProjects();
                return response.json();
            })

            .catch(error => {
                console.error('Error renaming project:', error);
            });
    }
});

deleteProject = (index) => {
    if (confirm('Are you sure you want to delete this project?')) {
        const projectId = projects[index].id;
        fetch(`/api/projects/delete/${projectId}`, {
            method: 'DELETE'
        })
            .then(() => {
                projects.splice(index, 1);
                renderProjects();
            })
            .catch(error => console.error('Error deleting project:', error));
    }
};
