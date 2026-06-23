package com.example.demo.service.export;

import com.example.demo.service.ai.OptimizedResume;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

/**
 * Generates ATS-friendly single-column PDF resumes from OptimizedResume data.
 * Uses plain text formatting to maximise ATS parser compatibility.
 * iText7 is used for PDF generation.
 */
@Service
public class PdfResumeExporter {

    public byte[] export(OptimizedResume resume, String candidateName, String email, String phone) {
        try {
            // Build plain-text HTML that iText can render into a clean single-column PDF
            String html = buildHtml(resume, candidateName, email, phone);
            return renderToPdf(html);
        } catch (Exception e) {
            // Fallback: plain text PDF
            return buildPlainTextPdf(resume, candidateName, email, phone);
        }
    }

    private String buildHtml(OptimizedResume r, String name, String email, String phone) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
<!DOCTYPE html><html><head>
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 20px 30px; }
  h1 { font-size: 18pt; font-weight: bold; margin: 0 0 4px 0; }
  .contact { font-size: 10pt; color: #333; margin-bottom: 14px; }
  h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;
       border-bottom: 1px solid #000; margin: 14px 0 6px 0; padding-bottom: 2px; }
  .summary { margin-bottom: 10px; }
  .skills-list { margin: 0; padding: 0; }
  .exp-header { display: flex; justify-content: space-between; font-weight: bold; margin-top: 8px; }
  ul { margin: 4px 0 8px 0; padding-left: 18px; }
  li { margin-bottom: 2px; }
  .edu-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .score-box { background: #f0f0f0; border: 1px solid #ccc; padding: 6px 12px;
               border-radius: 4px; font-size: 9pt; margin-top: 8px; }
</style>
</head><body>
""");
        System.out.println("PDF Name = " + r.getCandidate().getName());
        System.out.println("PDF Email = " + r.getCandidate().getEmail());
        System.out.println("PDF Phone = " + r.getCandidate().getPhone());
        sb.append("<h1>").append(esc(name)).append("</h1>");
        sb.append("<div class='contact'>").append(esc(email));
        if (phone != null && !phone.isBlank()) sb.append(" | ").append(esc(phone));
        sb.append("</div>");

        if (r.getSummary() != null) {
            sb.append("<h2>Professional Summary</h2>");
            sb.append("<div class='summary'>").append(esc(r.getSummary())).append("</div>");
        }

        if (notEmpty(r.getSkills())) {
            sb.append("<h2>Skills</h2>");
            sb.append("<div class='skills-list'>").append(esc(String.join(" • ", r.getSkills()))).append("</div>");
        }

        if (notEmpty(r.getExperience())) {
            sb.append("<h2>Experience</h2>");
            for (OptimizedResume.ExperienceItem exp : r.getExperience()) {
                sb.append("<div class='exp-header'><span>")
                  .append(esc(exp.getTitle())).append(" — ").append(esc(exp.getCompany()))
                  .append("</span><span>").append(esc(exp.getDuration())).append("</span></div>");
                if (notEmpty(exp.getBullets())) {
                    sb.append("<ul>");
                    exp.getBullets().forEach(b -> sb.append("<li>").append(esc(b)).append("</li>"));
                    sb.append("</ul>");
                }
            }
        }

        if (notEmpty(r.getProjects())) {
            sb.append("<h2>Projects</h2>");
            for (OptimizedResume.ProjectItem p : r.getProjects()) {
                sb.append("<div style='margin-bottom:8px'>");
                sb.append("<strong>").append(esc(p.getName())).append("</strong><br>");
                if (p.getDescription() != null) sb.append(esc(p.getDescription())).append("<br>");
                if (p.getImpact() != null) sb.append("<em>").append(esc(p.getImpact())).append("</em>");
                sb.append("</div>");
            }
        }

        if (notEmpty(r.getEducation())) {
            sb.append("<h2>Education</h2>");
            for (OptimizedResume.EducationItem ed : r.getEducation()) {
                sb.append("<div class='edu-row'><span>")
                  .append(esc(ed.getDegree())).append(", ").append(esc(ed.getInstitution()))
                  .append("</span><span>").append(esc(ed.getYear())).append("</span></div>");
            }
        }

        if (notEmpty(r.getCertifications())) {
            sb.append("<h2>Certifications</h2><ul>");
            r.getCertifications().forEach(c -> sb.append("<li>").append(esc(c)).append("</li>"));
            sb.append("</ul>");
        }

        if (r.getAtsScore() > 0) {
            sb.append("<div class='score-box'>ATS Compatibility Score: <strong>")
              .append(r.getAtsScore()).append("/100</strong></div>");
        }

        sb.append("</body></html>");
        return sb.toString();
    }

    private byte[] renderToPdf(String html) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        // Try iText HtmlConverter if available on classpath
        try {
            Class<?> converterClass = Class.forName("com.itextpdf.html2pdf.HtmlConverter");
            java.lang.reflect.Method method = converterClass.getMethod("convertToPdf",
                String.class, java.io.OutputStream.class);
            method.invoke(null, html, baos);
            return baos.toByteArray();
        } catch (ClassNotFoundException e) {
            // iText not available — fall back to plain text
            throw e;
        }
    }

    private byte[] buildPlainTextPdf(OptimizedResume r, String name, String email, String phone) {
        // Minimal PDF using raw PDF syntax — works without any library
        StringBuilder content = new StringBuilder();
        content.append(name).append("\n");
        content.append(email);
        if (phone != null && !phone.isBlank()) content.append(" | ").append(phone);
        content.append("\n\n");

        if (r.getSummary() != null) {
            content.append("PROFESSIONAL SUMMARY\n");
            content.append("--------------------\n");
            content.append(r.getSummary()).append("\n\n");
        }

        if (notEmpty(r.getSkills())) {
            content.append("SKILLS\n------\n");
            content.append(String.join(" • ", r.getSkills())).append("\n\n");
        }

        if (notEmpty(r.getExperience())) {
            content.append("EXPERIENCE\n----------\n");
            for (OptimizedResume.ExperienceItem exp : r.getExperience()) {
                content.append(exp.getTitle()).append(" — ").append(exp.getCompany())
                       .append("  (").append(exp.getDuration()).append(")\n");
                if (notEmpty(exp.getBullets())) {
                    exp.getBullets().forEach(b -> content.append("  • ").append(b).append("\n"));
                }
                content.append("\n");
            }
        }

        if (notEmpty(r.getEducation())) {
            content.append("EDUCATION\n---------\n");
            r.getEducation().forEach(e -> content.append(e.getDegree())
                .append(", ").append(e.getInstitution()).append(" (").append(e.getYear()).append(")\n"));
            content.append("\n");
        }

        if (notEmpty(r.getCertifications())) {
            content.append("CERTIFICATIONS\n--------------\n");
            r.getCertifications().forEach(c -> content.append("• ").append(c).append("\n"));
        }

        if (r.getAtsScore() > 0) {
            content.append("\nATS Score: ").append(r.getAtsScore()).append("/100\n");
        }

        // Embed as PDF
        return toPdfBytes(content.toString());
    }

    private byte[] toPdfBytes(String text) {
        // Minimal valid PDF structure
        String escapedText = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
        // Split into lines for rendering
        String[] lines = text.split("\n");
        StringBuilder stream = new StringBuilder();
        stream.append("BT\n/F1 11 Tf\n50 750 Td\n12 TL\n");
        for (String line : lines) {
            String safeL = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
            stream.append("(").append(safeL).append(") Tj T*\n");
        }
        stream.append("ET");
        String streamStr = stream.toString();
        byte[] streamBytes = streamStr.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);

        String pdf = "%PDF-1.4\n"
            + "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            + "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            + "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]\n"
            + "   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
            + "4 0 obj\n<< /Length " + streamBytes.length + " >>\nstream\n"
            + streamStr + "\nendstream\nendobj\n"
            + "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
            + "xref\n0 6\n0000000000 65535 f \n"
            + "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF";

        return pdf.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private boolean notEmpty(List<?> list) {
        return list != null && !list.isEmpty();
    }
}
