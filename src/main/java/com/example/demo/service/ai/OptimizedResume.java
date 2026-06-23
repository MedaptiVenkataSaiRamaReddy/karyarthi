package com.example.demo.service.ai;

import com.example.demo.dto.Candidate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OptimizedResume {


    private Candidate candidate;
    private String summary;
    private List<String> skills;
    private List<ExperienceItem> experience;
    private List<EducationItem> education;
    private List<String> certifications;
    private List<ProjectItem> projects;
    private int atsScore;
    private List<String> keywordsMatched;
    private List<String> improvementTips;


    public String getSummary() { return summary; }
    public void setSummary(String s) { this.summary = s; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> s) { this.skills = s; }
    public List<ExperienceItem> getExperience() { return experience; }
    public void setExperience(List<ExperienceItem> e) { this.experience = e; }
    public List<EducationItem> getEducation() { return education; }
    public void setEducation(List<EducationItem> e) { this.education = e; }
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> c) { this.certifications = c; }
    public List<ProjectItem> getProjects() { return projects; }
    public void setProjects(List<ProjectItem> p) { this.projects = p; }
    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int s) { this.atsScore = s; }
    public List<String> getKeywordsMatched() { return keywordsMatched; }
    public void setKeywordsMatched(List<String> k) { this.keywordsMatched = k; }
    public List<String> getImprovementTips() { return improvementTips; }
    public void setImprovementTips(List<String> t) { this.improvementTips = t; }
    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }


    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExperienceItem {
        private String title;
        private String company;
        private String duration;
        private List<String> bullets;
        public String getTitle() { return title; }
        public void setTitle(String t) { this.title = t; }
        public String getCompany() { return company; }
        public void setCompany(String c) { this.company = c; }
        public String getDuration() { return duration; }
        public void setDuration(String d) { this.duration = d; }
        public List<String> getBullets() { return bullets; }
        public void setBullets(List<String> b) { this.bullets = b; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EducationItem {
        private String degree;
        private String institution;
        private String year;
        public String getDegree() { return degree; }
        public void setDegree(String d) { this.degree = d; }
        public String getInstitution() { return institution; }
        public void setInstitution(String i) { this.institution = i; }
        public String getYear() { return year; }
        public void setYear(String y) { this.year = y; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProjectItem {
        private String name;
        private String description;
        private String impact;
        public String getName() { return name; }
        public void setName(String n) { this.name = n; }
        public String getDescription() { return description; }
        public void setDescription(String d) { this.description = d; }
        public String getImpact() { return impact; }
        public void setImpact(String i) { this.impact = i; }
    }
}
