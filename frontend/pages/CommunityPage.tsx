import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, Send, User } from 'lucide-react';
import { useData } from '../context/DataContext';

const Community: React.FC = () => {
  const { posts, addPost, addComment, likePost, currentUser } = useData();
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      addPost(newPostContent);
      setNewPostContent('');
    }
  };

  const handleReplySubmit = (postId: string) => {
    const content = replyContent[postId];
    if (content?.trim()) {
      addComment(postId, content);
      setReplyContent({ ...replyContent, [postId]: '' });
      setActiveReplyId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header e Novo Post */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Comunidade de Mães</h2>
        <p className="opacity-90 mb-6">Troque experiências, tire dúvidas e compartilhe este momento único.</p>
        
        <form onSubmit={handlePostSubmit} className="relative">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="No que você está pensando hoje?"
            className="w-full p-4 pr-12 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none h-24"
          />
          <button 
            type="submit" 
            disabled={!newPostContent.trim()}
            className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                 <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{post.authorName}</h4>
                <p className="text-xs text-slate-400">{post.timestamp}</p>
              </div>
            </div>
            
            <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>
            
            {/* Actions */}
            <div className="flex items-center gap-6 border-t border-slate-50 pt-4 mb-4">
              <button 
                onClick={() => likePost(post.id)}
                className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors text-sm group"
              >
                <Heart className="w-4 h-4 group-hover:fill-rose-500" /> {post.likes}
              </button>
              <button 
                onClick={() => setActiveReplyId(activeReplyId === post.id ? null : post.id)}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" /> {post.comments ? post.comments.length : 0} Comentários
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-teal-500 transition-colors text-sm ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Comments Section */}
            {(activeReplyId === post.id || (post.comments && post.comments.length > 0)) && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                {post.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                      {comment.authorName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 mr-2">{comment.authorName}</span>
                      <span className="text-slate-600">{comment.content}</span>
                    </div>
                  </div>
                ))}
                
                {/* Reply Input */}
                {activeReplyId === post.id && (
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={replyContent[post.id] || ''}
                      onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                      placeholder="Escreva um comentário..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
                    />
                    <button 
                      onClick={() => handleReplySubmit(post.id)}
                      className="text-indigo-600 font-medium text-sm hover:underline"
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;