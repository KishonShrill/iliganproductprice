import express from 'express';
import { ResultAsync, errAsync } from 'neverthrow';
import { PendingListing, User } from '../models/models.js'; // adjust path
import { user_verify } from '../helpers/auth.js';

const router = express.Router();


router.get('/pending', user_verify, async (req, res) => {
    // #swagger.tags = ['v1 | Contribution']
    // #swagger.description = '.'

    try {
        const currentUserId = req.user.user_id.toString();
        //console.log(currentUserId)

        // 1. Fetch the user to get their actual daily vote count
        const user = await User.findById(currentUserId).select('daily_votes daily_submissions last_vote_date last_submission_date').lean();

        console.log(`User: ${user.daily_votes} - ${user.last_vote_date}`)
        console.log(`User: ${user.daily_submissions} - ${user.last_submission_date}`)
        let realVotesToday = 0;
        let realSubmissionsToday = 0;
        if (user) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // If they voted today, use their count. Otherwise, it's 0.
            if (user.last_vote_date && user.last_vote_date >= today) {
                realVotesToday = user.daily_votes;
            }
            if (user.last_submission_date && user.last_submission_date >= today) {
                realSubmissionsToday = user.daily_submissions
            }
        }

        // 1. Fetch only pending items. .lean() makes it plain JS objects (super fast)
        const pendingItems = await PendingListing.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .lean();

        //return console.log(pendingItems)

        // 2. Format the data for the frontend
        const sanitizedItems = pendingItems.map(item => {
            // Check if the current user is inside this item's voters array
            const userVoteObj = item.voters.find(v => {
                //console.log(item)
                console.log(`Boolean ${v.userId.toString() === currentUserId} `)
                return v.userId.toString() === currentUserId
            });

            // Create a clean object to send to the frontend
            const cleanItem = {
                id: item._id,
                name: item.productName,
                price: item.price,
                location: item.location,
                category: item.category,
                upvotes: item.upvoteCount,
                downvotes: item.downvoteCount,
                // Add a simple 'myVote' flag! (Will be 'up', 'down', or null)
                myVote: userVoteObj ? true : null
            };

            return cleanItem;
        });

        res.status(200).json({ pending: sanitizedItems, votesToday: realVotesToday, submissionsToday: realSubmissionsToday });
    } catch (error) {
        res.status(500).json({ message: "Error fetching contributions" });
    }
});

router.post('/', user_verify, async (req, res) => {
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
    if (user.daily_submissions >= 1) {
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
                submittedBy: currentUserId,
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
router.post('/:id/vote', user_verify, async (req, res) => {
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
    if (user.daily_votes >= 5) {
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
            { new: true }
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

                if (approvalRating >= 0.75) {
                    updatedItem.status = 'approved';
                    // Move item to the official Product database
                    const newOfficialProduct = new Product({
                        product_name: updatedItem.productName,
                        price: updatedItem.price,
                        location: updatedItem.location,
                        category: updatedItem.category,
                        listType: updatedItem.listType
                    });

                    // Save Item, New Product, AND the updated User quota
                    return ResultAsync.fromPromise(
                        Promise.all([updatedItem.save(), newOfficialProduct.save(), user.save()]),
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
