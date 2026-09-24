-- Growing the activity library from 12 to 22. Same additive, slug-joined
-- pattern as V4 — nothing about the algorithm changes, this is content
-- only. Two new common household materials are introduced here (socks,
-- a blanket) using the same additive pattern as V3.
--
-- This batch deliberately leans toward INDOOR, mess_level 1 activities
-- across a wider age spread (as young as 1, as old as 12) — that gap is
-- what caused "Low mess only" + "Indoor" to come back empty for a real
-- test case during development, even though the recommendation logic
-- itself was working correctly. More real content is the actual fix for
-- that, not a code change.

INSERT INTO material (slug, display_name, category, is_common) VALUES
    ('socks',   'A pair of old socks', 'OTHER', true),
    ('blanket', 'Blanket or pillow',   'OTHER', true);

INSERT INTO activity (slug, title, summary, min_age_years, max_age_years, duration_minutes, mess_level, location_type, needs_adult) VALUES
    ('paper_airplane_contest',     'Paper Airplane Contest',        'Fold a few different paper airplane designs and see whose flies farthest.', 4, 11, 20, 1, 'INDOOR', false),
    ('sock_puppet_theater',        'Sock Puppet Theater',           'Turn old socks into characters and put on a two-minute show.', 3, 8, 30, 1, 'INDOOR', false),
    ('mini_book_making',           'Mini Book Making',              'Fold a few sheets of paper into a tiny book and fill it with a story or drawings.', 4, 10, 25, 1, 'INDOOR', false),
    ('leaf_rubbing_art',           'Leaf Rubbing Art',              'Collect a few leaves and reveal their veins and shapes with a simple crayon rubbing.', 4, 10, 25, 1, 'EITHER', false),
    ('reading_nook_blanket_fort',  'Reading Nook Blanket Fort',     'Drape a blanket over some chairs and settle in with a favorite book.', 3, 11, 30, 1, 'INDOOR', false),
    ('cardboard_tube_tower',       'Cardboard Tube Tower',          'Tape toilet paper rolls together into the tallest tower that will still stand.', 4, 9, 25, 1, 'INDOOR', false),
    ('sidewalk_watercolor_painting','Sidewalk Watercolor Painting', 'Paint with plain water on the sidewalk or driveway and watch the pictures dry away.', 3, 9, 20, 1, 'OUTDOOR', false),
    ('salt_sensory_bin',           'Salt Sensory Bin',              'Scoop, pour, and dig through a bin of salt with cups and spoons.', 2, 6, 20, 2, 'EITHER', true),
    ('shape_sorting_box',          'Shape Sorting Box',             'Cut simple shapes into the lid of a box and post matching shapes through the holes.', 1, 4, 15, 1, 'INDOOR', true),
    ('backyard_obstacle_relay',    'Backyard Obstacle Relay',       'Set up a simple string-and-bucket relay course in the yard and race against the clock.', 6, 12, 35, 1, 'OUTDOOR', false);

-- Tags
INSERT INTO activity_tag (activity_id, tag_id)
SELECT a.id, t.id
FROM (VALUES
    ('paper_airplane_contest',      'science'),
    ('paper_airplane_contest',      'building'),
    ('sock_puppet_theater',         'pretend_play'),
    ('sock_puppet_theater',         'art'),
    ('mini_book_making',            'quiet_reading'),
    ('mini_book_making',            'art'),
    ('leaf_rubbing_art',            'art'),
    ('leaf_rubbing_art',            'science'),
    ('reading_nook_blanket_fort',   'quiet_reading'),
    ('reading_nook_blanket_fort',   'building'),
    ('cardboard_tube_tower',        'building'),
    ('sidewalk_watercolor_painting','art'),
    ('sidewalk_watercolor_painting','outdoor'),
    ('salt_sensory_bin',            'science'),
    ('shape_sorting_box',           'building'),
    ('backyard_obstacle_relay',     'outdoor'),
    ('backyard_obstacle_relay',     'building')
) AS x(activity_slug, tag_slug)
JOIN activity a ON a.slug = x.activity_slug
JOIN tag t ON t.slug = x.tag_slug;

-- Materials (is_optional matters: optional materials never block a suggestion)
INSERT INTO activity_material (activity_id, material_id, is_optional)
SELECT a.id, m.id, x.is_optional
FROM (VALUES
    ('paper_airplane_contest',      'paper',            false),

    ('sock_puppet_theater',         'socks',            false),
    ('sock_puppet_theater',         'markers',          true),
    ('sock_puppet_theater',         'googly_eyes',      true),

    ('mini_book_making',            'paper',            false),
    ('mini_book_making',            'crayons',          false),

    ('leaf_rubbing_art',            'paper',            false),
    ('leaf_rubbing_art',            'crayons',          false),

    ('reading_nook_blanket_fort',   'blanket',          true),

    ('cardboard_tube_tower',        'toilet_paper_roll', false),
    ('cardboard_tube_tower',        'tape',              false),

    ('sidewalk_watercolor_painting','paintbrushes',      false),
    ('sidewalk_watercolor_painting','bucket',            false),

    ('salt_sensory_bin',            'salt',              false),
    ('salt_sensory_bin',            'bucket',            false),

    ('shape_sorting_box',           'cardboard_box',     false),
    ('shape_sorting_box',           'markers',           true),

    ('backyard_obstacle_relay',     'string',            false),
    ('backyard_obstacle_relay',     'bucket',            true)
) AS x(activity_slug, material_slug, is_optional)
JOIN activity a ON a.slug = x.activity_slug
JOIN material m ON m.slug = x.material_slug;

