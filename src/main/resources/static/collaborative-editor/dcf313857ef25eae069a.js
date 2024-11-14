import"bootstrap/dist/css/bootstrap.min.css";import"./style.css";document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("create-project-form"),t=document.getElementById("rename-project-form"),n=document.getElementById("delete-project-form"),o=document.getElementById("projects-list"),r="/api/projects";async function a(){try{const t=await fetch(r,{method:"GET",headers:{"Content-Type":"application/json"},credentials:"include"});t.ok?(e=await t.json(),o.innerHTML="",0!==e.length?e.forEach((e=>{const t=document.createElement("div");t.className="list-group-item list-group-item-action d-flex justify-content-between align-items-center",t.innerHTML=`\n                <div>\n                    <h5 class="mb-1">${e.name}</h5>\n                    <p class="mb-1">${e.description||"No description provided."}</p>\n                </div>\n                <div class="action-btns">\n                    <button class="btn btn-primary btn-sm me-2" onclick="viewProject(${e.id})">View</button>\n                    <button class="btn btn-secondary btn-sm me-2" onclick="openRenameModal(${e.id}, '${e.name.replace(/'/g,"\\'")}', '${(e.description||"").replace(/'/g,"\\'")}')">Rename</button>\n                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${e.id}, '${e.name.replace(/'/g,"\\'")}')">Delete</button>\n                </div>\n            `,o.appendChild(t)})):o.innerHTML="<p>No projects found. Create a new project to get started.</p>"):console.error("Failed to fetch projects.")}catch(e){console.error("Error fetching projects:",e)}var e}a(),e.addEventListener("submit",(async t=>{t.preventDefault();const n=document.getElementById("new-project-name").value.trim(),o=document.getElementById("new-project-description").value.trim();if(n)try{const t=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:n,description:o})});if(!t.ok){const e=await t.text();throw new Error(e||"Failed to create project.")}await t.json(),alert("Project created successfully!"),e.reset(),a(),bootstrap.Modal.getInstance(document.getElementById("createProjectModal")).hide()}catch(e){console.error("Error creating project:",e),alert(`Error: ${e.message}`)}else alert("Project name is required.")})),t.addEventListener("submit",(async e=>{e.preventDefault();const n=document.getElementById("rename-project-id").value,o=document.getElementById("rename-project-name").value.trim(),c=document.getElementById("rename-project-description").value.trim();if(o)try{const e=await fetch(`${r}/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({name:o,description:c})});if(!e.ok){const t=await e.text();throw new Error(t||"Failed to rename project.")}await e.json(),alert("Project renamed successfully!"),t.reset(),a(),bootstrap.Modal.getInstance(document.getElementById("renameProjectModal")).hide()}catch(e){console.error("Error renaming project:",e),alert(`Error: ${e.message}`)}else alert("New project name is required.")})),n.addEventListener("submit",(async e=>{e.preventDefault();const t=document.getElementById("delete-project-id").value;try{const e=await fetch(`${r}/${t}`,{method:"DELETE",headers:{"Content-Type":"application/json"},credentials:"include"});if(!e.ok){const t=await e.text();throw new Error(t||"Failed to delete project.")}alert("Project deleted successfully!"),n.reset(),a(),bootstrap.Modal.getInstance(document.getElementById("deleteProjectModal")).hide()}catch(e){console.error("Error deleting project:",e),alert(`Error: ${e.message}`)}})),window.openRenameModal=(e,t,n)=>{document.getElementById("rename-project-id").value=e,document.getElementById("rename-project-name").value=t,document.getElementById("rename-project-description").value=n,new bootstrap.Modal(document.getElementById("renameProjectModal")).show()},window.openDeleteModal=(e,t)=>{document.getElementById("delete-project-id").value=e,document.getElementById("delete-project-name").innerText=t,new bootstrap.Modal(document.getElementById("deleteProjectModal")).show()},window.viewProject=e=>{window.location.href=`/projects/${e}`}}));