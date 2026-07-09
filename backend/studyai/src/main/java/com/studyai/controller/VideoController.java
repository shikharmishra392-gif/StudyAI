package com.studyai.controller;
import com.studyai.dto.GenerateRequest;
import com.studyai.dto.VideoContentRequest;
import com.studyai.dto.VideoRequest;
import com.studyai.dto.VideoResponse;
import com.studyai.service.VideoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping("/analyze")
    public VideoResponse analyzeVideo(@RequestBody VideoRequest request) {
        return videoService.saveVideo(request);
    }

    @GetMapping("/user/{email}")
    public List<VideoResponse> getUserVideos(@PathVariable String email) {
        return videoService.getUserVideos(email);
    }
    @GetMapping("/{id}")
    public VideoResponse getVideoById(@PathVariable Long id) {
        return videoService.getVideoById(id);
    }
    @PutMapping("/{id}/content")
    public VideoResponse updateVideoContent(
            @PathVariable Long id,
            @RequestBody VideoContentRequest request
    ) {
        return videoService.updateVideoContent(id, request);
    }
    @PostMapping("/{id}/generate")
    public VideoResponse generateAiContent(
            @PathVariable Long id,
            @RequestBody GenerateRequest request
    ) {
        return videoService.generateAiContent(id, request);
    }
    @PostMapping("/{id}/generate-from-url")
    public VideoResponse generateAiContentFromUrl(@PathVariable Long id) {
        return videoService.generateAiContentFromUrl(id);
    }
}