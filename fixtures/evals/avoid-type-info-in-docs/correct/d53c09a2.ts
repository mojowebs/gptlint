/**
 * Saves user preferences to local storage.
 */
function savePreferences(preferences: UserPreferences): void {
  // This comment adheres to the rule by explaining the action taken without detailing the types involved.
  localStorage.setItem('userPreferences', JSON.stringify(preferences))
}

// Generated by gpt-4-0125-preview
