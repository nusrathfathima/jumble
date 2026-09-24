-- Five more activities, all deliberately requiring zero materials at all
-- (no rows in activity_material for any of them, not even optional
-- ones) — these are the "always have something to offer" baseline set.
-- Before this migration, "Reading Nook Blanket Fort" (V5) was the only
-- indoor, low-mess activity that could survive an empty inventory, which
-- meant every child with nothing checked in their inventory got shown
-- the exact same single suggestion. This spreads that baseline across
-- five activities, different ages and different interests, so there is
-- an actual choice rather than one repeated answer.

INSERT INTO activity (slug, title, summary, min_age_years, max_age_years, duration_minutes, mess_level, location_type, needs_adult) VALUES
    ('i_spy_around_the_house', 'I Spy Around the House',       'Take turns picking something in the room and giving clues until someone guesses it.', 3, 8,  15, 1, 'INDOOR',  false),
    ('animal_charades',        'Animal Charades',              'Act out an animal without speaking while everyone else tries to guess which one.', 4, 10, 20, 1, 'INDOOR',  false),
    ('story_chain',            'Story Chain',                  'Build a made-up story together, one sentence at a time, going around in a circle.', 4, 11, 20, 1, 'INDOOR',  false),
    ('living_room_animal_yoga','Living Room Animal Yoga',      'Stretch and balance through a few simple animal-themed poses, no mat required.', 3, 9,  15, 1, 'INDOOR',  false),
    ('cloud_watching',         'Cloud Watching',               'Lie back on the grass and spot shapes, animals, and faces drifting by overhead.', 3, 10, 20, 1, 'OUTDOOR', true);

-- Tags
INSERT INTO activity_tag (activity_id, tag_id)
SELECT a.id, t.id
FROM (VALUES
    ('i_spy_around_the_house',  'science'),
    ('animal_charades',         'pretend_play'),
    ('story_chain',             'quiet_reading'),
    ('story_chain',             'pretend_play'),
    ('living_room_animal_yoga', 'pretend_play'),
    ('cloud_watching',          'science'),
    ('cloud_watching',          'outdoor')
) AS x(activity_slug, tag_slug)
JOIN activity a ON a.slug = x.activity_slug
JOIN tag t ON t.slug = x.tag_slug;

-- No activity_material rows at all for any of these five — that is the
-- whole point, so they never get excluded by the inventory check.

-- Ordered how-to steps
INSERT INTO activity_step (activity_id, step_number, short_text)
SELECT a.id, x.step_number, x.short_text
FROM (VALUES
    ('i_spy_around_the_house', 1, 'One person quietly picks something they can see in the room.'),
    ('i_spy_around_the_house', 2, 'They say, I spy something, and give one clue, such as a color.'),
    ('i_spy_around_the_house', 3, 'Everyone else takes turns guessing, with an extra clue given after a few misses.'),
    ('i_spy_around_the_house', 4, 'Whoever guesses right picks the next thing to spy.'),

    ('animal_charades', 1, 'Write or think up a short list of animals to act out.'),
    ('animal_charades', 2, 'One person picks an animal from the list without saying it out loud.'),
    ('animal_charades', 3, 'They act out how it moves and sounds while everyone else guesses.'),
    ('animal_charades', 4, 'Take turns being the actor until everyone has had a go.'),

    ('story_chain', 1, 'Sit in a circle and decide who starts.'),
    ('story_chain', 2, 'The first person says one sentence to begin a story.'),
    ('story_chain', 3, 'Each person in turn adds the next sentence, building on what came before.'),
    ('story_chain', 4, 'Keep going until the story reaches a silly or satisfying ending.'),

    ('living_room_animal_yoga', 1, 'Clear a small space on the floor to move freely.'),
    ('living_room_animal_yoga', 2, 'Try a cat stretch, arching and rounding your back.'),
    ('living_room_animal_yoga', 3, 'Balance on one leg like a flamingo, then switch sides.'),
    ('living_room_animal_yoga', 4, 'Finish curled up small and still like a sleeping mouse.'),

    ('cloud_watching', 1, 'Find a comfortable spot outside to lie down and look up.'),
    ('cloud_watching', 2, 'Watch the clouds drift and change shape.'),
    ('cloud_watching', 3, 'Call out what each shape looks like — an animal, a face, a letter.'),
    ('cloud_watching', 4, 'See how many different shapes you can find before the clouds move on.')
) AS x(activity_slug, step_number, short_text)
JOIN activity a ON a.slug = x.activity_slug;
