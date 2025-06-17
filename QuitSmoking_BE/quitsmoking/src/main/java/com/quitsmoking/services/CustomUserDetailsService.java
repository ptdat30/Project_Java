package com.quitsmoking.services;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.Collections;
import java.util.Set;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDAO userDAO;

    @Autowired
    public CustomUserDetailsService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Find the user by email in your database
        User user = userDAO.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));

        // Convert the user's role to GrantedAuthority
        Set<GrantedAuthority> authorities;
        if (user.getRole() != null) {
            authorities = Collections.singleton(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            );
        } else {
            // Handle case where User has no Role or Role name is null
            // For security, you might want to throw an exception or assign a default role.
            // Assigning a default "USER" role for robustness here.
            authorities = Collections.singleton(
                    new SimpleGrantedAuthority("ROLE_USER") // Assign a default role
            );
            System.err.println("Warning: User " + user.getEmail() + " has no assigned role or role name is null. Defaulting to ROLE_USER.");
        }

        // Return the Spring Security UserDetails object
        // The password can be empty if the user only logs in via OAuth2
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword() != null ? user.getPassword() : "",
                authorities
        );
    }
}