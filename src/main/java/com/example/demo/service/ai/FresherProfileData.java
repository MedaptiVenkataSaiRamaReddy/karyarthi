package com.example.demo.service.ai;

import java.util.List;

public class FresherProfileData {
    private String fullName;
    private String targetRole;
    private String email;
    private String phone;
    private String location;
    private String education;
    private List<String> skills;
    private String projects;
    private List<String> certifications;
    private String achievements;
    private String linkedinUrl;
    private String githubUrl;

    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String v) { this.targetRole = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getLocation() { return location; }
    public void setLocation(String v) { this.location = v; }
    public String getEducation() { return education; }
    public void setEducation(String v) { this.education = v; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> v) { this.skills = v; }
    public String getProjects() { return projects; }
    public void setProjects(String v) { this.projects = v; }
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> v) { this.certifications = v; }
    public String getAchievements() { return achievements; }
    public void setAchievements(String v) { this.achievements = v; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String v) { this.linkedinUrl = v; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String v) { this.githubUrl = v; }
}
