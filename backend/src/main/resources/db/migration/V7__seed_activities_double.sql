-- Doubling the activity library from 27 to 54. Same additive, slug-joined
-- pattern as V4, V5 and V6: content only, nothing about the algorithm
-- changes.
--
-- What this batch fills in:
--   * Cooking had only two activities (play dough, pretend restaurant);
--     three more real kitchen ones are added.
--   * More active, zero-material games (Freeze Dance, Simon Says,
--     Listening Walk) so an empty inventory still gets variety.
--   * More quiet / reading options for wind-down time.
--   * A wider spread of ages (2 to 12) and of messy-but-fun art.
--
-- Nine everyday materials are added first, the same way V3 and V5 did.
-- The common ones are marked is_common so new parents get them pre-ticked.

INSERT INTO material (slug, display_name, category, is_common) VALUES
    ('fruit',          'Fresh fruit',          'KITCHEN', true),
    ('bread',          'Bread',                'KITCHEN', true),
    ('plastic_cups',   'Paper or plastic cups', 'KITCHEN', true),
    ('paper_plates',   'Paper plates',          'KITCHEN', true),
    ('straws',         'Drinking straws',       'KITCHEN', true),
    ('sponge',         'Kitchen sponge',        'KITCHEN', true),
    ('aluminum_foil',  'Aluminium foil',        'KITCHEN', true),
    ('cotton_balls',   'Cotton balls',          'CRAFT',   false),
    ('ball',           'A soft ball',           'OUTDOOR', true);

