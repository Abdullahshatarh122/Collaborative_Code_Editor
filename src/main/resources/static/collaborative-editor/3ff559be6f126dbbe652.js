import"bootstrap/dist/css/bootstrap.min.css";import"./style.css";import $ from"jquery";import SockJS from"sockjs-client";import{Stomp}from"@stomp/stompjs";import*as Y from"yjs";import{WebsocketProvider}from"y-websocket";import{MonacoBinding}from"y-monaco";import*as monaco from"monaco-editor";import{Terminal}from"xterm";import"xterm/css/xterm.css";import{port}from"sockjs-client/lib/location";const ydoc=new Y.Doc;let collabId;const provider=new WebsocketProvider("ws://localhost:1234",collabId,ydoc),yText=ydoc.getText("monaco"),editor=monaco.editor.create(document.getElementById("editor"),{value:"",language:"java",theme:"vs-dark",automaticLayout:!0}),awareness=provider.awareness,initialState={username:`User-${Math.floor(1e3*Math.random())}`,color:`#${Math.floor(16777215*Math.random()).toString(16)}`,cursor:{x:0,y:0}};function setupLanguageFeatures(e){"java"===e?setupJavaLanguageFeatures():"python"===e&&setupPythonLanguageFeatures()}function setupJavaLanguageFeatures(){monaco.languages.registerCompletionItemProvider("java",{provideCompletionItems:()=>({suggestions:[{label:"System.out.println",kind:monaco.languages.CompletionItemKind.Snippet,insertText:"System.out.println(${1});",insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:"Print a message to the console"}]})}),monaco.editor.setModelMarkers(editor.getModel(),"java",[{startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:2,message:"Warning: Code might be incomplete",severity:monaco.MarkerSeverity.Warning}])}function setupPythonLanguageFeatures(){monaco.languages.registerCompletionItemProvider("python",{provideCompletionItems:()=>({suggestions:[{label:"print",kind:monaco.languages.CompletionItemKind.Snippet,insertText:"print(${1})",insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,documentation:"Print a message to the console"}]})}),monaco.editor.setModelMarkers(editor.getModel(),"python",[{startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:2,message:"Warning: Code might be incomplete",severity:monaco.MarkerSeverity.Warning}])}awareness.setLocalState(initialState),editor.onDidChangeCursorPosition((e=>{const o={x:e.position.column,y:e.position.lineNumber};awareness.setLocalStateField("cursor",o)})),awareness.on("update",(()=>{awareness.getStates().forEach(((e,o)=>{if(e.cursor){const{username:t,color:r,cursor:n}=e;showCursor(o,n,t,r)}else removeCursor(o)}))}));let currentProject={id:null,language:null,isBranch:null,ownerEmail:null,name:null};function commitChanges(){const e={projectId:currentProject.id,code:editor.getValue()};fetch("/api/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then((e=>e.json())).then((e=>{e.success?alert("Changes have been committed successfully."):alert("Failed to commit changes. Please try again.")})).catch((e=>{console.error("Error while committing changes:",e),alert("An error occurred while committing changes.")}))}function createRoomUser(e){e?fetch(`/api/rooms/createRoomUser?roomId=${e}`,{method:"POST"}).then((e=>{if(!e.ok)return e.json().catch((()=>{throw new Error("Error while creating room user")}))})).then((e=>{console.log("Room user created successfully:",e)})).catch((e=>{console.error("Failed to create room user:",e),alert(`Error: ${e.message}`)})):console.error("roomId is required")}function fetchRoomDetails(e){fetch(`/api/rooms/${e}`).then((e=>e.json())).then((o=>{const t=o.isOwner,r=document.createElement("button");r.innerText="View Users",r.onclick=()=>fetchUsersInRoom(e,t),document.getElementById("user-list-container").appendChild(r)}))}function fetchUsersInRoom(e,o){fetch(`/api/rooms/${e}/users`).then((e=>e.json())).then((e=>{const t=document.getElementById("user-list");t.innerHTML="",e.forEach((e=>{const r=document.createElement("li");r.innerHTML=`\n                    ${e.name} (${e.userEmail}) - <span>${e.role}</span>\n                `,!0===o&&(r.innerHTML+=`\n                        <button onclick="assignRole('${e.userId}', 'editor', '${e.roomId}')">Make Editor</button>\n                        <button onclick="assignRole('${e.userId}', 'viewer', '${e.roomId}')">Make Viewer</button>\n                    `),t.appendChild(r)}))}))}function openRoomInIDE(e){fetchRoomDetails(e),fetch(`/api/rooms/openRoom/${e}`).then((e=>{if(e.ok)return e.json();throw new Error("Failed to open room!")})).then((e=>{if(!e.projectId)throw new Error("No project in this room.");currentProject.id=e.projectId,currentProject.language=e.language,editor.setValue(e.code),monaco.editor.setModelLanguage(editor.getModel(),e.language)})).catch((e=>{console.error("Error opening room :",e),alert("Unable to join the room: "+e.message)}))}window.openProjectInIDE=function(e){currentProject=projects[e],fetch(`/api/projects/openProject/${currentProject.id}`).then((e=>e.text())).then((e=>{setupLanguageFeatures(currentProject.language),editor.setValue(e),monaco.editor.setModelLanguage(editor.getModel(),currentProject.language)})).catch((e=>console.error("Error loading project code:",e)))},document.getElementById("commitButton").addEventListener("click",(function(){confirm("Are you sure you want to commit your changes?")&&commitChanges()})),document.getElementById("createRoomBtn").addEventListener("click",(function(){fetch(`/api/rooms/createRoom?projectId=${currentProject.id}`,{method:"POST"}).then((e=>e.json())).then((e=>{alert("Room created with room ID : "+e.roomId),collabId=e.roomId,fetchRoomDetails(e.roomId)}))})),document.getElementById("joinRoomBtn").addEventListener("click",(async function(){const e=document.getElementById("roomIdInput").value.trim();if(e)try{const o=await fetch(`/api/rooms/joinRoom?roomId=${e}`,{method:"POST"});if(o.ok)collabId=e,await createRoomUser(e),openRoomInIDE(e);else if(404===o.status)alert("Room not found!");else{const e=await o.text();console.error("Error:",e),alert("Failed to join room. Please try again.")}}catch(e){console.error("Network or server error:",e),alert("A network error occurred. Please check your connection and try again.")}else alert("Please enter a valid Room ID.")})),window.assignRole=function(e,o,t){console.log("roomId from assignRole: "+t),fetch(`/api/rooms/assignRole?userId=${e}&role=${o}&roomId=${t}`,{method:"POST",headers:{"Content-Type":"application/json"}}).then((e=>{e.ok?fetchUsersInRoom(t,!0):alert("Error assigning role")})).catch((e=>{console.error("Error:",e)}))},document.getElementById("branchBtn").addEventListener("click",(function(){const e=prompt("Enter the branch name:");fetch(`/api/branches/create?projectId=${currentProject.id}&branchName=${e}`,{method:"POST",headers:{"Content-Type":"application/json"}}).then((o=>{if(!o.ok)throw new Error("Failed to create branch.");alert(`Branch ${e} created successfully!`),loadProjects()})).catch((e=>{console.error("Error creating branch:",e),alert("Error: "+e.message)}))}));const terminal=new Terminal({cursorBlink:!0,rows:18});terminal.open(document.getElementById("terminal-container")),terminal.write("Connected to the terminal.\r\n");const socket=new SockJS("/ws-console"),stompClient=Stomp.over(socket);stompClient.connect({},(function(e){stompClient.subscribe("/topic/terminal",(function(e){const o=JSON.parse(e.body);console.log("Received message: ",o),o.output&&terminal.write(o.output+"\r\n"),o.error&&terminal.write("Error: "+o.error+"\r\n")}))})),document.getElementById("runBtn").addEventListener("click",(function(){const e=editor.getValue();terminal.reset();const o={language:currentProject.language,code:e,input:"",name:currentProject.name};stompClient.send("/app/executeCode",{},JSON.stringify(o))}));let inputBuffer="";terminal.onData((function(e){if(terminal.write(e),inputBuffer+=e,e.includes("\r")||e.includes("\n")){let e=inputBuffer.trim();terminal.write("\r\n"),stompClient.send("/app/input",{},e),inputBuffer=""}}));