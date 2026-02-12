import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';

interface FlashMessages {
    success?: string | null;
    error?: string | null;
}

export function useFlashToast() {
    const { flash } = usePage().props as { flash?: FlashMessages };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);
}
