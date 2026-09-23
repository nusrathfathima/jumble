-- A starter activity library: 12 real activities, at least one touching
-- every MVP tag (V2), built only from materials already in the catalog
-- (V3). This is deliberately NOT the full 60-80 the spec calls for
-- eventually (schema doc section 9, item 3) — it's enough to prove the
-- suggestions algorithm actually works end to end against real,
-- reasonably varied data. Growing the library later is just more
-- migrations in this same shape; nothing about the algorithm changes.
--
-- Every insert below is written to work no matter what ids tag/material
-- rows actually got (auto-generated identities, never hard-coded), by
-- joining on slug instead.

INSERT INTO activity (slug, title, summary, min_age_years, max_age_years, duration_minutes, mess_level, location_type, needs_adult) VALUES
    ('baking_soda_volcano',            'Baking Soda Volcano',            'Mix a fizzy, colorful eruption using pantry staples — a classic first chemistry experiment.', 4, 10, 25, 3, 'EITHER', true),
    ('cardboard_box_fort',             'Cardboard Box Fort',             'Turn empty boxes into a fort worth defending, no instructions required beyond imagination.', 3, 10, 45, 1, 'INDOOR', false),
    ('sidewalk_chalk_obstacle_course', 'Sidewalk Chalk Obstacle Course', 'Draw a course of hops, spins, and balance lines right on the driveway.', 3, 9, 30, 2, 'OUTDOOR', false),
    ('nature_scavenger_hunt',          'Nature Scavenger Hunt',          'A list of small outdoor finds turns any yard or park walk into a mission.', 3, 12, 30, 1, 'OUTDOOR', false),
    ('pretend_restaurant',             'Pretend Restaurant',             'Take orders, write menus, and serve up an imaginary three-course meal.', 3, 8, 40, 1, 'INDOOR', false),
    ('egg_carton_caterpillar',         'Egg Carton Caterpillar',         'Cut, paint, and decorate an egg carton into a wiggly caterpillar.', 3, 8, 35, 2, 'INDOOR', true),
    ('homemade_play_dough',            'Homemade Play Dough',            'Mix up a batch of soft, colorful play dough from things already in the pantry.', 3, 9, 30, 2, 'INDOOR', true),
    ('ice_excavation',                 'Ice Excavation',                 'Dig small frozen treasures out of a block of ice, melting your way to the prize.', 3, 8, 30, 2, 'EITHER', false),
    ('toilet_paper_roll_binoculars',   'Toilet Paper Roll Binoculars',   'Two cardboard tubes and some tape make a pair of binoculars ready for exploring.', 3, 8, 25, 1, 'INDOOR', false),
    ('story_stones',                   'Story Stones',                   'Paint simple pictures on stones, then pull a few at random to invent a story together.', 4, 10, 40, 2, 'INDOOR', false),
    ('flashlight_shadow_puppets',      'Flashlight Shadow Puppets',      'Cut simple shapes and put on a shadow show against the wall after dark.', 3, 10, 20, 1, 'INDOOR', false),
    ('balloon_rocket_race',            'Balloon Rocket Race',            'Send a balloon zipping along a string in a simple, noisy race.', 5, 11, 30, 1, 'EITHER', true);

-- Tags
INSERT INTO activity_tag (activity_id, tag_id)
SELECT a.id, t.id
FROM (VALUES
    ('baking_soda_volcano',            'science'),
    ('cardboard_box_fort',             'building'),
    ('cardboard_box_fort',             'pretend_play'),
    ('sidewalk_chalk_obstacle_course', 'outdoor'),
    ('nature_scavenger_hunt',          'outdoor'),
    ('nature_scavenger_hunt',          'science'),
    ('pretend_restaurant',             'pretend_play'),
    ('pretend_restaurant',             'cooking'),
    ('egg_carton_caterpillar',         'art'),
    ('homemade_play_dough',            'cooking'),
    ('homemade_play_dough',            'art'),
    ('ice_excavation',                 'science'),
    ('toilet_paper_roll_binoculars',   'building'),
    ('toilet_paper_roll_binoculars',   'pretend_play'),
    ('story_stones',                   'quiet_reading'),
    ('story_stones',                   'art'),
    ('flashlight_shadow_puppets',      'quiet_reading'),
    ('flashlight_shadow_puppets',      'pretend_play'),
    ('balloon_rocket_race',            'science'),
    ('balloon_rocket_race',            'building')
) AS x(activity_slug, tag_slug)
JOIN activity a ON a.slug = x.activity_slug
JOIN tag t ON t.slug = x.tag_slug;

