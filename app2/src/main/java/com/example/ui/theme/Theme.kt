package com.example.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = NexusPrimary,
    secondary = NexusSecondary,
    tertiary = NexusAccent,
    background = NexusDarkBg,
    surface = NexusDarkSurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color(0xFFE2E1F6),
    onSurface = Color(0xFFE2E1F6),
    surfaceVariant = NexusDarkSurfaceVariant,
    onSurfaceVariant = Color(0xFFC8C7E2)
)

private val LightColorScheme = lightColorScheme(
    primary = NexusPrimary,
    secondary = NexusSecondary,
    tertiary = NexusAccent,
    background = NexusLightBg,
    surface = NexusLightSurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color(0xFF1A1A2E),
    onSurface = Color(0xFF1A1A2E)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Dark mode is default
    dynamicColor: Boolean = false, // Force consistent branding
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
