package com.example.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.*;

@Document(collection = "users")
public class User implements UserDetails {
    @Id private String id;
    @Indexed(unique = true) private String email;
    private String password, fullName, role = "USER";
    private boolean enabled = true;

    public String getId()              { return id; }
    public void   setId(String v)      { this.id = v; }
    public String getEmail()           { return email; }
    public void   setEmail(String v)   { this.email = v; }
    public void   setPassword(String v){ this.password = v; }
    public String getFullName()        { return fullName; }
    public void   setFullName(String v){ this.fullName = v; }
    public String getRole()            { return role; }
    public void   setRole(String v)    { this.role = v; }
    public void   setEnabled(boolean v){ this.enabled = v; }

    @Override public String getPassword()              { return password; }
    @Override public String getUsername()              { return email; }
    @Override public boolean isEnabled()               { return enabled; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER")));
    }
}