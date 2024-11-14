import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const ydoc = new Y.Doc();

let collabId;

const provider = new WebsocketProvider('ws://localhost:1234', collabId, ydoc);

const yText = ydoc.getText('monaco');

const editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'java',
    theme: 'vs-dark',
    automaticLayout: true
});

const monacoBinding = new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness);

function setupLanguageFeatures(language) {
    if (language === 'java') {
        setupJavaLanguageFeatures();
    } else if (language === 'python') {
        setupPythonLanguageFeatures();
    }
}

function setupJavaLanguageFeatures() {
    monaco.languages.registerCompletionItemProvider('java', {
        provideCompletionItems: () => {
            const suggestions = [
                {
                    label: 'System.out.println',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'System.out.println(${1});',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Print a message to the console'
                }
            ];
            return { suggestions: suggestions };
        }
    });

    monaco.editor.setModelMarkers(editor.getModel(), 'java', [
        {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 2,
            message: "Warning: Code might be incomplete",
            severity: monaco.MarkerSeverity.Warning
        }
    ]);
}

function setupPythonLanguageFeatures() {
    monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: () => {
            const suggestions = [
                {
                    label: 'print',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'print(${1})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Print a message to the console'
                }
            ];
            return { suggestions: suggestions };
        }
    });

    monaco.editor.setModelMarkers(editor.getModel(), 'python', [
        {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 2,
            message: "Warning: Code might be incomplete",
            severity: monaco.MarkerSeverity.Warning
        }
    ]);
}

let currentProject = {
    id : null,
    language : null,
    isBranch : null,
    ownerEmail : null,
    name : null
}

window.openProjectInIDE = function(index) {
    currentProject = projects[index];
    fetch(`/api/projects/openProject/${currentProject.id}`)
        .then(response => response.text())
        .then(code => {
            setupLanguageFeatures(currentProject.language);
            editor.setValue(code);
            monaco.editor.setModelLanguage(editor.getModel(), currentProject.language);
        })
        .catch(error => console.error('Error loading project code:', error));
};

document.getElementById('commitButton').addEventListener('click', function() {
    const userConfirmed = confirm("Are you sure you want to commit your changes?");
    if (userConfirmed) {
        commitChanges();
    }
});
function commitChanges() {

    const commitInfo = {
        projectId: currentProject.id,
        code: editor.getValue()
    };

    fetch('/api/commit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitInfo)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Changes have been committed successfully.");
            } else {
                alert("Failed to commit changes. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error while committing changes:", error);
            alert("An error occurred while committing changes.");
        });
}

