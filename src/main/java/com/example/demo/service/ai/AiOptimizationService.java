package com.example.demo.service.ai;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class AiOptimizationService {

    private static final Logger log = LoggerFactory.getLogger(AiOptimizationService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${NVIDIA_API_KEY:}")
    private String apiKey;

    @Value("${AI_MODEL:openai/gpt-oss-20b}")
    private String model;

    @Value("${base-url:https://integrate.api.nvidia.com/v1/chat/completions}")
    private String baseUrl;

    private static final String SYSTEM_PROMPT = """
You are an expert ATS resume optimizer and professional resume writer with 15+ years of HR experience.
Your task: rewrite a candidate's resume to be perfectly tailored to a specific job description.

STRICT OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no explanation:
{
  "candidate": {
                   "name": "<original name>",
                   "email": "<original email>",
                   "phone": "<original phone>",
                   "linkedin": "<original linkedin>",
                   "github": "<original github>"
               },
  "summary": "2-3 sentence professional summary tailored to the role",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 – Dec 2023",
      "bullets": ["Achievement with metric", "Action verb + result", ...]
    }
  ],
  "education": [
    {
      "degree": "B.Tech Computer Science",
      "institution": "University Name",
      "year": "2019"
    }
  ],
  "certifications": ["Cert 1", "Cert 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does and tech used",
      "impact": "Quantified result or achievement"
    }
  ],
  "atsScore": 85,
  "keywordsMatched": ["keyword1", "keyword2"],
  "improvementTips": ["tip1", "tip2"]
}


ATS OPTIMIZATION RULES:
1. Mirror exact keywords and phrases from the JD (skills, tools, methodologies)
2. Start every bullet with a strong action verb (Led, Built, Reduced, Increased, Architected)
3. Quantify every achievement with numbers, percentages, or scale (e.g. "reduced load time by 40%")
4. Remove graphics, tables, columns, headers/footers (ATS parsers fail on these)
5. Use standard section names: Summary, Experience, Education, Skills, Projects, Certifications
6. Prioritize skills from the JD at the top of the skills list
7. Never fabricate experience — only reframe and strengthen what exists
8. Calculate atsScore (0–100) based on keyword coverage and format compliance
""";

    @Async
    public CompletableFuture<OptimizedResume> optimizeAsync(String resumeText, String jobDescription, String candidateName) {


        return CompletableFuture.supplyAsync(() -> {
            try {
                return optimize(resumeText, jobDescription, candidateName);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public OptimizedResume optimize(String resumeText, String jobDescription, String candidateName) throws JsonProcessingException {
        System.out.println(resumeText);
        System.out.println("=== OPTIMIZE METHOD CALLED ===");
        String userMessage = String.format("""
=== ORIGINAL RESUME ===
%s

=== JOB DESCRIPTION ===
%s

Extract candidate information from the resume itself.
Preserve name, email, phone, LinkedIn and GitHub exactly.
""", resumeText, jobDescription);

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("AI API key not configured — returning demo optimization");
            return demoOptimize(resumeText, candidateName);
        }

        String jsonText = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);

            body.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", SYSTEM_PROMPT
                    ),
                    Map.of(
                            "role", "user",
                            "content", userMessage
                    )
            ));

            body.put("temperature", 0.3);
            body.put("max_tokens", 4096);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) response.getBody().get("choices");

                Map<String, Object> choice = choices.get(0);

                Map<String, Object> message =
                        (Map<String, Object>) choice.get("message");

                jsonText = (String) message.get("content");
            }
        } catch (Exception e) {
            log.error("AI optimization failed", e);
        }
        System.out.println("========== AI RESPONSE ==========");
        System.out.println(jsonText);
        System.out.println("================================");
        return mapper.readValue(
                jsonText.trim(),
                OptimizedResume.class
        );
    }

    private OptimizedResume demoOptimize(String resumeText, String name) {
        OptimizedResume r = new OptimizedResume();
        r.setSummary("Results-driven professional with proven expertise in delivering high-impact solutions. Adept at leveraging technical skills to drive business outcomes and contribute to team success.");
        r.setSkills(List.of("Java", "Spring Boot", "REST APIs", "SQL", "Git", "Agile/Scrum"));
        r.setAtsScore(72);
        r.setKeywordsMatched(List.of("Java", "Spring Boot", "REST APIs"));
        r.setImprovementTips(List.of(
            "Add quantified metrics to each bullet point",
            "Include more keywords from the job description",
            "Connect your AI API key for full optimization"
        ));
        OptimizedResume.ExperienceItem exp = new OptimizedResume.ExperienceItem();
        exp.setTitle("Software Developer");
        exp.setCompany("Previous Company");
        exp.setDuration("2021 – Present");
        exp.setBullets(List.of(
            "Developed and maintained backend services using Java and Spring Boot",
            "Collaborated with cross-functional teams to deliver features on schedule",
            "Improved application performance by identifying and resolving bottlenecks"
        ));
        r.setExperience(List.of(exp));
        return r;
    }

    public OptimizedResume buildFromFresher(FresherProfileData data) {
        String prompt = String.format("""
Build a professional resume JSON for a fresher candidate with no prior full-time experience.
Name: %s | Role Target: %s

Education: %s
Skills: %s
Projects: %s
Certifications: %s
Achievements/Activities: %s

Create an impressive, ATS-optimized resume. Strengthen project descriptions with impact language.
Use the same JSON format as the system prompt.
""",
            data.getFullName(), data.getTargetRole(),
            data.getEducation(), String.join(", ", data.getSkills()),
            data.getProjects(), String.join(", ", data.getCertifications()),
            data.getAchievements()
        );

        if (apiKey == null || apiKey.isBlank()) {
            return demoOptimize("", data.getFullName());
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);

            body.put("messages", List.of(
                    Map.of(
                            "role", "system",
                            "content", SYSTEM_PROMPT
                    ),
                    Map.of(
                            "role", "user",
                            "content", prompt
                    )
            ));

            body.put("temperature", 0.3);
            body.put("max_tokens", 4096);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            baseUrl,
                            entity,
                            Map.class
                    );

            if (response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null) {

                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) response.getBody().get("choices");

                if (choices != null && !choices.isEmpty()) {

                    Map<String, Object> choice = choices.get(0);

                    Map<String, Object> message =
                            (Map<String, Object>) choice.get("message");

                    String jsonText =
                            (String) message.get("content");

                    return mapper.readValue(
                            jsonText.trim(),
                            OptimizedResume.class
                    );
                }
            }
        } catch (Exception e) {
            log.error("Fresher AI build failed", e);
        }
        return demoOptimize("", data.getFullName());
    }
}
