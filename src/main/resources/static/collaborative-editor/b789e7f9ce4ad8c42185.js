import"bootstrap/dist/css/bootstrap.min.css";import"./style.css";import $ from"jquery";import SockJS from"sockjs-client";import{Stomp}from"@stomp/stompjs";import*as Y from"yjs";import{WebsocketProvider}from"y-websocket";import{MonacoBinding}from"y-monaco";import*as monaco from"monaco-editor";import{Terminal}from"xterm";import"xterm/css/xterm.css";import{port}from"sockjs-client/lib/location";const ydoc=new Y.Doc,provider=new WebsocketProvider("ws://localhost:1234","code-editor",ydoc),yText=ydoc.getText("monaco"),editor=monaco.editor.create(document.getElementById("editor"),{value:"",language:"java",theme:"vs-dark",automaticLayout:!0}),monacoBinding=new MonacoBinding(yText,editor.getModel(),new Set([editor]),provider.awareness);function setupLanguageFeatures(e){"java"===e?setupJavaLanguageFeatures():"python"===e&&setupPythonLanguageFeatures()}function setupJavaLanguageFeatures(){monaco.languages.registerCompletionItemProvider("java",{provideCompletionItems:()=>({suggestions:[{label:"System.out.println",kind:monaco.languages.CompletionItemKind.Snippet,insertText:"System.out.println(${1});",insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:"Print a message to the console"}]})}),monaco.editor.setModelMarkers(editor.getModel(),"java",[{startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:2,message:"Warning: Code might be incomplete",severity:monaco.MarkerSeverity.Warning}])}function setupPythonLanguageFeatures(){monaco.languages.registerCompletionItemProvider("python",{provideCompletionItems:()=>({suggestions:[{label:"print",kind:monaco.languages.CompletionItemKind.Snippet,insertText:"print(${1})",insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:"Print a message to the console"}]})}),monaco.editor.setModelMarkers(editor.getModel(),"python",[{startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:2,message:"Warning: Code might be incomplete",severity:monaco.MarkerSeverity.Warning}])}let currentProject=null;function commitChanges(){const e={projectId:currentProject.id,code:editor.getValue()};fetch("/api/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then((e=>e.json())).then((e=>{e.success?alert("Changes have been committed successfully."):alert("Failed to commit changes. Please try again.")})).catch((e=>{console.error("Error while committing changes:",e),alert("An error occurred while committing changes.")}))}function fetchRoomDetails(e){fetch(`/api/rooms/${e}`).then((e=>e.json())).then((t=>{const o=t.isOwner,n=document.createElement("button");n.innerText="View Users",n.onclick=()=>fetchUsersInRoom(e,o),document.getElementById("user-list-container").appendChild(n)}))}function fetchUsersInRoom(e,t){fetch(`/api/rooms/${e}/users`).then((e=>e.json())).then((e=>{const o=document.getElementById("user-list");o.innerHTML="",e.forEach((e=>{const n=document.createElement("li");n.innerHTML=`\n                    ${e.name} (${e.userEmail}) - <span>${e.role}</span>\n                `,!0===t&&(n.innerHTML+=`\n                        <button onclick="assignRole('${e.userId}', 'editor', roomId)">Make Editor</button>\n                        <button onclick="assignRole('${e.userId}', 'viewer', roomId)">Make Viewer</button>\n                    `),o.appendChild(n)}))}))}function createRoomUser(e){e?fetch("/api/rooms/createRoomUser",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then((e=>e.ok?e.json():e.json().then((e=>{throw new Error(e.message||"Error while creating room user")})))).then((e=>{console.log("Room user created successfully:",e)})).catch((e=>{console.error("Failed to create room user:",e),alert(`Error: ${e.message}`)})):console.error("roomId is required")}function assignRole(e,t,o){fetch("/api/rooms/assignRole",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e,role:t,roomId:o})}).then((e=>{e.ok?fetchUsersInRoom(o,!0):alert("Error assigning role")}))}function openRoomInIDE(e){fetchRoomDetails(e),fetch(`/api/rooms/openRoom/${e}`).then((e=>{if(e.ok)return e.json();throw new Error("Failed to open room. Invalid room ID or project not found.")})).then((e=>{if(!e.projectId)throw new Error("No project in this room.");editor.setValue(e.code),monaco.editor.setModelLanguage(editor.getModel(),e.language),provider.connect(),e.isGuest&&showMakeBranchButton()})).catch((e=>{console.error("Error opening room :",e),alert("Unable to join the room: "+e.message)}))}function showMakeBranchButton(){const e=document.createElement("button");e.innerText="Make Branch",e.classList.add("btn","btn-primary"),e.addEventListener("click",(()=>{const e=prompt("Enter the branch name:");e?createBranch(e):alert("Please enter a branch name.")})),document.getElementById("button-container").appendChild(e)}function createBranch(e){fetch("/api/branches/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId,branchName:e})}).then((t=>{if(!t.ok)throw new Error("Failed to create branch.");alert(`Branch ${e} created successfully!`)})).catch((e=>{console.error("Error creating branch:",e),alert("Error: "+e.message)}))}window.openProjectInIDE=function(e){currentProject=projects[e],fetch(`/api/projects/openProject/${currentProject.id}`).then((e=>e.text())).then((e=>{setupLanguageFeatures(currentProject.language),editor.setValue(e),monaco.editor.setModelLanguage(editor.getModel(),currentProject.language)})).catch((e=>console.error("Error loading project code:",e)))},document.getElementById("commitButton").addEventListener("click",(function(){confirm("Are you sure you want to commit your changes?")&&commitChanges()})),document.getElementById("createRoomBtn").addEventListener("click",(function(){fetch(`/api/rooms/createRoom?projectId=${currentProject.id}`,{method:"POST"}).then((e=>e.json())).then((e=>{alert("Room created with room ID : "+e.roomId),fetchRoomDetails(e.roomId)}))})),document.getElementById("joinRoomBtn").addEventListener("click",(function(){const e=document.getElementById("roomIdInput").value;e?(createRoomUser(e),openRoomInIDE(e)):alert("Please enter a room ID.")}));const terminal=new Terminal({cursorBlink:!0,rows:18});terminal.open(document.getElementById("terminal-container")),terminal.write("Connected to the terminal.\r\n");const socket=new SockJS("/ws-console"),stompClient=Stomp.over(socket);stompClient.connect({},(function(e){stompClient.subscribe("/topic/terminal",(function(e){const t=JSON.parse(e.body);console.log("Received message: ",t),t.output&&terminal.write(t.output+"\r\n"),t.error&&terminal.write("Error: "+t.error+"\r\n")}))})),document.getElementById("runBtn").addEventListener("click",(function(){const e=editor.getValue();terminal.reset();const t={language:currentProject.language,code:e,input:"",name:currentProject.name};stompClient.send("/app/executeCode",{},JSON.stringify(t))}));let inputBuffer="";terminal.onData((function(e){if(terminal.write(e),inputBuffer+=e,e.includes("\r")||e.includes("\n")){let e=inputBuffer.trim();terminal.write("\r\n"),stompClient.send("/app/input",{},e),inputBuffer=""}}));