INSERT INTO activity (slug, title, summary, min_age_years, max_age_years, duration_minutes, mess_level, location_type, needs_adult) VALUES
    ('rainbow_fruit_kebabs',   'Rainbow Fruit Kebabs',      'Thread chopped fruit onto sticks in rainbow order for a snack that is also a piece of art.', 3, 10, 20, 2, 'INDOOR',  true),
    ('silly_sandwich_faces',   'Silly Sandwich Faces',      'Turn a plain sandwich into a funny face using slices of fruit and vegetables.', 3, 9, 15, 2, 'INDOOR', true),
    ('mini_pizza_toast',       'Mini Pizza Toast',          'Top slices of bread like tiny pizzas and toast them until bubbly.', 4, 11, 25, 2, 'INDOOR', true),
    ('homemade_lava_bottle',   'Homemade Lava Bottle',      'Oil, water and a pinch of salt make colourful blobs sink and rise inside a bottle.', 5, 11, 20, 2, 'INDOOR', true),
    ('sink_or_float',          'Sink or Float',             'Guess which household objects will sink or float, then test every guess in a bucket of water.', 3, 8, 20, 2, 'EITHER', false),
    ('cup_string_telephone',   'Cup and String Telephone',  'Two cups and a long string carry whispers from one room to the next.', 4, 10, 20, 1, 'INDOOR', true),
    ('straw_rockets',          'Paper Straw Rockets',       'Roll a paper rocket around a straw and launch it with one big puff.', 5, 11, 25, 1, 'EITHER', false),
    ('foil_boat_challenge',    'Foil Boat Challenge',       'Build a boat from foil and see how many coins or pebbles it can carry before it sinks.', 5, 12, 30, 2, 'EITHER', false),
    ('ice_paint',              'Frozen Ice Paint',          'Freeze coloured water into cubes, then paint with them as they melt across the paper.', 3, 8, 25, 3, 'EITHER', true),
    ('paper_plate_masks',      'Paper Plate Animal Masks',  'Cut and colour paper plates into lions, cats and owls, then put on an animal parade.', 3, 9, 30, 2, 'INDOOR', true),
    ('cotton_ball_sheep',      'Cotton Ball Sheep',         'Glue fluffy cotton balls onto a paper sheep and give it a silly name.', 2, 6, 20, 2, 'INDOOR', false),
    ('sponge_stamp_painting',  'Sponge Stamp Painting',     'Cut sponges into shapes and stamp bright patterns across a big sheet of paper.', 2, 7, 25, 3, 'INDOOR', true),
    ('newspaper_pirate_hats',  'Newspaper Pirate Hats',     'Fold a sheet of newspaper into a pirate hat, then set sail on a sofa ship.', 4, 10, 20, 1, 'INDOOR', false),
    ('foil_sculptures',        'Foil Sculptures',           'Scrunch, twist and shape foil into animals, people and tiny robots.', 4, 11, 20, 1, 'INDOOR', false),
    ('pipe_cleaner_creatures', 'Pipe Cleaner Creatures',    'Bend and twist pipe cleaners into bugs, spiders and made-up creatures.', 4, 10, 20, 1, 'INDOOR', false),
    ('glitter_calm_jar',       'Calm Down Glitter Jar',     'Fill a bottle with water and glitter, then shake it and breathe slowly while it settles.', 4, 10, 15, 2, 'INDOOR', true),
    ('yarn_spider_web_maze',   'Yarn Spider Web Maze',      'Tape yarn across a hallway into a web, then climb through without touching a strand.', 3, 9, 25, 1, 'INDOOR', false),
    ('backyard_bug_hotel',     'Backyard Bug Hotel',        'Pack a cut-open bottle with sticks and leaves to make a cosy home for garden bugs.', 6, 12, 40, 2, 'OUTDOOR', true),
    ('bubble_garden',          'Bubble Garden',             'Blow streams of bubbles outside and chase, pop and count them before they land.', 2, 8, 20, 2, 'OUTDOOR', false),
    ('classic_hopscotch',      'Classic Hopscotch',         'Draw a hopscotch grid in chalk and hop, skip and balance your way to the top.', 4, 10, 20, 1, 'OUTDOOR', false),
    ('bucket_ball_toss',       'Bucket Ball Toss',          'Toss a soft ball into a bucket from further and further away to score points.', 3, 9, 20, 1, 'OUTDOOR', false),
    ('treasure_map_hunt',      'Treasure Map Hunt',         'Draw a map of the house or yard, hide a small treasure and follow the clues to find it.', 5, 11, 40, 1, 'EITHER', false),
    ('freeze_dance_party',     'Freeze Dance Party',        'Dance wildly while the music plays and freeze like a statue the moment it stops.', 2, 9, 15, 1, 'INDOOR', false),
    ('simon_says',             'Simon Says',                'Follow the leader, but only when Simon says so. A classic listening game.', 3, 8, 10, 1, 'EITHER', false),
    ('listening_walk',         'Listening Walk',            'Go for a slow walk and count every sound you can hear: birds, cars, wind and footsteps.', 3, 10, 20, 1, 'OUTDOOR', true),
    ('home_library_day',       'Home Library Day',          'Set up a pretend library with library cards, a quiet corner and a stack of favourite books.', 4, 10, 30, 1, 'INDOOR', false),
    ('flashlight_reading',     'Flashlight Reading Den',    'Read a story by flashlight under a blanket, like a secret midnight adventure.', 4, 11, 20, 1, 'INDOOR', false);

