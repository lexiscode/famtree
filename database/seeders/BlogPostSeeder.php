<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posts = [
            [
                'title' => 'The Adeyemi Family of Oyo — 5 Generations of Legacy',
                'excerpt' => 'Discover how the Adeyemi family has preserved their heritage across five generations, from their roots in Oyo to their diaspora communities worldwide.',
                'content' => '<p>The Adeyemi family stands as a testament to the strength of Nigerian heritage and the bonds that connect generations. With roots deeply planted in Oyo State, the family has expanded across Nigeria and internationally, maintaining their cultural identity through deliberate preservation efforts.</p><h2>A Rich History</h2><p>The Adeyemi lineage dates back over 150 years, with documented ancestry tracing back to the pre-colonial period. Each generation has added its own chapter to the family story, from traditional chiefs to modern professionals in medicine, law, and business.</p><h2>Preserving Heritage</h2><p>Today, the family uses FamTree to maintain their connections, share stories, and ensure younger generations understand their roots. Through our platform, they\'ve created a living digital archive that celebrates their achievements and honors their ancestors.</p>',
                'category' => 'Family Stories',
                'author' => 'Chioma Okafor',
                'featured_image' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 342,
            ],
            [
                'title' => 'How to Preserve Family Photos Digitally',
                'excerpt' => 'Learn practical steps to digitize and preserve your family photos for future generations with proper storage and organization techniques.',
                'content' => '<p>Family photographs are windows into our past. They capture moments, preserve memories, and connect us to our heritage. But physical photos fade, deteriorate, and are vulnerable to loss. Here\'s how to protect your family\'s visual legacy.</p><h2>Step 1: Gather Your Photos</h2><p>Start by collecting all physical photographs. Organize them chronologically and label them with dates, names, and locations when possible.</p><h2>Step 2: Choose Quality Scanning Equipment</h2><p>Invest in a good photo scanner. A resolution of 600-1200 DPI is ideal for most family photos. For precious items, consider professional scanning services.</p><h2>Step 3: Organize Digital Files</h2><p>Create a folder structure organized by family, decade, or event. Use descriptive filenames with dates.</p><h2>Step 4: Backup Multiple Times</h2><p>Store copies on external hard drives, cloud services, and consider DNA testing archives that preserve digital heritage.</p>',
                'category' => 'Tips',
                'author' => 'David Okonkwo',
                'featured_image' => 'https://images.unsplash.com/photo-1606933248051-5ce98adc876d?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 528,
            ],
            [
                'title' => 'The Meaning of Family Names in Nigeria',
                'excerpt' => 'Explore the cultural significance and hidden meanings behind common Nigerian family names and what they reveal about our heritage.',
                'content' => '<p>Nigerian family names carry profound meanings deeply rooted in our languages, history, and cultural values. Understanding these meanings connects us to our ancestors and enriches our sense of identity.</p><h2>Yoruba Family Names</h2><p>In Yoruba culture, names often describe parents\' circumstances at birth or aspirations for the child. Okafor means "a child born on Okarasi market day." Oluwaseun means "God has done well."</p><h2>Igbo Family Names</h2><p>Igbo surnames often reference place of origin or ancestral achievements. Okonkwo literally means "man of the fields" - suggesting strength and hard work.</p><h2>Hausa Family Names</h2><p>Hausa names reflect Islamic influences and often have spiritual meanings. Many surnames honor ancestors or describe family occupations.</p><h2>Cross-Cultural Significance</h2><p>In modern Nigeria, surnames transcend ethnic boundaries, and many families carry names from multiple cultures due to intermarriage and migration.</p>',
                'category' => 'Culture',
                'author' => 'Amara Chukwu',
                'featured_image' => 'https://images.unsplash.com/photo-1516937941344-00b4b9b1c00c?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 612,
            ],
            [
                'title' => 'Building Your Family Tree: A Beginner\'s Guide',
                'excerpt' => 'Start your journey of genealogical discovery with this comprehensive guide to building your first family tree on FamTree.',
                'content' => '<p>Building a family tree can seem daunting, but breaking it down into manageable steps makes the process enjoyable and rewarding. Let\'s start from the ground up.</p><h2>Begin with What You Know</h2><p>Start with yourself and work backwards. Write down names, birth dates, marriage dates, and places of residence for immediate family members.</p><h2>Interview Older Relatives</h2><p>Reach out to grandparents, aunts, and uncles. Record their memories, stories, and family connections. These conversations are invaluable.</p><h2>Organize Your Findings</h2><p>Use FamTree to input this information. Our platform helps you structure relationships clearly and identify gaps in your knowledge.</p><h2>Verify Your Information</h2><p>Cross-reference facts with documents like birth certificates, marriage certificates, and land deeds when available.</p><h2>Share and Expand</h2><p>Once you\'ve created your family space, invite relatives to join. They can contribute information, photos, and stories, expanding your tree collaboratively.</p>',
                'category' => 'Tips',
                'author' => 'Emeka Nwankwo',
                'featured_image' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 289,
            ],
            [
                'title' => 'Celebrating Heritage: Family Naming Ceremonies in Nigeria',
                'excerpt' => 'Discover the beautiful traditions of Nigerian naming ceremonies and how families continue to honor these ancestral practices in the modern age.',
                'content' => '<p>The naming ceremony is one of Nigeria\'s most cherished traditions. It marks a child\'s official entry into the family and community, establishing their identity and place within their lineage.</p><h2>The Significance of Names</h2><p>In Nigerian culture, a name is never arbitrary. It reflects the family\'s hopes, honors ancestors, or marks significant life events. A child might be named after a deceased grandparent, ensuring their memory lives on.</p><h2>Traditional Ceremony Structure</h2><p>Naming ceremonies vary by ethnic group but typically include family gathering, blessing of the child, presentation of names, and communal celebration with food and music.</p><h2>Modern Celebrations</h2><p>Today, families blend traditional practices with contemporary celebrations. Some hold elaborate events with hundreds of guests, while others maintain intimate family gatherings.</p><h2>Preserving These Traditions</h2><p>FamTree allows families to document naming ceremonies, record the stories behind names, and share these moments with relatives worldwide, ensuring these traditions survive generations.</p>',
                'category' => 'Culture',
                'author' => 'Nneka Obi',
                'featured_image' => 'https://images.unsplash.com/photo-1530268729831-4be0926458f3?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 198,
            ],
            [
                'title' => 'Managing Privacy in Your Family Tree',
                'excerpt' => 'Learn best practices for keeping your family information secure while sharing with trusted relatives on FamTree.',
                'content' => '<p>Your family\'s information is precious and sensitive. FamTree provides multiple privacy controls to help you share selectively while protecting your family\'s data.</p><h2>Understanding Privacy Levels</h2><p>FamTree offers three privacy levels: Private (only you can see), Family Only (invited members only), and Public (searchable directory). Choose what works for your comfort level.</p><h2>Setting Up Access Controls</h2><p>You control who sees what. Family members can view the full tree while the public sees only basic information. Sensitive details like addresses can be hidden entirely.</p><h2>Managing Sensitive Information</h2><p>Some information may be too sensitive even for family. FamTree allows you to restrict access to specific details like health information or financial records.</p><h2>Regular Privacy Audits</h2><p>Periodically review who has access to your family space. Remove inactive members and update permissions as your family dynamics change.</p><h2>Safe Sharing Practices</h2><p>Only invite relatives you trust. Use strong passwords and enable two-factor authentication for added security.</p>',
                'category' => 'Tips',
                'author' => 'Victor Okafor',
                'featured_image' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 276,
            ],
            [
                'title' => 'The Role of Marriage in Family Connections',
                'excerpt' => 'Explore how marriages link families together and why accurate documentation of unions is vital to family heritage preservation.',
                'content' => '<p>Marriage is more than a union between two people; it\'s the connection between two families, two histories, and two legacies. In Nigerian culture, marriages are celebrated events that formalize kinship networks.</p><h2>Kinship Networks Through Marriage</h2><p>When families unite through marriage, they create complex relational webs. In-laws become integral to family identity. Understanding these connections is crucial for building accurate family trees.</p><h2>Documentation of Unions</h2><p>Traditional marriage ceremonies, religious ceremonies, and civil registrations all serve important roles in documenting family unions. Each creates a record that future generations depend on.</p><h2>Breaking Down Traditional Barriers</h2><p>Marriages across ethnic groups and religions are increasingly common, creating richer, more diverse family narratives. FamTree accommodates these complex relationships.</p><h2>Honoring Marital Bonds</h2><p>Your family tree isn\'t complete without properly honoring the marriages that created it. By documenting these unions, you honor the commitment and love that built your family.</p>',
                'category' => 'Heritage Preservation',
                'author' => 'Ife Adeyemi',
                'featured_image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 334,
            ],
            [
                'title' => 'Stories from the Diaspora: Nigerian Families Worldwide',
                'excerpt' => 'Learn how Nigerian families scattered across the globe maintain their connections and preserve their heritage through FamTree.',
                'content' => '<p>The Nigerian diaspora is vast and vibrant. Millions of Nigerians and their descendants live worldwide, maintaining ties to their homeland while building lives in new countries. FamTree bridges these distances.</p><h2>Challenges of Distance</h2><p>Geographic separation makes maintaining family bonds difficult. Time zones, communication barriers, and infrequent visits can strain relationships between relatives.</p><h2>Creating Global Family Spaces</h2><p>FamTree allows diaspora families to create centralized spaces where members from Lagos to London, Lagos to Los Angeles can connect, share, and participate in family life.</p><h2>Preserving Homeland Connections</h2><p>Through our platform, diaspora members can document their family\'s origin stories, share ancestry research, and teach younger generations about their heritage.</p><h2>Multi-Generational Storytelling</h2><p>Stories from those who lived in Nigeria provide invaluable context for second and third-generation diaspora members. Documenting these narratives ensures cultural continuity.</p>',
                'category' => 'Family Stories',
                'author' => 'Tunde Ogunleye',
                'featured_image' => 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 445,
            ],
            [
                'title' => 'Using DNA Testing to Uncover Your Family Roots',
                'excerpt' => 'Combine traditional genealogy with modern DNA testing to discover your family origins and connect with distant relatives.',
                'content' => '<p>DNA testing has revolutionized genealogy. What once took years of research can now be supplemented by scientific evidence of ancestry and connections to unknown relatives.</p><h2>Types of DNA Tests</h2><p>Autosomal DNA tests examine your overall ancestry. Mitochondrial DNA traces maternal lines. Y-DNA traces paternal lines. Each provides different insights into your heritage.</p><h2>Interpreting Results</h2><p>DNA results show ethnic composition and specific regions of origin. Many services connect you with genetic matches—people who share DNA with you and might be distant cousins.</p><h2>Connecting with DNA Matches</h2><p>Finding genetic matches can help complete family trees by identifying common ancestors or confirming relationships between separated branches.</p><h2>Combining Traditional and Genetic Genealogy</h2><p>The most complete picture comes from combining traditional genealogical research with DNA evidence. Use FamTree to organize both types of information.</p>',
                'category' => 'Tips',
                'author' => 'Zainab Hassan',
                'featured_image' => 'https://images.unsplash.com/photo-1495574542244-8b7a8a9a9a7f?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 521,
            ],
            [
                'title' => 'Heirloom Documentation: Preserving Family Treasures',
                'excerpt' => 'Create detailed records of family heirlooms, their history, and significance for future generations to understand and appreciate.',
                'content' => '<p>Family heirlooms are physical connections to our past. An old photograph, a piece of jewelry, a traditional artifact—each carries stories and significance that deserve preservation.</p><h2>Why Document Heirlooms?</h2><p>Without documentation, heirlooms lose their context. Future generations may not understand an item\'s significance or the story behind it. Proper documentation preserves these meanings.</p><h2>Creating Heirloom Records</h2><p>For each heirloom, record: its name, origin, maker (if known), acquisition date, condition, current location, and its story. Photograph it from multiple angles.</p><h2>Storing Documentation</h2><p>Keep copies in multiple places: digital copies on FamTree, printed copies in a family journal, and archived copies with insurance documents.</p><h2>Passing Down Heirlooms</h2><p>Make your intention clear regarding who inherits each heirloom. Share this information with heirs and keep it updated as family circumstances change.</p>',
                'category' => 'Heritage Preservation',
                'author' => 'Blessing Okoro',
                'featured_image' => 'https://images.unsplash.com/photo-1552993881-64b96ba18af5?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 287,
            ],
            [
                'title' => 'Family Reunions: Planning and Celebrating Together',
                'excerpt' => 'Tips for organizing memorable family reunions that strengthen bonds and create lasting memories across generations.',
                'content' => '<p>Family reunions are celebrations of connection and continuity. They bring together people who might otherwise stay separated, creating moments that families treasure for years.</p><h2>Planning Process</h2><p>Start planning 4-6 months ahead. Designate an organizer or committee. Discuss location, dates, budget, and logistics with key family members before broader announcements.</p><h2>Creating Invitations</h2><p>Use FamTree to track who\'s coming, dietary restrictions, and contributions. Send reminders as the date approaches.</p><h2>Meaningful Activities</h2><p>Include activities beyond eating: family tree presentations, storytelling sessions, photo displays, or games that engage all age groups.</p><h2>Documenting the Event</h2><p>Designate someone to photograph the reunion. Share photos on FamTree afterward so everyone can relive the experience and those who couldn\'t attend can participate remotely.</p><h2>Follow-Up</h2><p>Send thank-you messages to hosts and contributors. Share photos and memories. Use the momentum to strengthen family connections going forward.</p>',
                'category' => 'Family Stories',
                'author' => 'Ndidi Eze',
                'featured_image' => 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&h=600&fit=crop',
                'is_published' => true,
                'view_count' => 412,
            ],
        ];

        foreach ($posts as $post) {
            $post['slug'] = Str::slug($post['title']);
            $post['published_at'] = now()->subDays(rand(1, 60));
            BlogPost::create($post);
        }
    }
}
