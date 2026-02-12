import OrgLayout from '@/Layouts/OrgLayout';
import { TrendingUp, Eye, MessageCircle, Heart, Megaphone } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface FollowerGrowthItem {
    date: string;
    count: number;
}

interface PostEngagementItem {
    date: string;
    views: number;
    reactions: number;
    comments: number;
}

interface BroadcastReachItem {
    date: string;
    reach: number;
}

interface Props {
    followerGrowth: FollowerGrowthItem[];
    postEngagement: PostEngagementItem[];
    broadcastReach: BroadcastReachItem[];
}

const chartTooltipStyle = {
    backgroundColor: '#1a1a24',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '0.8rem',
};

export default function AnalyticsIndex({ followerGrowth, postEngagement, broadcastReach }: Props) {
    const totalFollowers = followerGrowth.reduce((sum, item) => sum + item.count, 0);
    const totalViews = postEngagement.reduce((sum, item) => sum + item.views, 0);
    const totalReactions = postEngagement.reduce((sum, item) => sum + item.reactions, 0);
    const totalComments = postEngagement.reduce((sum, item) => sum + item.comments, 0);
    const totalReach = broadcastReach.reduce((sum, item) => sum + item.reach, 0);

    const summaryCards = [
        { label: 'Total Follower Growth', value: totalFollowers, icon: TrendingUp, color: '#8B5CF6' },
        { label: 'Total Post Views', value: totalViews, icon: Eye, color: '#3B82F6' },
        { label: 'Total Reactions', value: totalReactions, icon: Heart, color: '#EC4899' },
        { label: 'Total Comments', value: totalComments, icon: MessageCircle, color: '#10B981' },
        { label: 'Total Broadcast Reach', value: totalReach, icon: Megaphone, color: '#F59E0B' },
    ];

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const chartContainerStyle: React.CSSProperties = {
        background: '#111118',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    };

    const chartTitleStyle: React.CSSProperties = {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#ffffff',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    return (
        <OrgLayout>
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                    Analytics
                </h1>
                <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '2rem' }}>
                    Track your organization's performance and engagement
                </p>

                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                }}>
                    {summaryCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div key={index} style={{
                                background: '#111118',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.75rem',
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: `${card.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Icon size={18} color={card.color} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.25rem' }}>
                                    {card.value.toLocaleString()}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
                                    {card.label}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Follower Growth Chart */}
                <div style={chartContainerStyle}>
                    <h3 style={chartTitleStyle}>
                        <TrendingUp size={18} color="#8B5CF6" />
                        Follower Growth
                    </h3>
                    {followerGrowth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={followerGrowth}>
                                <defs>
                                    <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    labelFormatter={formatDate}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    name="New Followers"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    fill="url(#followerGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
                            No follower growth data available yet.
                        </p>
                    )}
                </div>

                {/* Post Engagement Chart */}
                <div style={chartContainerStyle}>
                    <h3 style={chartTitleStyle}>
                        <Eye size={18} color="#3B82F6" />
                        Post Engagement
                    </h3>
                    {postEngagement.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={postEngagement}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip contentStyle={chartTooltipStyle} labelFormatter={formatDate} />
                                <Legend
                                    wrapperStyle={{ fontSize: '0.8rem', color: '#888' }}
                                />
                                <Bar dataKey="views" name="Views" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="reactions" name="Reactions" fill="#EC4899" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="comments" name="Comments" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
                            No post engagement data available yet.
                        </p>
                    )}
                </div>

                {/* Broadcast Reach Chart */}
                <div style={{ ...chartContainerStyle, marginBottom: 0 }}>
                    <h3 style={chartTitleStyle}>
                        <Megaphone size={18} color="#F59E0B" />
                        Broadcast Reach
                    </h3>
                    {broadcastReach.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={broadcastReach}>
                                <defs>
                                    <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    labelFormatter={formatDate}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="reach"
                                    name="People Reached"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    fill="url(#reachGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
                            No broadcast reach data available yet.
                        </p>
                    )}
                </div>
            </div>
        </OrgLayout>
    );
}
