package com.studyai.dto;

public class VideoContentRequest {

    private String transcript;
    private String summary;
    private String notes;
    private String quiz;

    public VideoContentRequest() {
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

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setQuiz(String quiz) {
        this.quiz = quiz;
    }
}