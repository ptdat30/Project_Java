import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Comment from '../community/Comment';
import { motion } from 'framer-motion';
import AvatarFromName from '../common/AvatarFromName';

const CommentSection = ({ postId, showTitle = true }) => {
    const { isAuthenticated, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('jwt_token');
                const headers = {};

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(
                    `http://localhost:8080/api/community/comments/post/${postId}`,
                    { headers }
                );

                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setError('Vui lòng đăng nhập để bình luận');
                return;
            }

            const response = await fetch('http://localhost:8080/api/community/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    postId,
                    content: newComment
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to post comment');
            }

            const createdComment = await response.json();
            setComments(prev => [createdComment, ...prev]);
            setNewComment('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="mt-4">
            {showTitle && (
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                    Bình luận ({comments.length})
                </h3>
            )}

            {isAuthenticated ? (
                <div className="mb-6">
                    <div className="flex items-start space-x-3">
                        {user.pictureUrl ? (
                            <img
                                src={user.pictureUrl.startsWith("http")
                                    ? user.pictureUrl
                                    : `http://localhost:8080${user.pictureUrl}`}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover border border-green-200"
                            />
                        ) : (
                            <AvatarFromName
                                firstName={user.firstName}
                                lastName={user.lastName}
                                size={40}
                            />
                        )}

                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận..."
                                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows="3"
                            />
                            <div className="flex justify-end mt-2">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Gửi bình luận
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4 text-center text-gray-600">
                    <p>Vui lòng <a href="/login" className="text-green-600 hover:underline">đăng nhập</a> để bình luận</p>
                </div>
            )}

            {loading && <div className="text-center text-gray-500">Đang tải bình luận...</div>}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="space-y-4">
                {comments.length === 0 && !loading ? (
                    <p className="text-gray-500 text-center">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                ) : (
                    comments.map(comment => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            onReply={(parentId, content) => {
                                if (!isAuthenticated) {
                                    setError('Vui lòng đăng nhập để phản hồi');
                                    return;
                                }
                                // Xử lý reply logic ở đây
                            }}
                            onDelete={(commentId) => {
                                // Xử lý delete logic ở đây
                            }}
                            isOwner={comment.userId === user?.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;