-- Ordered how-to steps
INSERT INTO activity_step (activity_id, step_number, short_text)
SELECT a.id, x.step_number, x.short_text
FROM (VALUES
    ('paper_airplane_contest', 1, 'Fold two or three sheets of paper into different airplane designs.'),
    ('paper_airplane_contest', 2, 'Mark a starting line on the floor.'),
    ('paper_airplane_contest', 3, 'Take turns throwing each design and mark where it lands.'),
    ('paper_airplane_contest', 4, 'Compare distances and crown a winning design.'),

    ('sock_puppet_theater', 1, 'Pull a sock over one hand to see how it moves.'),
    ('sock_puppet_theater', 2, 'Add googly eyes and a marker face if you would like a character.'),
    ('sock_puppet_theater', 3, 'Set up a table or couch cushions as a stage.'),
    ('sock_puppet_theater', 4, 'Put on a short show, making up the story as you go.'),

    ('mini_book_making', 1, 'Fold two or three sheets of paper in half together to make a little book.'),
    ('mini_book_making', 2, 'Decide on a story or topic for the book together.'),
    ('mini_book_making', 3, 'Fill each page with drawings, or write a sentence per page.'),
    ('mini_book_making', 4, 'Add a title and author name to the cover and read it aloud.'),

    ('leaf_rubbing_art', 1, 'Collect a handful of leaves with clear veins and interesting shapes.'),
    ('leaf_rubbing_art', 2, 'Lay a leaf flat on a table and place a sheet of paper on top.'),
    ('leaf_rubbing_art', 3, 'Rub the side of a crayon gently over the paper until the leaf shows through.'),
    ('leaf_rubbing_art', 4, 'Repeat with different leaves and colors to build a little collection.'),

    ('reading_nook_blanket_fort', 1, 'Drape a blanket over a couple of chairs or a couch to make a small nook.'),
    ('reading_nook_blanket_fort', 2, 'Add a pillow or cushion inside for comfort.'),
    ('reading_nook_blanket_fort', 3, 'Bring a flashlight in if it is a little dark inside.'),
    ('reading_nook_blanket_fort', 4, 'Settle in and read a favorite book together.'),

    ('cardboard_tube_tower', 1, 'Gather as many toilet paper rolls as you can find.'),
    ('cardboard_tube_tower', 2, 'Tape rolls together in a ring to make the base wider and sturdier.'),
    ('cardboard_tube_tower', 3, 'Keep stacking and taping rings on top, narrowing as you go up.'),
    ('cardboard_tube_tower', 4, 'See how tall it can get before it topples, then try again.'),

    ('sidewalk_watercolor_painting', 1, 'Fill a bucket with plain water.'),
    ('sidewalk_watercolor_painting', 2, 'Dip a paintbrush in the water and paint pictures on the sidewalk or driveway.'),
    ('sidewalk_watercolor_painting', 3, 'Watch how the wet shapes look darker, then fade as they dry.'),
    ('sidewalk_watercolor_painting', 4, 'Paint the same spot again and again, or race the sun to see who dries first.'),

    ('salt_sensory_bin', 1, 'Pour a few cups of salt into a shallow bin or tray.'),
    ('salt_sensory_bin', 2, 'Add cups, spoons, and small containers for scooping and pouring.'),
    ('salt_sensory_bin', 3, 'Let your child scoop, pour, and mix freely.'),
    ('salt_sensory_bin', 4, 'Sweep or vacuum up any spilled salt when you are done.'),

    ('shape_sorting_box', 1, 'Cut two or three simple shapes into the lid of a sturdy box.'),
    ('shape_sorting_box', 2, 'Cut matching shapes out of cardboard or use small toys of those shapes.'),
    ('shape_sorting_box', 3, 'Show how each shape fits through its matching hole.'),
    ('shape_sorting_box', 4, 'Let your child post the shapes through on their own, again and again.'),

    ('backyard_obstacle_relay', 1, 'Lay a length of string on the ground in a zigzag path.'),
    ('backyard_obstacle_relay', 2, 'Set a bucket at the end as the finish marker.'),
    ('backyard_obstacle_relay', 3, 'Race along the string path to the bucket and back, timing each run.'),
    ('backyard_obstacle_relay', 4, 'Try hopping, walking backward, or crab-walking the course for a new challenge.')
) AS x(activity_slug, step_number, short_text)
JOIN activity a ON a.slug = x.activity_slug;
