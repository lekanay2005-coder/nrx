package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey val id: Int = 1,
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val phone: String = "",
    val bio: String = "Building the future on NEXUS",
    val goals: String = "Learning,Social,Career", // Comma-separated goals
    val skills: String = "Kotlin,UI Design,AI Integration", // Comma-separated skills
    val experience: String = "Self-taught Developer",
    val portfolio: String = "[{\"title\":\"Nexus Super Social\",\"desc\":\"Combining Facebook, Telegram, Discord, TikTok, WhatsApp and Linkedin all in one app!\"}]", // JSON string of portfolio items
    val isRegistered: Boolean = false,
    val selectedThemeMode: String = "DARK" // DARK or LIGHT
)

@Entity(tableName = "goal_tasks")
data class GoalTask(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val taskDescription: String,
    val taskType: String, // "DAILY" or "WEEKLY"
    val isCompleted: Boolean = false,
    val associatedGoal: String,
    val dateCreated: Long = System.currentTimeMillis()
)

@Entity(tableName = "messages")
data class Message(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val chatName: String, // e.g. "General", "AI", "lekanay2005"
    val senderId: String,
    val senderName: String,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isDisappearing: Boolean = false,
    val dateExpiry: Long? = null,
    val hapticPattern: String? = null,
    val reactionList: String = "" // comma separated list
)

@Entity(tableName = "matched_people")
data class MatchedPerson(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val role: String,
    val goals: String,
    val matchReason: String,
    val introMessage: String,
    val avatarColorSeed: Int = (0..5).random(),
    val isConnected: Boolean = false
)

@Entity(tableName = "community_channels")
data class CommunityChannel(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val description: String,
    val category: String, // "Career", "Gaming", "Networking", "Tech"
    val isBroadcastChannel: Boolean = false, // Telegram style vs Discord style
    val subscriberCount: Int = (100..4500).random(),
    val isJoined: Boolean = false
)

@Entity(tableName = "readiness_checks")
data class ReadinessCheck(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val actionType: String, // "Posting Update", "Applying for Job", "Sending Message"
    val contentProposed: String,
    val readinessScore: Int, // 0 - 100
    val feedback: String,
    val timestamp: Long = System.currentTimeMillis(),
    val decision: String = "PENDING" // "APPROVED", "CANCELLED"
)
