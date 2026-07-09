package com.studyai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyai.dto.VideoContentRequest;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AiService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public VideoContentRequest generateStudyContent(String transcript) {

        try {
            String apiKey = System.getenv("OPENROUTER_API_KEY");

            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException("OPENROUTER_API_KEY is missing");
            }

            String prompt = """
                    You are StudyAI, an AI learning assistant.

                    Read the transcript and generate:
                    1. A clear summary
                    2. Detailed study notes
                    3. A quiz with 5 MCQs and answers related to the topic 

                    Return ONLY valid JSON in this exact format:
                    {
                      "summary": "...",
                      "notes": "...",
                      "quiz": "..."
                    }

                    Transcript:
                    %s
                    """.formatted(transcript);

            String requestBody = """
                    {
                      "model": "openrouter/free",
                      "messages": [
                        {
                          "role": "user",
                          "content": %s
                        }
                      ],
                      "temperature": 0.4
                    }
                    """.formatted(objectMapper.writeValueAsString(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("HTTP-Referer", "http://localhost:5500")
                    .header("X-Title", "StudyAI")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw new RuntimeException("OpenRouter API error: " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());

            String aiText = root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            String cleanJson = extractJson(aiText);
            JsonNode contentJson = objectMapper.readTree(cleanJson);

            VideoContentRequest result = new VideoContentRequest();

            result.setTranscript(transcript);
            result.setSummary(contentJson.path("summary").asText());
            result.setNotes(contentJson.path("notes").asText());
            result.setQuiz(contentJson.path("quiz").asText());

            return result;

        } catch (Exception e) {
            throw new RuntimeException("AI generation failed: " + e.getMessage());
        }
    }

    public VideoContentRequest generateStudyContentFromYoutubeUrl(String videoUrl) {
        throw new RuntimeException(
                "Direct YouTube video analysis is disabled for OpenRouter. " +
                        "Use yt-dlp captions first, then generate from transcript."
        );
    }

    private String extractJson(String text) {

        text = text.trim();

        if (text.startsWith("```json")) {
            text = text.replace("```json", "").replace("```", "").trim();
        } else if (text.startsWith("```")) {
            text = text.replace("```", "").trim();
        }

        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");

        if (start != -1 && end != -1) {
            return text.substring(start, end + 1);
        }

        return text;
    }
}