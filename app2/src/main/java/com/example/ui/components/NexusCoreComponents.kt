package com.example.ui.components

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.ui.theme.NexusAccent
import com.example.ui.theme.NexusPrimary
import com.example.ui.theme.NexusSecondary
import kotlinx.coroutines.isActive
import kotlin.random.Random

// --- Haptic Feedback Assistant ---
object HapticAssistant {
    fun triggerHaptic(context: Context, patternType: String) {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

        if (vibrator == null || !vibrator.hasVibrator()) return

        try {
            when (patternType) {
                "LIGHT" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createOneShot(15, VibrationEffect.DEFAULT_AMPLITUDE))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(15)
                    }
                }
                "MEDIUM" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(45)
                    }
                }
                "HEAVY" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createOneShot(80, VibrationEffect.DEFAULT_AMPLITUDE))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(80)
                    }
                }
                "SUCCESS" -> {
                    val timings = longArrayOf(0, 30, 80, 40)
                    val amplitudes = intArrayOf(0, 100, 0, 230)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(50)
                    }
                }
                "WARNING" -> {
                    val timings = longArrayOf(0, 80, 50, 80)
                    val amplitudes = intArrayOf(0, 255, 0, 255)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(100)
                    }
                }
            }
        } catch (e: Exception) {
            // Fallback safe silent execution
        }
    }
}

// --- Living Particle Background (Wallpaper) ---
class Particle(
    var x: Float,
    var y: Float,
    val speed: Float,
    val radius: Float,
    val color: Color,
    val alphaAnim: Float
)

@Composable
fun LivingParticleBackground(
    modifier: Modifier = Modifier,
    moodColor: Color? = null
) {
    val particles = remember {
        List(25) {
            Particle(
                x = Random.nextFloat(),
                y = Random.nextFloat(),
                speed = 0.0006f + Random.nextFloat() * 0.001f,
                radius = 3f + Random.nextFloat() * 8f,
                color = when (Random.nextInt(3)) {
                    0 -> NexusPrimary.copy(alpha = 0.15f)
                    1 -> NexusSecondary.copy(alpha = 0.15f)
                    else -> NexusAccent.copy(alpha = 0.15f)
                },
                alphaAnim = 0.3f + Random.nextFloat() * 0.7f
            )
        }
    }

    var tick by remember { mutableStateOf(0L) }

    LaunchedEffect(Unit) {
        while (isActive) {
            withFrameMillis { frameTime ->
                tick = frameTime
            }
        }
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        if (width > 0 && height > 0) {
            particles.forEach { p ->
                // Drift particles upward
                p.y -= p.speed
                if (p.y < 0) {
                    p.y = 1.0f
                    p.x = Random.nextFloat()
                }

                val px = p.x * width
                val py = p.y * height

                // If user specifies a mood override color, paint a subtle aura
                val finalColor = moodColor?.copy(alpha = 0.08f) ?: p.color

                drawCircle(
                    color = finalColor,
                    radius = p.radius,
                    center = androidx.compose.ui.geometry.Offset(px, py),
                    alpha = p.alphaAnim
                )
            }
        }
    }
}

// --- Shape Morphing Action Button ---
// Shape morphs dynamically between: circle (normal) -> star/cut corners (hover) -> square (completed click)
@Composable
fun MorphingButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    colors: ButtonColors = ButtonDefaults.buttonColors(containerColor = NexusPrimary),
    contentPadding: PaddingValues = ButtonDefaults.ContentPadding,
    hapticPattern: String = "LIGHT",
    content: @Composable RowScope.() -> Unit
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    // Morph the shape border corner radius dynamically
    // Unpressed: Rounded oval/circle (24dp corners)
    // Pressed: Sharp square/diamond (4dp corners)
    val cornerRadius: Dp by animateDpAsState(
        targetValue = if (isPressed) 6.dp else 24.dp,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "ButtonShapeMorph"
    )

    Button(
        onClick = {
            HapticAssistant.triggerHaptic(context, hapticPattern)
            onClick()
        },
        modifier = modifier,
        enabled = enabled,
        shape = RoundedCornerShape(cornerRadius),
        colors = colors,
        contentPadding = contentPadding,
        interactionSource = interactionSource,
        content = content
    )
}
