<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RelationshipTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $relationshipTypes = [
            // Spousal relationships
            ['type_key' => 'wife', 'label' => 'Wife', 'description' => 'Your spouse (wife)', 'sort_order' => 1, 'is_bidirectional' => true],
            ['type_key' => 'husband', 'label' => 'Husband', 'description' => 'Your spouse (husband)', 'sort_order' => 2, 'is_bidirectional' => true],
            ['type_key' => 'partner', 'label' => 'Partner', 'description' => 'Your life partner', 'sort_order' => 3, 'is_bidirectional' => true],
            ['type_key' => 'co_wife', 'label' => 'Co-wife', 'description' => 'Another wife of your spouse', 'sort_order' => 4, 'is_bidirectional' => true],
            ['type_key' => 'co_husband', 'label' => 'Co-husband', 'description' => 'Another husband of your spouse', 'sort_order' => 5, 'is_bidirectional' => true],

            // Parent-child relationships
            ['type_key' => 'mother', 'label' => 'Mother', 'description' => 'Your biological or adoptive mother', 'sort_order' => 6, 'is_bidirectional' => false],
            ['type_key' => 'father', 'label' => 'Father', 'description' => 'Your biological or adoptive father', 'sort_order' => 7, 'is_bidirectional' => false],
            ['type_key' => 'child', 'label' => 'Child', 'description' => 'Your biological or adoptive child', 'sort_order' => 8, 'is_bidirectional' => false],
            ['type_key' => 'son', 'label' => 'Son', 'description' => 'Your biological or adoptive son', 'sort_order' => 9, 'is_bidirectional' => false],
            ['type_key' => 'daughter', 'label' => 'Daughter', 'description' => 'Your biological or adoptive daughter', 'sort_order' => 10, 'is_bidirectional' => false],

            // Sibling relationships
            ['type_key' => 'brother', 'label' => 'Brother', 'description' => 'Your biological or adoptive brother', 'sort_order' => 12, 'is_bidirectional' => true],
            ['type_key' => 'sister', 'label' => 'Sister', 'description' => 'Your biological or adoptive sister', 'sort_order' => 13, 'is_bidirectional' => true],

            // Grandparent relationships
            ['type_key' => 'grandmother', 'label' => 'Grandmother', 'description' => 'Your grandmother', 'sort_order' => 14, 'is_bidirectional' => false],
            ['type_key' => 'grandfather', 'label' => 'Grandfather', 'description' => 'Your grandfather', 'sort_order' => 15, 'is_bidirectional' => false],
            ['type_key' => 'grandchild', 'label' => 'Grandchild', 'description' => 'Your grandchild', 'sort_order' => 16, 'is_bidirectional' => false],
            ['type_key' => 'grandson', 'label' => 'Grandson', 'description' => 'Your grandson', 'sort_order' => 17, 'is_bidirectional' => false],
            ['type_key' => 'granddaughter', 'label' => 'Granddaughter', 'description' => 'Your granddaughter', 'sort_order' => 18, 'is_bidirectional' => false],

            // Great-grandparent relationships
            ['type_key' => 'great_grandmother', 'label' => 'Great-grandmother', 'description' => 'Your great-grandmother', 'sort_order' => 19, 'is_bidirectional' => false],
            ['type_key' => 'great_grandfather', 'label' => 'Great-grandfather', 'description' => 'Your great-grandfather', 'sort_order' => 20, 'is_bidirectional' => false],
            ['type_key' => 'great_grandchild', 'label' => 'Great-grandchild', 'description' => 'Your great-grandchild', 'sort_order' => 21, 'is_bidirectional' => false],
            ['type_key' => 'great_grandson', 'label' => 'Great-grandson', 'description' => 'Your great-grandson', 'sort_order' => 22, 'is_bidirectional' => false],
            ['type_key' => 'great_granddaughter', 'label' => 'Great-granddaughter', 'description' => 'Your great-granddaughter', 'sort_order' => 23, 'is_bidirectional' => false],

            // Great-great-grandparent relationships
            ['type_key' => 'great_great_grandmother', 'label' => 'Great-great-grandmother', 'description' => 'Your great-great-grandmother', 'sort_order' => 24, 'is_bidirectional' => false],
            ['type_key' => 'great_great_grandfather', 'label' => 'Great-great-grandfather', 'description' => 'Your great-great-grandfather', 'sort_order' => 25, 'is_bidirectional' => false],
            ['type_key' => 'great_great_grandchild', 'label' => 'Great-great-grandchild', 'description' => 'Your great-great-grandchild', 'sort_order' => 26, 'is_bidirectional' => false],
            ['type_key' => 'great_great_grandson', 'label' => 'Great-great-grandson', 'description' => 'Your great-great-grandson', 'sort_order' => 27, 'is_bidirectional' => false],
            ['type_key' => 'great_great_granddaughter', 'label' => 'Great-great-granddaughter', 'description' => 'Your great-great-granddaughter', 'sort_order' => 28, 'is_bidirectional' => false],

            // Extended family
            ['type_key' => 'aunt', 'label' => 'Aunt', 'description' => 'Your aunt', 'sort_order' => 29, 'is_bidirectional' => false],
            ['type_key' => 'uncle', 'label' => 'Uncle', 'description' => 'Your uncle', 'sort_order' => 30, 'is_bidirectional' => false],
            ['type_key' => 'uncle_by_marriage', 'label' => 'Uncle (by marriage)', 'description' => 'Your uncle by marriage', 'sort_order' => 31, 'is_bidirectional' => false],
            ['type_key' => 'aunt_by_marriage', 'label' => 'Aunt (by marriage)', 'description' => 'Your aunt by marriage', 'sort_order' => 32, 'is_bidirectional' => false],
            ['type_key' => 'niece', 'label' => 'Niece', 'description' => 'Your niece', 'sort_order' => 33, 'is_bidirectional' => false],
            ['type_key' => 'nephew', 'label' => 'Nephew', 'description' => 'Your nephew', 'sort_order' => 34, 'is_bidirectional' => false],
            ['type_key' => 'nephew_by_marriage', 'label' => 'Nephew (by marriage)', 'description' => 'Your nephew by marriage', 'sort_order' => 35, 'is_bidirectional' => false],
            ['type_key' => 'niece_by_marriage', 'label' => 'Niece (by marriage)', 'description' => 'Your niece by marriage', 'sort_order' => 36, 'is_bidirectional' => false],
            ['type_key' => 'cousin', 'label' => 'Cousin', 'description' => 'Your cousin', 'sort_order' => 37, 'is_bidirectional' => true],
            ['type_key' => 'first_cousin', 'label' => 'First Cousin', 'description' => 'Your first cousin', 'sort_order' => 38, 'is_bidirectional' => true],
            ['type_key' => 'second_cousin', 'label' => 'Second Cousin', 'description' => 'Your second cousin', 'sort_order' => 39, 'is_bidirectional' => true],
            ['type_key' => 'third_cousin', 'label' => 'Third Cousin', 'description' => 'Your third cousin', 'sort_order' => 40, 'is_bidirectional' => true],

            // Step relationships
            ['type_key' => 'step_mother', 'label' => 'Step-mother', 'description' => 'Your step-mother', 'sort_order' => 41, 'is_bidirectional' => false],
            ['type_key' => 'step_father', 'label' => 'Step-father', 'description' => 'Your step-father', 'sort_order' => 42, 'is_bidirectional' => false],
            ['type_key' => 'step_brother', 'label' => 'Step-brother', 'description' => 'Your step-brother', 'sort_order' => 43, 'is_bidirectional' => true],
            ['type_key' => 'step_sister', 'label' => 'Step-sister', 'description' => 'Your step-sister', 'sort_order' => 44, 'is_bidirectional' => true],
            ['type_key' => 'step_son', 'label' => 'Step-son', 'description' => 'Your step-son', 'sort_order' => 45, 'is_bidirectional' => false],
            ['type_key' => 'step_daughter', 'label' => 'Step-daughter', 'description' => 'Your step-daughter', 'sort_order' => 46, 'is_bidirectional' => false],
            ['type_key' => 'step_child', 'label' => 'Step-child', 'description' => 'Your step-child', 'sort_order' => 47, 'is_bidirectional' => false],

            // In-law relationships
            ['type_key' => 'mother_in_law', 'label' => 'Mother-in-law', 'description' => 'Your mother-in-law', 'sort_order' => 48, 'is_bidirectional' => false],
            ['type_key' => 'father_in_law', 'label' => 'Father-in-law', 'description' => 'Your father-in-law', 'sort_order' => 49, 'is_bidirectional' => false],
            ['type_key' => 'sister_in_law', 'label' => 'Sister-in-law', 'description' => 'Your sister-in-law', 'sort_order' => 50, 'is_bidirectional' => false],
            ['type_key' => 'brother_in_law', 'label' => 'Brother-in-law', 'description' => 'Your brother-in-law', 'sort_order' => 51, 'is_bidirectional' => false],
            ['type_key' => 'daughter_in_law', 'label' => 'Daughter-in-law', 'description' => 'Your daughter-in-law', 'sort_order' => 52, 'is_bidirectional' => false],
            ['type_key' => 'son_in_law', 'label' => 'Son-in-law', 'description' => 'Your son-in-law', 'sort_order' => 53, 'is_bidirectional' => false],

            // Ex-in-law relationships
            ['type_key' => 'ex_mother_in_law', 'label' => 'Ex-mother-in-law', 'description' => 'Your ex-mother-in-law', 'sort_order' => 54, 'is_bidirectional' => false],
            ['type_key' => 'ex_father_in_law', 'label' => 'Ex-father-in-law', 'description' => 'Your ex-father-in-law', 'sort_order' => 55, 'is_bidirectional' => false],
            ['type_key' => 'ex_sister_in_law', 'label' => 'Ex-sister-in-law', 'description' => 'Your ex-sister-in-law', 'sort_order' => 56, 'is_bidirectional' => false],
            ['type_key' => 'ex_brother_in_law', 'label' => 'Ex-brother-in-law', 'description' => 'Your ex-brother-in-law', 'sort_order' => 57, 'is_bidirectional' => false],
            ['type_key' => 'ex_daughter_in_law', 'label' => 'Ex-daughter-in-law', 'description' => 'Your ex-daughter-in-law', 'sort_order' => 58, 'is_bidirectional' => false],
            ['type_key' => 'ex_son_in_law', 'label' => 'Ex-son-in-law', 'description' => 'Your ex-son-in-law', 'sort_order' => 59, 'is_bidirectional' => false],

            // Other relationships
            ['type_key' => 'godparent', 'label' => 'Godparent', 'description' => 'Your godparent', 'sort_order' => 60, 'is_bidirectional' => false],
            ['type_key' => 'godchild', 'label' => 'Godchild', 'description' => 'Your godchild', 'sort_order' => 61, 'is_bidirectional' => false],
        ];

        foreach ($relationshipTypes as $type) {
            DB::table('relationship_types')->updateOrInsert(
                ['type_key' => $type['type_key']],
                [
                    'label' => $type['label'],
                    'description' => $type['description'],
                    'sort_order' => $type['sort_order'],
                    'is_bidirectional' => $type['is_bidirectional'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
