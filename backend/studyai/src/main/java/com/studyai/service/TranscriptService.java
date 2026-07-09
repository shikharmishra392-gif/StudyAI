package com.studyai.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class TranscriptService {

    public String getTranscriptFromYoutube(String videoUrl) {
        try {
            Path transcriptDir = Paths.get("transcripts");

            if (!Files.exists(transcriptDir)) {
                Files.createDirectories(transcriptDir);
            }

            // Delete old .vtt files before downloading new caption
            try (Stream<Path> files = Files.list(transcriptDir)) {
                files.filter(path -> path.toString().endsWith(".vtt"))
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (Exception ignored) {}
                        });
            }

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "yt-dlp",
                    "--skip-download",
                    "--write-subs",
                    "--write-auto-subs",
                    "--sub-langs", "en",
                    "--sub-format", "vtt",
                    "-o", "transcripts/%(id)s.%(ext)s",
                    videoUrl
            );

            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            StringBuilder output = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new RuntimeException("yt-dlp failed: " + output);
            }

            Path vttFile;

            try (Stream<Path> files = Files.list(transcriptDir)) {
                vttFile = files
                        .filter(path -> path.toString().endsWith(".vtt"))
                        .max(Comparator.comparingLong(path -> path.toFile().lastModified()))
                        .orElseThrow(() -> new RuntimeException("No subtitle file found"));
            }

            String vttContent = Files.readString(vttFile);

            return cleanVttText(vttContent);

        } catch (Exception e) {
            throw new RuntimeException("Transcript extraction failed: " + e.getMessage());
        }
    }

    private String cleanVttText(String vttContent) {
        StringBuilder transcript = new StringBuilder();

        String[] lines = vttContent.split("\\R");

        String previousLine = "";

        for (String line : lines) {
            line = line.trim();

            if (line.isBlank()) continue;
            if (line.equals("WEBVTT")) continue;
            if (line.contains("-->")) continue;
            if (line.matches("\\d+")) continue;
            if (line.startsWith("Kind:")) continue;
            if (line.startsWith("Language:")) continue;
            if (line.startsWith("NOTE")) continue;

            line = line.replaceAll("<[^>]*>", "");
            line = line.replaceAll("&nbsp;", " ");
            line = line.replaceAll("&amp;", "&");

            if (!line.equals(previousLine)) {
                transcript.append(line).append(" ");
                previousLine = line;
            }
        }

        return transcript.toString().trim();
    }
}