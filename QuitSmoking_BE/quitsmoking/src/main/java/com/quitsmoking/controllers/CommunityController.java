package com.quitsmoking.controllers;
import com.quitsmoking.model.CommunityPost;
import com.quitsmoking.model.User;
import com.quitsmoking.services.CommunityService;
import com.quitsmoking.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class CommunityController {
    @Autowired
    private CommunityService communityService;
    @Autowired
    private UserService userService;
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @RequestBody CreatePostRequest request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            
            CommunityPost post = communityService.createPost(
                user,
                request.getTitle(),
                request.getContent(),
                request.getPostType(),
                request.getAchievementId()
            );
            
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CommunityPost> posts = communityService.getAllPosts(pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts/type/{postType}")
    public ResponseEntity<?> getPostsByType(
            @PathVariable CommunityPost.PostType postType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CommunityPost> posts = communityService.getPostsByType(postType, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts/my")
    public ResponseEntity<?> getMyPosts(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<CommunityPost> posts = communityService.getUserPosts(user);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts/featured")
    public ResponseEntity<?> getFeaturedPosts() {
        try {
            List<CommunityPost> posts = communityService.getFeaturedPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts/popular")
    public ResponseEntity<?> getPopularPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CommunityPost> posts = communityService.getMostPopularPosts(pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CommunityPost> posts = communityService.searchPosts(keyword, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getPost(@PathVariable String postId) {
        try {
            Optional<CommunityPost> post = communityService.getPostById(postId);
            if (post.isPresent()) {
                return ResponseEntity.ok(post.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId) {
        try {
            CommunityPost post = communityService.likePost(postId);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PutMapping("/posts/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestBody UpdatePostRequest request,
            Authentication authentication) {
        try {
            // Kiểm tra quyền sở hữu post (implement sau)
            CommunityPost post = communityService.updatePost(postId, request.getTitle(), request.getContent());
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable String postId,
            Authentication authentication) {
        try {
            // Kiểm tra quyền sở hữu post (implement sau)
            communityService.deletePost(postId);
            return ResponseEntity.ok().body("Đã xóa bài viết");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    // Admin endpoint
    @PostMapping("/posts/{postId}/feature")
    public ResponseEntity<?> setFeaturedPost(
            @PathVariable String postId,
            @RequestParam boolean featured,
            Authentication authentication) {
        try {
            // Kiểm tra quyền admin (implement sau)
            CommunityPost post = communityService.setFeatured(postId, featured);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    // DTO classes
    public static class CreatePostRequest {
        private String title;
        private String content;
        private CommunityPost.PostType postType;
        private String achievementId;
        // Constructors
        public CreatePostRequest() {}
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public CommunityPost.PostType getPostType() { return postType; }
        public void setPostType(CommunityPost.PostType postType) { this.postType = postType; }
        public String getAchievementId() { return achievementId; }
        public void setAchievementId(String achievementId) { this.achievementId = achievementId; }
    }
    public static class UpdatePostRequest {
        private String title;
        private String content;
        // Constructors
        public UpdatePostRequest() {}
        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}