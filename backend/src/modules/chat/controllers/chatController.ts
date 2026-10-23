import { Notification } from "../../notifications/models/Notification";
import { Request, Response, NextFunction } from "express";

import { asyncHandler } from "../../../utils/asyncHandler";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Interaction } from "../../feed/models/Interaction";
import mongoose from "mongoose";

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

  // 2. Get blocked by me & them
  const blockedByMeInteractions = await Interaction.find({ actorId: userId, action: "block" });
  const blockedByMeIds = blockedByMeInteractions.map(i => i.targetId.toString());

  const blockedByThemInteractions = await Interaction.find({ targetId: userId, action: "block" });
  const blockedByThemIds = blockedByThemInteractions.map(i => i.actorId.toString());

  // 3. Fetch existing conversations
  const conversations = await Conversation.find({ participants: userId })
    .populate("lastMessage");

  const convoOtherUserIds = conversations
    .flatMap(c => c.participants.map(p => p.toString()))
    .filter(p => p !== userId.toString());

  const allVisibleUserIds = Array.from(new Set([...mutualMatchIds, ...convoOtherUserIds]));

  if (allVisibleUserIds.length === 0) {
    return res.status(200).json([]);
  }

  // 4. Fetch user details
  const User = require("../../auth/models/User").User;
  const allUsers = await User.find({
    _id: { $in: allVisibleUserIds },
    isBanned: { $ne: true },
  }) as any[];
  
  // Fetch profiles safely
  let mutualProfiles: any[] = [];
  if (mongoose.connection.db) {
    mutualProfiles = await mongoose.connection.db.collection("profiles")
      .find({ userId: { $in: allUsers.map((u: any) => u._id) } })
      .toArray();
  }

  // Fetch unread counts
  const unreadCounts = await require("../models/Message").Message.aggregate([
    { $match: { senderId: { $ne: new mongoose.Types.ObjectId(userId) }, isRead: false } },
    { $group: { _id: "$conversationId", count: { $sum: 1 } } }
  ]);

// 5. Merge
  const result = allUsers.map((user: any) => {
    const convo = conversations.find(c => 
      c.participants.some(p => p.toString() === user._id.toString())
    );
    const profile = mutualProfiles.find(p => p.userId.toString() === user._id.toString());
    
    const unread = convo 
      ? unreadCounts.find((u: any) => u._id.toString() === convo._id.toString())?.count || 0 
      : 0;
      
    const isMutual = mutualMatchIds.includes(user._id.toString());
    const haveISentLike = sentTargetIds.includes(user._id.toString());

    return {
      _id: convo ? convo._id : `new_${user._id}`,
      otherUser: {
        _id: user._id,
        name: user.name,
        mainPhoto: profile?.mainPhoto || null
      },
      lastMessage: convo?.lastMessage || null,
      unreadCount: unread,
      isBlockedByMe: blockedByMeIds.includes(user._id.toString()),
      isBlockedByThem: blockedByThemIds.includes(user._id.toString()),
      isMutual,
      haveISentLike,
      updatedAt: convo ? convo.updatedAt : new Date(0)
    };
  });

  result.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.status(200).json(result);
});

export const getMessages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  const targetId = req.params.targetId as string;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const User = require("../../auth/models/User").User;
  const targetUser = await User.findById(targetId).select("isBanned");
  if (!targetUser || targetUser.isBanned) {
    return res.status(403).json({ message: "This user's account has been suspended.", isSuspended: true });
  }

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, targetId] }
  });

  if (!conversation) {
    const isMatch = await checkMutualMatch(userId, targetId);
    if (!isMatch) {
      return res.status(403).json({ message: "You can only chat with mutual matches." });
    }
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

  const User = require("../../auth/models/User").User;
  const targetUser = await User.findById(targetId).select("isBanned");
  if (!targetUser || targetUser.isBanned) {
    return res.status(403).json({ message: "This account has been suspended and is no longer available.", isSuspended: true });
  }

  // Check blocks
  const isBlockedByThem = await Interaction.findOne({ actorId: targetId, targetId: userId, action: "block" });
  if (isBlockedByThem) {
    return res.status(403).json({ message: "You cannot message this user." });
  }

  const isBlockedByMe = await Interaction.findOne({ actorId: userId, targetId: targetId, action: "block" });
  if (isBlockedByMe) {
    return res.status(403).json({ message: "You must unblock this user first." });
  }

  // STRICT MUTUAL MATCH CHECK
  const isMatch = await checkMutualMatch(userId, targetId);
  if (!isMatch) {
    return res.status(403).json({ message: "You can only chat with mutual matches. Send a request to chat again." });
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

  // Create or update a single unread notification for this chat
  const notif = await Notification.findOneAndUpdate(
    { userId: targetId, type: "new_message", relatedUserId: userId, isRead: false },
    { message: "Sent you a new message", createdAt: new Date() },
    { upsert: true, new: true }
  );

  // Emit real-time Socket.IO event to recipient's personal room
  const io = (req as any).io;
  if (io) {
    const messagePayload = {
      _id: message._id.toString(),
      conversationId: conversation._id.toString(),
      senderId: userId.toString(),
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt ? message.createdAt.toISOString() : new Date().toISOString(),
    };
    io.to(targetId.toString()).emit("receiveMessage", messagePayload);
    if (notif) {
      io.to(targetId.toString()).emit("newNotification", notif);
    }
  }

  res.status(201).json(message);
});

export const clearChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  const targetId = req.params.targetId as string;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, targetId] }
  });

  if (!conversation) return res.status(404).json({ message: "Chat not found" });

  // Delete all messages in the conversation
  await Message.deleteMany({ conversationId: conversation._id });
  
  // Also clear lastMessage in conversation
  conversation.lastMessage = undefined as any;
  await conversation.save();

  res.status(200).json({ message: "Chat cleared successfully" });
});
