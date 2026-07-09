package com.studyai.repository;

import com.studyai.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByUserEmailOrderByCreatedAtDesc(String email);
}