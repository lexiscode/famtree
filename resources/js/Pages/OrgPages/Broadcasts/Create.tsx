import OrgLayout from '@/Layouts/OrgLayout';
import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Send, Search, Loader } from 'lucide-react';
import RichTextEditor from '@/Components/RichTextEditor';

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
    const [groupSearch, setGroupSearch] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('');

    const faculties = useMemo(() => {
        const set = new Set<string>();
        groups.forEach(g => { if (g.faculty) set.add(g.faculty); });
        return Array.from(set).sort();
    }, [groups]);

    const filteredGroups = useMemo(() => {
        const search = groupSearch.toLowerCase().trim();
        return groups.filter(g => {
            if (facultyFilter && g.faculty !== facultyFilter) return false;
            if (!search) return true;
            return (
                g.name.toLowerCase().includes(search) ||
                (g.faculty && g.faculty.toLowerCase().includes(search)) ||
                (g.department && g.department.toLowerCase().includes(search))
            );
        });
    }, [groups, groupSearch, facultyFilter]);

    const allFilteredSelected = filteredGroups.length > 0 && filteredGroups.every(g => selectedGroupIds.includes(g.id));

    const toggleSelectAllFiltered = () => {
        if (allFilteredSelected) {
            const filteredIds = new Set(filteredGroups.map(g => g.id));
            setSelectedGroupIds(prev => prev.filter(id => !filteredIds.has(id)));
        } else {
            const currentSet = new Set(selectedGroupIds);
            filteredGroups.forEach(g => currentSet.add(g.id));
            setSelectedGroupIds(Array.from(currentSet));
        }
    };

    const toggleGroup = (id: number) => {
        setSelectedGroupIds((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const getTextContent = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || '').trim();
    };

    const hasMessage = getTextContent(message).length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasMessage) return;
        setSubmitting(true);
        router.post(route('org.broadcasts.store'), {
            title: title || null,
            message,
            target_type: targetType,
            target_class_set_ids: targetType === 'selected_groups' ? selectedGroupIds : [],
            schedule_type: scheduleType,
            scheduled_at: (scheduleType === 'scheduled' || scheduleType === 'recurring') && scheduledAt ? new Date(scheduledAt).toISOString() : null,
            recurrence_type: scheduleType === 'recurring' ? recurrenceType : null,
            recurrence_count: scheduleType === 'recurring' ? recurrenceCount : null,
        }, {
            onSuccess: () => setSubmitting(false),
            onError: () => setSubmitting(false),
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#1e1e35',
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
        background: '#1e1e35',
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
                    background: '#141425',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '2rem',
                    position: 'relative',
                }}>
                    {/* Sending Overlay */}
                    {submitting && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 10,
                            background: 'rgba(17, 17, 24, 0.92)',
                            borderRadius: '12px',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: '1.25rem',
                        }}>
                            <Loader
                                size={36}
                                color="#8B5CF6"
                                style={{ animation: 'spin 1.2s linear infinite' }}
                            />
                            <p style={{
                                color: '#e0e0e0', fontSize: '1.05rem',
                                fontWeight: 600, margin: 0,
                            }}>
                                Sending broadcast...
                            </p>
                            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0, textAlign: 'center', maxWidth: '320px' }}>
                                Delivering to {targetType === 'all_groups' ? 'all groups' : `${selectedGroupIds.length} selected group${selectedGroupIds.length !== 1 ? 's' : ''}`}. This may take a moment.
                            </p>
                            {/* Indeterminate progress bar */}
                            <div style={{
                                width: '220px', height: '4px',
                                background: 'rgba(139, 92, 246, 0.15)',
                                borderRadius: '2px', overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: '40%', height: '100%',
                                    background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                                    borderRadius: '2px',
                                    animation: 'progressSlide 1.5s ease-in-out infinite',
                                }} />
                            </div>
                            <style>{`
                                @keyframes spin { to { transform: rotate(360deg); } }
                                @keyframes progressSlide {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(350%); }
                                }
                            `}</style>
                        </div>
                    )}

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
                        <RichTextEditor
                            value={message}
                            onChange={setMessage}
                            placeholder="Write your broadcast message..."
                            maxLength={5000}
                            disabled={submitting}
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
                                    style={{ accentColor: '#8B5CF6', width: 16, height: 16, flexShrink: 0 }}
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
                                    style={{ accentColor: '#8B5CF6', width: 16, height: 16, flexShrink: 0 }}
                                />
                                Selected Groups
                            </label>
                        </div>
                    </div>

                    {/* Group Selection */}
                    {targetType === 'selected_groups' && (
                        <div style={{
                            marginBottom: '1.5rem',
                            background: '#0e0e1e',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            borderRadius: '10px',
                            padding: '1.25rem',
                        }}>
                            <label style={{ ...labelStyle, marginBottom: '1rem' }}>
                                Select Groups ({selectedGroupIds.length} selected)
                            </label>

                            {/* Search & Filter Bar */}
                            <div style={{
                                display: 'flex', gap: '0.75rem', marginBottom: '0.75rem',
                                flexWrap: 'wrap', alignItems: 'center',
                            }}>
                                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
                                    <Search size={15} style={{
                                        position: 'absolute', left: '10px', top: '50%',
                                        transform: 'translateY(-50%)', color: '#666',
                                    }} />
                                    <input
                                        type="text"
                                        value={groupSearch}
                                        onChange={(e) => setGroupSearch(e.target.value)}
                                        placeholder="Search groups..."
                                        style={{
                                            ...inputStyle,
                                            padding: '0.6rem 0.75rem 0.6rem 2rem',
                                            fontSize: '0.85rem',
                                        }}
                                    />
                                </div>
                                {faculties.length > 1 && (
                                    <select
                                        value={facultyFilter}
                                        onChange={(e) => setFacultyFilter(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            width: 'auto', flex: '0 1 200px',
                                            padding: '0.6rem 0.75rem',
                                            fontSize: '0.85rem', cursor: 'pointer',
                                        }}
                                    >
                                        <option value="">All Faculties</option>
                                        {faculties.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                )}
                                <button
                                    type="button"
                                    onClick={toggleSelectAllFiltered}
                                    style={{
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '8px',
                                        padding: '0.6rem 1rem',
                                        color: '#8B5CF6',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '0.5rem',
                                maxHeight: '300px',
                                overflowY: 'auto',
                            }}>
                                {filteredGroups.length > 0 ? filteredGroups.map((group) => (
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
                                            style={{ accentColor: '#8B5CF6', width: 16, height: 16, flexShrink: 0 }}
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
                                )) : (
                                    <p style={{ color: '#555', fontSize: '0.85rem', padding: '1rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                                        No groups match your search.
                                    </p>
                                )}
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
                                        style={{ accentColor: '#8B5CF6', width: 16, height: 16, flexShrink: 0 }}
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
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>First Send Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    required
                                    style={{ ...inputStyle, maxWidth: '320px', colorScheme: 'dark' }}
                                />
                                <p style={{ margin: '0.4rem 0 0', color: '#666', fontSize: '0.78rem' }}>
                                    The first broadcast will be sent at this date and time. Subsequent sends will occur at the same time.
                                </p>
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                alignItems: 'flex-end',
                                marginBottom: '1.5rem',
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
                            disabled={submitting || !hasMessage}
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
                                cursor: submitting || !hasMessage ? 'not-allowed' : 'pointer',
                                opacity: submitting || !hasMessage ? 0.6 : 1,
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
