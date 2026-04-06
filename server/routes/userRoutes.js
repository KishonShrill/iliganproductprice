import express from 'express';
import { ResultAsync, errAsync } from 'neverthrow';
import { User } from '../models/models.js';
import { user_verify, requireRole, ROLE_HIERARCHY } from '../helpers/auth.js';

const router = express.Router();

// ==========================================
// GET /api/v1/users - Fetch all users
// ==========================================
router.get('/', user_verify, requireRole('moderator'), async (req, res) => {
    // #swagger.tags = ['v1 | Users']
    // #swagger.description = 'Endpoint for fetching all registered users (Requires at least Moderator access)'

    const currentUserRole = req.user.role; // Assuming user_verify attaches the decoded token to req.user

    if (ROLE_HIERARCHY[currentUserRole] < ROLE_HIERARCHY.moderator) {
        return res.status(403).json({ message: "Access denied. Insufficient clearance." });
    }

    await ResultAsync.fromPromise(
        // Exclude passwords and sensitive data from the payload
        User.find({}).select('-password -__v').sort({ createdAt: -1 }).exec(),
        (error) => new Error(`Database fetch failed: ${error.message}`)
    )
        .match(
            (users) => {
                return res.status(200).json({ users });
            },
            (error) => {
                console.error('Error fetching users:', error);
                return res.status(500).json({ message: 'Failed to retrieve users.', error: error.message });
            }
        );
});

// ==========================================
// PUT /api/v1/users/:id/role - Update user role
// ==========================================
router.put('/:id/role', user_verify, requireRole('moderator'), async (req, res) => {
    // #swagger.tags = ['v1 | Users']
    // #swagger.description = 'Endpoint for promoting/demoting users based on strict RBAC hierarchy'

    const { role: newRole } = req.body;
    const targetUserId = req.params.id;
    const currentUserId = req.user.user_id;
    const currentUserRole = req.user.user_role;

    // 1. Initial Validation Checks
    if (!ROLE_HIERARCHY[newRole]) {
        return res.status(400).json({ message: "Invalid role specified." });
    }

    if (targetUserId === currentUserId.toString()) {
        return res.status(403).json({ message: "You cannot modify your own role." });
    }

    if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[currentUserRole]) {
        return res.status(403).json({ message: "You cannot assign a role equal to or higher than your own." });
    }

    // 2. Fetch target user and apply strict hierarchical validation safely
    await ResultAsync.fromPromise(
        User.findById(targetUserId).exec(),
        (error) => new Error(`Database error: ${error.message}`)
    )
        .andThen((targetUser) => {
            // If user doesn't exist, instantly break the chain
            if (!targetUser) {
                return errAsync(new Error("NOT_FOUND"));
            }

            // Validate that the requester actually has authority over the target's CURRENT role
            if (ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[currentUserRole]) {
                return errAsync(new Error("FORBIDDEN"));
            }

            // All checks passed! Update and save.
            targetUser.role = newRole;

            return ResultAsync.fromPromise(
                targetUser.save(),
                (error) => new Error(`Failed to save updated role: ${error.message}`)
            );
        })
        .match(
            (savedUser) => {
                // SUCCESS ARM
                return res.status(200).json({
                    message: "User role updated successfully.",
                    user: {
                        _id: savedUser._id,
                        username: savedUser.username,
                        role: savedUser.role
                    }
                });
            },
            (error) => {
                // ERROR ARM
                if (error.message === "NOT_FOUND") {
                    return res.status(404).json({ message: "Target user not found." });
                }
                if (error.message === "FORBIDDEN") {
                    return res.status(403).json({ message: "You do not have permission to manage this user." });
                }

                console.error('Error updating role:', error);
                return res.status(500).json({ message: 'Internal server error.', error: error.message });
            }
        );
});

// ==========================================
// DELETE /api/v1/users/:id - Delete a user
// ==========================================
router.delete('/:id', user_verify, requireRole('admin'), async (req, res) => {
    // #swagger.tags = ['v1 | Users']
    // #swagger.description = 'Endpoint for permanently deleting a user (Admin Only)'

    const targetUserId = req.params.id;
    const currentUserId = req.user.user_id;

    // 1. Prevent self-deletion
    if (targetUserId === currentUserId.toString()) {
        return res.status(403).json({ message: "You cannot delete your own admin account from the console." });
    }

    // 2. Safely execute the deletion using neverthrow
    await ResultAsync.fromPromise(
        User.findByIdAndDelete(targetUserId).exec(),
        (error) => new Error(`Database error: ${error.message}`)
    )
        .match(
            (deletedUser) => {
                // SUCCESS ARM
                if (!deletedUser) {
                    return res.status(404).json({ message: "Target user not found or already deleted." });
                }
                return res.status(200).json({
                    message: `User ${deletedUser.username} has been permanently deleted.`
                });
            },
            (error) => {
                // ERROR ARM
                console.error('Error deleting user:', error);
                return res.status(500).json({ message: 'Internal server error.', error: error.message });
            }
        );
});

export default router;
