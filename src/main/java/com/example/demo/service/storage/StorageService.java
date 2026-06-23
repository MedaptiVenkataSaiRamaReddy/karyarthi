package com.example.demo.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

public interface StorageService {
    /**
     * Save the uploaded file and return the saved path.
     */
    Path store(MultipartFile file) throws IOException;
}

