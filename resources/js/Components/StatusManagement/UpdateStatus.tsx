import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, Heart, Skull, Calendar, Check, X } from 'lucide-react';

interface UpdateStatusProps {
    userId: number;
    currentStatus: 'alive' | 'deceased';
    currentDeathDate?: string | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateStatus({
    userId,
    currentStatus,
    currentDeathDate,
    onClose,
    onSuccess,
}: UpdateStatusProps) {
    const [selectedStatus, setSelectedStatus] = useState<'alive' | 'deceased'>(currentStatus);
    const [deathDate, setDeathDate] = useState<string>(currentDeathDate || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(route('status.update'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    user_id: userId,
                    status: selectedStatus,
                    death_date: selectedStatus === 'deceased' ? deathDate : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status');
            }

            setLoading(false);
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err) {
            setLoading(false);
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    }, [userId, selectedStatus, deathDate, onClose, onSuccess]);

    const isFormValid = selectedStatus === 'deceased' ? deathDate : true;
    const hasChanges = selectedStatus !== currentStatus || (selectedStatus === 'deceased' && deathDate !== (currentDeathDate || ''));

    return (
        <div className="status-modal-overlay">
            <div className="status-modal-content">
                {/* Header */}
                <div className="status-modal-header">
                    <h2 className="status-modal-title">Update Status</h2>
                    <p className="status-modal-subtitle">
                        Update the status for {userId}. This action can be performed by the user or their nuclear family members.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="status-confirmation-alert warning">
                        <AlertCircle size={20} className="status-alert-icon" />
                        <div>{error}</div>
                    </div>
                )}

                {/* Status Selection */}
                <div className="status-form-group">
                    <label className="status-form-label">Select Status</label>
                    <div className="status-options">
                        {/* Alive Option */}
                        <div className="status-option">
                            <input
                                type="radio"
                                id="status-alive"
                                name="status"
                                value="alive"
                                checked={selectedStatus === 'alive'}
                                onChange={() => {
                                    setSelectedStatus('alive');
                                    setDeathDate('');
                                    setError(null);
                                }}
                            />
                            <label htmlFor="status-alive" className="status-option-label">
                                <div className="status-option-icon">
                                    <Heart size={24} fill="currentColor" />
                                </div>
                                <span className="status-option-text">Alive</span>
                            </label>
                        </div>

                        {/* Deceased Option */}
                        <div className="status-option">
                            <input
                                type="radio"
                                id="status-deceased"
                                name="status"
                                value="deceased"
                                checked={selectedStatus === 'deceased'}
                                onChange={() => {
                                    setSelectedStatus('deceased');
                                    setError(null);
                                }}
                            />
                            <label htmlFor="status-deceased" className="status-option-label">
                                <div className="status-option-icon">
                                    <Skull size={24} />
                                </div>
                                <span className="status-option-text">Deceased</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Death Date Input - Show only when deceased is selected */}
                {selectedStatus === 'deceased' && (
                    <div className={`status-date-input-group ${selectedStatus === 'deceased' ? 'visible' : 'hidden'}`}>
                        <label className="status-form-label">
                            <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Date of Death *
                        </label>
                        <input
                            type="date"
                            value={deathDate}
                            onChange={(e) => {
                                setDeathDate(e.target.value);
                                setError(null);
                            }}
                            className="status-date-input"
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <div className="status-date-help">
                            Please provide the date of death. The date cannot be in the future.
                        </div>
                    </div>
                )}

                {/* Confirmation Alert */}
                {selectedStatus === 'deceased' && deathDate && (
                    <div className="status-confirmation-alert deceased">
                        <AlertCircle size={20} className="status-alert-icon" />
                        <div>
                            <strong>Important:</strong> Marking a person as deceased is a permanent action that should be done with care. Please ensure the information is accurate.
                        </div>
                    </div>
                )}

                {/* Status Change Warning */}
                {selectedStatus === 'deceased' && currentStatus === 'alive' && (
                    <div className="status-confirmation-alert warning">
                        <AlertCircle size={20} className="status-alert-icon" />
                        <div>
                            You are about to mark this person as deceased. This will update their profile status permanently.
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="status-modal-actions">
                    <button
                        onClick={onClose}
                        className="status-btn status-btn-secondary"
                        disabled={loading}
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`status-btn ${selectedStatus === 'deceased' ? 'status-btn-danger' : 'status-btn-primary'}`}
                        disabled={loading || !isFormValid || !hasChanges}
                    >
                        <Check size={18} />
                        {loading ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </div>
        </div>
    );
}
