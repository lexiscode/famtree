<?php

namespace Database\Seeders;

use App\Models\GuestModels\OrganizationCategory;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\Faculty;
use App\Models\GuestModels\Department;
use App\Models\GuestModels\ClassSet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            [
                'name' => 'Higher Institutions',
                'slug' => 'higher-institutions',
                'description' => 'Universities, polytechnics, and colleges of education across Nigeria.',
                'icon' => 'graduation-cap',
                'display_order' => 1,
            ],
            [
                'name' => 'High Schools',
                'slug' => 'high-schools',
                'description' => 'Secondary schools and grammar schools.',
                'icon' => 'building',
                'display_order' => 2,
            ],
            [
                'name' => 'Football Fans',
                'slug' => 'football-fans',
                'description' => 'Connect with fellow fans of your favorite football clubs.',
                'icon' => 'users',
                'display_order' => 3,
            ],
            [
                'name' => 'Religious Organizations',
                'slug' => 'religious-organizations',
                'description' => 'Churches, mosques, and other religious communities.',
                'icon' => 'church',
                'display_order' => 4,
            ],
        ];

        foreach ($categories as $categoryData) {
            OrganizationCategory::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        $higherInstitutions = OrganizationCategory::where('slug', 'higher-institutions')->first();

        // UNILAG Data
        $unilag = Organization::updateOrCreate(
            ['slug' => 'university-of-lagos'],
            [
                'category_id' => $higherInstitutions->id,
                'name' => 'University of Lagos',
                'short_name' => 'UNILAG',
                'description' => 'The University of Lagos, popularly known as UNILAG, is a public research university located in Lagos, Nigeria. Founded in 1962, it is one of Nigeria\'s oldest and most prestigious universities.',
                'vision' => 'To be a top-class institution for the pursuit of excellence in knowledge through teaching, research and public service delivery.',
                'mission' => 'To provide a conducive environment for teaching and learning, undertake research and development activities relevant to the needs of the nation, and promote good governance and service delivery.',
                'logo' => '/unilag/unilag-logo.jpg',
                'cover_image' => '/unilag/senate-building.jpg',
                'address' => 'University Road, Akoka',
                'city' => 'Lagos',
                'state' => 'Lagos State',
                'country' => 'Nigeria',
                'website' => 'https://www.unilag.edu.ng',
                'email' => 'info@unilag.edu.ng',
                'phone' => '+234 1 280 2439',
                'founded_year' => 1962,
                'leader_name' => 'Professor Folasade T. Ogunsola',
                'leader_title' => 'Vice-Chancellor',
                'leader_qualifications' => 'MBBS, MSc, PhD, FMCPath, FAS, OON. First female Vice-Chancellor of UNILAG.',
                'leader_image' => '/unilag/vc.png',
                'is_active' => true,
            ]
        );

        // UI Data
        $ui = Organization::updateOrCreate(
            ['slug' => 'university-of-ibadan'],
            [
                'category_id' => $higherInstitutions->id,
                'name' => 'University of Ibadan',
                'short_name' => 'UI',
                'description' => 'The University of Ibadan, established in 1948, is Nigeria\'s oldest university. It is located in Ibadan, Oyo State, and is a premier research institution.',
                'vision' => 'To be a world-class institution where conditions for learning are excellent and research findings are disseminated globally.',
                'mission' => 'To expand the frontiers of knowledge through provision of excellent conditions for learning and research, the production of graduates who are worthy in character and sound judgment, and the provision of service to the community.',
                'logo' => '/ui/ui-logo.jpeg',
                'cover_image' => '/ui/ui-gate.jpg',
                'address' => 'Oduduwa Road, Agbowo',
                'city' => 'Ibadan',
                'state' => 'Oyo State',
                'country' => 'Nigeria',
                'website' => 'https://www.ui.edu.ng',
                'email' => 'info@ui.edu.ng',
                'phone' => '+234 2 810 1100',
                'founded_year' => 1948,
                'leader_name' => 'Professor Kayode Oyebode Adebowale',
                'leader_title' => 'Vice-Chancellor',
                'leader_qualifications' => 'BSc, MSc, PhD. Distinguished Professor of Industrial Chemistry.',
                'leader_image' => '/ui/ui-vc.png',
                'is_active' => true,
            ]
        );

        // Create Faculties and Departments for UNILAG
        $this->seedUnilagFaculties($unilag);

        // Create Faculties and Departments for UI
        $this->seedUIFaculties($ui);

        // Get Football Fans category
        $footballFans = OrganizationCategory::where('slug', 'football-fans')->first();

        // Chelsea Football Club
        $chelsea = Organization::updateOrCreate(
            ['slug' => 'chelsea-football-club'],
            [
                'category_id' => $footballFans->id,
                'name' => 'Chelsea Football Club',
                'short_name' => 'Chelsea FC',
                'description' => 'Chelsea Football Club is a professional football club based in Fulham, West London, England. Founded in 1905, the club competes in the Premier League, the top tier of English football. Chelsea have won six league titles, eight FA Cups, five League Cups, and two UEFA Champions League titles, establishing themselves as one of the most successful clubs in English football history. The club plays their home games at Stamford Bridge, a 40,341-seat stadium they have occupied since their foundation.',
                'vision' => '"We are Chelsea. We are the Blues. Pride of London."',
                'mission' => "HONOURS: Premier League (6): 1954–55, 2004–05, 2005–06, 2009–10, 2014–15, 2016–17 | FA Cup (8): 1970, 1997, 2000, 2007, 2009, 2010, 2012, 2018 | UEFA Champions League (2): 2012, 2021 | UEFA Europa League (2): 2013, 2019 | FIFA Club World Cup (1): 2022 | League Cup (5): 1965, 1998, 2005, 2007, 2015 | UEFA Cup Winners' Cup (2): 1971, 1998 | UEFA Super Cup (2): 1998, 2021",
                'logo' => '/chelsea/chelsea-logo.webp',
                'cover_image' => '/chelsea/stadium.jpg',
                'address' => 'Stamford Bridge, Fulham Road',
                'city' => 'London',
                'state' => 'England',
                'country' => 'United Kingdom',
                'website' => 'https://www.chelseafc.com',
                'email' => 'info@chelseafc.com',
                'phone' => '+44 207 386 9373',
                'founded_year' => 1905,
                'leader_name' => 'Liam Rosenior',
                'leader_title' => 'Head Coach',
                'leader_qualifications' => 'On 6 January 2026, Rosenior was appointed as the new head coach of Chelsea on a six-and-a-half-year deal. He started working with the squad after their league match against Fulham on 7 January. In his first match in charge, he led Chelsea to a 5–1 away win over Charlton Athletic in the third round of the FA Cup.',
                'leader_image' => '/chelsea/liam-rosenior.jpg',
                'is_active' => true,
            ]
        );

        // Manchester United
        $manutd = Organization::updateOrCreate(
            ['slug' => 'manchester-united'],
            [
                'category_id' => $footballFans->id,
                'name' => 'Manchester United Football Club',
                'short_name' => 'Man Utd',
                'description' => 'Manchester United Football Club is a professional football club based in Old Trafford, Greater Manchester, England. Founded in 1878 as Newton Heath LYR Football Club, they are one of the most successful and widely supported football clubs in the world. The club plays at Old Trafford, known as "The Theatre of Dreams", which has a capacity of 74,310, making it the largest club football stadium in the United Kingdom.',
                'vision' => '"Glory, Glory, Man United!" - The Theatre of Dreams',
                'mission' => "HONOURS: Premier League (20): 1908, 1911, 1952, 1956, 1957, 1965, 1967, 1993, 1994, 1996, 1997, 1999, 2000, 2001, 2003, 2007, 2008, 2009, 2011, 2013 | FA Cup (12): 1909, 1948, 1963, 1977, 1983, 1985, 1990, 1994, 1996, 1999, 2004, 2016 | UEFA Champions League (3): 1968, 1999, 2008 | UEFA Europa League (1): 2017 | FIFA Club World Cup (1): 2008 | League Cup (6): 1992, 2006, 2009, 2010, 2017, 2023",
                'logo' => '/manutd/manutd-logo.png',
                'cover_image' => '/manutd/manutd-stadium.jpg',
                'address' => 'Sir Matt Busby Way, Old Trafford',
                'city' => 'Manchester',
                'state' => 'England',
                'country' => 'United Kingdom',
                'website' => 'https://www.manutd.com',
                'email' => 'enquiries@manutd.co.uk',
                'phone' => '+44 161 868 8000',
                'founded_year' => 1878,
                'leader_name' => 'Michael Carrick',
                'leader_title' => 'Head Coach',
                'leader_qualifications' => "Carrick returned to Manchester United on 13 January 2026 to take over as head coach until the end of the 2025–26 season. Four days later, on 17 January, he led the team to a 2–0 win over Manchester City in the Manchester derby. It was United's first win over their rivals at Old Trafford since January 2023",
                'leader_image' => '/manutd/michael-carrick.avif',
                'is_active' => true,
            ]
        );

        // Seed channels for Chelsea
        $this->seedFootballChannels($chelsea, 'Chelsea');

        // Seed channels for Manchester United
        $this->seedFootballChannels($manutd, 'Man Utd');

        // Get Religious Organizations category
        $religiousOrgs = OrganizationCategory::where('slug', 'religious-organizations')->first();

        // Deeper Christian Life Ministry
        $deeperLife = Organization::updateOrCreate(
            ['slug' => 'deeper-christian-life-ministry'],
            [
                'category_id' => $religiousOrgs->id,
                'name' => 'Deeper Christian Life Ministry',
                'short_name' => 'Deeper Life',
                'description' => 'Deeper Christian Life Ministry, commonly known as Deeper Life Bible Church, is one of Nigeria\'s largest and most influential evangelical churches. Founded by Pastor William Folorunso Kumuyi in 1973, the ministry began as a small Bible study group of fifteen people in a living room at the University of Lagos. Today, it has grown into a global ministry with millions of members worldwide, known for its emphasis on holiness, in-depth Bible study, and practical Christian living.',
                'vision' => 'To be a leading global ministry that transforms lives through the uncompromising teaching of God\'s Word, raising disciples who are worthy in character and sound in doctrine, while demonstrating the power of the Gospel in every sphere of human endeavor.',
                'mission' => 'To proclaim the undiluted Word of God with clarity and power, nurture believers to spiritual maturity through systematic Bible teaching, establish vibrant local assemblies worldwide, and demonstrate Christ\'s love through practical acts of service to humanity. The ministry is committed to raising a generation of Christians who take their faith seriously and live as salt and light in their communities.',
                'logo' => '/churches/deeper-life/logo.png',
                'cover_image' => '/churches/deeper-life/deeper-life.jpeg',
                'address' => 'Deeper Life Bible Church Headquarters, Gbagada',
                'city' => 'Lagos',
                'state' => 'Lagos State',
                'country' => 'Nigeria',
                'website' => 'https://www.dclm.org',
                'email' => 'info@dclm.org',
                'phone' => '+234 1 280 0000',
                'founded_year' => 1973,
                'leader_name' => 'Pastor William Folorunso Kumuyi',
                'leader_title' => 'General Superintendent',
                'leader_qualifications' => 'BSc Mathematics (First Class Honours), Former Lecturer at the University of Lagos. Pastor Kumuyi is widely regarded as one of the greatest living preachers, known for his clear, systematic Bible exposition and commitment to holiness. Under his leadership, Deeper Life has grown from a small Bible study group to a global ministry with presence in over 100 countries.',
                'leader_image' => '/churches/deeper-life/founder.webp',
                'is_active' => true,
            ]
        );

        // Seed channels for Deeper Life
        $this->seedReligiousChannels($deeperLife, 'Deeper Life');
    }

    private function seedUnilagFaculties(Organization $unilag): void
    {
        $faculties = [
            [
                'name' => 'Faculty of Engineering',
                'slug' => 'engineering-unilag',
                'departments' => [
                    'Chemical & Petroleum Engineering',
                    'Civil & Environmental Engineering',
                    'Computer Engineering',
                    'Electrical & Electronics Engineering',
                    'Mechanical Engineering',
                    'Metallurgical & Materials Engineering',
                    'Systems Engineering',
                ],
            ],
            [
                'name' => 'Faculty of Science',
                'slug' => 'science-unilag',
                'departments' => [
                    'Biochemistry',
                    'Botany',
                    'Chemistry',
                    'Computer Science',
                    'Geology',
                    'Geophysics',
                    'Marine Sciences',
                    'Mathematics',
                    'Microbiology',
                    'Physics',
                    'Zoology',
                ],
            ],
            [
                'name' => 'Faculty of Arts',
                'slug' => 'arts-unilag',
                'departments' => [
                    'Creative Arts',
                    'English',
                    'European Languages & Integration Studies',
                    'History & Strategic Studies',
                    'Linguistics, African & Asian Studies',
                    'Philosophy',
                ],
            ],
            [
                'name' => 'Faculty of Social Sciences',
                'slug' => 'social-sciences-unilag',
                'departments' => [
                    'Economics',
                    'Geography',
                    'Mass Communication',
                    'Political Science',
                    'Psychology',
                    'Sociology',
                ],
            ],
            [
                'name' => 'Faculty of Business Administration',
                'slug' => 'business-admin-unilag',
                'departments' => [
                    'Accounting',
                    'Actuarial Science & Insurance',
                    'Business Administration',
                    'Finance',
                    'Industrial Relations & Personnel Management',
                ],
            ],
            [
                'name' => 'Faculty of Law',
                'slug' => 'law-unilag',
                'departments' => [
                    'Commercial & Industrial Law',
                    'International Law & Jurisprudence',
                    'Private & Property Law',
                    'Public Law',
                ],
            ],
            [
                'name' => 'Faculty of Education',
                'slug' => 'education-unilag',
                'departments' => [
                    'Adult Education',
                    'Arts & Social Sciences Education',
                    'Educational Administration',
                    'Educational Foundations',
                    'Human Kinetics & Health Education',
                    'Science & Technology Education',
                ],
            ],
            [
                'name' => 'College of Medicine',
                'slug' => 'medicine-unilag',
                'departments' => [
                    'Anatomy',
                    'Medicine',
                    'Nursing',
                    'Obstetrics & Gynaecology',
                    'Paediatrics',
                    'Pharmacology',
                    'Physiotherapy',
                    'Surgery',
                ],
            ],
        ];

        foreach ($faculties as $facultyData) {
            $faculty = Faculty::updateOrCreate(
                ['slug' => $facultyData['slug']],
                [
                    'organization_id' => $unilag->id,
                    'name' => $facultyData['name'],
                ]
            );

            foreach ($facultyData['departments'] as $deptName) {
                $deptSlug = Str::slug($deptName) . '-' . $unilag->short_name;
                $dept = Department::updateOrCreate(
                    ['slug' => $deptSlug],
                    [
                        'faculty_id' => $faculty->id,
                        'name' => $deptName,
                    ]
                );

                // Create class sets for years 2020-2028
                $this->createClassSets($dept, $deptName);
            }
        }
    }

    private function seedUIFaculties(Organization $ui): void
    {
        $faculties = [
            [
                'name' => 'Faculty of Technology',
                'slug' => 'technology-ui',
                'departments' => [
                    'Agronomy',
                    'Agricultural Economics',
                    'Animal Science',
                    'Civil Engineering',
                    'Electrical & Electronic Engineering',
                    'Food Technology',
                    'Industrial & Production Engineering',
                    'Mechanical Engineering',
                    'Petroleum Engineering',
                ],
            ],
            [
                'name' => 'Faculty of Science',
                'slug' => 'science-ui',
                'departments' => [
                    'Archaeology & Anthropology',
                    'Biochemistry',
                    'Botany',
                    'Chemistry',
                    'Computer Science',
                    'Geology',
                    'Mathematics',
                    'Microbiology',
                    'Physics',
                    'Statistics',
                    'Zoology',
                ],
            ],
            [
                'name' => 'Faculty of Arts',
                'slug' => 'arts-ui',
                'departments' => [
                    'Classics',
                    'Communication & Language Arts',
                    'English',
                    'European Studies',
                    'History',
                    'Linguistics & African Languages',
                    'Music',
                    'Philosophy',
                    'Religious Studies',
                    'Theatre Arts',
                ],
            ],
            [
                'name' => 'Faculty of The Social Sciences',
                'slug' => 'social-sciences-ui',
                'departments' => [
                    'Economics',
                    'Geography',
                    'Political Science',
                    'Psychology',
                    'Sociology',
                ],
            ],
            [
                'name' => 'Faculty of Education',
                'slug' => 'education-ui',
                'departments' => [
                    'Adult Education',
                    'Educational Management',
                    'Guidance & Counselling',
                    'Human Kinetics & Health Education',
                    'Library, Archival & Information Studies',
                    'Special Education',
                    'Teacher Education',
                ],
            ],
            [
                'name' => 'Faculty of Law',
                'slug' => 'law-ui',
                'departments' => [
                    'Business Law',
                    'International Law',
                    'Jurisprudence & International Law',
                    'Private & Business Law',
                    'Public & International Law',
                ],
            ],
            [
                'name' => 'College of Medicine',
                'slug' => 'medicine-ui',
                'departments' => [
                    'Anatomy',
                    'Biochemistry (Medicine)',
                    'Medicine',
                    'Nursing',
                    'Obstetrics & Gynaecology',
                    'Paediatrics',
                    'Pharmacology & Therapeutics',
                    'Physiology',
                    'Surgery',
                ],
            ],
            [
                'name' => 'Faculty of Pharmacy',
                'slug' => 'pharmacy-ui',
                'departments' => [
                    'Clinical Pharmacy & Pharmacy Administration',
                    'Pharmaceutical Chemistry',
                    'Pharmaceutics & Industrial Pharmacy',
                    'Pharmacognosy',
                    'Pharmacology & Toxicology',
                ],
            ],
        ];

        foreach ($faculties as $facultyData) {
            $faculty = Faculty::updateOrCreate(
                ['slug' => $facultyData['slug']],
                [
                    'organization_id' => $ui->id,
                    'name' => $facultyData['name'],
                ]
            );

            foreach ($facultyData['departments'] as $deptName) {
                $deptSlug = Str::slug($deptName) . '-' . $ui->short_name;
                $dept = Department::updateOrCreate(
                    ['slug' => $deptSlug],
                    [
                        'faculty_id' => $faculty->id,
                        'name' => $deptName,
                    ]
                );

                // Create class sets for years 2020-2028
                $this->createClassSets($dept, $deptName);
            }
        }
    }

    private function createClassSets(Department $department, string $deptName): void
    {
        $years = range(2020, 2028);

        foreach ($years as $year) {
            ClassSet::updateOrCreate(
                [
                    'department_id' => $department->id,
                    'year' => $year,
                ],
                [
                    'name' => "Class of {$year} ({$deptName})",
                    'is_active' => true,
                ]
            );
        }
    }

    /**
     * Seed channels for football clubs
     */
    private function seedFootballChannels(Organization $club, string $clubName): void
    {
        // Create a single faculty for fan channels
        $faculty = Faculty::updateOrCreate(
            ['slug' => Str::slug($clubName) . '-fan-channels'],
            [
                'organization_id' => $club->id,
                'name' => 'Fan Channels',
                'description' => "Regional fan groups for {$club->name}",
            ]
        );

        // Create a single department to hold all channels
        $department = Department::updateOrCreate(
            ['slug' => Str::slug($clubName) . '-regional-groups'],
            [
                'faculty_id' => $faculty->id,
                'name' => 'Regional Groups',
                'description' => 'Connect with fans from your region',
            ]
        );

        // Create regional channels
        $channels = [
            "{$clubName} - Nigeria",
            "{$clubName} - Africa",
            "{$clubName} - Europe",
            "{$clubName} - Americas",
            "{$clubName} - Asia",
            "{$clubName} - Middle East",
            "{$clubName} - Worldwide",
        ];

        $year = date('Y');
        foreach ($channels as $index => $channelName) {
            ClassSet::updateOrCreate(
                [
                    'department_id' => $department->id,
                    'year' => $year + $index, // Use different years to make unique
                ],
                [
                    'name' => $channelName,
                    'is_active' => true,
                ]
            );
        }
    }

    /**
     * Seed channels for religious organizations
     */
    private function seedReligiousChannels(Organization $org, string $orgName): void
    {
        // Create a single faculty for church channels
        $faculty = Faculty::updateOrCreate(
            ['slug' => Str::slug($orgName) . '-channels'],
            [
                'organization_id' => $org->id,
                'name' => 'Fellowship Channels',
                'description' => "Regional fellowship groups for {$org->name}",
            ]
        );

        // Create a single department to hold all channels
        $department = Department::updateOrCreate(
            ['slug' => Str::slug($orgName) . '-regional-fellowships'],
            [
                'faculty_id' => $faculty->id,
                'name' => 'Regional Fellowships',
                'description' => 'Connect with brethren from your region',
            ]
        );

        // Create regional channels
        $channels = [
            "{$orgName} - Nigeria",
            "{$orgName} - Lagos",
            "{$orgName} - Abuja",
            "{$orgName} - Port Harcourt",
            "{$orgName} - Ibadan",
            "{$orgName} - Ghana",
            "{$orgName} - UK",
            "{$orgName} - USA",
            "{$orgName} - Europe",
            "{$orgName} - Worldwide",
        ];

        $year = date('Y');
        foreach ($channels as $index => $channelName) {
            ClassSet::updateOrCreate(
                [
                    'department_id' => $department->id,
                    'year' => $year + $index, // Use different years to make unique
                ],
                [
                    'name' => $channelName,
                    'is_active' => true,
                ]
            );
        }
    }
}
