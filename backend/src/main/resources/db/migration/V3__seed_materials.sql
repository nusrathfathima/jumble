-- A starter material catalog. Not exhaustive — like the tags (V2), this is
-- additive: a future migration can add more without touching this one.
--
-- is_common = true marks the small set most households already have, so
-- the inventory screen can pre-tick them during onboarding rather than
-- handing a parent 30 blank checkboxes on their first visit (see the
-- schema doc's comment on parent_inventory / material.is_common).
INSERT INTO material (slug, display_name, category, is_common) VALUES
    -- Kitchen
    ('flour',            'Flour',                'KITCHEN',   true),
    ('food_coloring',    'Food coloring',         'KITCHEN',   false),
    ('baking_soda',      'Baking soda',           'KITCHEN',   true),
    ('vinegar',          'Vinegar',               'KITCHEN',   true),
    ('salt',             'Salt',                  'KITCHEN',   true),
    ('cooking_oil',      'Cooking oil',           'KITCHEN',   true),
    ('ice_cube_tray',    'Ice cube tray',          'KITCHEN',   true),

    -- Craft supplies
    ('paper',            'Paper',                 'CRAFT',     true),
    ('construction_paper','Construction paper',   'CRAFT',     false),
    ('crayons',          'Crayons',               'CRAFT',     true),
    ('markers',          'Markers',               'CRAFT',     true),
    ('glue',             'Glue',                  'CRAFT',     true),
    ('scissors',         'Scissors',              'CRAFT',     true),
    ('tape',             'Tape',                  'CRAFT',     true),
    ('glitter',          'Glitter',               'CRAFT',     false),
    ('yarn',             'Yarn',                  'CRAFT',     false),
    ('paint',            'Paint',                 'CRAFT',     false),
    ('paintbrushes',     'Paintbrushes',          'CRAFT',     false),
    ('googly_eyes',      'Googly eyes',           'CRAFT',     false),
    ('pipe_cleaners',    'Pipe cleaners',         'CRAFT',     false),
    ('chalk',            'Chalk',                 'CRAFT',     false),

    -- Recycling / household odds and ends
    ('cardboard_box',    'Cardboard box',         'RECYCLING', true),
    ('toilet_paper_roll','Toilet paper roll',     'RECYCLING', true),
    ('egg_carton',       'Egg carton',            'RECYCLING', false),
    ('plastic_bottle',   'Plastic bottle',        'RECYCLING', true),
    ('newspaper',        'Newspaper',             'RECYCLING', false),

    -- Outdoor
    ('sidewalk_chalk',   'Sidewalk chalk',        'OUTDOOR',   false),
    ('bucket',           'Bucket',                'OUTDOOR',   true),
    ('bubbles',          'Bubble solution',       'OUTDOOR',   false),
    ('magnifying_glass', 'Magnifying glass',      'OUTDOOR',   false),

    -- Other
    ('balloons',         'Balloons',              'OTHER',     false),
    ('string',           'String',                'OTHER',     true),
    ('flashlight',       'Flashlight',            'OTHER',     true);
