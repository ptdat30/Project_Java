import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import AvatarFromName from '../common/AvatarFromName';

const Comment = ({ comment, onReply, onDelete, isOwner }) => {
    const { user } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
            <div className="flex items-start space-x-3 mb-2">
                {comment.user?.pictureUrl ? (
                    <img
                        src={comment.user.pictureUrl.startsWith("http")
                            ? comment.user.pictureUrl
                            : `http://localhost:8080${comment.user.pictureUrl}`}
                        alt={comment.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <AvatarFromName
                        firstName={comment.user?.firstName || comment.user?.username?.split(' ')[0]}
                        lastName={comment.user?.lastName || comment.user?.username?.split(' ')[1] || ''}
                        size={32}
                    />
                )}

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-800">
                            {comment.user?.username || 'Ẩn danh'}
                        </h4>
                        <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-gray-700 mt-1 text-sm whitespace-pre-line">
                        {comment.content}
                    </p>
                </div>
            </div>

            <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                <button
                    onClick={() => onReply(comment.id, `@${comment.user?.username} `)}
                    className="hover:text-blue-500"
                >
                    Phản hồi
                </button>
                {isOwner && (
                    <button
                        onClick={() => onDelete(comment.id)}
                        className="hover:text-red-500"
                    >
                        Xóa
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default Comment;