
package com.studyai.service;
import com.studyai.dto.GenerateRequest;
import com.studyai.dto.VideoContentRequest;
import com.studyai.dto.VideoRequest;
import com.studyai.dto.VideoResponse;
import com.studyai.model.User;
import com.studyai.model.Video;
import com.studyai.repository.UserRepository;
import com.studyai.repository.VideoRepository;
import org.springframework.stereotype.Service;
import com.studyai.service.TranscriptService;
import java.util.List;

@Service
public class VideoService {
    private final AiService aiService;
    private final TranscriptService transcriptService;

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;

    public VideoService(VideoRepository videoRepository,
                        UserRepository userRepository,
                        AiService aiService,
                        TranscriptService transcriptService) {
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.transcriptService = transcriptService;
    }

    public VideoResponse saveVideo(VideoRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Video video = new Video(
                request.getVideoUrl(),
                "SAVED",
                user
        );

        Video savedVideo = videoRepository.save(video);

        return new VideoResponse(
                savedVideo.getId(),
                savedVideo.getVideoUrl(),
                savedVideo.getStatus(),
                savedVideo.getCreatedAt(),
                savedVideo.getTranscript(),
                savedVideo.getSummary(),
                savedVideo.getNotes(),
                savedVideo.getQuiz()
        );
    }

    public List<VideoResponse> getUserVideos(String email) {

        List<Video> videos = videoRepository.findByUserEmailOrderByCreatedAtDesc(email);

        return videos.stream()
                .map(video -> new VideoResponse(
                        video.getId(),
                        video.getVideoUrl(),
                        video.getStatus(),
                        video.getCreatedAt(),
                        video.getTranscript(),
                        video.getSummary(),
                        video.getNotes(),
                        video.getQuiz()
                ))
                .toList();
    }
    public VideoResponse getVideoById(Long id) {

        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        return new VideoResponse(
                video.getId(),
                video.getVideoUrl(),
                video.getStatus(),
                video.getCreatedAt(),
                video.getTranscript(),
                video.getSummary(),
                video.getNotes(),
                video.getQuiz()
        );
    }
    public VideoResponse updateVideoContent(Long id, VideoContentRequest request) {

        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        video.setTranscript(request.getTranscript());
        video.setSummary(request.getSummary());
        video.setNotes(request.getNotes());
        video.setQuiz(request.getQuiz());
        video.setStatus("CONTENT_READY");

        Video savedVideo = videoRepository.save(video);

        return new VideoResponse(
                savedVideo.getId(),
                savedVideo.getVideoUrl(),
                savedVideo.getStatus(),
                savedVideo.getCreatedAt(),
                savedVideo.getTranscript(),
                savedVideo.getSummary(),
                savedVideo.getNotes(),
                savedVideo.getQuiz()
        );
    }
    public VideoResponse generateAiContent(Long id, GenerateRequest request) {

        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        if (request.getTranscript() == null || request.getTranscript().isBlank()) {
            throw new RuntimeException("Transcript is required");
        }

        VideoContentRequest generatedContent =
                aiService.generateStudyContent(request.getTranscript());

        video.setTranscript(generatedContent.getTranscript());
        video.setSummary(generatedContent.getSummary());
        video.setNotes(generatedContent.getNotes());
        video.setQuiz(generatedContent.getQuiz());
        video.setStatus("AI_READY");

        Video savedVideo = videoRepository.save(video);

        return new VideoResponse(
                savedVideo.getId(),
                savedVideo.getVideoUrl(),
                savedVideo.getStatus(),
                savedVideo.getCreatedAt(),
                savedVideo.getTranscript(),
                savedVideo.getSummary(),
                savedVideo.getNotes(),
                savedVideo.getQuiz()
        );
    }
    public VideoResponse generateAiContentFromUrl(Long id) {

        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        String transcript = transcriptService.getTranscriptFromYoutube(video.getVideoUrl());

        VideoContentRequest generatedContent =
                aiService.generateStudyContent(transcript);

        video.setTranscript(transcript);
        video.setSummary(generatedContent.getSummary());
        video.setNotes(generatedContent.getNotes());
        video.setQuiz(generatedContent.getQuiz());
        video.setStatus("AI_READY");

        Video savedVideo = videoRepository.save(video);

        return new VideoResponse(
                savedVideo.getId(),
                savedVideo.getVideoUrl(),
                savedVideo.getStatus(),
                savedVideo.getCreatedAt(),
                savedVideo.getTranscript(),
                savedVideo.getSummary(),
                savedVideo.getNotes(),
                savedVideo.getQuiz()
        );
    }
}