-- Tags
INSERT INTO activity_tag (activity_id, tag_id)
SELECT a.id, t.id
FROM (VALUES
    ('rainbow_fruit_kebabs',   'cooking'),
    ('rainbow_fruit_kebabs',   'art'),
    ('silly_sandwich_faces',   'cooking'),
    ('silly_sandwich_faces',   'art'),
    ('mini_pizza_toast',       'cooking'),
    ('homemade_lava_bottle',   'science'),
    ('sink_or_float',          'science'),
    ('cup_string_telephone',   'science'),
    ('cup_string_telephone',   'pretend_play'),
    ('straw_rockets',          'science'),
    ('straw_rockets',          'building'),
    ('foil_boat_challenge',    'science'),
    ('foil_boat_challenge',    'building'),
    ('ice_paint',              'art'),
    ('ice_paint',              'science'),
    ('paper_plate_masks',      'art'),
    ('paper_plate_masks',      'pretend_play'),
    ('cotton_ball_sheep',      'art'),
    ('sponge_stamp_painting',  'art'),
    ('newspaper_pirate_hats',  'art'),
    ('newspaper_pirate_hats',  'pretend_play'),
    ('foil_sculptures',        'art'),
    ('foil_sculptures',        'building'),
    ('pipe_cleaner_creatures', 'art'),
    ('pipe_cleaner_creatures', 'building'),
    ('glitter_calm_jar',       'art'),
    ('glitter_calm_jar',       'quiet_reading'),
    ('yarn_spider_web_maze',   'building'),
    ('yarn_spider_web_maze',   'pretend_play'),
    ('backyard_bug_hotel',     'outdoor'),
    ('backyard_bug_hotel',     'science'),
    ('backyard_bug_hotel',     'building'),
    ('bubble_garden',          'outdoor'),
    ('bubble_garden',          'science'),
    ('classic_hopscotch',      'outdoor'),
    ('bucket_ball_toss',       'outdoor'),
    ('treasure_map_hunt',      'pretend_play'),
    ('treasure_map_hunt',      'art'),
    ('freeze_dance_party',     'pretend_play'),
    ('simon_says',             'pretend_play'),
    ('listening_walk',         'outdoor'),
    ('listening_walk',         'science'),
    ('home_library_day',       'quiet_reading'),
    ('home_library_day',       'pretend_play'),
    ('flashlight_reading',     'quiet_reading')
) AS x(activity_slug, tag_slug)
JOIN activity a ON a.slug = x.activity_slug
JOIN tag t ON t.slug = x.tag_slug;

-- Materials (is_optional matters: optional materials never block a suggestion).
-- Freeze Dance Party, Simon Says and Listening Walk need nothing at all,
-- so they have no rows here, like the V6 set.
INSERT INTO activity_material (activity_id, material_id, is_optional)
SELECT a.id, m.id, x.is_optional
FROM (VALUES
    ('rainbow_fruit_kebabs',   'fruit',            false),

    ('silly_sandwich_faces',   'bread',            false),
    ('silly_sandwich_faces',   'fruit',            true),

    ('mini_pizza_toast',       'bread',            false),

    ('homemade_lava_bottle',   'plastic_bottle',   false),
    ('homemade_lava_bottle',   'cooking_oil',      false),
    ('homemade_lava_bottle',   'salt',             false),
    ('homemade_lava_bottle',   'food_coloring',    true),

    ('sink_or_float',          'bucket',           false),

    ('cup_string_telephone',   'plastic_cups',     false),
    ('cup_string_telephone',   'string',           false),

    ('straw_rockets',          'straws',           false),
    ('straw_rockets',          'paper',            false),
    ('straw_rockets',          'tape',             false),
    ('straw_rockets',          'markers',          true),

    ('foil_boat_challenge',    'aluminum_foil',    false),
    ('foil_boat_challenge',    'bucket',           false),

    ('ice_paint',              'ice_cube_tray',    false),
    ('ice_paint',              'food_coloring',    false),
    ('ice_paint',              'paper',            false),

    ('paper_plate_masks',      'paper_plates',     false),
    ('paper_plate_masks',      'scissors',         false),
    ('paper_plate_masks',      'crayons',          false),
    ('paper_plate_masks',      'string',           true),

    ('cotton_ball_sheep',      'cotton_balls',     false),
    ('cotton_ball_sheep',      'glue',             false),
    ('cotton_ball_sheep',      'paper',            false),
    ('cotton_ball_sheep',      'googly_eyes',      true),

    ('sponge_stamp_painting',  'sponge',           false),
    ('sponge_stamp_painting',  'paint',            false),
    ('sponge_stamp_painting',  'paper',            false),

    ('newspaper_pirate_hats',  'newspaper',        false),
    ('newspaper_pirate_hats',  'tape',             true),
    ('newspaper_pirate_hats',  'markers',          true),

    ('foil_sculptures',        'aluminum_foil',    false),

    ('pipe_cleaner_creatures', 'pipe_cleaners',    false),
    ('pipe_cleaner_creatures', 'googly_eyes',      true),

    ('glitter_calm_jar',       'plastic_bottle',   false),
    ('glitter_calm_jar',       'glitter',          false),
    ('glitter_calm_jar',       'glue',             true),

    ('yarn_spider_web_maze',   'yarn',             false),
    ('yarn_spider_web_maze',   'tape',             false),

    ('backyard_bug_hotel',     'plastic_bottle',   false),
    ('backyard_bug_hotel',     'scissors',         false),
    ('backyard_bug_hotel',     'string',           true),

    ('bubble_garden',          'bubbles',          false),
    ('bubble_garden',          'pipe_cleaners',    true),

    ('classic_hopscotch',      'sidewalk_chalk',   false),

    ('bucket_ball_toss',       'ball',             false),
    ('bucket_ball_toss',       'bucket',           false),

    ('treasure_map_hunt',      'paper',            false),
    ('treasure_map_hunt',      'crayons',          false),

    ('home_library_day',       'paper',            false),
    ('home_library_day',       'crayons',          true),

    ('flashlight_reading',     'flashlight',       false),
    ('flashlight_reading',     'blanket',          true)
) AS x(activity_slug, material_slug, is_optional)
JOIN activity a ON a.slug = x.activity_slug
JOIN material m ON m.slug = x.material_slug;

