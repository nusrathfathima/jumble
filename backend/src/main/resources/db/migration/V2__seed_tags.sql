-- The MVP interest/category taxonomy from the spec (section 3, item 2).
-- Additive by design: adding an 8th tag later is just another INSERT in a
-- future migration (V3, V4, ...). The one thing that migration would also
-- need to do is backfill a child_tag_weight row (default 1.0) for every
-- existing child for the new tag, since weights are seeded once at child
-- creation time (see section 4 of the schema doc) and are what the
-- suggestions query actually reads from — a tag with no weight rows would
-- silently never be suggested for children created before it existed.
INSERT INTO tag (slug, display_name) VALUES
    ('art',           'Art'),
    ('science',       'Science'),
    ('outdoor',       'Outdoor'),
    ('building',      'Building'),
    ('pretend_play',  'Pretend play'),
    ('cooking',       'Cooking'),
    ('quiet_reading', 'Quiet / reading');
