package com.compilerdemo.complier_demo.Controller.Controllers;

import com.compilerdemo.complier_demo.Model.DTO.CodeExecutionRequest;
import com.compilerdemo.complier_demo.Model.DTO.CodeExecutionResponse;
import com.compilerdemo.complier_demo.Services.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.io.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class CodeExecutionController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private FileService fileService;
    private Map<String, Process> sessionProcessMap = new ConcurrentHashMap<>();

    @MessageMapping("/executeCode")
    public void executeCode(CodeExecutionRequest codeExecutionRequest, @Header("simpSessionId") String sessionId) {

        String containerId = null;
        try {
            containerId = startDockerContainer(codeExecutionRequest.getLanguage());
        } catch (IOException | InterruptedException e) {
            messagingTemplate.convertAndSend( "/topic/terminal", new CodeExecutionResponse("", "Error starting container: " + e.getMessage()));
            return;
        }

        try {
            runCodeInContainer(containerId, codeExecutionRequest.getCode(), codeExecutionRequest.getInput(),codeExecutionRequest.getName(), sessionId);
        } catch (IOException | InterruptedException e) {
            messagingTemplate.convertAndSend( "/topic/terminal", new CodeExecutionResponse("", "Error executing code: " + e.getMessage()));

        }
    }
    @MessageMapping("/input")
    public void handleInput(String input, @Header("simpSessionId") String sessionId) {
        Process process = sessionProcessMap.get(sessionId);
        if (process != null) {
            try {
                BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
                writer.write(input);
                writer.newLine();
                writer.flush();
            } catch (IOException e) {
                messagingTemplate.convertAndSend("/topic/terminal", new CodeExecutionResponse("", "Error sending input: " + e.getMessage()));

            }
        }
    }

    private String startDockerContainer(String language) throws IOException, InterruptedException {
        ProcessBuilder builder = new ProcessBuilder();
        String containerName ;
        switch (language.toLowerCase()) {
            case "java":
                containerName = "java_container_" + System.currentTimeMillis();
                builder.command("docker", "run", "-d","-i", "--rm", "--name", containerName , "openjdk:latest", "bash", "-c", "sleep 1000");
                break;
            case "python":
                containerName = "python_container_" + System.currentTimeMillis();
                builder.command("docker", "run", "-d","-i", "--rm", "--name", containerName, "python:latest", "bash", "-c", "sleep 1000");
                break;
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }

        Process process = builder.start();
        process.waitFor();
        return containerName;
    }

    private void runCodeInContainer(String containerId, String code, String input, String projectName, String sessionId) throws IOException, InterruptedException {
        writeCodeToContainer(containerId, code , projectName);
        String command = "";
        switch (getLanguageFromContainer(containerId)) {
            case "java":
                String className = fileService.getJavaClassName(projectName);
                command = " javac /tmp/" + className + ".java && java -cp /tmp " + className;
                break;
            case "python":
                command = "\" python -u /tmp/script.py\"";
                break;
        }

        ProcessBuilder builder = new ProcessBuilder("docker", "exec", "-i", containerId, "bash", "-c", command);
        Process process = builder.start();
        
        sessionProcessMap.put(sessionId, process);

        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

        InputStream stdout = process.getInputStream();

        new Thread(() -> {
            try {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = stdout.read(buffer)) != -1) {
                    String output = new String(buffer, 0, bytesRead);
                    messagingTemplate.convertAndSend("/topic/terminal", new CodeExecutionResponse(output, ""));

                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

        new Thread(() -> {
            try {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    System.out.println("Error: " + line);
                    messagingTemplate.convertAndSend("/topic/terminal", new CodeExecutionResponse("", line));

                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

        new Thread(() -> {
            try {
                int exitCode = process.waitFor();
                messagingTemplate.convertAndSend("/topic/terminal", new CodeExecutionResponse("", "Process exited with code: " + exitCode));

                sessionProcessMap.remove(sessionId);

                stopDockerContainer(containerId);
            } catch (InterruptedException | IOException e) {
                messagingTemplate.convertAndSend("/topic/terminal", new CodeExecutionResponse("", "Error during process termination: " + e.getMessage()));

            }
        }).start();
    }

    private void writeCodeToContainer(String containerId, String code , String projectName) throws IOException, InterruptedException {
        String fileName = "";
        switch (getLanguageFromContainer(containerId)) {
            case "java":
                String className = fileService.getJavaClassName(projectName);
                fileName = className + ".java";
                break;
            case "python":
                fileName = "script.py";
                break;
            default:
                throw new IllegalArgumentException("Unsupported container language");
        }
        String command = "cat > /tmp/" + fileName + " << EOF\n" + escapeQuotes(code) + "\nEOF";
        ProcessBuilder builder = new ProcessBuilder("docker", "exec", "-i", containerId, "bash", "-c", command);
        Process process = builder.start();
        process.waitFor();

    }
    private String escapeQuotes(String code) {
        return code.replace("\"", "\\\"");
    }

    private String getLanguageFromContainer(String containerId) {
        if (containerId.startsWith("java_container_")) {
            return "java";
        } else if (containerId.startsWith("python_container_")) {
            return "python";
        }
        return "unknown";
    }

    private void stopDockerContainer(String containerId) throws IOException {
        new ProcessBuilder("docker", "stop", containerId).start();
        new ProcessBuilder("docker", "rm", containerId).start();
    }

}