-- Ordered how-to steps
INSERT INTO activity_step (activity_id, step_number, short_text)
SELECT a.id, x.step_number, x.short_text
FROM (VALUES
    ('rainbow_fruit_kebabs', 1, 'Wash the fruit and have a grown-up chop it into bite-sized pieces.'),
    ('rainbow_fruit_kebabs', 2, 'Sort the pieces into colour piles: red, orange, yellow, green, blue and purple.'),
    ('rainbow_fruit_kebabs', 3, 'Thread the fruit onto skewers or straws in rainbow order.'),
    ('rainbow_fruit_kebabs', 4, 'Line them up on a plate, admire your rainbow, then eat it.'),

    ('silly_sandwich_faces', 1, 'Make a simple sandwich with a favourite filling.'),
    ('silly_sandwich_faces', 2, 'Set out small pieces of fruit and vegetables as eyes, noses and hair.'),
    ('silly_sandwich_faces', 3, 'Arrange them on top of the sandwich to make a funny face.'),
    ('silly_sandwich_faces', 4, 'Give the face a name, take a picture, then take a big bite.'),

    ('mini_pizza_toast', 1, 'Lay slices of bread on a baking tray.'),
    ('mini_pizza_toast', 2, 'Spread on tomato sauce and sprinkle grated cheese.'),
    ('mini_pizza_toast', 3, 'Add toppings to make a pattern or a face.'),
    ('mini_pizza_toast', 4, 'A grown-up toasts them in the oven until the cheese bubbles, then let them cool a little.'),

    ('homemade_lava_bottle', 1, 'Fill a clear bottle about one quarter full with water and add a few drops of food colouring.'),
    ('homemade_lava_bottle', 2, 'Pour in cooking oil until the bottle is nearly full and watch the layers separate.'),
    ('homemade_lava_bottle', 3, 'Sprinkle in a pinch of salt and watch the coloured blobs sink and rise.'),
    ('homemade_lava_bottle', 4, 'Add more salt to keep the lava moving, then screw the lid on tight.'),

    ('sink_or_float', 1, 'Fill a bucket or sink with water.'),
    ('sink_or_float', 2, 'Gather small objects from around the house: a spoon, a leaf, a cork, a toy, a coin.'),
    ('sink_or_float', 3, 'Guess whether each one will sink or float before dropping it in.'),
    ('sink_or_float', 4, 'Sort the results into two piles and talk about why some float.'),

    ('cup_string_telephone', 1, 'A grown-up pokes a small hole in the bottom of two cups.'),
    ('cup_string_telephone', 2, 'Thread a long piece of string through both holes and tie a knot inside each cup.'),
    ('cup_string_telephone', 3, 'Each person takes a cup and walks apart until the string is pulled tight.'),
    ('cup_string_telephone', 4, 'Take turns whispering into one cup while the other person listens.'),

    ('straw_rockets', 1, 'Cut a small strip of paper and roll it loosely around a pencil to make a tube.'),
    ('straw_rockets', 2, 'Tape the tube closed and fold over the top end to make the rocket nose.'),
    ('straw_rockets', 3, 'Slide the rocket over a straw and decorate it with fins.'),
    ('straw_rockets', 4, 'Blow hard through the straw to launch it, and see whose flies farthest.'),

    ('foil_boat_challenge', 1, 'Give everyone the same size square of foil.'),
    ('foil_boat_challenge', 2, 'Shape the foil into a boat with sides to keep water out.'),
    ('foil_boat_challenge', 3, 'Float the boats in a bucket of water.'),
    ('foil_boat_challenge', 4, 'Add coins or pebbles one at a time and count how many each boat holds.'),

    ('ice_paint', 1, 'The day before, fill an ice cube tray with water and add a drop of food colouring to each cube.'),
    ('ice_paint', 2, 'Freeze overnight, adding a lolly stick to each cube if you have them.'),
    ('ice_paint', 3, 'Pop out the cubes and slide them across thick paper to paint.'),
    ('ice_paint', 4, 'Watch the colours mix as the ice melts, then leave the picture to dry.'),

    ('paper_plate_masks', 1, 'Choose an animal and colour a paper plate to look like its face.'),
    ('paper_plate_masks', 2, 'A grown-up cuts out two eye holes.'),
    ('paper_plate_masks', 3, 'Add ears, whiskers or a mane with paper and crayons.'),
    ('paper_plate_masks', 4, 'Tie on string or hold the mask up, and put on an animal parade.'),

    ('cotton_ball_sheep', 1, 'Draw a simple cloud shape for the body and four legs on paper.'),
    ('cotton_ball_sheep', 2, 'Spread glue all over the body.'),
    ('cotton_ball_sheep', 3, 'Press cotton balls onto the glue until the sheep is fluffy.'),
    ('cotton_ball_sheep', 4, 'Add a face and googly eyes, then give your sheep a name.'),

    ('sponge_stamp_painting', 1, 'A grown-up cuts kitchen sponges into simple shapes like stars, hearts and squares.'),
    ('sponge_stamp_painting', 2, 'Pour a little paint onto paper plates.'),
    ('sponge_stamp_painting', 3, 'Dip a sponge in the paint and press it onto the paper.'),
    ('sponge_stamp_painting', 4, 'Build a pattern, a garden or a night sky, then let it dry.'),

    ('newspaper_pirate_hats', 1, 'Fold a sheet of newspaper in half from top to bottom.'),
    ('newspaper_pirate_hats', 2, 'Fold the top corners down to meet in the middle, making a triangle.'),
    ('newspaper_pirate_hats', 3, 'Fold the bottom strips up on both sides to finish the hat.'),
    ('newspaper_pirate_hats', 4, 'Draw a skull or a badge on the front and set sail.'),

    ('foil_sculptures', 1, 'Tear off a few pieces of foil of different sizes.'),
    ('foil_sculptures', 2, 'Scrunch a ball for a body and twist thinner pieces for arms and legs.'),
    ('foil_sculptures', 3, 'Press the parts together to make an animal, person or robot.'),
    ('foil_sculptures', 4, 'Line up your sculptures for a little museum show.'),

    ('pipe_cleaner_creatures', 1, 'Pick a few colourful pipe cleaners.'),
    ('pipe_cleaner_creatures', 2, 'Twist one into a coil for a body.'),
    ('pipe_cleaner_creatures', 3, 'Add legs, wings or antennae by twisting on more pieces.'),
    ('pipe_cleaner_creatures', 4, 'Add googly eyes and make up a story about your creature.'),

    ('glitter_calm_jar', 1, 'Fill a clear plastic bottle most of the way with warm water.'),
    ('glitter_calm_jar', 2, 'Add a big spoonful of glitter, plus a squeeze of glue to slow it down if you like.'),
    ('glitter_calm_jar', 3, 'A grown-up screws the lid on tightly.'),
    ('glitter_calm_jar', 4, 'Shake the jar and breathe slowly in and out until all the glitter settles.'),

    ('yarn_spider_web_maze', 1, 'Pick a hallway or doorway for the maze.'),
    ('yarn_spider_web_maze', 2, 'Tape lengths of yarn from wall to wall at different heights and angles.'),
    ('yarn_spider_web_maze', 3, 'Take turns climbing through without touching the strands.'),
    ('yarn_spider_web_maze', 4, 'Add more strands to make it trickier each round.'),

    ('backyard_bug_hotel', 1, 'A grown-up cuts the top and bottom off a plastic bottle to make a tube.'),
    ('backyard_bug_hotel', 2, 'Collect sticks, dry leaves, pine cones and bark.'),
    ('backyard_bug_hotel', 3, 'Pack them tightly into the tube so there are lots of small gaps.'),
    ('backyard_bug_hotel', 4, 'Hang it or tuck it in a quiet, sheltered spot and check back for visitors.'),

    ('bubble_garden', 1, 'Head outside with a bottle of bubble solution.'),
    ('bubble_garden', 2, 'Bend a pipe cleaner into a loop for a homemade wand if you have one.'),
    ('bubble_garden', 3, 'Blow slow bubbles and fast bubbles, big ones and tiny ones.'),
    ('bubble_garden', 4, 'Chase them, pop them, and count how many land before popping.'),

    ('classic_hopscotch', 1, 'Draw a hopscotch grid of ten squares with chalk and number them.'),
    ('classic_hopscotch', 2, 'Toss a small stone onto square one.'),
    ('classic_hopscotch', 3, 'Hop through the grid, skipping the square with the stone, and back again.'),
    ('classic_hopscotch', 4, 'Pick up the stone on the way back and toss it onto the next number.'),

    ('bucket_ball_toss', 1, 'Place a bucket on the ground and mark a throwing line.'),
    ('bucket_ball_toss', 2, 'Take turns tossing a soft ball into the bucket.'),
    ('bucket_ball_toss', 3, 'Each time someone scores, take one big step back.'),
    ('bucket_ball_toss', 4, 'Keep score and see who can land the longest throw.'),

    ('treasure_map_hunt', 1, 'Draw a simple map of a room or the yard together.'),
    ('treasure_map_hunt', 2, 'One person hides a small treasure and marks it with an X.'),
    ('treasure_map_hunt', 3, 'The other follows the map, counting steps and checking landmarks.'),
    ('treasure_map_hunt', 4, 'Swap roles and draw a trickier map for the next round.'),

    ('freeze_dance_party', 1, 'Clear a space and put on some favourite music.'),
    ('freeze_dance_party', 2, 'Everyone dances while the music plays.'),
    ('freeze_dance_party', 3, 'When the music stops, everyone freezes like a statue.'),
    ('freeze_dance_party', 4, 'Anyone who wobbles becomes the next music controller.'),

    ('simon_says', 1, 'Pick one person to be Simon.'),
    ('simon_says', 2, 'Simon gives actions like touch your toes, but only ones that start with Simon says count.'),
    ('simon_says', 3, 'Anyone who moves without Simon says sits out for a round.'),
    ('simon_says', 4, 'The last one standing becomes the next Simon.'),

    ('listening_walk', 1, 'Head out for a slow, quiet walk around the block or the park.'),
    ('listening_walk', 2, 'Stop every few minutes, close your eyes and listen.'),
    ('listening_walk', 3, 'Name every sound you hear and count them on your fingers.'),
    ('listening_walk', 4, 'At home, talk about the loudest, quietest and strangest sounds.'),

    ('home_library_day', 1, 'Gather a stack of books and arrange them on a shelf or table.'),
    ('home_library_day', 2, 'Make library cards from paper with names and pictures.'),
    ('home_library_day', 3, 'Take turns being the librarian, stamping and lending books.'),
    ('home_library_day', 4, 'Settle into a quiet corner and read the books you borrowed.'),

    ('flashlight_reading', 1, 'Build a cosy den under a blanket or a table.'),
    ('flashlight_reading', 2, 'Turn off the big lights and switch on a flashlight.'),
    ('flashlight_reading', 3, 'Read a story together, taking turns holding the light.'),
    ('flashlight_reading', 4, 'Make shadow shapes on the blanket at the exciting parts.')
) AS x(activity_slug, step_number, short_text)
JOIN activity a ON a.slug = x.activity_slug;
