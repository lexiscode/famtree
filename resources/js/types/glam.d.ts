export interface GlamSeason {
    id: number;
    name: string;
    status: 'upcoming' | 'active' | 'completed';
    start_date: string;
    end_date: string;
}

export interface GlamChallenge {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    theme: string | null;
    banner_image: string | null;
    status: 'upcoming' | 'submissions_open' | 'voting_open' | 'completed';
    challenge_number: number;
    submissions_open_at: string | null;
    submissions_close_at: string | null;
    voting_open_at: string | null;
    voting_close_at: string | null;
    results_at: string | null;
    entries_count: number;
}

export interface GlamSquad {
    id: number;
    uuid: string;
    name: string;
    gender_track: 'female' | 'male' | 'mixed';
    member_count: number;
}

export interface GlamEntry {
    id: number;
    rank: number | null;
    is_qualified: boolean;
    photo_1: string | null;
    photo_2: string | null;
    caption: string | null;
    avg_rating: number;
    vote_count: number;
    weighted_score: number;
    user: GlamUser | null;
}

export interface GlamUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string | null;
}

export interface GlamStanding {
    rank: number;
    user: GlamUser | null;
    total_points: number;
    challenges_entered: number;
    top_1_count: number;
    top_3_count: number;
    current_entry_streak: number;
}

export interface GlamBadge {
    slug: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export interface GlamUserBadge {
    badge: GlamBadge | null;
    times_earned: number;
    earned_at: string;
}

export interface VotableEntry {
    id: number;
    photo_1: string | null;
    photo_2: string | null;
    caption: string | null;
    user: {
        first_name: string;
        last_name: string;
        profile_image_url: string | null;
    } | null;
}

export interface GlamWinner {
    rank: number;
    user: GlamUser | null;
    photo_1: string;
    weighted_score: number;
    challenge_title: string;
    challenge_id: number;
    gender_track: string;
}
