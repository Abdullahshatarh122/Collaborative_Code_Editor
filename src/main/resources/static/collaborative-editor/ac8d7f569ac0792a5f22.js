let projects=[],currentRenameIndex=null;const openProjectsButton=document.getElementById("openProjectsButton"),projectsPanel=document.getElementById("projectsPanel"),projectsList=document.getElementById("projectsList"),createProjectButton=document.getElementById("createProjectButton"),renameModal=document.getElementById("renameModal"),renameProjectInput=document.getElementById("renameProjectInput"),renameProjectConfirm=document.getElementById("renameProjectConfirm"),createProjectModal=document.getElementById("createProjectModal"),newProjectNameInput=document.getElementById("newProjectNameInput"),newProjectLanguageSelect=document.getElementById("newProjectLanguageSelect"),createProjectConfirm=document.getElementById("createProjectConfirm"),closeCreateProjectModal=document.getElementById("closeCreateProjectModal");function loadProjects(){fetch("/api/projects/userProjects").then((e=>{if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return e.json()})).then((e=>{projects=e,renderProjects()})).catch((e=>console.error("Error loading projects:",e)))}function renderProjects(){projectsList.innerHTML="",projects.forEach(((e,t)=>{const n=document.createElement("li");let o=e.name;"java"===e.language?o+=".java":"python"===e.language&&(o+=".py"),n.innerHTML=`\n            <span>${o}</span>\n            <div>\n                <button onclick="renameProject(${t})">Rename</button>\n                <button onclick="deleteProject(${t})">Delete</button>\n            </div>\n        `,projectsList.appendChild(n)}))}document.addEventListener("DOMContentLoaded",(function(){const e=document.getElementById("closeProjectsPanel");openProjectsButton.addEventListener("click",(function(){projectsPanel.style.display="block",loadProjects()})),e.addEventListener("click",(function(){projectsPanel.style.display="none"})),closeCreateProjectModal.addEventListener("click",(()=>{createProjectModal.style.display="none"}))})),createProjectButton.addEventListener("click",(()=>{createProjectModal.style.display="block"})),createProjectConfirm.addEventListener("click",(()=>{const e=newProjectNameInput.value,t=newProjectLanguageSelect.value;e&&t?fetch("/api/projects/createNewProject",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,language:t})}).then((e=>e.json())).then((e=>{projects.push(e),renderProjects(),createProjectModal.style.display="none"})).catch((e=>console.error("Error creating project:",e))):alert("Please provide both project name and language.")})),window.renameProject=e=>{currentRenameIndex=e,renameProjectInput.value=projects[e].name,renameModal.style.display="flex"},renameProjectConfirm.addEventListener("click",(()=>{const e=renameProjectInput.value;if(e){const t=projects[currentRenameIndex].name;fetch(`/api/projects/rename/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then((e=>e.json())).then((e=>{projects[currentRenameIndex].name=e.name,renderProjects(),renameModal.style.display="none"})).catch((e=>console.error("Error renaming project:",e)))}})),window.deleteProject=e=>{if(confirm("Are you sure you want to delete this project?")){const t=projects[e].id;fetch(`/api/projects/delete/${t}`,{method:"DELETE"}).then((()=>{projects.splice(e,1),renderProjects()})).catch((e=>console.error("Error deleting project:",e)))}};