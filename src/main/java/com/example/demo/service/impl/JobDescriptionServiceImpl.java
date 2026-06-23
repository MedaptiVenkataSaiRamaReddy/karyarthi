package com.example.demo.service.impl;

import com.example.demo.entity.JobDescription;
import com.example.demo.repository.JobDescriptionRepository;
import com.example.demo.service.JobDescriptionService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class JobDescriptionServiceImpl implements JobDescriptionService {

    private final JobDescriptionRepository repository;

    public JobDescriptionServiceImpl(JobDescriptionRepository repository) {
        this.repository = repository;
    }

    @Override
    public JobDescription save(JobDescription jd) {
        return repository.save(jd);
    }

    @Override
    public Optional<JobDescription> findById(String id) {
        return repository.findById(id);
    }
}

