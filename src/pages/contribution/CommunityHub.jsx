import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Plus, Clock, Store, Tag, PackageOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import useFetchPendingContributions from '@/hooks/useFetchPendingContributions';
import useVoteContribution from '@/hooks/useVoteContribution';


export default function CommunityHub() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('to_review');
    const [voting, isVoting] = useState(false);

    const { data = { pending: [], votesToday: 0, submissionsToday: 0 }, isLoading, isError, error } = useFetchPendingContributions();
    const { isLoading: voteLoading, mutate: submitVote } = useVoteContribution();

    const pendingItems = data.pending

    // If myVote is null, they haven't voted. If it has a value ('up'/'down'), they have.
    //console.log({ data })
    const toReviewList = pendingItems.filter(item => !item.myVote);
    const votedList = pendingItems.filter(item => item.myVote);

    // Track daily votes (you could also pass this from the backend!)
    const votesToday = data.votesToday;
    const submissionsToday = data.submissionsToday;
    const activeList = activeTab === 'to_review' ? toReviewList : votedList;
    const MAX_VOTES = 5;
    const MAX_SUBMISSION = 1;

    function handleVote(id, type) {
        if (votesToday >= MAX_VOTES) {
            alert("You've reached your 5 votes for today! Come back tomorrow.");
            return;
        }
        submitVote({ id, voteType: type });
    }

    if (isError) return (
        <div className='errorDisplay px-4'>
            <h2 className="text-lg inter-regular">Forbidden!</h2>
            <p>{error.message}</p>
            <button className='mx-auto mt-4 py-2 px-8 rounded-md bg-orange-500 text-white font-semibold' onClick={() => navigate('/')}>Go back?</button>
        </div>
    );

    if (isLoading && !isError) return (
        <div className='errorDisplay'>
            <h2 className="text-lg inter-regular">Loading community hub<span className="animated-dots"></span></h2>
        </div>
    );


    const renderCard = (item, isVotedTab, isVoting) => (
        <div key={item.id} className={`bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden ${isVotedTab ? 'border-gray-200 opacity-80' : 'border-yellow-200'}`}>

            <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center ${isVotedTab ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                {isVotedTab ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {isVotedTab ? 'Voted' : 'Pending'}
            </div>

            <h3 className="font-bold text-lg text-gray-900 pr-16 leading-tight">{item.name}</h3>

            <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
                <span className="flex items-center"><Store className="w-4 h-4 mr-2 text-gray-400" /> {item.location.name}</span>
                <span className="flex items-center"><Tag className="w-4 h-4 mr-2 text-gray-400" /> {`${item.category.list} - ${item.category.catalog}`}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Reported Price</p>
                    <p className="text-2xl font-black text-orange-500">₱{item.price?.toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => !isVotedTab && handleVote(item.id, 'up')}
                        disabled={isVotedTab || isVoting} // Disable while loading
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${item.myVote === 'up' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50'}`}
                    >
                        {isVoting && !isVotedTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                        <span className="text-sm font-bold">{item.upvotes}</span>
                    </button>
                    <button
                        onClick={() => !isVotedTab && handleVote(item.id, 'down')}
                        disabled={isVotedTab || isVoting} // Disable while loading
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${item.myVote === 'down' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50'}`}
                    >
                        {isVoting && !isVotedTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                        <span className="text-sm font-bold">{item.downvotes}</span>
                    </button>
                </div>
            </div>

            {/* Progress bar to 10 votes */}
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${((item.upvotes + item.downvotes) / 10) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">{item.upvotes + item.downvotes}/10 votes reached</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-wrap md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Community Hub</h1>

                    {/* Daily Progress Indicator */}
                    <div className='flex flex-wrap gap-x-2'>
                        <div className="items-center gap-3 mt-3 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm inline-flex">
                            <span className="text-sm font-semibold text-gray-600">Daily Votes:</span>
                            <div className="flex gap-1">
                                {[...Array(MAX_VOTES)].map((_, i) => (
                                    <div key={i} className={`w-6 h-2 rounded-full ${i < votesToday ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">{votesToday}/{MAX_VOTES}</span>
                        </div>
                        <div className="items-center gap-3 mt-3 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm inline-flex">
                            <span className="text-sm font-semibold text-gray-600">Daily Votes:</span>
                            <div className="flex gap-1">
                                {[...Array(MAX_SUBMISSION)].map((_, i) => (
                                    <div key={i} className={`w-6 h-2 rounded-full ${i < submissionsToday ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">{submissionsToday}/{MAX_SUBMISSION}</span>
                        </div>
                    </div>
                </div>

                <Link to="/contribution/submit" className={`ml-auto self-end ${MAX_SUBMISSION === submissionsToday && 'pointer-events-none'}`}>
                    <Button className={`bg-orange-500 hover:bg-orange-600 ${MAX_SUBMISSION === submissionsToday && 'bg-gray-400'} text-white shadow-md max-md:w-full`}>
                        <Plus className="w-4 h-4 mr-2" /> Submit New Price
                    </Button>
                </Link>
            </div>

            {/* The Tabs to switch views! */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`pb-3 px-6 text-sm font-bold transition-colors relative ${activeTab === 'to_review' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('to_review')}
                >
                    To Review ({toReviewList.length})
                    {activeTab === 'to_review' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
                </button>
                <button
                    className={`pb-3 px-6 text-sm font-bold transition-colors relative ${activeTab === 'voted' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('voted')}
                >
                    My Votes ({votedList.length})
                    {activeTab === 'voted' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
                </button>
            </div>

            {/* CONDITIONAL RENDERING: Fallback vs Grid */}
            {
                activeList.length === 0 ? (
                    /* --- DYNAMIC EMPTY STATE FALLBACK --- */
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                            {activeTab === 'to_review' ? <PackageOpen className="w-10 h-10 text-gray-400" /> : <CheckCircle2 className="w-10 h-10 text-gray-400" />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {activeTab === 'to_review' ? "No Pending Approvals" : "You haven't voted yet"}
                        </h2>
                        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                            {activeTab === 'to_review'
                                ? "You're all caught up! There are currently no prices waiting for review."
                                : "Your voting history will appear here. Switch to the 'To Review' tab to start earning points!"}
                        </p>
                        {activeTab === 'to_review' && (
                            <Link to="/contribution/submit" className={`${MAX_SUBMISSION === submissionsToday && 'pointer-events-none'}`}>
                                <Button className={`bg-gray-900 hover:bg-gray-800 text-white px-8 ${MAX_SUBMISSION === submissionsToday && 'bg-gray-400'}`}>
                                    <Plus className="w-4 h-4 mr-2" /> Make a Contribution
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    /* --- GRID OF ITEMS (Using activeList and renderCard) --- */
                    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-all duration-200 ${voteLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                        {activeList.map(item => renderCard(item, activeTab === 'voted', voteLoading))}
                    </div>
                )
            }
        </div >
    );
}
