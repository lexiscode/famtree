import OrgLayout from '@/Layouts/OrgLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    faculty: string | null;
    department: string | null;
}

interface Props {
    groups: Group[];
}

export default function BroadcastsCreate({ groups }: Props) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'all_groups' | 'selected_groups'>('all_groups');
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled' | 'recurring'>('immediate');
    const [scheduledAt, setScheduledAt] = useState('');
    const [recurrenceType, setRecurrenceType] = useState('daily');
    const [recurrenceCount, setRecurrenceCount] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const toggleGroup = (id: number) => {
        setSelectedGroupIds((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSubmitting(true);
        router.post(route('org.broadcasts.store'), {
            title: title || null,
            message,
            target_type: targetType,
            target_class_set_ids: targetType === 'selected_groups' ? selectedGroupIds : [],
            schedule_type: scheduleType,
            scheduled_at: scheduleType === 'scheduled' ? scheduledAt : null,
            recurrence_type: scheduleType === 'recurring' ? recurrenceType : null,
            recurrence_count: scheduleType === 'recurring' ? recurrenceCount : null,
        }, {
            onSuccess: () => setSubmitting(false),
            onError: () => setSubmitting(false),
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#1a1a24',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '8px',
        padding: '0.875rem',
        color: '#ffffff',
        fontSize: '0.95rem',
        outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#e0e0e0',
        marginBottom: '0.5rem',
    };

    const radioLabelStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: '#1a1a24',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#e0e0e0',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
    };

    const radioLabelActiveStyle: React.CSSProperties = {
        ...radioLabelStyle,
        borderColor: 'rgba(139, 92, 246, 0.4)',
        background: 'rgba(139, 92, 246, 0.08)',
    };

    return (
        <OrgLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.visit(route('org.broadcasts.index'))}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#8B5CF6',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: 0,
                            marginBottom: '1rem',
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Broadcasts
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Create Broadcast
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    background: '#111118',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '2rem',
                }}>
                    {/* Title */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Title (optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your broadcast a title..."
                            style={inputStyle}
                        />
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Message *</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your broadcast message..."
                            rows={5}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    {/* Target Type */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Target Audience</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <label style={targetType === 'all_groups' ? radioLabelActiveStyle : radioLabelStyle}>
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="all_groups"
                                    checked={targetType === 'all_groups'}
                                    onChange={() => setTargetType('all_groups')}
                                    style={{ accentColor: '#8B5CF6' }}
                                />
                                All Groups
                            </label>
                            <label style={targetType === 'selected_groups' ? radioLabelActiveStyle : radioLabelStyle}>
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="selected_groups"
                                    checked={targetType === 'selected_groups'}
                                    onChange={() => setTargetType('selected_groups')}
                                    style={{ accentColor: '#8B5CF6' }}
                                />
                                Selected Groups
                            </label>
                        </div>
                    </div>

                    {/* Group Selection */}
                    {targetType === 'selected_groups' && (
                        <div style={{
                            marginBottom: '1.5rem',
                            background: '#0d0d14',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            borderRadius: '10px',
                            padding: '1.25rem',
                        }}>
                            <label style={{ ...labelStyle, marginBottom: '1rem' }}>
                                Select Groups ({selectedGroupIds.length} selected)
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '0.5rem',
                                maxHeight: '300px',
                                overflowY: 'auto',
                            }}>
                                {groups.map((group) => (
                                    <label
                                        key={group.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            background: selectedGroupIds.includes(group.id)
                                                ? 'rgba(139, 92, 246, 0.08)'
                                                : 'rgba(255, 255, 255, 0.02)',
                                            border: `1px solid ${selectedGroupIds.includes(group.id) ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGroupIds.includes(group.id)}
                                            onChange={() => toggleGroup(group.id)}
                                            style={{ accentColor: '#8B5CF6' }}
                                        />
                                        <div>
                                            <p style={{ margin: 0, color: '#e0e0e0', fontSize: '0.875rem', fontWeight: 500 }}>
                                                {group.name}
                                            </p>
                                            {(group.faculty || group.department) && (
                                                <p style={{ margin: '0.15rem 0 0', color: '#666', fontSize: '0.75rem' }}>
                                                    {[group.faculty, group.department].filter(Boolean).join(' / ')}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Schedule Type */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Schedule</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {(['immediate', 'scheduled', 'recurring'] as const).map((type) => (
                                <label
                                    key={type}
                                    style={scheduleType === type ? radioLabelActiveStyle : radioLabelStyle}
                                >
                                    <input
                                        type="radio"
                                        name="schedule_type"
                                        value={type}
                                        checked={scheduleType === type}
                                        onChange={() => setScheduleType(type)}
                                        style={{ accentColor: '#8B5CF6' }}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Scheduled At */}
                    {scheduleType === 'scheduled' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Scheduled Date & Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                style={{ ...inputStyle, maxWidth: '320px', colorScheme: 'dark' }}
                            />
                        </div>
                    )}

                    {/* Recurrence Settings */}
                    {scheduleType === 'recurring' && (
                        <div style={{
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'flex-end',
                        }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Recurrence Type</label>
                                <select
                                    value={recurrenceType}
                                    onChange={(e) => setRecurrenceType(e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Number of Recurrences</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={recurrenceCount}
                                    onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                        <button
                            type="submit"
                            disabled={submitting || !message.trim()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 2rem',
                                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: submitting || !message.trim() ? 'not-allowed' : 'pointer',
                                opacity: submitting || !message.trim() ? 0.6 : 1,
                                transition: 'opacity 0.2s ease',
                            }}
                        >
                            <Send size={16} />
                            {submitting ? 'Creating...' : 'Create Broadcast'}
                        </button>
                    </div>
                </form>
            </div>
        </OrgLayout>
    );
}
