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
            ['type_key' => 'wife', 'label' => 'Wife', 'reverse_type_key' => 'husband', 'sort_order' => 1],
            ['type_key' => 'husband', 'label' => 'Husband', 'reverse_type_key' => 'wife', 'sort_order' => 2],
            ['type_key' => 'partner', 'label' => 'Partner', 'reverse_type_key' => 'partner', 'sort_order' => 3],

            // Parent-child relationships
            ['type_key' => 'mother', 'label' => 'Mother', 'reverse_type_key' => 'child', 'sort_order' => 4],
            ['type_key' => 'father', 'label' => 'Father', 'reverse_type_key' => 'child', 'sort_order' => 5],
            ['type_key' => 'child', 'label' => 'Child', 'reverse_type_key' => null, 'sort_order' => 6],
            ['type_key' => 'son', 'label' => 'Son', 'reverse_type_key' => null, 'sort_order' => 7],
            ['type_key' => 'daughter', 'label' => 'Daughter', 'reverse_type_key' => null, 'sort_order' => 8],

            // Sibling relationships
            ['type_key' => 'sibling', 'label' => 'Sibling', 'reverse_type_key' => 'sibling', 'sort_order' => 9],
            ['type_key' => 'brother', 'label' => 'Brother', 'reverse_type_key' => 'sibling', 'sort_order' => 10],
            ['type_key' => 'sister', 'label' => 'Sister', 'reverse_type_key' => 'sibling', 'sort_order' => 11],

            // Grandparent relationships
            ['type_key' => 'grandmother', 'label' => 'Grandmother', 'reverse_type_key' => 'grandchild', 'sort_order' => 12],
            ['type_key' => 'grandfather', 'label' => 'Grandfather', 'reverse_type_key' => 'grandchild', 'sort_order' => 13],
            ['type_key' => 'grandchild', 'label' => 'Grandchild', 'reverse_type_key' => null, 'sort_order' => 14],
            ['type_key' => 'grandson', 'label' => 'Grandson', 'reverse_type_key' => null, 'sort_order' => 15],
            ['type_key' => 'granddaughter', 'label' => 'Granddaughter', 'reverse_type_key' => null, 'sort_order' => 16],

            // Extended family
            ['type_key' => 'aunt', 'label' => 'Aunt', 'reverse_type_key' => null, 'sort_order' => 17],
            ['type_key' => 'uncle', 'label' => 'Uncle', 'reverse_type_key' => null, 'sort_order' => 18],
            ['type_key' => 'niece', 'label' => 'Niece', 'reverse_type_key' => null, 'sort_order' => 19],
            ['type_key' => 'nephew', 'label' => 'Nephew', 'reverse_type_key' => null, 'sort_order' => 20],
            ['type_key' => 'cousin', 'label' => 'Cousin', 'reverse_type_key' => 'cousin', 'sort_order' => 21],

            // Step relationships
            ['type_key' => 'step_mother', 'label' => 'Step-mother', 'reverse_type_key' => null, 'sort_order' => 22],
            ['type_key' => 'step_father', 'label' => 'Step-father', 'reverse_type_key' => null, 'sort_order' => 23],
            ['type_key' => 'step_sibling', 'label' => 'Step-sibling', 'reverse_type_key' => 'step_sibling', 'sort_order' => 24],
            ['type_key' => 'step_child', 'label' => 'Step-child', 'reverse_type_key' => null, 'sort_order' => 25],

            // In-law relationships
            ['type_key' => 'mother_in_law', 'label' => 'Mother-in-law', 'reverse_type_key' => null, 'sort_order' => 26],
            ['type_key' => 'father_in_law', 'label' => 'Father-in-law', 'reverse_type_key' => null, 'sort_order' => 27],
            ['type_key' => 'sister_in_law', 'label' => 'Sister-in-law', 'reverse_type_key' => null, 'sort_order' => 28],
            ['type_key' => 'brother_in_law', 'label' => 'Brother-in-law', 'reverse_type_key' => null, 'sort_order' => 29],

            // Other relationships
            ['type_key' => 'godparent', 'label' => 'Godparent', 'reverse_type_key' => null, 'sort_order' => 30],
            ['type_key' => 'godchild', 'label' => 'Godchild', 'reverse_type_key' => null, 'sort_order' => 31],
        ];

        foreach ($relationshipTypes as $type) {
            DB::table('relationship_types')->insert([
                'type_key' => $type['type_key'],
                'label' => $type['label'],
                'reverse_type_key' => $type['reverse_type_key'],
                'description' => null,
                'sort_order' => $type['sort_order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