document.getElementById('createRoomBtn').addEventListener('click', function() {
    fetch(`/api/rooms/createRoom?projectId=${currentProject.id}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert('Room created with room ID : ' + data.roomId);
            collabId = data.roomId;
            fetchRoomDetails(data.roomId);
        });
});

document.getElementById('joinRoomBtn').addEventListener('click', async function() {
    const roomId = document.getElementById('roomIdInput').value.trim();
    if (!roomId) {
        alert('Please enter a valid Room ID.');
        return;
    }
    try {
        const response = await fetch(`/api/rooms/joinRoom?roomId=${roomId}`, {
            method: 'POST'
        });

        if (response.ok) {
            collabId = roomId;
            await createRoomUser(roomId);
            openRoomInIDE(roomId);
        } else if (response.status === 404) {
            alert('Room not found!');
        } else {
            const errorText = await response.text();
            console.error("Error:", errorText);
            alert('Failed to join room. Please try again.');
        }
    } catch (error) {
        console.error("Network or server error:", error);
        alert('A network error occurred. Please check your connection and try again.');
    }
});



function createRoomUser(roomId) {
    if (!roomId) {
        console.error('roomId is required');
        return;
    }

    fetch(`/api/rooms/createRoomUser?roomId=${roomId}`, {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().catch(() => {
                    throw new Error('Error while creating room user') });
            }
        })
        .then(data => {
            console.log('Room user created successfully:', data);
        })
        .catch(error => {
            console.error('Failed to create room user:', error);
            alert(`Error: ${error.message}`);
        });
}

function fetchRoomDetails(roomId) {
    fetch(`/api/rooms/${roomId}`)
        .then(response => response.json())
        .then(data => {
            const isOwner = data.isOwner;
            const viewUsersButton = document.createElement('button');
            viewUsersButton.innerText = 'View Users';
            viewUsersButton.onclick = () => fetchUsersInRoom(roomId,isOwner);
            document.getElementById('user-list-container').appendChild(viewUsersButton);
        });
}
function fetchUsersInRoom(roomId, isOwner) {
    fetch(`/api/rooms/${roomId}/users`)
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';
            users.forEach(user => {
                const user_Item = document.createElement('li');
                user_Item.innerHTML = `
                    ${user.name} (${user.userEmail}) - <span>${user.role}</span>
                `;
                if (isOwner === true) {
                    user_Item.innerHTML += `
                        <button onclick="assignRole('${user.userId}', 'editor', '${user.roomId}')">Make Editor</button>
                        <button onclick="assignRole('${user.userId}', 'viewer', '${user.roomId}')">Make Viewer</button>
                    `;
                }
                userList.appendChild(user_Item);
            });
        });
}

window.assignRole = function(userId, role, roomId) {
    console.log('roomId from assignRole: ' + roomId);
    fetch(`/api/rooms/assignRole?userId=${userId}&role=${role}&roomId=${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        if (response.ok) {
            fetchUsersInRoom(roomId, true);
        } else {
            alert('Error assigning role');
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function openRoomInIDE(roomId) {

    fetchRoomDetails(roomId);
    fetch(`/api/rooms/openRoom/${roomId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to open room!');
            }
        })
        .then(roomData => {
            if (roomData.projectId) {
                currentProject.id = roomData.projectId;
                currentProject.language = roomData.language;
                editor.setValue(roomData.code);
                monaco.editor.setModelLanguage(editor.getModel(), roomData.language);
            } else {
                throw new Error('No project in this room.');
            }
        })
        .catch(error => {
            console.error('Error opening room :', error);
            alert('Unable to join the room: ' + error.message);
        });
}

document.getElementById('branchBtn').addEventListener('click', function() {
    const branchName = prompt("Enter the branch name:");
    fetch(`/api/branches/create?projectId=${currentProject.id}&branchName=${branchName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                alert(`Branch ${branchName} created successfully!`);
                loadProjects();
            } else {
                throw new Error('Failed to create branch.');
            }
        })
        .catch(error => {
            console.error('Error creating branch:', error);
            alert('Error: ' + error.message);
        });
});
const terminal = new Terminal({
    cursorBlink: true,
    rows: 18,
});

terminal.open(document.getElementById('terminal-container'));
terminal.write('Connected to the terminal.\r\n');

const socket = new SockJS('/ws-console');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    stompClient.subscribe('/topic/terminal', function(message) {
        const response = JSON.parse(message.body);
        console.log("Received message: ", response);
        if (response.output) {
            terminal.write(response.output + '\r\n');
        }
        if (response.error) {
            terminal.write('Error: ' + response.error + '\r\n');
        }
    });
});


document.getElementById('runBtn').addEventListener('click', function() {
    const code = editor.getValue();
    terminal.reset();

    const codeRequest = {
        language: currentProject.language,
        code: code,
        input: "",
        name: currentProject.name
    };
    stompClient.send("/app/executeCode", {}, JSON.stringify(codeRequest));
});
let inputBuffer = '';
terminal.onData(function(data) {
    terminal.write(data);
    inputBuffer += data;

    if (data.includes('\r') || data.includes('\n')) {
        let userInput = inputBuffer.trim();
        terminal.write(`\r\n`);
        stompClient.send("/app/input", {}, userInput );
        inputBuffer = '';
    }
});
