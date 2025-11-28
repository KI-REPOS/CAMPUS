import { Schema, model, Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: string;
  userName: string;
  room: string;
  message: string;
  isModerated: boolean;
  moderationFlags: string[];
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    room: { type: String, required: true, index: true },
    message: { type: String, required: true },
    isModerated: { type: Boolean, default: false },
    moderationFlags: [{ type: String }]
  },
  { timestamps: true, collection: 'chat_messages' }
);
export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);

export interface IForumPost extends Document {
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isModerated: boolean;
  moderationFlags: string[];
}

const ForumPostSchema = new Schema<IForumPost>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    isModerated: { type: Boolean, default: false },
    moderationFlags: [{ type: String }]
  },
  { timestamps: true, collection: 'forum_posts' }
);
export const ForumPost = model<IForumPost>('ForumPost', ForumPostSchema);

export interface IModerationLog extends Document {
  userId: string;
  userName: string;
  contentType: 'chat' | 'forum_post';
  contentId: string;
  reason: string;
  flaggedContent: string;
  action: 'warning' | 'suspension' | 'content_removed';
}

const ModerationLogSchema = new Schema<IModerationLog>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    contentType: { type: String, enum: ['chat', 'forum_post'], required: true },
    contentId: { type: String, required: true },
    reason: { type: String, required: true },
    flaggedContent: { type: String, required: true },
    action: {
      type: String,
      enum: ['warning', 'suspension', 'content_removed'],
      required: true
    }
  },
  { timestamps: true, collection: 'moderation_logs' }
);
export const ModerationLog = model<IModerationLog>('ModerationLog', ModerationLogSchema);
