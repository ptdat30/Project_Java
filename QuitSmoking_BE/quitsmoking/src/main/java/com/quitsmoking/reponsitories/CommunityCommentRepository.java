package com.quitsmoking.reponsitories;

import com.quitsmoking.model.CommunityComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, String> {
    
    Page<CommunityComment> findByPostIdOrderByCreatedAtAsc(String postId, Pageable pageable);
    
    List<CommunityComment> findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(String postId);
    
    List<CommunityComment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
    
    long countByPostId(String postId);
    
    List<CommunityComment> findByUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT c FROM CommunityComment c WHERE c.post.id = :postId AND c.parentComment IS NULL ORDER BY c.createdAt ASC")
    List<CommunityComment> findTopLevelCommentsByPostId(@Param("postId") String postId);
    
    @Query("SELECT c FROM CommunityComment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
    List<CommunityComment> findRepliesByParentCommentId(@Param("parentId") String parentId);
    
    void deleteByPostId(String postId);
}
