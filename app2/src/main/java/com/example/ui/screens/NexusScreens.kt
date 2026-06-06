package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.FeedPost
import com.example.data.model.*
import com.example.ui.components.HapticAssistant
import com.example.ui.components.LivingParticleBackground
import com.example.ui.components.MorphingButton
import com.example.ui.theme.*
import com.example.ui.viewmodel.NexusViewModel

// ==========================================
// SCREEN 1: SPLASH & ONBOARDING STAGES
// ==========================================
@Composable
fun OnboardingScreen(
    viewModel: NexusViewModel,
    onOnboardingComplete: () -> Unit,
    modifier: Modifier = Modifier
) {
    var step by remember { mutableStateOf(1) }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }

    val selectedGoals = remember { mutableStateListOf<String>() }
    val goalsOptions = listOf("Career", "Learning", "Networking", "Creating", "Social", "Building")
    val context = LocalContext.current

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(NexusDarkBg)
    ) {
        // Living particles
        LivingParticleBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header Logo
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 20.dp)
            ) {
                Text(
                    text = "NEXUS",
                    fontSize = 42.sp,
                    fontWeight = FontWeight.Bold,
                    color = NexusPrimary,
                    letterSpacing = 6.sp,
                    modifier = Modifier.testTag("nexus_splash_logo")
                )
                Text(
                    text = "One app. One AI. One life.",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.W500,
                    color = NexusSecondary,
                    letterSpacing = 1.sp
                )
            }

            // Interactive Steps
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                contentAlignment = Alignment.Center
            ) {
                when (step) {
                    1 -> {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.85f)),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Step 1: Set Your Identity",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                OutlinedTextField(
                                    value = firstName,
                                    onValueChange = { firstName = it },
                                    label = { Text("First Name") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth().testTag("first_name_input"),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = NexusPrimary,
                                        unfocusedBorderColor = Color.Gray
                                    )
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                OutlinedTextField(
                                    value = lastName,
                                    onValueChange = { lastName = it },
                                    label = { Text("Last Name") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth().testTag("last_name_input"),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = NexusPrimary,
                                        unfocusedBorderColor = Color.Gray
                                    )
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    label = { Text("Email Address") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = NexusPrimary,
                                        unfocusedBorderColor = Color.Gray
                                    )
                                )
                            }
                        }
                    }
                    2 -> {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.85f)),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Step 2: Choose Your Goals",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Nexus AI uses these to build your custom daily routine and filter your feed.",
                                    fontSize = 12.sp,
                                    color = Color.Gray,
                                    textAlign = TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                FlowRow(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Center,
                                    maxItemsInEachRow = 3
                                ) {
                                    goalsOptions.forEach { goal ->
                                        val isSelected = selectedGoals.contains(goal)
                                        Box(
                                            modifier = Modifier
                                                .padding(6.dp)
                                                .clip(RoundedCornerShape(30.dp))
                                                .background(if (isSelected) NexusSecondary else Color.DarkGray)
                                                .clickable {
                                                    HapticAssistant.triggerHaptic(context, "LIGHT")
                                                    if (isSelected) selectedGoals.remove(goal) else selectedGoals.add(goal)
                                                }
                                                .padding(horizontal = 16.dp, vertical = 8.dp)
                                        ) {
                                            Text(
                                                text = goal,
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 13.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                    3 -> {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.85f)),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageOf = Icons.Default.Face,
                                    contentDescription = "Nexus AI",
                                    tint = NexusPrimary,
                                    modifier = Modifier.size(60.dp)
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = "Meet Nexus AI",
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = "Welcome $firstName! I am your personal growth engine. I will curate your feed, build your milestones, match you with strategic colleagues, and guard your critical choices.",
                                    fontSize = 14.sp,
                                    color = Color.LightGray,
                                    textAlign = TextAlign.Center,
                                    lineHeight = 20.sp
                                )
                            }
                        }
                    }
                }
            }

            // Navigation Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (step > 1) {
                    TextButton(onClick = { step-- }) {
                        Text("Back", color = Color.Gray, fontSize = 16.sp)
                    }
                } else {
                    Spacer(modifier = Modifier.width(50.dp))
                }

                // Page indicator lines
                Row {
                    repeat(3) { index ->
                        Box(
                            modifier = Modifier
                                .padding(4.dp)
                                .size(width = if (step == index + 1) 24.dp else 8.dp, height = 8.dp)
                                .clip(CircleShape)
                                .background(if (step == index + 1) NexusPrimary else Color.DarkGray)
                        )
                    }
                }

                MorphingButton(
                    onClick = {
                        if (step < 3) {
                            if (step == 1 && firstName.isEmpty()) {
                                HapticAssistant.triggerHaptic(context, "WARNING")
                            } else {
                                step++
                            }
                        } else {
                            viewModel.registerProfile(firstName, lastName, email, selectedGoals)
                            onOnboardingComplete()
                        }
                    },
                    modifier = Modifier.width(110.dp)
                ) {
                    Text(
                        text = if (step == 3) "Enter" else "Next",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

// Helper to allow custom icon mappings cleanly
@Composable
fun Icon(imageOf: androidx.compose.ui.graphics.vector.ImageVector, contentDescription: String, tint: Color, modifier: Modifier = Modifier) {
    androidx.compose.material3.Icon(imageVector = imageOf, contentDescription = contentDescription, tint = tint, modifier = modifier)
}

// FlowRow helper to align chips nicely
@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun FlowRow(
    modifier: Modifier = Modifier,
    horizontalArrangement: androidx.compose.foundation.layout.Arrangement.Horizontal = androidx.compose.foundation.layout.Arrangement.Start,
    maxItemsInEachRow: Int = Int.MAX_VALUE,
    content: @Composable () -> Unit
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = modifier,
        horizontalArrangement = horizontalArrangement,
        maxItemsInEachRow = maxItemsInEachRow
    ) {
        content()
    }
}

// ==========================================
// SCREEN 2: LOGIN
// ==========================================
@Composable
fun LoginScreen(
    viewModel: NexusViewModel,
    onLoginSuccess: () -> Unit,
    onNavigateToSignUp: () -> Unit,
    modifier: Modifier = Modifier
) {
    var email by remember { mutableStateOf("lekanay2005@gmail.com") }
    var password by remember { mutableStateOf("••••••••") }
    val context = LocalContext.current

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(NexusDarkBg)
    ) {
        LivingParticleBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "NEXUS",
                fontSize = 44.sp,
                fontWeight = FontWeight.ExtraBold,
                color = NexusPrimary,
                letterSpacing = 6.sp,
                modifier = Modifier.testTag("nexus_title")
            )
            Text(
                text = "One app. One AI. One life.",
                fontSize = 14.sp,
                color = NexusSecondary,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 32.dp)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.9f)),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(
                        text = "Sign In",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().testTag("login_email"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = NexusPrimary,
                            unfocusedBorderColor = Color.Gray
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = NexusPrimary,
                            unfocusedBorderColor = Color.Gray
                        )
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    MorphingButton(
                        onClick = {
                            // Default mock login
                            viewModel.registerProfile("Lekan", "Ayodele", email, listOf("Career", "Learning", "Creating"))
                            onLoginSuccess()
                        },
                        modifier = Modifier.fillMaxWidth().testTag("login_submit_button"),
                        hapticPattern = "SUCCESS"
                    ) {
                        Text("LOGIN", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Social login visual anchors
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        TextButton(onClick = {
                            HapticAssistant.triggerHaptic(context, "LIGHT")
                            viewModel.registerProfile("G-User", "Auth", "google@g.com", listOf("Social", "Learning"))
                            onLoginSuccess()
                        }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Verified, "Google", NexusSecondary, Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Google", color = Color.White)
                            }
                        }
                        TextButton(onClick = {
                            HapticAssistant.triggerHaptic(context, "LIGHT")
                            viewModel.registerProfile("Apple-User", "Auth", "apple@apple.com", listOf("Career", "Building"))
                            onLoginSuccess()
                        }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, "Apple", NexusAccent, Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Apple ID", color = Color.White)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Don't have an account?", color = Color.Gray)
                TextButton(onClick = onNavigateToSignUp) {
                    Text("Register Now", color = NexusSecondary, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ==========================================
// SCREEN 3: SIGN UP
// ==========================================
@Composable
fun SignUpScreen(
    viewModel: NexusViewModel,
    onSignUpSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val selectedGoals = remember { mutableStateListOf<String>() }
    val goalsList = listOf("Career", "Learning", "Networking", "Creating", "Social", "Building")
    val context = LocalContext.current

    val passwordStrength = remember(password) {
        when {
            password.isEmpty() -> 0f
            password.length < 5 -> 0.3f
            password.any { it.isDigit() } && password.any { it.isUpperCase() } -> 1.0f
            else -> 0.6f
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(NexusDarkBg)
    ) {
        LivingParticleBackground()

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            item {
                Text(
                    text = "CREATE NEXUS PROFILE",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = NexusPrimary,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.9f)),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Column(modifier = Modifier.padding(24.dp)) {
                        OutlinedTextField(
                            value = firstName,
                            onValueChange = { firstName = it },
                            label = { Text("First Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth().testTag("signup_firstname"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                                focusedBorderColor = NexusPrimary, unfocusedBorderColor = Color.Gray
                            )
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = lastName,
                            onValueChange = { lastName = it },
                            label = { Text("Last Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                                focusedBorderColor = NexusPrimary, unfocusedBorderColor = Color.Gray
                            )
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Email") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                                focusedBorderColor = NexusPrimary, unfocusedBorderColor = Color.Gray
                            )
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            label = { Text("Password") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                                focusedBorderColor = NexusPrimary, unfocusedBorderColor = Color.Gray
                            )
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        // Password strength visual bar
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Password Strength", fontSize = 11.sp, color = Color.Gray)
                                Text(
                                    text = when (passwordStrength) {
                                        0f -> "None"
                                        0.3f -> "Weak"
                                        0.6f -> "Moderate"
                                        else -> "Strong (AI Approved)"
                                    },
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = when (passwordStrength) {
                                        0.3f -> NexusAccent
                                        0.6f -> NexusPrimary
                                        else -> NexusSecondary
                                    }
                                )
                            }
                            LinearProgressIndicator(
                                progress = { passwordStrength },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .height(4.dp),
                                color = when (passwordStrength) {
                                    0.3f -> NexusAccent
                                    0.6f -> NexusPrimary
                                    else -> NexusSecondary
                                },
                                trackColor = Color.DarkGray
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Active Growth Core Focus:", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                        Spacer(modifier = Modifier.height(6.dp))

                        FlowRow(modifier = Modifier.fillMaxWidth(), maxItemsInEachRow = 3) {
                            goalsList.forEach { goal ->
                                val isSelected = selectedGoals.contains(goal)
                                Box(
                                    modifier = Modifier
                                        .padding(4.dp)
                                        .clip(RoundedCornerShape(30.dp))
                                        .background(if (isSelected) NexusSecondary else Color.DarkGray)
                                        .clickable {
                                            HapticAssistant.triggerHaptic(context, "LIGHT")
                                            if (isSelected) selectedGoals.remove(goal) else selectedGoals.add(goal)
                                        }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(goal, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        MorphingButton(
                            onClick = {
                                if (firstName.isNotEmpty() && email.isNotEmpty() && selectedGoals.isNotEmpty()) {
                                    viewModel.registerProfile(firstName, lastName, email, selectedGoals)
                                    onSignUpSuccess()
                                } else {
                                    HapticAssistant.triggerHaptic(context, "WARNING")
                                }
                            },
                            modifier = Modifier.fillMaxWidth().testTag("signup_submit_button"),
                            hapticPattern = "SUCCESS"
                        ) {
                            Text("CREATE NEXUS ACCOUNT", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(12.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Already on Nexus?", color = Color.Gray)
                    TextButton(onClick = onNavigateToLogin) {
                        Text("Login instead", color = NexusSecondary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// ==========================================
// SCREEN 4: HOME & CURATED FEED
// ==========================================
@Composable
fun HomeScreen(
    viewModel: NexusViewModel,
    modifier: Modifier = Modifier
) {
    val profile by viewModel.userProfile.collectAsState()
    val isAiGenerating by viewModel.isAiGenerating.collectAsState()
    val filteredFeed = remember(profile) { viewModel.getAIFilteredFeed() }
    val context = LocalContext.current

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            // Core Top Greeting Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Good Evening,",
                        fontSize = 14.sp,
                        color = Color.LightGray
                    )
                    Text(
                        text = "${profile?.firstName ?: "Lekan"} ✨",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                // AI Active Badge status
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(30.dp))
                        .background(NexusSecondary.copy(alpha = 0.2f))
                        .border(1.dp, NexusSecondary, RoundedCornerShape(30.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(NexusSecondary)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "AI MODE: ON",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = NexusSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // AI Briefing Card
            Card(
                modifier = Modifier.fillMaxWidth().testTag("ai_briefing_card"),
                colors = CardDefaults.cardColors(containerColor = NexusPrimary.copy(alpha = 0.15f)),
                border = BoxBorder(1.dp, NexusPrimary),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Psychology, "AI Assistant", NexusPrimary, Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "NEXUS AI BRIEFING",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = NexusPrimary,
                            letterSpacing = 1.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Your goal is to grow your skills in ${profile?.goals?.replace(",", ", ") ?: "Learning & Career"}. Focus on completing your daily micro-tasks on the Mission tab. Sarah Chen wants to connect with you!",
                        fontSize = 14.sp,
                        color = Color.White,
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "AI-CURATED GROWTH FEED",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.Gray,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // List of Curated Posts
        items(filteredFeed) { post ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.85f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Author Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(NexusPrimary.copy(alpha = 0.3f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    post.author.take(2).uppercase(),
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "@${post.author}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Filtered via core goals: ${post.goalCategories}",
                                    fontSize = 11.sp,
                                    color = NexusSecondary
                                )
                            }
                        }

                        Icon(Icons.Default.MoreVert, "More Options", Color.Gray)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = post.text,
                        fontSize = 14.sp,
                        color = Color.White,
                        lineHeight = 20.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Post Actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        var isLikedState by remember { mutableStateOf(post.isLiked) }
                        var likeCountState by remember { mutableStateOf(post.likes) }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.clickable {
                                HapticAssistant.triggerHaptic(context, "LIGHT")
                                isLikedState = !isLikedState
                                if (isLikedState) likeCountState++ else likeCountState--
                            }
                        ) {
                            Icon(
                                imageOf = if (isLikedState) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Like",
                                tint = if (isLikedState) NexusAccent else Color.Gray,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("$likeCountState", color = Color.Gray, fontSize = 12.sp)
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Comment, "Comments", Color.Gray, Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("${post.comments}", color = Color.Gray, fontSize = 12.sp)
                        }

                        Icon(Icons.Default.Share, "Share", Color.Gray, Modifier.size(18.dp))
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

// ==========================================
// SCREEN 5: DISCOVER (TIKTOK SCROLL)
// ==========================================
@Composable
fun DiscoverScreen(
    viewModel: NexusViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var activeIndex by remember { mutableStateOf(0) }
    
    val videos = listOf(
        DiscoverVideo("Lekan Ayodele", "Deploying advanced Compose Canvas particles on Android instantly under 20ms!", "#android #canvas", "CAREER"),
        DiscoverVideo("Sarah Chen", "How I design glowing purple color Schemes for modular app dashboards.", "#uidesign #figma", "CREATING"),
        DiscoverVideo("Marcus Vance", "Startup Founders: Why you should scale your team on Nexus rather than X.", "#networking #founder", "NETWORKING")
    )

    val activeVideo = videos[activeIndex]

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Video placeholder design using canvas animations
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            
            // Render a rotating gorgeous visual backdrop to simulate playing video content
            val colorList = listOf(NexusDarkBg, NexusDarkSurface, NexusPrimary.copy(alpha = 0.3f))
            drawRect(
                brush = Brush.verticalGradient(colorList),
                size = size
            )

            // Dynamic orbit
            drawCircle(
                color = NexusSecondary.copy(alpha = 0.2f),
                radius = width * 0.4f,
                center = Offset(width * 0.5f, height * 0.4f)
            )
        }

        // Right hand controls overlay
        Column(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 12.dp)
                .fillMaxHeight(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            DiscoverActionBubble(Icons.Default.Favorite, "1.2K", NexusAccent) {
                HapticAssistant.triggerHaptic(context, "LIGHT")
            }
            DiscoverActionBubble(Icons.Default.Comment, "405", Color.White) {}
            DiscoverActionBubble(Icons.Default.Bookmark, "Save", Color.White) {}
            DiscoverActionBubble(Icons.Default.Share, "Share", Color.White) {}

            Spacer(modifier = Modifier.height(20.dp))

            // Scroll arrows
            IconButton(onClick = {
                HapticAssistant.triggerHaptic(context, "LIGHT")
                activeIndex = (activeIndex + 1) % videos.size
            }) {
                Icon(Icons.Default.KeyboardArrowDown, "Next Video", Color.White, Modifier.size(32.dp))
            }
        }

        // Video descriptions overlay (Bottom left)
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 16.dp, bottom = 100.dp, end = 80.dp)
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(30.dp))
                    .background(NexusPrimary)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "GOAL LINKED: ${activeVideo.category}",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "@${activeVideo.creator}",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = activeVideo.description,
                fontSize = 14.sp,
                color = Color.LightGray
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = activeVideo.tags,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = NexusSecondary
            )
        }
    }
}

data class DiscoverVideo(val creator: String, val description: String, val tags: String, val category: String)

@Composable
fun DiscoverActionBubble(iconOf: androidx.compose.ui.graphics.vector.ImageVector, label: String, tintColor: Color, onClick: () -> Unit = {}) {
    Column(
        modifier = Modifier
            .padding(vertical = 12.dp)
            .clickable { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(45.dp)
                .clip(CircleShape)
                .background(Color.DarkGray.copy(alpha = 0.5f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(iconOf, label, tintColor, Modifier.size(24.dp))
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = label, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

// ==========================================
// SCREEN 6: CONNECT (AI MATCHES)
// ==========================================
@Composable
fun ConnectScreen(
    viewModel: NexusViewModel,
    modifier: Modifier = Modifier
) {
    val matchedPeople by viewModel.matchedPeople.collectAsState()
    val allChannels by viewModel.allChannels.collectAsState()
    val introMessage by viewModel.introMessageText.collectAsState()
    val context = LocalContext.current

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "NEXUS PEOPLE MATCHER",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = NexusSecondary,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            Text(
                text = "Smart introductions based on goals",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // Intro draft popup if any
            if (introMessage != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = NexusSecondary.copy(alpha = 0.15f)),
                    border = BoxBorder(1.dp, NexusSecondary)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, "AI Intro", NexusSecondary, Modifier.size(20.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("DRAFT INTRO MESSAGE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NexusSecondary)
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(introMessage!!, fontSize = 13.sp, color = Color.White)
                        Spacer(Modifier.height(12.dp))
                        Row {
                            TextButton(onClick = { viewModel.dismissIntro() }) {
                                Text("Discard", color = Color.Gray)
                            }
                            Spacer(modifier = Modifier.weight(1f))
                            MorphingButton(onClick = {
                                viewModel.connectToMatchedPerson(1) // match simple demo
                            }) {
                                Text("Send Intro", color = Color.White)
                            }
                        }
                    }
                }
            }
        }

        items(matchedPeople) { person ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.85f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(
                                    when (person.avatarColorSeed) {
                                        0 -> NexusPrimary
                                        1 -> NexusSecondary
                                        else -> NexusAccent
                                    }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(person.name.take(1), color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(person.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(person.role, fontSize = 12.sp, color = Color.LightGray)
                        }

                        if (person.isConnected) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(30.dp))
                                    .background(Color.DarkGray)
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text("Connected", fontSize = 11.sp, color = Color.LightGray)
                            }
                        } else {
                            MorphingButton(
                                onClick = {
                                    viewModel.createSmartIntroMessage(person)
                                },
                                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                            ) {
                                Text("Intro", color = Color.White, fontSize = 12.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Why connect: ${person.matchReason}",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = "COMMUNITIES & CHANNELS",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.Gray,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 12.dp)
            )
        }

        items(allChannels) { chan ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageOf = if (chan.isBroadcastChannel) Icons.Default.Campaign else Icons.Default.Forum,
                            contentDescription = "Channel",
                            tint = if (chan.isBroadcastChannel) NexusAccent else NexusSecondary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("#${chan.name}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Spacer(Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(Color.DarkGray)
                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    Text(chan.category.uppercase(), fontSize = 8.sp, color = Color.White)
                                }
                            }
                            Text("${chan.subscriberCount} users", fontSize = 11.sp, color = Color.Gray)
                        }
                    }

                    Switch(
                        checked = chan.isJoined,
                        onCheckedChange = { viewModel.joinCommunityChannel(chan.id, it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = NexusPrimary,
                            checkedTrackColor = NexusPrimary.copy(alpha = 0.5f)
                        )
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

// ==========================================
// SCREEN 7: MISSION (GOALS & TASKS & READINESS GUARD HISTORY)
// ==========================================
@Composable
fun MissionScreen(
    viewModel: NexusViewModel,
    modifier: Modifier = Modifier
) {
    val profile by viewModel.userProfile.collectAsState()
    val allTasks by viewModel.allTasks.collectAsState()
    val checksHistory by viewModel.readinessChecks.collectAsState()
    val isAiGenerating by viewModel.isAiGenerating.collectAsState()
    val context = LocalContext.current

    val finishedTasks = allTasks.filter { it.isCompleted }.size
    val totalTasksVal = allTasks.size
    val progressPercent = if (totalTasksVal > 0) finishedTasks.toFloat() / totalTasksVal else 0.8f

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            // Welcome Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("ACTIVE MISSIONS", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = NexusPrimary)
                    Text("Your Progress Radar", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }

                IconButton(onClick = { viewModel.rebuildDailyTasks() }) {
                    Icon(
                        imageOf = Icons.Default.Refresh,
                        contentDescription = "Regenerate tasks",
                        tint = NexusSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Percentage summary tracker card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = NexusDarkSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Weekly Target Compiles", fontSize = 13.sp, color = Color.Gray)
                        Text("${(progressPercent * 100).toInt()}% completed", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NexusSecondary)
                    }
                    LinearProgressIndicator(
                        progress = { progressPercent },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp)
                            .height(6.dp),
                        color = NexusSecondary,
                        trackColor = Color.DarkGray
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text("DAILY MILITARY PROTOCOLS:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
            Spacer(modifier = Modifier.height(8.dp))
            
            if (isAiGenerating) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = NexusPrimary)
                }
            }
        }

        items(allTasks) { task ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (task.isCompleted) NexusDarkSurface.copy(alpha = 0.4f) else NexusDarkSurface
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Checkbox(
                            checked = task.isCompleted,
                            onCheckedChange = { viewModel.toggleTaskCompletion(task.id, it) },
                            colors = CheckboxDefaults.colors(
                                checkedColor = NexusSecondary,
                                checkmarkColor = Color.White
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = task.taskDescription,
                                fontSize = 13.sp,
                                color = if (task.isCompleted) Color.Gray else Color.White,
                                fontWeight = FontWeight.W500
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (task.taskType == "DAILY") NexusPrimary.copy(alpha = 0.2f) else NexusAccent.copy(alpha = 0.2f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(task.taskType, fontSize = 8.sp, color = if (task.taskType == "DAILY") NexusPrimary else NexusAccent, fontWeight = FontWeight.Bold)
                                }
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Goal: ${task.associatedGoal}", fontSize = 10.sp, color = Color.Gray)
                            }
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
            Text("READINESS GUARD CHECKS LOG:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
            Spacer(modifier = Modifier.height(8.dp))
            
            if (checksHistory.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No security blocks cleared yet.", fontSize = 12.sp, color = Color.Gray)
                }
            }
        }

        items(checksHistory) { check ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = NexusDarkSurface.copy(alpha = 0.6f))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = check.actionType,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = Color.White
                        )

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    when {
                                        check.readinessScore > 75 -> NexusSecondary
                                        check.readinessScore > 50 -> NexusPrimary
                                        else -> NexusAccent
                                    }
                                )
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                "Safety: ${check.readinessScore}%",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Proposed item: \"${check.contentProposed}\"",
                        fontSize = 12.sp,
                        color = Color.LightGray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "AI Advice: ${check.feedback}",
                        fontSize = 12.sp,
                        color = NexusPrimary
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

// ==========================================
// SCREEN 8: INBOX & DMs
// ==========================================
@Composable
fun InboxScreen(
    viewModel: NexusViewModel,
    modifier: Modifier = Modifier
) {
    val activeChat by viewModel.activeChatName.collectAsState()
    val chatMessages by viewModel.currentChatMessages.collectAsState()
    val isAiGenerating by viewModel.isAiGenerating.collectAsState()

    var activeInboxTab by remember { mutableStateOf("DMS") } // DMS, GROUPS, BRANDS
    var currentMessageInput by remember { mutableStateOf("") }
    var disappearsEnabled by remember { mutableStateOf(false) }

    val context = LocalContext.current

    Column(
        modifier = modifier
            .fillMaxSize()
    ) {
        // Top Filter Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            listOf("DMS", "GROUPS", "BROADCASTS").forEach { tab ->
                val active = (activeInboxTab == tab)
                Box(
                    modifier = Modifier
                        .clickable { activeInboxTab = tab }
                        .border(
                            width = if (active) 1.dp else 0.dp,
                            color = if (active) NexusSecondary else Color.Transparent,
                            shape = RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = tab,
                        color = if (active) NexusSecondary else Color.Gray,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(if (disappearsEnabled) NexusAccent else Color.Gray)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("DISAPPEARING MODE (24H)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (disappearsEnabled) NexusAccent else Color.Gray)
            }
            Switch(
                checked = disappearsEnabled,
                onCheckedChange = { disappearsEnabled = it },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = NexusAccent,
                    checkedTrackColor = NexusAccent.copy(alpha = 0.5f)
                ),
                modifier = Modifier.scale(0.8f)
            )
        }

        Divider(color = Color.DarkGray)

        // Split Layout: chats sidebar simulation + full DM conversation
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            // Left panel small quick icon list
            Column(
                modifier = Modifier
                    .width(66.dp)
                    .fillMaxHeight()
                    .background(NexusDarkBg)
                    .border(1.dp, Color.DarkGray),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(12.dp))
                
                // General channel quick selectors
                ChatAvatarIcon("ai", "Nexus AI", activeChat == "ai-chat") {
                    viewModel.selectActiveChat("ai-chat")
                }
                ChatAvatarIcon("la", "Lekan Ayodele", activeChat == "lekanay2005") {
                    viewModel.selectActiveChat("lekanay2005")
                }
                ChatAvatarIcon("gl", "General", activeChat == "general-lounge") {
                    viewModel.selectActiveChat("general-lounge")
                }
            }

            // Right panel chat detail
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f)
                    .background(NexusDarkSurface.copy(alpha = 0.3f))
            ) {
                // Header conversation detail
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = when (activeChat) {
                                "ai-chat" -> "Nexus AI Agent"
                                "lekanay2005" -> "Lekan Ayodele"
                                else -> "General Lounge"
                            },
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = if (activeChat == "ai-chat") "Always active, powered by Gemini" else "Online in chat channel",
                            fontSize = 11.sp,
                            color = NexusSecondary
                        )
                    }

                    if (isAiGenerating) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp, color = NexusPrimary)
                    }
                }

                Divider(color = Color.DarkGray)

                // Messages lazy column
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.Bottom
                ) {
                    items(chatMessages) { msg ->
                        val isSelf = msg.senderId == "self"
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalAlignment = if (isSelf) Alignment.End else Alignment.Start
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(
                                        RoundedCornerShape(
                                            topStart = 16.dp,
                                            topEnd = 16.dp,
                                            bottomStart = if (isSelf) 16.dp else 4.dp,
                                            bottomEnd = if (isSelf) 4.dp else 16.dp
                                        )
                                    )
                                    .background(if (isSelf) NexusPrimary else Color.DarkGray)
                                    .padding(horizontal = 14.dp, vertical = 10.dp)
                            ) {
                                Column {
                                    if (!isSelf) {
                                        Text(msg.senderName, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NexusSecondary)
                                    }
                                    Text(msg.text, color = Color.White, fontSize = 13.sp)
                                    if (msg.isDisappearing) {
                                        Text("⏱ Disappearing 24h", fontSize = 8.sp, color = NexusAccent, modifier = Modifier.padding(top = 2.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                // AI Suggested Replies row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                ) {
                    val suggestions = when (activeChat) {
                        "ai-chat" -> listOf("Generate tasks", "Analyze a choice", "Connect me")
                        else -> listOf("Sounds building!", "Let's align", "Review my portfolio")
                    }
                    suggestions.forEach { cleanSuggest ->
                        Box(
                            modifier = Modifier
                                .padding(horizontal = 4.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(NexusSecondary.copy(alpha = 0.2f))
                                .clickable {
                                    HapticAssistant.triggerHaptic(context, "LIGHT")
                                    currentMessageInput = cleanSuggest
                                }
                                .padding(horizontal = 8.dp, vertical = 6.dp)
                        ) {
                            Text(cleanSuggest, fontSize = 10.sp, color = NexusSecondary, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Input Controls
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = currentMessageInput,
                        onValueChange = { currentMessageInput = it },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("inbox_msg_input"),
                        placeholder = { Text("Send decrypted DM...") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = NexusPrimary, unfocusedBorderColor = Color.Gray
                        ),
                        shape = RoundedCornerShape(20.dp)
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    // Simulated Intercept Action button (Apply Readiness Guard automatically if user types sensitive keyword like 'stupid' or 'hate' or 'job')
                    IconButton(
                        onClick = {
                            if (currentMessageInput.isNotEmpty()) {
                                HapticAssistant.triggerHaptic(context, "LIGHT")
                                val text = currentMessageInput
                                currentMessageInput = ""

                                if (text.contains("stupid") || text.contains("hate") || text.contains("apply")) {
                                    // Trigger intercept
                                    viewModel.triggerReadinessGuard(
                                        actionType = "Sending Encrypted DM",
                                        content = text,
                                        onComplete = { check ->
                                            if (check.readinessScore > 50) {
                                                viewModel.sendMessage(activeChat, text, disappearsEnabled)
                                            }
                                        }
                                    )
                                } else {
                                    viewModel.sendMessage(activeChat, text, disappearsEnabled)
                                }
                            }
                        }
                    ) {
                        Icon(Icons.Default.Send, "Send message", NexusPrimary)
                    }
                }
            }
        }
    }
}

@Composable
fun ChatAvatarIcon(prefix: String, details: String, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .padding(vertical = 10.dp)
            .size(44.dp)
            .clip(CircleShape)
            .background(if (isSelected) NexusSecondary else Color.DarkGray)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(prefix.uppercase(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
    }
}

// Scale modifier helper representing switch size scales
fun Modifier.scale(f: Float): Modifier = this

// BoxBorder helper
fun BoxBorder(w: androidx.compose.ui.unit.Dp, color: Color): androidx.compose.foundation.BorderStroke {
    return androidx.compose.foundation.BorderStroke(w, color)
}

// ==========================================
// SCREEN 9: PROFILE (DUAL SOCIAL vs CV VIEW)
// ==========================================
@Composable
fun ProfileScreen(
    viewModel: NexusViewModel,
    modifier: Modifier = Modifier
) {
    val profile by viewModel.userProfile.collectAsState()
    var isSocialMode by remember { mutableStateOf(true) }
    val context = LocalContext.current

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Spacer(modifier = Modifier.height(20.dp))
            // Profile Card Header with Dynamic Avatar
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(CircleShape)
                    .background(NexusPrimary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = profile?.firstName?.take(1)?.uppercase() ?: "L",
                    fontSize = 32.sp,
                    color = Color.White,
                    fontWeight = FontWeight.W700
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "${profile?.firstName ?: "Lekan"} ${profile?.lastName ?: "Ayodele"}",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = profile?.email ?: "lekanay2005@gmail.com",
                fontSize = 12.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Social Mode vs Professional CV mode Toggle Switch
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.DarkGray.copy(alpha = 0.5f))
                    .padding(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSocialMode) NexusSecondary else Color.Transparent)
                        .clickable { isSocialMode = true }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text("Social Persona", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (!isSocialMode) NexusPrimary else Color.Transparent)
                        .clickable { isSocialMode = false }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text("Professional CV", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }

        if (isSocialMode) {
            item {
                // Statistics
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    ProfileStatItem("442", "Followers")
                    ProfileStatItem("830", "Connections")
                    ProfileStatItem("1.5K", "Milestones")
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Bio
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NexusDarkSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("BIO PROFILE", fontSize = 11.sp, color = NexusSecondary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = profile?.bio ?: "Exploring Android and AI integration on Nexus, the future of decentralized super social apps. Building modular animations in Jetpack Compose.",
                            color = Color.White,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // AI summary block how AI sees you
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NexusPrimary.copy(alpha = 0.12f)),
                    border = BoxBorder(1.dp, NexusPrimary)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AutoAwesome, "AI Analyst", NexusPrimary, Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("AI SUMMARY REPORT", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = NexusPrimary)
                            Text(
                                text = "Lekan acts as a focus-driven visual builder, logging regular task checkpoints in Learning and Career categories. Highly aligned with UI engineering targets.",
                                color = Color.White,
                                fontSize = 12.sp,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }
        } else {
            item {
                // Skills panel
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NexusDarkSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("DEVELOPMENT SKILLS TAGS", fontSize = 11.sp, color = NexusPrimary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        FlowRow(modifier = Modifier.fillMaxWidth()) {
                            val list = profile?.skills?.split(",")?.filter { it.isNotEmpty() } ?: listOf("Kotlin", "Compose", "Retrofit", "Moshi", "Room Db", "Gemini API")
                            list.forEach { Skill ->
                                Box(
                                    modifier = Modifier
                                        .padding(4.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(NexusPrimary.copy(alpha = 0.2f))
                                        .border(1.dp, NexusPrimary, RoundedCornerShape(8.dp))
                                        .padding(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Text(Skill, fontSize = 11.sp, color = Color.White)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Experience CV Block
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NexusDarkSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("EXPERIENCE CHRONOLOGY", fontSize = 11.sp, color = NexusSecondary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = profile?.experience ?: "Mobile application architectural design, specializing in high frequency rendering, offline synchronization and custom visual particle shaders.",
                            color = Color.LightGray,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Portfolio sections
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NexusDarkSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("PORTFOLIO CASE STUDY", fontSize = 11.sp, color = NexusSecondary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Nexus Super Social Media App",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "A modern high-fidelity compilation connecting chat, goal tasks, readiness shields, and vertical videos all in one place.",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { viewModel.logout() },
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.2f)),
                border = BoxBorder(1.dp, Color.Red),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp)
            ) {
                Text("RESET SYSTEM", color = Color.Red)
            }
            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
fun ProfileStatItem(stat: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(stat, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text(label, fontSize = 11.sp, color = Color.Gray)
    }
}
