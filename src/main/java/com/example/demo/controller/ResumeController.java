package com.example.demo.controller;

import com.example.demo.entity.Resume;
import com.example.demo.entity.User;
import com.example.demo.service.ResumeService;
import com.example.demo.service.UserService;
import com.example.demo.service.ai.AiOptimizationService;
import com.example.demo.service.ai.FresherProfileData;
import com.example.demo.service.ai.OptimizedResume;
import com.example.demo.service.export.PdfResumeExporter;
import com.example.demo.service.storage.StorageService;
import com.example.demo.util.ResumeParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private static final Logger log = LoggerFactory.getLogger(ResumeController.class);
    private static final Set<String> ALLOWED = Set.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword","text/plain");
    private static final long MAX = 10 * 1024 * 1024;

    private final ResumeService resumeService;
    private final StorageService storageService;
    private final UserService userService;
    private final AiOptimizationService aiService;
    private final PdfResumeExporter pdfExporter;
    private final ObjectMapper mapper = new ObjectMapper();

    public ResumeController(ResumeService rs, StorageService ss, UserService us,
                            AiOptimizationService ai, PdfResumeExporter pdf) {
        this.resumeService=rs; this.storageService=ss; this.userService=us;
        this.aiService=ai; this.pdfExporter=pdf;
    }

    @PostMapping(value="/upload-optimize", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAndOptimize(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value="jobDescription",required=false) String jd) throws IOException {

        if (file.getSize() > MAX) return ResponseEntity.badRequest().body(Map.of("error","File too large (max 10MB)"));
        String ct = file.getContentType();
        String name = file.getOriginalFilename()==null?"":file.getOriginalFilename().toLowerCase();
        if (ct==null||!ALLOWED.contains(ct)) {
            if (!name.endsWith(".pdf")&&!name.endsWith(".docx")&&!name.endsWith(".doc")&&!name.endsWith(".txt"))
                return ResponseEntity.badRequest().body(Map.of("error","Only PDF, DOCX, or TXT accepted"));
        }
        User owner = currentUser();
        if (owner==null) return ResponseEntity.status(401).build();

        Path saved = storageService.store(file);
        String parsed = "";
        try (var in = Files.newInputStream(saved)) {
            if (name.endsWith(".pdf")) parsed = ResumeParser.parsePdf(in);
            else if (name.endsWith(".docx")||name.endsWith(".doc")) parsed = ResumeParser.parseDocx(in);
            else parsed = new String(file.getBytes());
        }

        // Estimate raw ATS score before optimization
        int rawScore = estimateRawAts(parsed, jd);

        Resume r = new Resume();
        r.setOriginalFileName(file.getOriginalFilename());
        r.setResumeTitle(name.replaceFirst("[.][^.]+$",""));
        r.setParsedText(parsed);
        r.setStoragePath(saved.toString());
        r.setJobDescriptionText(jd);
        r.setStatus("PARSING");
        r.setType("SENIOR");
        r.setOwner(owner);
        r.setPreviousAtsScore(String.valueOf(rawScore));  // store raw score
        Resume saved2 = resumeService.save(r);

        final String fp=parsed, fjd=jd;
        final String ownerName = owner.getFullName()!=null?owner.getFullName():owner.getEmail();
        new Thread(()->runOptimization(saved2.getId(), fp, fjd, ownerName, owner)).start();

        return ResponseEntity.ok(Map.of(
            "id", saved2.getId(),
            "status", "OPTIMIZING",
            "rawAtsScore", rawScore,
            "message", "Resume uploaded. AI optimization in progress..."
        ));
    }

    @PostMapping("/build-fresher")
    public ResponseEntity<?> buildFresher(@RequestBody FresherProfileData data) {
        User owner = currentUser();
        if (owner==null) return ResponseEntity.status(401).build();
        Resume r = new Resume();
        r.setResumeTitle(data.getTargetRole()+" — "+data.getFullName());
        r.setType("FRESHER"); r.setStatus("OPTIMIZING"); r.setOwner(owner);
        r.setPreviousAtsScore("0");  // fresher starts from 0
        Resume saved = resumeService.save(r);
        new Thread(()->{
            try {
                resumeService.updateStatus(saved.getId(),"OPTIMIZING");
                OptimizedResume opt = aiService.buildFromFresher(data);
                String json = mapper.writeValueAsString(opt);
                byte[] pdf = pdfExporter.export(opt,data.getFullName(),data.getEmail(),data.getPhone());
                Path pp = storePath(saved.getId(),pdf,"pdf");
                resumeService.updateOptimizedContent(saved.getId(),json,opt.getAtsScore(),pp.toString());
            } catch(Exception e){
                log.error("Fresher build failed",e);
                resumeService.updateStatus(saved.getId(),"FAILED");
            }
        }).start();
        return ResponseEntity.ok(Map.of("id",saved.getId(),"status","OPTIMIZING",
            "message","Building your resume with AI..."));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> status(@PathVariable("id") String id) {
        return resumeService.findById(id).map(r -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("status", r.getStatus());
            m.put("atsScore", r.getAtsScore()!=null?r.getAtsScore():0);
            m.put("previousAtsScore", r.getPreviousAtsScore()!=null?Integer.parseInt(r.getPreviousAtsScore()):0);
            return ResponseEntity.ok(m);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable("id") String id) {
        return resumeService.findById(id).map(r -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("title", r.getResumeTitle());
            m.put("status", r.getStatus());
            m.put("type", r.getType());
            m.put("atsScore", r.getAtsScore()!=null?r.getAtsScore():0);
            m.put("previousAtsScore", r.getPreviousAtsScore()!=null?Integer.parseInt(r.getPreviousAtsScore()):0);
            m.put("createdAt", r.getCreatedAt());
            if ("READY".equals(r.getStatus())&&r.getOptimizedJson()!=null) {
                try { m.put("optimized", mapper.readValue(r.getOptimizedJson(),Object.class)); }
                catch(Exception e){ m.put("optimizedJson",r.getOptimizedJson()); }
            }
            return ResponseEntity.ok(m);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> list() {
        User owner = currentUser();
        if (owner==null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(resumeService.findByOwner(owner.getId()).stream().map(r->{
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id",r.getId()); m.put("title",r.getResumeTitle());
            m.put("status",r.getStatus()); m.put("type",r.getType());
            m.put("atsScore",r.getAtsScore()!=null?r.getAtsScore():0);
            m.put("previousAtsScore",r.getPreviousAtsScore()!=null?Integer.parseInt(r.getPreviousAtsScore()):0);
            m.put("createdAt",r.getCreatedAt());
            return m;
        }).toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private void runOptimization(String id,String text,String jd,String name,User owner){
        try {
            resumeService.updateStatus(id,"OPTIMIZING");
            OptimizedResume opt = aiService.optimize(text,jd!=null?jd:"",name);
            String json = mapper.writeValueAsString(opt);
            byte[] pdf = pdfExporter.export(opt,name,owner.getEmail(),null);
            Path pp = storePath(id,pdf,"pdf");
            resumeService.updateOptimizedContent(id,json,opt.getAtsScore(),pp.toString());
        } catch(Exception e){
            log.error("Optimization failed {}",id,e);
            resumeService.updateStatus(id,"FAILED");
        }
    }

    /** Quick keyword-based ATS estimate before AI optimization */
    private int estimateRawAts(String resumeText, String jd) {
        if (resumeText==null||resumeText.isBlank()) return 0;
        if (jd==null||jd.isBlank()) return 30;
        String rt = resumeText.toLowerCase();
        String[] jdWords = jd.toLowerCase().split("\\W+");
        long matched = Arrays.stream(jdWords)
            .filter(w -> w.length() > 4)
            .distinct()
            .filter(rt::contains)
            .count();
        long total = Arrays.stream(jdWords).filter(w->w.length()>4).distinct().count();
        if (total==0) return 30;
        return (int) Math.min(65, 20 + (matched * 45 / total));
    }

    private Path storePath(String id,byte[] data,String ext) throws IOException {
        Path dir = Path.of("uploads/generated");
        Files.createDirectories(dir);
        Path p = dir.resolve(id+"."+ext);
        Files.write(p,data);
        return p;
    }

    private User currentUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return userService.findByEmail(email).orElse(null);
        } catch(Exception e){ return null; }
    }
}
