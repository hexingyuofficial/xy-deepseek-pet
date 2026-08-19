export interface MacWindowVisibilityPolicy {
  visibleOnAllWorkspaces: true
  visibleOnFullScreen: boolean
  skipTransformProcessType: true
  alwaysOnTopLevel: 'floating' | 'screen-saver'
}

// skipTransformProcessType is valid only after Electron is already a UIElement app.
export const MAC_PET_ACTIVATION_POLICY = 'accessory' as const

export function macWindowVisibilityPolicy(showOnFullScreen: boolean, textInputActive = false): MacWindowVisibilityPolicy {
  return {
    visibleOnAllWorkspaces: true,
    visibleOnFullScreen: showOnFullScreen,
    skipTransformProcessType: true,
    // Keep system input-method candidate panels above every pet surface while
    // the user is typing, then restore the full-screen-compatible level.
    // Outside text entry, screen-saver is the lowest documented level that
    // remains above full-screen Spaces.
    alwaysOnTopLevel: textInputActive ? 'floating' : showOnFullScreen ? 'screen-saver' : 'floating',
  }
}
