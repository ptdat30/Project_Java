package com.quitsmoking.services;
import com.quitsmoking.model.CommunityPost;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.CommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
@Service
public class CommunityService {
    @Autowired
    private CommunityPostRepository communityPostRepository;
    public CommunityPost createPost(User user, String title, String content, 
                                   CommunityPost.PostType postType, String achievementId) {
        CommunityPost post = new CommunityPost(user, title, content, postType);
        // Nếu có achievementId, set achievement (implement sau)
        return communityPostRepository.save(post);
    }
    public Page<CommunityPost> getAllPosts(Pageable pageable) {
        return communityPostRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    public Page<CommunityPost> getPostsByType(CommunityPost.PostType postType, Pageable pageable) {
        return communityPostRepository.findByPostTypeOrderByCreatedAtDesc(postType, pageable);
    }
    public List<CommunityPost> getUserPosts(User user) {
        return communityPostRepository.findByUserOrderByCreatedAtDesc(user);
    }
    public List<CommunityPost> getFeaturedPosts() {
        return communityPostRepository.findByIsFeaturedTrueOrderByCreatedAtDesc();
    }
    public Page<CommunityPost> searchPosts(String keyword, Pageable pageable) {
        return communityPostRepository.searchPosts(keyword, pageable);
    }
    public Page<CommunityPost> getMostPopularPosts(Pageable pageable) {
        return communityPostRepository.findMostPopularPosts(pageable);
    }
    public Optional<CommunityPost> getPostById(String postId) {
        return communityPostRepository.findById(postId);
    }
    public CommunityPost likePost(String postId) {
        Optional<CommunityPost> postOpt = communityPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            CommunityPost post = postOpt.get();
            post.setLikesCount(post.getLikesCount() + 1);
            return communityPostRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }
    public CommunityPost updatePost(String postId, String title, String content) {
        Optional<CommunityPost> postOpt = communityPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            CommunityPost post = postOpt.get();
            post.setTitle(title);
            post.setContent(content);
            return communityPostRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }
    public void deletePost(String postId) {
        communityPostRepository.deleteById(postId);
    }
    public CommunityPost setFeatured(String postId, boolean featured) {
        Optional<CommunityPost> postOpt = communityPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            CommunityPost post = postOpt.get();
            post.setFeatured(featured);
            return communityPostRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }
}
