package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.HapticAssistant
import com.example.ui.components.LivingParticleBackground
import com.example.ui.components.MorphingButton
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NexusAccent
import com.example.ui.theme.NexusDarkBg
import com.example.ui.theme.NexusDarkSurface
import com.example.ui.theme.NexusPrimary
import com.example.ui.theme.NexusSecondary
import com.example.ui.viewmodel.NexusViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: NexusViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                val profile by viewModel.userProfile.collectAsState()
                val currentTab by viewModel.currentTab.collectAsState()
                val activeReadinessCheck by viewModel.activeReadinessCheck.collectAsState()
                val moodColor by viewModel.moodColor.collectAsState()
                val context = LocalContext.current

                // Seed login check
                val isRegistered = profile?.isRegistered == true

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        if (isRegistered && currentTab != "SPLASH" && currentTab != "LOGIN" && currentTab != "SIGNUP") {
                            NexusBottomBar(
                                currentTab = currentTab,
                                onTabSelected = { tab ->
                                    HapticAssistant.triggerHaptic(this, "LIGHT")
                                    viewModel.navigateToTab(tab)
                                }
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(NexusDarkBg)
                            .padding(bottom = if (isRegistered) innerPadding.calculateBottomPadding() else 0.dp)
                    ) {
                        // Global drifting wallpaper particle effect
                        LivingParticleBackground(moodColor = moodColor)

                        // Top level screen routes routing
                        Crossfade(
                            targetState = if (!isRegistered) "ONBOARDING" else currentTab,
                            animationSpec = tween(500),
                            label = "PageBloomTransition"
                        ) { screen ->
                            when (screen) {
                                "ONBOARDING" -> OnboardingScreen(
                                    viewModel = viewModel,
                                    onOnboardingComplete = { viewModel.navigateToTab("HOME") },
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "LOGIN" -> LoginScreen(
                                    viewModel = viewModel,
                                    onLoginSuccess = { viewModel.navigateToTab("HOME") },
                                    onNavigateToSignUp = { viewModel.navigateToTab("SIGNUP") },
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "SIGNUP" -> SignUpScreen(
                                    viewModel = viewModel,
                                    onSignUpSuccess = { viewModel.navigateToTab("HOME") },
                                    onNavigateToLogin = { viewModel.navigateToTab("LOGIN") },
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "HOME" -> HomeScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "DISCOVER" -> DiscoverScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "CONNECT" -> ConnectScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "MISSION" -> MissionScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "INBOX" -> InboxScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                "PROFILE" -> ProfileScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                                else -> HomeScreen(
                                    viewModel = viewModel,
                                    modifier = Modifier.fillMaxSize().padding(top = innerPadding.calculateTopPadding())
                                )
                            }
                        }

                        // Top Level Intercepting READINESS GUARD POPUP
                        activeReadinessCheck?.let { check ->
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.75f))
                                    .padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Card(
                                    modifier = Modifier.fillMaxWidth().testTag("readiness_guard_modal"),
                                    colors = CardDefaults.cardColors(containerColor = NexusDarkSurface),
                                    shape = RoundedCornerShape(24.dp),
                                    border = BoxBorder(1.dp, if (check.readinessScore > 70) NexusSecondary else NexusAccent)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageOf = Icons.Default.Shield,
                                                contentDescription = "Readiness Shield",
                                                tint = if (check.readinessScore > 75) NexusSecondary else NexusAccent,
                                                modifier = Modifier.size(28.dp)
                                            )
                                            Spacer(Modifier.width(8.dp))
                                            Text(
                                                text = "NEXUS READINESS INTERCEPT",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = if (check.readinessScore > 75) NexusSecondary else NexusAccent,
                                                letterSpacing = 1.sp
                                            )
                                        }

                                        Spacer(Modifier.height(16.dp))

                                        // Safety speedometer
                                        Box(
                                            modifier = Modifier
                                                .size(100.dp)
                                                .clip(CircleShape)
                                                .background(if (check.readinessScore > 75) NexusSecondary.copy(alpha = 0.15f) else NexusAccent.copy(alpha = 0.15f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                Text(
                                                    text = "${check.readinessScore}%",
                                                    fontSize = 28.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (check.readinessScore > 75) NexusSecondary else NexusAccent
                                                )
                                                Text(text = "READINESS", fontSize = 10.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
                                            }
                                        }

                                        Spacer(Modifier.height(16.dp))

                                        Text(
                                            text = "Proposed: \"${check.contentProposed}\"",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )

                                        Spacer(Modifier.height(8.dp))

                                        Text(
                                            text = "Advice: ${check.feedback}",
                                            fontSize = 13.sp,
                                            color = Color.LightGray,
                                            textAlign = TextAlign.Center,
                                            lineHeight = 18.sp
                                        )

                                        Spacer(Modifier.height(24.dp))

                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceEvenly
                                        ) {
                                            Button(
                                                onClick = {
                                                    HapticAssistant.triggerHaptic(context, "LIGHT")
                                                    viewModel.submitReadinessDecision("CANCELLED")
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray)
                                            ) {
                                                Text("Abstain", color = Color.White)
                                            }

                                            MorphingButton(
                                                onClick = {
                                                    HapticAssistant.triggerHaptic(context, "SUCCESS")
                                                    viewModel.submitReadinessDecision("APPROVED")
                                                }
                                            ) {
                                                Text("Approve & Post", color = Color.White, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// CENTRAL NAVIGATION BOTTOM BAR (Respects insets)
// ==========================================
@Composable
fun NexusBottomBar(
    currentTab: String,
    onTabSelected: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars)
            .shadow(16.dp, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)),
        color = NexusDarkSurface.copy(alpha = 0.95f),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val menu = listOf(
                NavigationMenuItem("HOME", Icons.Default.Home, "Home"),
                NavigationMenuItem("DISCOVER", Icons.Default.PlayCircle, "Discover"),
                NavigationMenuItem("CONNECT", Icons.Default.People, "Connect"),
                NavigationMenuItem("MISSION", Icons.Default.Assignment, "Mission"),
                NavigationMenuItem("INBOX", Icons.Default.Forum, "Inbox")
            )

            menu.forEach { item ->
                val active = (currentTab == item.id)
                Column(
                    modifier = Modifier
                        .clickable { onTabSelected(item.id) }
                        .padding(horizontal = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (active) NexusPrimary.copy(alpha = 0.25f) else Color.Transparent)
                            .padding(8.dp)
                    ) {
                        Icon(
                            imageOf = item.icon,
                            contentDescription = item.label,
                            tint = if (active) NexusPrimary else Color.Gray,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Text(
                        text = item.label,
                        color = if (active) NexusPrimary else Color.Gray,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
            
            // PROFILE selector
            val activeProfile = (currentTab == "PROFILE")
            Column(
                modifier = Modifier
                    .clickable { onTabSelected("PROFILE") }
                    .padding(horizontal = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (activeProfile) NexusSecondary.copy(alpha = 0.25f) else Color.Transparent)
                        .padding(8.dp)
                ) {
                    Icon(
                        imageOf = Icons.Default.AccountCircle,
                        contentDescription = "Profile",
                        tint = if (activeProfile) NexusSecondary else Color.Gray,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Text(
                    text = "Profile",
                    color = if (activeProfile) NexusSecondary else Color.Gray,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }
}

data class NavigationMenuItem(val id: String, val icon: androidx.compose.ui.graphics.vector.ImageVector, val label: String)
