import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import useFetchPriceHistory from '@/hooks/useFetchPriceHistory';

export default function PriceHistoryModal({ isOpen, onClose, listing }) {

    const {
        data: history = [],
        isLoading,
        isError
    } = useFetchPriceHistory(isOpen ? listing?._id : null);

    // Format the data for Recharts: Combine old logs + current price
    const chartData = useMemo(() => {
        if (!listing) return [];

        // Map the historical data
        const formattedHistory = history.map(log => ({
            price: log.old_price,
            date: new Date(log.date_recorded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));

        // Append the current listing data at the end of the line
        formattedHistory.push({
            price: listing.updated_price,
            date: new Date(listing.date_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });

        return formattedHistory;
    }, [history, listing]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Price History</DialogTitle>
                    <DialogDescription>
                        {listing?.product.product_name} at {listing?.location.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 min-h-[250px] flex flex-col justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p className="text-sm">Loading trends...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center text-red-500 text-sm">{error}</div>
                    ) : chartData.length < 2 ? (
                        <div className="text-center text-gray-500 text-sm">
                            <p>Not enough data yet.</p>
                            <p className="text-xs mt-1">This price hasn't fluctuated since it was listed.</p>
                        </div>
                    ) : (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        domain={['dataMin - 10', 'dataMax + 10']}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₱${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`₱${value.toFixed(2)}`, 'Price']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#f97316" /* Tailwind orange-500 */
                                        strokeWidth={3}
                                        dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
