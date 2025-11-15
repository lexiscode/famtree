import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, MapPin, Globe } from 'lucide-react';

interface LocationInfoStepProps {
    onComplete: (progress: any) => void;
    data: Record<string, any> | null | undefined;
}

const NIGERIAN_STATES = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Federal Capital Territory',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
];

const NIGERIAN_CITIES_BY_STATE: Record<string, string[]> = {
    'Abia': ['Umuahia', 'Aba', 'Ohafia', 'Arochukwu', 'Bende'],
    'Adamawa': ['Yola', 'Mubi', 'Gombe', 'Girei', 'Song'],
    'Akwa Ibom': ['Uyo', 'Ikot Ekpene', 'Oron', 'Eket', 'Abak'],
    'Anambra': ['Awka', 'Onitsha', 'Nnewi', 'Agulu', 'Enugu Ukwu'],
    'Bauchi': ['Bauchi', 'Giade', 'Jada', 'Dass', 'Gamawa'],
    'Bayelsa': ['Yenagoa', 'Brass', 'Nembe', 'Sagbama', 'Ekeremor'],
    'Benue': ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Logo'],
    'Borno': ['Maiduguri', 'Biu', 'Monguno', 'Damaturu', 'Gubio'],
    'Cross River': ['Calabar', 'Ogoja', 'Buea', 'Ikom', 'Obudu'],
    'Delta': ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor'],
    'Ebonyi': ['Abakaliki', 'Afikpo', 'Ezza', 'Onueke', 'Ebonyi'],
    'Edo': ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Ifekoko'],
    'Ekiti': ['Ado Ekiti', 'Ikere', 'Ijero', 'Irepodun', 'Aramoko'],
    'Enugu': ['Enugu', 'Nsukka', 'Agbani', 'Awgu', 'Oji River'],
    'Federal Capital Territory': ['Abuja', 'Kwali', 'Bwari', 'Kuje', 'Gwagwalada'],
    'Gombe': ['Gombe', 'Bajoga', 'Akko', 'Balanga', 'Nafada'],
    'Imo': ['Owerri', 'Orlu', 'Okigwe', 'Ngor Okpala', 'Ikeduru'],
    'Jigawa': ['Dutse', 'Kazaure', 'Birnin Kudu', 'Gumel', 'Hadejia'],
    'Kaduna': ['Kaduna', 'Zaria', 'Kafanchan', 'Soba', 'Kachia'],
    'Kano': ['Kano', 'Kumbotso', 'Tarauni', 'Nassarawa', 'Gwarzo'],
    'Katsina': ['Katsina', 'Katsina City', 'Daura', 'Funtua', 'Malumfashi'],
    'Kebbi': ['Birnin Kebbi', 'Argungu', 'Jega', 'Yauri', 'Bagudo'],
    'Kogi': ['Lokoja', 'Koton Karfe', 'Idah', 'Ankpa', 'Obajana'],
    'Kwara': ['Ilorin', 'Offa', 'Ilaro', 'Jebba', 'Share'],
    'Lagos': ['Lagos', 'Ikeja', 'Lekki', 'Ajah', 'Ikorodu', 'Epe', 'Badagry'],
    'Nasarawa': ['Lafia', 'Keffi', 'Nasarawa', 'Kokona', 'Obi'],
    'Niger': ['Minna', 'Suleja', 'Bida', 'Kontagora', 'Gussau'],
    'Ogun': ['Abeokuta', 'Sagamu', 'Ilaro', 'Ijebu-Ode', 'Ifo'],
    'Ondo': ['Akure', 'Ondo', 'Owo', 'Ilesa', 'Igbokoda'],
    'Osun': ['Osogbo', 'Ilesha', 'Iwo', 'Oye', 'Ilesa'],
    'Oyo': ['Ibadan', 'Oyo', 'Ogbomosho', 'Ijebu-Igbo', 'Eruwa'],
    'Plateau': ['Jos', 'Bukuru', 'Barkin Ladi', 'Pankshin', 'Wase'],
    'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Bonny', 'Degema'],
    'Sokoto': ['Sokoto', 'Gusau', 'Wurno', 'Bodinga', 'Yabo'],
    'Taraba': ['Jalingo', 'Wukari', 'Takum', 'Gembu', 'Zing'],
    'Yobe': ['Damaturu', 'Potiskum', 'Geidam', 'Nguru', 'Gashua'],
    'Zamfara': ['Gusau', 'Zamfara', 'Kaura Namoda', 'Talika', 'Anka'],
};

export default function LocationInfoStep({ onComplete, data }: LocationInfoStepProps) {
    const [formData, setFormData] = useState({
        address: data?.address || '',
        city: data?.city || '',
        state_province: data?.state_province || '',
        country: data?.country || 'Nigeria',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('onboarding.save.location-info'), formData, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                // @ts-ignore
                onComplete(page.props.progress);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors as Record<string, string>);
            },
        });
    };

    return (
        <div className="location-info-step">
            <h3>Where are you from?</h3>
            <p>Share your location to help find family members in your area and communities.</p>

            <form onSubmit={handleSubmit}>
                {/* Country - Most Important */}
                <div className="form-group">
                    <label htmlFor="country" className="form-label" style={{ color: '#4a4545ff' }}>
                        Country <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Globe
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '15px',
                                color: '#9CA3AF',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="United States"
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    {errors.country && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {errors.country}
                        </div>
                    )}
                </div>

                {/* State/Province and City Row */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="state_province" className="form-label" style={{ color: '#4a4545ff' }}>
                                State
                            </label>
                            <div style={{ position: 'relative' }}>
                                <MapPin
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '15px',
                                        color: '#9CA3AF',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                />
                                <select
                                    className={`form-control ${errors.state_province ? 'is-invalid' : ''}`}
                                    id="state_province"
                                    name="state_province"
                                    value={formData.state_province}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: '40px' }}
                                >
                                    <option value="">Select a state</option>
                                    {NIGERIAN_STATES.map(state => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.state_province && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    {errors.state_province}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="city" className="form-label" style={{ color: '#4a4545ff' }}>
                                City
                            </label>
                            <div style={{ position: 'relative' }}>
                                <MapPin
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '15px',
                                        color: '#9CA3AF',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                />
                                <select
                                    className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={isSubmitting || !formData.state_province}
                                    style={{ paddingLeft: '40px' }}
                                >
                                    <option value="">Select a city</option>
                                    {formData.state_province && NIGERIAN_CITIES_BY_STATE[formData.state_province]?.map(city => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.city && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    {errors.city}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="form-group">
                    <label htmlFor="address" className="form-label" style={{ color: '#4a4545ff' }}>
                        Street Address
                    </label>
                    <div style={{ position: 'relative' }}>
                        <MapPin
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '15px',
                                color: '#9CA3AF',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            className="form-control"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main Street"
                            disabled={isSubmitting}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="btn-group">
                    <button
                        type="submit"
                        className="btn btn-primary btn-full-width"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Saving...
                            </>
                        ) : (
                            'Continue to Next Step'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
