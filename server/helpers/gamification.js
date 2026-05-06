import { ROLE_HIERARCHY } from './auth.js';

// helpers/gamification.js (or just place at the top of your router file)
export const calculateUserLevel = (xp, currentRole) => {
    // 1. Check if the user is a Moderator or Admin (Level 5 or 10)
    const currentRank = ROLE_HIERARCHY[currentRole] || 1;

    // 2. Protect staff! If they are moderator or above, NEVER change their role.
    if (currentRank >= ROLE_HIERARCHY.moderator) {
        return currentRole;
    }

    if (xp >= 500) return 'budget_guru';
    if (xp >= 250) return 'wise_spender';
    if (xp >= 100) return 'budget_starter';
    return 'regular'
};
