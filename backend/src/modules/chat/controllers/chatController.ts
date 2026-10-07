import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Interaction } from "../../feed/models/Interaction";
import mongoose from "mongoose";

// Helper to check mutual match
const checkMutualMatch = async (userId: string, targetId: string) => {
  const [sentLike, receivedLike] = await Promise.all([
    Interaction.findOne({ actorId: userId, targetId, action: "like" }),
    Interaction.findOne({ actorId: targetId, targetId: userId, action: "like" })
  ]);
  return !!(sentLike && receivedLike);
};

export const getConversations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // 1. Get all mutual matches
  const sentInteractions = await Interaction.find({ actorId: userId, action: "like" });
  const receivedInteractions = await Interaction.find({ targetId: userId, action: "like" });
  
  const sentTargetIds = sentInteractions.map(i => i.targetId.toString());
  const receivedActorIds = receivedInteractions.map(i => i.actorId.toString());
  
  const mutualMatchIds = sentTargetIds.filter(id => receivedActorIds.includes(id));

  // 2. Fetch existing conversations
  const conversations = await Conversation.find({ participants: userId })
    .populate("lastMessage");

  if (mutualMatchIds.length === 0) {
    return res.status(200).json([]);
  }

  // 3. Fetch user details for all mutual matches
  const User = require("../../auth/models/User").User;
  const mutualUsers = await User.find({ _id: { $in: mutualMatchIds } }) as any[];
  
  // Fetch profiles safely
  let mutualProfiles: any[] = [];
  if (mongoose.connection.db) {
    mutualProfiles = await mongoose.connection.db.collection("profiles")
      .find({ userId: { $in: mutualUsers.map((u: any) => u._id) } })
      .toArray();
  }

  // 4. Merge mutual matches with conversations
  const result = mutualUsers.map((user: any) => {
    const convo = conversations.find(c => 
      c.participants.some(p => p.toString() === user._id.toString())
    );
    const profile = mutualProfiles.find(p => p.userId.toString() === user._id.toString());
    
    return {
      _id: convo ? convo._id : `new_${user._id}`,
      otherUser: {
        _id: user._id,
        name: user.name,
        mainPhoto: profile?.mainPhoto || null
      },
      lastMessage: convo?.lastMessage || null,
      updatedAt: convo ? convo.updatedAt : new Date(0) // Default old date so active chats bubble up
    };
  });

  // Sort by updatedAt descending
  result.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.status(200).json(result);
});

export const getMessages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  const targetId = req.params.targetId as string;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // Check if mutual match exists
  const isMatch = await checkMutualMatch(userId, targetId);
  if (!isMatch) {
    return res.status(403).json({ message: "You can only chat with mutual matches." });
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, targetId] }
  });

  if (!conversation) {
    return res.status(200).json({ messages: [] });
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 });

  // Mark unread messages as read
  await Message.updateMany(
    { conversationId: conversation._id, senderId: targetId, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({ messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  const targetId = req.params.targetId as string;
  const { content } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!content) return res.status(400).json({ message: "Content is required" });

  const isMatch = await checkMutualMatch(userId, targetId);
  if (!isMatch) {
    return res.status(403).json({ message: "You can only chat with mutual matches." });
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, targetId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, targetId]
    });
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: userId,
    content
  });

  conversation.lastMessage = message._id as mongoose.Types.ObjectId;
  await conversation.save();

  // Emitting the message is done inside the Socket layer, but we can return it
  res.status(201).json(message);
});
