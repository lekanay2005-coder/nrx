package com.example.data

import android.util.Log
import com.example.BuildConfig
import com.example.data.local.NexusDao
import com.example.data.model.*
import com.example.data.remote.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class NexusRepository(private val nexusDao: NexusDao) {

    // --- Database Queries (Exposed to UI as Live Flows) ---
    val userProfile: Flow<UserProfile?> = nexusDao.getUserProfile()
    val allTasks: Flow<List<GoalTask>> = nexusDao.getAllGoalTasks()
    val matchedPeople: Flow<List<MatchedPerson>> = nexusDao.getAllMatchedPeople()
    val allChannels: Flow<List<CommunityChannel>> = nexusDao.getAllChannels()
    val readinessChecks: Flow<List<ReadinessCheck>> = nexusDao.getAllReadinessChecks()

    fun getMessagesForChat(chatName: String): Flow<List<Message>> = nexusDao.getMessagesForChat(chatName)

    // --- Basic Local Actions ---
    suspend fun saveProfile(profile: UserProfile) = withContext(Dispatchers.IO) {
        nexusDao.insertUserProfile(profile)
    }

    suspend fun updateTaskCompletion(id: Int, isCompleted: Boolean) = withContext(Dispatchers.IO) {
        nexusDao.updateTaskStatus(id, isCompleted)
    }

    suspend fun deleteGoalTask(id: Int) = withContext(Dispatchers.IO) {
        nexusDao.deleteTask(id)
    }

    suspend fun saveMessage(message: Message) = withContext(Dispatchers.IO) {
        nexusDao.insertMessage(message)
    }

    suspend fun joinChannel(id: Int, isJoined: Boolean) = withContext(Dispatchers.IO) {
        nexusDao.updateChannelJoinStatus(id, isJoined)
    }

    suspend fun connectWithPerson(id: Int, isConnected: Boolean) = withContext(Dispatchers.IO) {
        nexusDao.updateMatchedConnection(id, isConnected)
    }

    suspend fun updateReadinessDecision(id: Int, decision: String) = withContext(Dispatchers.IO) {
        nexusDao.updateReadinessDecision(id, decision)
    }

    // --- Database Seedings (For empty/first-launch states) ---
    suspend fun seedDatabaseIfEmpty() = withContext(Dispatchers.IO) {
        val currentProfile = nexusDao.getUserProfileSync()
        if (currentProfile == null) {
            nexusDao.insertUserProfile(UserProfile(isRegistered = false))
        }

        // Seed Channels
        nexusDao.insertChannels(
            listOf(
                CommunityChannel(name = "announcements", description = "Official platformwide status announcements.", category = "General", isBroadcastChannel = true),
                CommunityChannel(name = "ai-builders", description = "Let's build cutting-edge systems using AI agents.", category = "Tech"),
                CommunityChannel(name = "careers-board", description = "Real-time updates on career leads, resumes & portfolios.", category = "Career", isBroadcastChannel = true),
                CommunityChannel(name = "learning-buddies", description = "Group studying Kotlin, algorithms & UX design.", category = "Learning"),
                CommunityChannel(name = "socials-lounge", description = "General hangout room for developers and networkers.", category = "Social")
            )
        )

        // Seed Matched People
        nexusDao.insertMatchedPeople(
            listOf(
                MatchedPerson(name = "Lekan Ayodele", role = "Full-stack Android Engineer", goals = "Learning, Career", matchReason = "Both master mobile architectures and are pursuing software engineering careers.", introMessage = "Hi Lekan! I saw we are both deeply into mobile development and scalability. Let's connect and share progress!"),
                MatchedPerson(name = "Sarah Chen", role = "UI/UX & Product Designer", goals = "Social, Creating", matchReason = "She excels at dynamic interactions while you are building modern UI animations.", introMessage = "Hey Sarah! Love your visual designs. I'm building a mobile particle engine and noticed your creative portfolio. Let's collaborate!"),
                MatchedPerson(name = "Marcus Vance", role = "SaaS Founder & Builder", goals = "Building, Networking", matchReason = "He connects micro-founders. Your goal to grow a brand lines up with his network.", introMessage = "Hi Marcus! I see you are scaling several SaaS products. I'm currently launching active goals and expanding my brand. Let's discuss ideas!")
            )
        )
    }

    // --- GEMINI REST CALLS ---

    private suspend fun callGeminiAPI(prompt: String, systemInstruction: String? = null): String {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            Log.e("NexusAiRepository", "Gemini API key is not set. Using local mock fallbacks.")
            return "MOCK_FALLBACK"
        }

        val request = GeminiRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = systemInstruction?.let { Content(parts = listOf(Part(text = it))) },
            generationConfig = GenerationConfig(temperature = 0.7)
        )

        return try {
            val response = GeminiRetrofitClient.service.generateContent(apiKey, request)
            response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: "No valid response text obtained from Gemini."
        } catch (e: Exception) {
            Log.e("NexusAiRepository", "Exception during Gemini Call: ${e.localizedMessage}")
            "ERROR: ${e.localizedMessage}"
        }
    }

    // --- JOB 1: Daily Task Generation based on user goals ---
    suspend fun generateDailyTasks(goals: List<String>): List<GoalTask> {
        val goalsStr = goals.joinToString(", ")
        val systemPrompt = "You are Nexus AI, the task engine for the Nexus Super Social app. Output exactly between 3 and 5 concrete actionable, micro-goals/tasks for the user matching their active goals. Separate each task with a new line, starting each with a hyphen. Do not add intro/outro."
        val mainPrompt = "The user is working on the following core goals: $goalsStr. Generate 3 to 4 daily tasks and 1 weekly task suited for these goals."

        val result = callGeminiAPI(mainPrompt, systemPrompt)
        
        if (result == "MOCK_FALLBACK" || result.startsWith("ERROR:")) {
            // Local fallback generation
            val mockTasks = mutableListOf<GoalTask>()
            if (goals.contains("Career") || goals.contains("Learning")) {
                mockTasks.add(GoalTask(taskDescription = "Code for 30 minutes in Kotlin / Jetpack Compose", taskType = "DAILY", associatedGoal = "Learning"))
                mockTasks.add(GoalTask(taskDescription = "Review 3 software architecture pattern summaries", taskType = "DAILY", associatedGoal = "Learning"))
                mockTasks.add(GoalTask(taskDescription = "Complete 1 professional CV module update", taskType = "WEEKLY", associatedGoal = "Career"))
            }
            if (goals.contains("Networking") || goals.contains("Social")) {
                mockTasks.add(GoalTask(taskDescription = "Reach out to 2 people on Nexus Connect panel", taskType = "DAILY", associatedGoal = "Networking"))
                mockTasks.add(GoalTask(taskDescription = "Share a status post regarding your current build process", taskType = "DAILY", associatedGoal = "Social"))
            }
            if (goals.contains("Creating") || goals.contains("Building")) {
                mockTasks.add(GoalTask(taskDescription = "Design a low-fidelity wireframe sketch for your app concept", taskType = "DAILY", associatedGoal = "Creating"))
                mockTasks.add(GoalTask(taskDescription = "Upload a short video asset showcase on Nexus Discover", taskType = "WEEKLY", associatedGoal = "Building"))
            }
            // If empty, add default
            if (mockTasks.isEmpty()) {
                mockTasks.add(GoalTask(taskDescription = "Complete 2 articles of career reading", taskType = "DAILY", associatedGoal = "Learning"))
                mockTasks.add(GoalTask(taskDescription = "Establish 1 connections to similar builders on Nexus", taskType = "DAILY", associatedGoal = "Social"))
                mockTasks.add(GoalTask(taskDescription = "Draft a portfolio item for your LinkedIn board profile", taskType = "WEEKLY", associatedGoal = "Career"))
            }
            nexusDao.clearAllTasks()
            nexusDao.insertGoalTasks(mockTasks)
            return mockTasks
        } else {
            val tasks = result.lines()
                .map { it.trim().removePrefix("-").trim() }
                .filter { it.isNotEmpty() }
                .mapIndexed { idx, desc ->
                    val type = if (idx == 0) "WEEKLY" else "DAILY"
                    val rGoal = goals.randomOrNull() ?: "General"
                    GoalTask(taskDescription = desc, taskType = type, associatedGoal = rGoal)
                }
            if (tasks.isNotEmpty()) {
                nexusDao.clearAllTasks()
                nexusDao.insertGoalTasks(tasks)
            }
            return tasks
        }
    }

    // --- JOB 2: Readiness Guard intercepts critical action ---
    suspend fun performReadinessCheck(actionType: String, actionContent: String): ReadinessCheck {
        val systemPrompt = "You are Nexus AI's Readiness Guard. Before the user takes a major step, analyze the safety/readiness. Output in this CSV-like layout: [SCORE]|[FEEDBACK]. SCORE is 0 to 100 representing safety/readiness. FEEDBACK is 2-3 sentences of advice on potential risks. Example: 85|Looks professional, but check spelling!"
        val mainPrompt = "Action type: $actionType. Content: '$actionContent'."

        val responseContent = callGeminiAPI(mainPrompt, systemPrompt)
        
        val parsedCheck = if (responseContent == "MOCK_FALLBACK" || responseContent.startsWith("ERROR:") || !responseContent.contains("|")) {
            // Mock simulation
            val score = when {
                actionContent.contains("stupid") || actionContent.contains("hate") -> 35
                actionContent.length < 5 -> 50
                else -> 88
            }
            val feedback = when (score) {
                35 -> "Warning: This contains high emotional charge or potential slang. It might harm your professional networking value. Refine with professional spacing."
                50 -> "Your action is a bit empty. We advise adding more detail and a concise value proposition to improve reach."
                else -> "Perfect! Your tone is crisp, professional, and captures your focus. Ready to send off."
            }
            ReadinessCheck(actionType = actionType, contentProposed = actionContent, readinessScore = score, feedback = feedback)
        } else {
            try {
                val parts = responseContent.split("|", limit = 2)
                val score = parts[0].trim().toIntOrNull() ?: 80
                val feedback = parts[1].trim()
                ReadinessCheck(actionType = actionType, contentProposed = actionContent, readinessScore = score, feedback = feedback)
            } catch (e: Exception) {
                ReadinessCheck(actionType = actionType, contentProposed = actionContent, readinessScore = 75, feedback = "Your decision structure is analyzed. Advice: Keep your goal lists aligned and review once more.")
            }
        }
        
        nexusDao.insertReadinessCheck(parsedCheck)
        return parsedCheck
    }

    // --- JOB 3: People Matcher Smart Intro generator ---
    suspend fun generateSmartIntro(targetName: String, reason: String): String {
        val systemPrompt = "You are Nexus AI. Write a 2-sentence conversational, friendly connect proposal intro message from the user to $targetName based on the reason supplied."
        val result = callGeminiAPI("Intro to $targetName. Reason: $reason", systemPrompt)
        return if (result == "MOCK_FALLBACK" || result.startsWith("ERROR:")) {
            "Hey $targetName, noticed we are both working on scaling our tech skills! Let's connect and build."
        } else {
            result
        }
    }

    // --- JOB 4: Feed curation, returns a curated list based on goals ---
    fun getAIFilteredFeed(goals: List<String>): List<FeedPost> {
        // Curation details representing dual social side posts
        val allFeedPosts = listOf(
            FeedPost("sarah_chen", "Designed a glowing particle shader for a brand-new dashboard in Compose! Thoughts? #uidesign #android", "LEARNING, CREATING", 42, 8),
            FeedPost("lekan_coder", "Just built a custom SQLite Room configuration engine in Kotlin with incredible haptic response feedback on buttons!", "CAREER, BUILDING", 57, 12),
            FeedPost("marcus_founder", "Secured initial funding for our modular learning platform! Big thanks to the Nexus Networking circles.", "NETWORKING, BUILDING", 112, 24),
            FeedPost("alice_wander", "Walking around Kyoto during sunset - the gradient colors of the sky look surreal. Inspiring my next artwork palette.", "SOCIAL, CREATING", 83, 14),
            FeedPost("dev_dan", "Struggling with multi-window Compose insets. Any tips on scaling bottom navigation bars gracefully on foldables?", "LEARNING, CAREER", 15, 3),
            FeedPost("branding_guru", "Your online brand is your portfolio. Consistency in typography and content layout will double your outbound leads.", "NETWORKING, CAREER", 132, 45)
        )

        if (goals.isEmpty()) return allFeedPosts

        // Filter: does post category match any user goals?
        return allFeedPosts.filter { post ->
            goals.any { goal -> post.goalCategories.contains(goal.uppercase()) }
        }
    }
}

// Model-like data holder representing posts for main feed (no room persistence needed for static-interactive feed)
data class FeedPost(
    val author: String,
    val text: String,
    val goalCategories: String, // comma separated goals matching
    var likes: Int,
    val comments: Int,
    var isLiked: Boolean = false
)