-- Materials (is_optional matters: optional materials never block a suggestion)
INSERT INTO activity_material (activity_id, material_id, is_optional)
SELECT a.id, m.id, x.is_optional
FROM (VALUES
    ('baking_soda_volcano',            'baking_soda',       false),
    ('baking_soda_volcano',            'vinegar',           false),
    ('baking_soda_volcano',            'plastic_bottle',    false),
    ('baking_soda_volcano',            'food_coloring',     true),

    ('cardboard_box_fort',             'cardboard_box',     false),
    ('cardboard_box_fort',             'tape',              false),
    ('cardboard_box_fort',             'markers',           true),

    ('sidewalk_chalk_obstacle_course', 'sidewalk_chalk',    false),

    ('nature_scavenger_hunt',          'bucket',            true),
    ('nature_scavenger_hunt',          'magnifying_glass',  true),

    ('pretend_restaurant',             'paper',             false),
    ('pretend_restaurant',             'crayons',           false),

    ('egg_carton_caterpillar',         'egg_carton',        false),
    ('egg_carton_caterpillar',         'paint',             false),
    ('egg_carton_caterpillar',         'paintbrushes',      false),
    ('egg_carton_caterpillar',         'googly_eyes',       true),
    ('egg_carton_caterpillar',         'pipe_cleaners',     true),

    ('homemade_play_dough',            'flour',             false),
    ('homemade_play_dough',            'salt',              false),
    ('homemade_play_dough',            'cooking_oil',       false),
    ('homemade_play_dough',            'food_coloring',     true),

    ('ice_excavation',                 'ice_cube_tray',     false),

    ('toilet_paper_roll_binoculars',   'toilet_paper_roll', false),
    ('toilet_paper_roll_binoculars',   'tape',              false),
    ('toilet_paper_roll_binoculars',   'markers',           true),

    ('story_stones',                   'paint',             false),
    ('story_stones',                   'paintbrushes',      false),

    ('flashlight_shadow_puppets',      'flashlight',        false),
    ('flashlight_shadow_puppets',      'paper',             true),

    ('balloon_rocket_race',            'balloons',          false),
    ('balloon_rocket_race',            'string',            false),
    ('balloon_rocket_race',            'tape',              false)
) AS x(activity_slug, material_slug, is_optional)
JOIN activity a ON a.slug = x.activity_slug
JOIN material m ON m.slug = x.material_slug;

