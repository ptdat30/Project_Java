package com.quitsmoking.model;

import com.quitsmoking.model.interfaces.iAuthenticatable;
import com.quitsmoking.model.interfaces.iProfileManageable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public abstract class User implements UserDetails, iAuthenticatable, iProfileManageable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)") // Dùng VARCHAR(36) cho UUID
    private String id;

    @Column(unique = true)
    private String username;

    @Column(nullable = true)
    private String password;

    @Column(unique = true)
    private String email;

    private String firstName;
    private String lastName;

    @Column(nullable = true)
    private String googleId;

    @Column(nullable = true)
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Thêm các trường cho gói thành viên
    @ManyToOne(fetch = FetchType.LAZY) // Mối quan hệ nhiều người dùng có một gói thành viên
    @JoinColumn(name = "current_membership_plan_id") // Cột khóa ngoại trỏ đến MembershipPlan entity
    private MembershipPlan currentMembershipPlan; // <-- THAY ĐỔI TỪ MembershipPlanType SANG MembershipPlan
                                                // Xem xét đổi tên để rõ ràng hơn, ví dụ: 'currentMembershipPlan'
    private LocalDate membershipEndDate;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public User(String username, String password, String email, String firstName, String lastName, Role role) {
        this.username = username;
        // this.password = new BCryptPasswordEncoder().encode(password);
        this.password = password; // Mật khẩu nên được mã hóa trước khi gọi constructor này hoặc trong service
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.authProvider = AuthProvider.LOCAL;
        this.role = role;
    }

    public User(String email, String firstName, String lastName,
                String googleId, String pictureUrl, AuthProvider authProvider, Role role) {
        this.username = email; // Sử dụng email làm username cho người dùng Google
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.googleId = googleId;
        this.pictureUrl = pictureUrl;
        this.authProvider = authProvider;
        this.role = role;
        this.password = null;
    }

    // Constructor dùng để tái tạo User khi chuyển đổi loại (Guest -> Member, Member -> Guest)
    public User(String id, String username, String password, String email,
                String firstName, String lastName, String googleId, String pictureUrl,
                AuthProvider authProvider, Role role, MembershipPlan currentMembershipPlan, LocalDate membershipEndDate) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.googleId = googleId;
        this.pictureUrl = pictureUrl;
        this.authProvider = authProvider;
        this.role = role;
        this.currentMembershipPlan = currentMembershipPlan;
        this.membershipEndDate = membershipEndDate;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public abstract void login();

    @Override
    public void updateProfile() {
    }
}