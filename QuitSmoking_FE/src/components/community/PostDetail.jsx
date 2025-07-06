import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import CommentSection from '../community/CommentSection';
import { motion } from 'framer-motion';
import AvatarFromName from '../common/AvatarFromName';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/community/posts/${postId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch post');
                }
                const data = await response.json();
                setPost(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-8"
        >
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center text-green-600 hover:text-green-800"
            >
                ← Quay lại
            </button>

            <motion.div
                className="bg-white rounded-xl shadow-md p-6 mb-8"
                whileHover={{ y: -3 }}
            >
                <div className="flex items-start space-x-4 mb-4">
                    {post.pictureUrl ? (
                        <img
                            src={post.pictureUrl.startsWith("http")
                                ? post.pictureUrl
                                : `http://localhost:8080${post.pictureUrl}`}
                            alt={post.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                        />
                    ) : (
                        <AvatarFromName
                            firstName={post.firstName}
                            lastName={post.lastName}
                            size={48}
                        />
                    )}
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-gray-800">{post.username}</h4>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Active Member
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-lg">❤️</span>
                        <span className="text-sm">{post.likesCount}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-lg">💬</span>
                        <span className="text-sm">Bình luận</span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
      {post.commentsCount}
    </span>
                    </div>
                </div>
            </motion.div>

            <CommentSection postId={postId} />
        </motion.div>
    );
};

export default PostDetail;