-- Ordered how-to steps
INSERT INTO activity_step (activity_id, step_number, short_text)
SELECT a.id, x.step_number, x.short_text
FROM (VALUES
    ('baking_soda_volcano', 1, 'Stand the empty plastic bottle in a tray, or outside on grass, to catch the mess.'),
    ('baking_soda_volcano', 2, 'Spoon a few tablespoons of baking soda into the bottle.'),
    ('baking_soda_volcano', 3, 'Add a few drops of food coloring to a cup of vinegar if you want a colored eruption.'),
    ('baking_soda_volcano', 4, 'Pour the vinegar into the bottle and watch it fizz over.'),

    ('cardboard_box_fort', 1, 'Flatten or cut open cardboard boxes to make walls and a doorway.'),
    ('cardboard_box_fort', 2, 'Tape the pieces together into a shape with room to sit inside.'),
    ('cardboard_box_fort', 3, 'Decorate the outside with markers — windows, a flag, a house number.'),
    ('cardboard_box_fort', 4, 'Move in a flashlight or blanket and declare it open.'),

    ('sidewalk_chalk_obstacle_course', 1, 'Draw a starting line and decide where the course ends.'),
    ('sidewalk_chalk_obstacle_course', 2, 'Add four or five stations along the way: hopscotch squares, a wavy balance line, a spin-around spot.'),
    ('sidewalk_chalk_obstacle_course', 3, 'Walk the course together once to show how it works.'),
    ('sidewalk_chalk_obstacle_course', 4, 'Time each run and try to beat the record.'),

    ('nature_scavenger_hunt', 1, 'Make a short list of things to find: a smooth rock, something yellow, a bug, a stick shaped like a letter.'),
    ('nature_scavenger_hunt', 2, 'Head outside and search together, collecting finds in the bucket if you have one.'),
    ('nature_scavenger_hunt', 3, 'Use the magnifying glass to look closely at anything interesting.'),
    ('nature_scavenger_hunt', 4, 'Lay everything out at the end and talk about what was found.'),

    ('pretend_restaurant', 1, 'Draw and write out a simple menu together with a few made-up dishes.'),
    ('pretend_restaurant', 2, 'Set up a table as the restaurant, with a notepad for taking orders.'),
    ('pretend_restaurant', 3, 'Take turns being the customer and the server.'),
    ('pretend_restaurant', 4, 'Serve the "food" — real snacks or pretend ones — and ask how the meal was.'),

    ('egg_carton_caterpillar', 1, 'Cut a row of connected cups from the egg carton to form the body.'),
    ('egg_carton_caterpillar', 2, 'Paint the cups in bright colors and let them dry.'),
    ('egg_carton_caterpillar', 3, 'Glue on googly eyes and pipe-cleaner antennae if you have them.'),
    ('egg_carton_caterpillar', 4, 'Give the caterpillar a name and a place to crawl.'),

    ('homemade_play_dough', 1, 'Mix 2 cups flour with 1 cup salt in a big bowl.'),
    ('homemade_play_dough', 2, 'Add a few drops of food coloring to a cup of water, then stir it into the dry mix along with a spoonful of cooking oil.'),
    ('homemade_play_dough', 3, 'Knead the dough until smooth and no longer sticky, adding a little more flour if needed.'),
    ('homemade_play_dough', 4, 'Shape, roll, and squish to your heart''s content.'),

    ('ice_excavation', 1, 'The night before, freeze small toys or trinkets in a tray or container of water.'),
    ('ice_excavation', 2, 'Pop out the ice block and place it in a tray or outside.'),
    ('ice_excavation', 3, 'Use warm water, salt, and spoons to melt and chip away at the ice.'),
    ('ice_excavation', 4, 'Celebrate each treasure as it''s freed.'),

    ('toilet_paper_roll_binoculars', 1, 'Tape two toilet paper rolls together side by side.'),
    ('toilet_paper_roll_binoculars', 2, 'Decorate them with markers.'),
    ('toilet_paper_roll_binoculars', 3, 'Punch a small hole near the top of each roll and tie a piece of string through both for a neck strap, if you''d like.'),
    ('toilet_paper_roll_binoculars', 4, 'Head out on an explorer mission around the house or yard.'),

    ('story_stones', 1, 'Collect eight to ten smooth stones.'),
    ('story_stones', 2, 'Paint a simple picture on each one — a sun, a dragon, a house, a star.'),
    ('story_stones', 3, 'Once dry, pull three or four stones at random.'),
    ('story_stones', 4, 'Take turns inventing a story that uses everything on the stones you picked.'),

    ('flashlight_shadow_puppets', 1, 'Dim the lights and shine the flashlight at a blank wall.'),
    ('flashlight_shadow_puppets', 2, 'Use your hands to make simple shadow shapes — a bird, a dog, a rabbit.'),
    ('flashlight_shadow_puppets', 3, 'Cut paper shapes and tape them to a pencil for extra puppets, if you''d like.'),
    ('flashlight_shadow_puppets', 4, 'Put on a short shadow show, taking turns being the audience.'),

    ('balloon_rocket_race', 1, 'Tie one end of a long piece of string to a doorknob or chair, and stretch it tight to another anchor point.'),
    ('balloon_rocket_race', 2, 'Thread the string through a straw and tape the straw to an inflated (but not tied) balloon.'),
    ('balloon_rocket_race', 3, 'Hold the balloon''s end closed, then let go and watch it race along the string.'),
    ('balloon_rocket_race', 4, 'Try changing the balloon size or string angle to race again.')
) AS x(activity_slug, step_number, short_text)
JOIN activity a ON a.slug = x.activity_slug;
