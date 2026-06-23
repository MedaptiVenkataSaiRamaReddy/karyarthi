package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards all non-API, non-asset requests to index.html
 * so React Router can handle /admin, /admin/setup, /dashboard, etc.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/admin",
        "/admin/setup",
        "/admin/dashboard",
        "/dashboard",
        "/upload",
        "/build",
        "/login",
        "/register",
        "/resume/{id:[^.]+}",
        "/reset-password"
    })
    public String spa() {
        return "forward:/index.html";
    }
}
