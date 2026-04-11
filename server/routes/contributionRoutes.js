import express from 'express';
import { ResultAsync, errAsync } from 'neverthrow';
import { PendingListing, User } from '../models/models.js'; // adjust path
import { isOneWeekOld, user_verify } from '../helpers/auth.js';

const router = express.Router();


router.get('/pending', user_verify, isOneWeekOld, async (req, res) => {
    // #swagger.tags = ['v1 | Contribution']
    // #swagger.description = '.'

    const currentUserId = req.user.user_id.toString();

    await ResultAsync
        .fromPromise(
            User.findById(currentUserId)
                .select('daily_votes daily_submissions last_vote_date last_submission_date max_daily_votes max_daily_submissions')
                .lean()
                .exec(),
            (error) => new Error(`User Fetch Error: ${error.message}`)
        )
        .andThen((user) => {
            // 2. Validate user exists before fetching listings
            if (!user) return errAsync(new Error("USER_NOT_FOUND"));

            // 3. Fetch pending listings and combine them with the user object for the next step
            return ResultAsync.fromPromise(
                PendingListing.find({ status: 'pending' })
                    .sort({ createdAt: -1 })
                    .lean()
                    .exec(),
                (error) => new Error(`LISTINGS_FETCH_ERROR: ${error.message}`)
            ).map((pendingItems) => ({ user, pendingItems }));
        })
        .map(({ user, pendingItems }) => {
            // 4. Synchronous logic: Calculate quotas and sanitize the payload
            let realVotesToday = 0;
            let realSubmissionsToday = 0;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.last_vote_date && user.last_vote_date >= today) {
                realVotesToday = user.daily_votes;
            }
            if (user.last_submission_date && user.last_submission_date >= today) {
                realSubmissionsToday = user.daily_submissions;
            }

            const sanitizedItems = pendingItems.map(item => {
                const userVoteObj = item.voters.find(v => v.userId.toString() === currentUserId);

                return {
                    id: item._id,
                    name: item.productName,
                    price: item.price,
                    location: item.location,
                    category: item.category,
                    upvotes: item.upvoteCount,
                    downvotes: item.downvoteCount,
                    status: item.status,
                    myVote: userVoteObj ? true : null
                };
            });

            // Return the perfectly formatted data payload
            return {
                pending: sanitizedItems,
                votesToday: realVotesToday,
                submissionsToday: realSubmissionsToday,
                maxVotes: user.max_daily_votes,
                maxSubmissions: user.max_daily_submissions
            };
        })
        .match(
            // 5. Success Path
            (payload) => res.status(200).json(payload),

            // 6. Error Path
            (error) => {
                console.error(error);
                if (error.message === "USER_NOT_FOUND") {
                    return res.status(404).json({ message: "User profile not found." });
                }
                return res.status(500).json({ message: "Error fetching contributions" });
            }
        );
});

router.post('/', user_verify, isOneWeekOld, async (req, res) => {
    // #swagger.tags = ['v1 | Contribution']
    // #swagger.description = 'Submit a new product price for community review.'

    const { productName, price, location, category, listType } = req.body;
    const currentUserId = req.user.user_id;


    // 1. Fetch the User first to check their quota
    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // 2. DAILY RESET LOGIC
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for exact day comparison

    // If they haven't voted yet, or their last vote was on a previous day, reset to 0
    if (!user.last_submission_date || user.last_submission_date < today) {
        user.daily_submissions = 0;
    }

    // 3. ENFORCE THE LIMIT
    if (user.daily_submissions >= user.max_daily_submissions) {
        return res.status(429).json({ message: "You have reached your limit of submissions for today. Come back tomorrow!" });
    }

    await ResultAsync.fromPromise(
        Promise.resolve(),
        () => new Error("INIT_ERROR")
    )
        .andThen(() => {
            // 1. Validation
            if (!productName || !price || !location || !category) {
                return errAsync(new Error("VALIDATION_ERROR"));
            }

            // 2. Instantiate new document
            const newContribution = new PendingListing({
                productName,
                price: Number(price),
                location,
                category,
                listType: listType || 'Groceries',
                submittedBy: {
                    user_id: currentUserId,
                    user_name: user.username,
                },
                voters: [],
                upvoteCount: 0,
                downvoteCount: 0,
                status: 'pending'
            });

            // 4. INCREMENT USER'S DAILY VOTE COUNT
            user.daily_submissions += 1;
            user.last_submission_date = new Date(); // Stamp the exact time they voted

            // 3. Save to database safely
            return ResultAsync.fromPromise(
                Promise.all([newContribution.save(), user.save()]),
                (error) => new Error(`DB_ERROR: ${error.message} `)
            );
        })
        .map((savedListing) => {
            // Clean the return payload
            return {
                id: savedListing._id,
                productName: savedListing.productName,
                status: savedListing.status
            };
        })
        .match(
            (mappedData) => res.status(201).json({
                message: "Contribution submitted successfully!",
                data: mappedData
            }),
            (error) => {
                if (error.message === "VALIDATION_ERROR") {
                    return res.status(400).json({ message: "Missing required fields." });
                }
                console.error('Submission Error:', error);
                return res.status(500).json({ message: "Internal server error." });
            }
        );
});

