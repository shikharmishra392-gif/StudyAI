package com.studyai.dto;

import java.time.LocalDateTime;

public class VideoResponse {

    private Long id;
    private String videoUrl;
    private String status;
    private LocalDateTime createdAt;
    private String transcript;
    private String summary;
    private String notes;
    private String quiz;

    public VideoResponse(Long id, String videoUrl, String status, LocalDateTime createdAt,
                         String transcript, String summary, String notes, String quiz) {
        this.id = id;
        this.videoUrl = videoUrl;
        this.status = status;
        this.createdAt = createdAt;
        this.transcript = transcript;
        this.summary = summary;
        this.notes = notes;
        this.quiz = quiz;
    }

    public Long getId() {
        return id;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public String getTranscript() {
        return transcript;
    }

    public String getSummary() {
        return summary;
    }

    public String getNotes() {
        return notes;
    }

    public String getQuiz() {
        return quiz;
    }
}