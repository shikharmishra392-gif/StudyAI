package com.studyai.dto;

public class VideoRequest {

    private String email;
    private String videoUrl;

    public VideoRequest() {
    }

    public String getEmail() {
        return email;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
}