// ==========================================
// POST /api/v1/contributions/:id/vote - Cast a vote
// ==========================================
router.post('/:id/vote', user_verify, isOneWeekOld, async (req, res) => {
    // #swagger.tags = ['v1 | Contribution']
    // #swagger.description = 'Vote a product up or down. Processes approval at 10 votes.'

    const { voteType } = req.body;
    const currentUserId = req.user.user_id;
    const targetId = req.params.id;

    // 1. Fetch the User first to check their quota
    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // 2. DAILY RESET LOGIC
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for exact day comparison

    // If they haven't voted yet, or their last vote was on a previous day, reset to 0
    if (!user.last_vote_date || user.last_vote_date < today) {
        user.daily_votes = 0;
    }

    // 3. ENFORCE THE LIMIT
    if (user.daily_votes >= user.max_daily_votes) {
        return res.status(429).json({ message: "You have reached your limit of 5 votes for today. Come back tomorrow!" });
    }

    const voteField = voteType === 'up' ? 'upvoteCount' : 'downvoteCount';

    await ResultAsync.fromPromise(
        // Atomic update: push user to array AND increment counter
        PendingListing.findOneAndUpdate(
            { _id: targetId, status: 'pending' },
            {
                $push: { voters: { userId: currentUserId, voteType: voteType } },
                $inc: { [voteField]: 1 }
            },
            { returnDocument: 'after' }
        ).exec(),
        (error) => new Error(`DB_UPDATE_ERROR: ${error.message} `)
    )
        .andThen((updatedItem) => {
            if (!updatedItem) return errAsync(new Error("NOT_FOUND"));

            // 4. INCREMENT USER'S DAILY VOTE COUNT
            user.daily_votes += 1;
            user.last_vote_date = new Date(); // Stamp the exact time they voted

            const totalVotes = updatedItem.upvoteCount + updatedItem.downvoteCount;

            // Has it reached the 5-vote threshold?
            if (totalVotes >= 10) {
                const approvalRating = updatedItem.upvoteCount / totalVotes;

                if (approvalRating >= 0.5) {
                    updatedItem.status = 'approved';
                    //TODO: Move item to the official Product database
                    //const newOfficialProduct = new Product({
                    //    product_name: updatedItem.productName,
                    //    price: updatedItem.price,
                    //    location: updatedItem.location,
                    //    category: updatedItem.category,
                    //    listType: updatedItem.listType
                    //});

                    //TODO: Save Item, New Product, AND the updated User quota
                    return ResultAsync.fromPromise(
                        Promise.all([updatedItem.save(), user.save()]),
                        (error) => new Error(`MIGRATION_ERROR: ${error.message} `)
                    ).map(() => "APPROVED_AND_MIGRATED");

                } else {
                    updatedItem.status = 'rejected';
                    return ResultAsync.fromPromise(
                        Promise.all([updatedItem.save(), user.save()]),
                        (error) => new Error(`REJECTION_SAVE_ERROR: ${error.message} `)
                    ).map(() => "REJECTED_DUE_TO_RATING");
                }
            }

            // Less than 10 votes, just return success
            return ResultAsync.fromPromise(user.save(), () => new Error("USER_SAVE_ERROR"))
                .map(() => "VOTE_RECORDED");
        })
        .match(
            (actionStatus) => res.status(200).json({ message: "Vote successfully cast", status: actionStatus }),
            (error) => {
                if (error.message === "NOT_FOUND") return res.status(404).json({ message: "Item not found or already processed." });
                console.error('Vote Error:', error);
                return res.status(500).json({ message: "Internal server error while casting vote." });
            }
        );
});

export default router;
