package com.example.demo.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;

@Service
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.rootLocation);
    }

    @Override
    public Path store(MultipartFile file) throws IOException {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String suffix = "";
        int idx = original.lastIndexOf('.');
        if (idx >= 0) suffix = original.substring(idx);
        String filename = Instant.now().toEpochMilli() + "-" + Math.abs(original.hashCode()) + suffix;
        Path dest = this.rootLocation.resolve(filename);
        Files.copy(file.getInputStream(), dest);
        return dest;
    }
}

