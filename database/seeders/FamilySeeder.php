<?php

namespace Database\Seeders;

use App\Models\GuestModels\Family;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FamilySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $families = [
            [
                'name' => 'Okafor Family',
                'slug' => 'okafor-family',
                'state' => 'Enugu',
                'lga' => 'Enugu East',
                'village' => 'Nkanu',
                'founder' => 'Chief Emeka Okafor',
                'member_count' => 45,
                'story' => 'The Okafor family has been a cornerstone of Enugu community for over 5 generations. Known for their strong cultural values and business acumen, the family has produced leaders in various fields including education, politics, and commerce.',
                'cover_image' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=400&fit=crop',
                'founded_year' => 1985,
                'new_members_this_year' => 5,
                'is_public' => true,
            ],
            [
                'name' => 'Adeyemi Family',
                'slug' => 'adeyemi-family',
                'state' => 'Oyo',
                'lga' => 'Ibadan',
                'village' => 'Oyo Town',
                'founder' => 'Oba Babatunde Adeyemi',
                'member_count' => 67,
                'story' => 'The Adeyemi family is one of the most prominent royal families in Oyo. With deep roots in Yoruba culture and traditions, they have maintained their heritage while embracing modern practices. The family is known for their philanthropy and community development initiatives.',
                'cover_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
                'founded_year' => 1920,
                'new_members_this_year' => 8,
                'is_public' => true,
            ],
            [
                'name' => 'Nnamdi Family',
                'slug' => 'nnamdi-family',
                'state' => 'Anambra',
                'lga' => 'Awka',
                'village' => 'Nawfia',
                'founder' => 'Chief Nnamdi Okeke',
                'member_count' => 38,
                'story' => 'The Nnamdi family epitomizes the entrepreneurial spirit of Igbo people. Based in Awka, they have built a successful textile and trading business spanning three generations. Family members are scattered across Nigeria and the diaspora but maintain strong cultural ties.',
                'cover_image' => 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop',
                'founded_year' => 1978,
                'new_members_this_year' => 3,
                'is_public' => true,
            ],
            [
                'name' => 'Adekunle Family',
                'slug' => 'adekunle-family',
                'state' => 'Lagos',
                'lga' => 'Lagos Island',
                'village' => 'Isale Eko',
                'founder' => 'Hajj Adekunle Olatunde',
                'member_count' => 52,
                'story' => 'The Adekunle family has been instrumental in the development of Lagos for decades. Known for their commercial ventures and educational contributions, the family values hard work, integrity, and community service above all else.',
                'cover_image' => 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop',
                'founded_year' => 1965,
                'new_members_this_year' => 7,
                'is_public' => true,
            ],
            [
                'name' => 'Ichiakwu Family',
                'slug' => 'ichiakwu-family',
                'state' => 'Abia',
                'lga' => 'Umuahia',
                'village' => 'Ahiaba',
                'founder' => 'Sir Ikechi Ichiakwu',
                'member_count' => 41,
                'story' => 'The Ichiakwu family represents the proud heritage of Abia. With strong ties to agriculture and trade, the family continues to thrive both locally and in the diaspora. They are known for their annual family reunion which brings together family members from around the world.',
                'cover_image' => 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop',
                'founded_year' => 1990,
                'new_members_this_year' => 4,
                'is_public' => true,
            ],
            [
                'name' => 'Olayinka Family',
                'slug' => 'olayinka-family',
                'state' => 'Osun',
                'lga' => 'Ife',
                'village' => 'Ile-Ife',
                'founder' => 'Chief Adeola Olayinka',
                'member_count' => 56,
                'story' => 'The Olayinka family is deeply rooted in Yoruba traditions and the rich history of Ile-Ife. They have maintained their cultural practices while adapting to modern times. The family is proud of their contributions to education and traditional governance.',
                'cover_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
                'founded_year' => 1972,
                'new_members_this_year' => 6,
                'is_public' => true,
            ],
            [
                'name' => 'Mbakogu Family',
                'slug' => 'mbakogu-family',
                'state' => 'Ebonyi',
                'lga' => 'Abakaliki',
                'village' => 'Onuebonyi',
                'founder' => 'Dr. Ifeanyi Mbakogu',
                'member_count' => 33,
                'story' => 'The Mbakogu family is known for their academic and professional achievements. With several doctors, engineers, and scholars among their members, they exemplify the power of education in transforming families and communities.',
                'cover_image' => 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop',
                'founded_year' => 1995,
                'new_members_this_year' => 2,
                'is_public' => true,
            ],
            [
                'name' => 'Oni Family',
                'slug' => 'oni-family',
                'state' => 'Ekiti',
                'lga' => 'Ado-Ekiti',
                'village' => 'Ijero',
                'founder' => 'The Oni of Ijero',
                'member_count' => 72,
                'story' => 'The Oni family are royal custodians of Ijero kingdom with centuries of history. They maintain strong cultural traditions and are involved in preserving Yoruba heritage and traditional governance structures.',
                'cover_image' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=400&fit=crop',
                'founded_year' => 1850,
                'new_members_this_year' => 9,
                'is_public' => true,
            ],
            [
                'name' => 'Azodo Family',
                'slug' => 'azodo-family',
                'state' => 'Delta',
                'lga' => 'Asaba',
                'village' => 'Asaba',
                'founder' => 'Oghenekaro Azodo',
                'member_count' => 44,
                'story' => 'The Azodo family hails from the oil-rich Delta region and has been involved in business and community development. They pride themselves on unity, hard work, and giving back to society.',
                'cover_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
                'founded_year' => 1980,
                'new_members_this_year' => 5,
                'is_public' => true,
            ],
            [
                'name' => 'Okoro Family',
                'slug' => 'okoro-family',
                'state' => 'Cross River',
                'lga' => 'Calabar',
                'village' => 'Bakassi',
                'founder' => 'Pa Etim Okoro',
                'member_count' => 38,
                'story' => 'The Okoro family is part of the vibrant Calabar culture, known for their warmth and hospitality. They maintain strong bonds despite members being scattered across different countries for work and studies.',
                'cover_image' => 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=400&fit=crop',
                'founded_year' => 1975,
                'new_members_this_year' => 4,
                'is_public' => true,
            ],
            [
                'name' => 'Usman Family',
                'slug' => 'usman-family',
                'state' => 'Kano',
                'lga' => 'Kano Municipal',
                'village' => 'Gida',
                'founder' => 'Alhaji Muhammad Usman',
                'member_count' => 89,
                'story' => 'The Usman family is one of the largest families in Northern Nigeria with deep Islamic roots. They have been prominent in trade and education for generations, contributing significantly to their community.',
                'cover_image' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=400&fit=crop',
                'founded_year' => 1940,
                'new_members_this_year' => 12,
                'is_public' => true,
            ],
        ];

        foreach ($families as $family) {
            Family::create($family);
        }
    }
}
