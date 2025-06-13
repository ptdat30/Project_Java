package com.example.quitsmoking.services.interfaces;

import com.example.quitsmoking.model.Role;
import com.example.quitsmoking.model.User;

// import com.smokingcessation.model.Role;
// import com.smokingcessation.model.User;

public interface iRegistrableService {
    User register(String username, String password, String email, String fisrtname, String lastname , Role role);
}
