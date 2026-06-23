package com.example.demo.controller;

import com.example.demo.entity.JobDescription;
import com.example.demo.service.JobDescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/job-descriptions")
public class JobDescriptionController {

    private final JobDescriptionService service;

    public JobDescriptionController(JobDescriptionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<JobDescription> create(@RequestBody JobDescription jd) {
        JobDescription saved = service.save(jd);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        Optional<JobDescription> jd = service.findById(id);
        return jd.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}

