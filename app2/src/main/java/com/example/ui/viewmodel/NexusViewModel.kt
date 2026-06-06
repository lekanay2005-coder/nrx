package com.example.ui.viewmodel

import android.app.Application
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.BuildConfig
import com.example.data.NexusRepository
import com.example.data.FeedPost
import com.example.data.remote.*
import com.example.data.local.NexusDatabase
import com.example.data.model.*
import com.example.ui.theme.NexusPrimary
import com.example.ui.theme.NexusSecondary
import com.example.ui.theme.NexusAccent
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class NexusViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: NexusRepository

    // Initial Database Configuration
    init {
        val database = NexusDatabase.getDatabase(application)
        repository = NexusRepository(database.nexusDao())
        viewModelScope.launch {
            repository.seedDatabaseIfEmpty()
        }
    }

    // --- Bottom Navigation State ---
    private val _currentTab = MutableStateFlow("HOME") // HOME, DISCOVER, CONNECT, MISSION, INBOX, PROFILE
    val currentTab: StateFlow<String> = _currentTab.asStateFlow()

    fun navigateToTab(tab: String) {
        _currentTab.value = tab
    }

    // --- Flows from Room Database ---
    val userProfile: StateFlow<UserProfile?> = repository.userProfile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val allTasks: StateFlow<List<GoalTask>> = repository.allTasks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val matchedPeople: StateFlow<List<MatchedPerson>> = repository.matchedPeople
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allChannels: StateFlow<List<CommunityChannel>> = repository.allChannels
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val readinessChecks: StateFlow<List<ReadinessCheck>> = repository.readinessChecks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Loading Indicators & AI Statuses ---
    private val _isAiGenerating = MutableStateFlow(false)
    val isAiGenerating: StateFlow<Boolean> = _isAiGenerating.asStateFlow()

    private val _activeReadinessCheck = MutableStateFlow<ReadinessCheck?>(null)
    val activeReadinessCheck: StateFlow<ReadinessCheck?> = _activeReadinessCheck.asStateFlow()

    private val _moodColor = MutableStateFlow<Color?>(null)
    val moodColor: StateFlow<Color?> = _moodColor.asStateFlow()

    // --- Temporary Fields ---
    private val _introMessageText = MutableStateFlow<String?>(null)
    val introMessageText: StateFlow<String?> = _introMessageText.asStateFlow()

    // Active Chat Selection state
    private val _activeChatName = MutableStateFlow("general-lounge")
    val activeChatName: StateFlow<String> = _activeChatName.asStateFlow()

    val currentChatMessages: StateFlow<List<Message>> = _activeChatName
        .flatMapLatest { repository.getMessagesForChat(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun selectActiveChat(chatName: String) {
        _activeChatName.value = chatName
    }

    // --- Core User Authentication Mocks ---
    fun registerProfile(firstName: String, lastName: String, email: String, chosenGoals: List<String>) {
        viewModelScope.launch {
            val goalsStr = chosenGoals.joinToString(",")
            val current = userProfile.value ?: UserProfile()
            repository.saveProfile(
                current.copy(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    goals = goalsStr,
                    isRegistered = true
                )
            )
            // Generate tasks immediately
            _isAiGenerating.value = true
            repository.generateDailyTasks(chosenGoals)
            _isAiGenerating.value = false
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.saveProfile(UserProfile(isRegistered = false))
            navigateToTab("SPLASH")
        }
    }

    // --- JOB 1: Force Generate Tasks ---
    fun rebuildDailyTasks() {
        viewModelScope.launch {
            val profile = userProfile.value
            val isRegistered = profile?.isRegistered ?: false
            if (isRegistered && profile != null) {
                _isAiGenerating.value = true
                val goals = profile.goals.split(",").filter { it.isNotEmpty() }
                repository.generateDailyTasks(goals)
                _isAiGenerating.value = false
            }
        }
    }

    fun toggleTaskCompletion(taskId: Int, isCompleted: Boolean) {
        viewModelScope.launch {
            repository.updateTaskCompletion(taskId, isCompleted)
        }
    }

    // --- JOB 2: Intercept with Readiness Guard ---
    fun triggerReadinessGuard(actionType: String, content: String, onComplete: (ReadinessCheck) -> Unit) {
        viewModelScope.launch {
            _isAiGenerating.value = true
            val check = repository.performReadinessCheck(actionType, content)
            _activeReadinessCheck.value = check
            _isAiGenerating.value = false
            onComplete(check)
        }
    }

    fun submitReadinessDecision(decision: String) {
        val active = _activeReadinessCheck.value ?: return
        viewModelScope.launch {
            repository.updateReadinessDecision(active.id, decision)
            _activeReadinessCheck.value = null
        }
    }

    fun clearActiveReadinessCheck() {
        _activeReadinessCheck.value = null
    }

    // --- JOB 3: Generate Matched connection Intro ---
    fun createSmartIntroMessage(targetPerson: MatchedPerson) {
        viewModelScope.launch {
            _isAiGenerating.value = true
            val intro = repository.generateSmartIntro(targetPerson.name, targetPerson.matchReason)
            _introMessageText.value = intro
            _isAiGenerating.value = false
        }
    }

    fun connectToMatchedPerson(id: Int) {
        viewModelScope.launch {
            repository.connectWithPerson(id, true)
            _introMessageText.value = null
        }
    }

    fun dismissIntro() {
        _introMessageText.value = null
    }

    // --- JOB 4: Feed curation, gets filtered items based on user profile goals ---
    fun getAIFilteredFeed(): List<FeedPost> {
        val goalsStr = userProfile.value?.goals ?: ""
        val goals = goalsStr.split(",").filter { it.isNotEmpty() }
        return repository.getAIFilteredFeed(goals)
    }

    // --- Messaging and channels ---
    fun sendMessage(chat: String, messageText: String, isDisappearing: Boolean = false) {
        val profile = userProfile.value ?: return
        val senderName = "${profile.firstName} ${profile.lastName}".trim()
        val senderId = if (senderName.isNotEmpty()) senderName else "User"

        viewModelScope.launch {
            val hapticPattern = if (messageText.contains("!") || messageText.contains("urgent")) "HEAVY" else "LIGHT"
            val expiry = if (isDisappearing) System.currentTimeMillis() + 24 * 60 * 60 * 1000 else null

            val msg = Message(
                chatName = chat,
                senderId = "self",
                senderName = senderId,
                text = messageText,
                isDisappearing = isDisappearing,
                dateExpiry = expiry,
                hapticPattern = hapticPattern
            )
            repository.saveMessage(msg)

            // If messaging general-lounge or ai-chat, generate a funny / relevant AI suggested automated response!
            if (chat == "lekanay2005" || chat == "ai-chat") {
                simulateAiResponse(chat, messageText)
            }
        }
    }

    private fun simulateAiResponse(chat: String, userMessage: String) {
        viewModelScope.launch {
            _isAiGenerating.value = true
            val apiKey = BuildConfig.GEMINI_API_KEY
            val replyText = if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
                "Awesome message! Nexus AI is fully aligned with your current task flow."
            } else {
                try {
                    val request = GeminiRequest(
                        contents = listOf(
                            Content(
                                parts = listOf(
                                    Part(text = "The user says: '$userMessage'. Give a direct 1-sentence reply as Nexus AI.")
                                )
                            )
                        ),
                        systemInstruction = Content(
                            parts = listOf(
                                Part(text = "Direct, friendly 1-sentence reply as Nexus AI.")
                            )
                        )
                    )
                    val response = GeminiRetrofitClient.service.generateContent(apiKey, request)
                    response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: "Nexus AI is aligned!"
                } catch (e: Exception) {
                    "That's fantastic. Let's keep making progress!"
                }
            }

            val aiMsg = Message(
                chatName = chat,
                senderId = "ai",
                senderName = if (chat == "lekanay2005") "Lekan Ayodele" else "Nexus AI",
                text = replyText,
                isDisappearing = false
            )
            repository.saveMessage(aiMsg)
            _isAiGenerating.value = false
        }
    }

    fun joinCommunityChannel(id: Int, join: Boolean) {
        viewModelScope.launch {
            repository.joinChannel(id, join)
        }
    }

    // --- Particle Mood Color Shifts ---
    fun shiftMoodColor(mood: String) {
        val color = when (mood.lowercase()) {
            "energetic" -> NexusAccent // Coral
            "focused" -> NexusSecondary // Teal
            "inspired" -> NexusPrimary // Purple
            else -> null
        }
        _moodColor.value = color
    }
}
