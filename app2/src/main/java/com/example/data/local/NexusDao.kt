package com.example.data.local

import androidx.room.*
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface NexusDao {

    // User Profile
    @Query("SELECT * FROM user_profile WHERE id = 1")
    fun getUserProfile(): Flow<UserProfile?>

    @Query("SELECT * FROM user_profile WHERE id = 1")
    suspend fun getUserProfileSync(): UserProfile?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProfile(profile: UserProfile)

    // Goal Tasks
    @Query("SELECT * FROM goal_tasks ORDER BY dateCreated DESC")
    fun getAllGoalTasks(): Flow<List<GoalTask>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGoalTask(task: GoalTask)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGoalTasks(tasks: List<GoalTask>)

    @Query("UPDATE goal_tasks SET isCompleted = :isCompleted WHERE id = :id")
    suspend fun updateTaskStatus(id: Int, isCompleted: Boolean)

    @Query("DELETE FROM goal_tasks WHERE id = :id")
    suspend fun deleteTask(id: Int)

    @Query("DELETE FROM goal_tasks")
    suspend fun clearAllTasks()

    // Messages
    @Query("SELECT * FROM messages WHERE chatName = :chatName ORDER BY timestamp ASC")
    fun getMessagesForChat(chatName: String): Flow<List<Message>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: Message)

    @Query("DELETE FROM messages WHERE id = :id")
    suspend fun deleteMessage(id: Int)

    @Query("DELETE FROM messages WHERE dateExpiry IS NOT NULL AND dateExpiry < :now")
    suspend fun pruneExpiredMessages(now: Long)

    // Matched People
    @Query("SELECT * FROM matched_people")
    fun getAllMatchedPeople(): Flow<List<MatchedPerson>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMatchedPeople(people: List<MatchedPerson>)

    @Query("UPDATE matched_people SET isConnected = :isConnected WHERE id = :id")
    suspend fun updateMatchedConnection(id: Int, isConnected: Boolean)

    // Community / Broadcast Channels
    @Query("SELECT * FROM community_channels")
    fun getAllChannels(): Flow<List<CommunityChannel>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChannels(channels: List<CommunityChannel>)

    @Query("UPDATE community_channels SET isJoined = :isJoined WHERE id = :id")
    suspend fun updateChannelJoinStatus(id: Int, isJoined: Boolean)

    // Readiness Checks
    @Query("SELECT * FROM readiness_checks ORDER BY timestamp DESC")
    fun getAllReadinessChecks(): Flow<List<ReadinessCheck>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReadinessCheck(check: ReadinessCheck)

    @Query("UPDATE readiness_checks SET decision = :decision WHERE id = :id")
    suspend fun updateReadinessDecision(id: Int, decision: String)
}
